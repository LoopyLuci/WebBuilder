"""Sequence-to-Sequence model with attention mechanism."""

import numpy as np
from .layers import Linear
from .activations import sigmoid, softmax


class Seq2SeqAttention:
    """
    Sequence-to-Sequence model with attention.
    
    Architecture:
    - Encoder: Bidirectional RNN
    - Attention: Additive (Bahdanau) attention
    - Decoder: RNN with attention context
    """
    
    def __init__(self, input_size, hidden_size, output_size, attention_size=None):
        """
        Args:
            input_size: Dimensionality of input features
            hidden_size: Number of hidden units (per direction for encoder)
            output_size: Dimensionality of output (vocab size)
            attention_size: Dimensionality of attention mechanism
        """
        self.input_size = input_size
        self.hidden_size = hidden_size
        self.output_size = output_size
        self.attention_size = attention_size or hidden_size
        
        # Encoder: Bidirectional RNN
        limit_enc = np.sqrt(6.0 / (input_size + hidden_size))
        
        # Forward encoder
        self.enc_W_xh_f = np.random.uniform(-limit_enc, limit_enc, (input_size, hidden_size))
        self.enc_W_hh_f = np.random.uniform(-limit_enc, limit_enc, (hidden_size, hidden_size))
        self.enc_b_f = np.zeros(hidden_size)
        
        # Backward encoder
        self.enc_W_xh_b = np.random.uniform(-limit_enc, limit_enc, (input_size, hidden_size))
        self.enc_W_hh_b = np.random.uniform(-limit_enc, limit_enc, (hidden_size, hidden_size))
        self.enc_b_b = np.zeros(hidden_size)
        
        # Decoder
        limit_dec = np.sqrt(6.0 / (output_size + hidden_size))
        self.dec_W_xh = np.random.uniform(-limit_dec, limit_dec, (output_size, hidden_size))
        self.dec_W_hh = np.random.uniform(-limit_dec, limit_dec, (hidden_size, hidden_size))
        self.dec_b_h = np.zeros(hidden_size)
        
        # Attention: Additive (Bahdanau)
        self.attn_W_enc = np.random.randn(2 * hidden_size, self.attention_size) * 0.01  # Encoder hidden to attention
        self.attn_W_dec = np.random.randn(hidden_size, self.attention_size) * 0.01      # Decoder hidden to attention
        self.attn_v = np.random.randn(self.attention_size) * 0.01                        # Attention vector
        self.attn_b = np.zeros(self.attention_size)
        
        # Output projection
        limit_out = np.sqrt(6.0 / (hidden_size * 3 + output_size))
        self.out_W = np.random.uniform(-limit_out, limit_out, (hidden_size * 3, output_size))
        self.out_b = np.zeros(output_size)
        
        # Gradients (initialized lazily)
        self._init_grads()
        
        # Cache
        self._cache = None
    
    def _init_grads(self):
        """Initialize gradient arrays."""
        # Encoder forward
        self.d_enc_W_xh_f = np.zeros_like(self.enc_W_xh_f)
        self.d_enc_W_hh_f = np.zeros_like(self.enc_W_hh_f)
        self.d_enc_b_f = np.zeros_like(self.enc_b_f)
        
        # Encoder backward
        self.d_enc_W_xh_b = np.zeros_like(self.enc_W_xh_b)
        self.d_enc_W_hh_b = np.zeros_like(self.enc_W_hh_b)
        self.d_enc_b_b = np.zeros_like(self.enc_b_b)
        
        # Decoder
        self.d_dec_W_xh = np.zeros_like(self.dec_W_xh)
        self.d_dec_W_hh = np.zeros_like(self.dec_W_hh)
        self.d_dec_b_h = np.zeros_like(self.dec_b_h)
        
        # Attention
        self.d_attn_W_enc = np.zeros_like(self.attn_W_enc)
        self.d_attn_W_dec = np.zeros_like(self.attn_W_dec)
        self.d_attn_v = np.zeros_like(self.attn_v)
        self.d_attn_b = np.zeros_like(self.attn_b)
        
        # Output
        self.d_out_W = np.zeros_like(self.out_W)
        self.d_out_b = np.zeros_like(self.out_b)
    
    def _rnn_step_forward(self, x, h_prev, W_xh, W_hh, b):
        """Single RNN step forward."""
        pre_act = x @ W_xh + h_prev @ W_hh + b
        h = np.tanh(pre_act)
        return h, pre_act
    
    def _rnn_step_backward(self, dh, x, h_prev, h, W_xh, W_hh, dW_xh, dW_hh, db):
        """Single RNN step backward. Returns dx, dh_prev."""
        dpre_act = dh * (1.0 - h ** 2)
        dW_xh += x.T @ dpre_act
        dW_hh += h_prev.T @ dpre_act
        db += np.sum(dpre_act, axis=0)
        dx = dpre_act @ W_xh.T
        dh_prev = dpre_act @ W_hh.T
        return dx, dh_prev
    
    def _encode(self, x):
        """
        Encode input sequence with bidirectional RNN.
        
        Args:
            x: (batch, src_len, input_size)
            
        Returns:
            encoder_hiddens: (batch, src_len, 2*hidden_size)
        """
        batch_size, src_len, _ = x.shape
        
        # Forward pass
        h_f = np.zeros((batch_size, self.hidden_size))
        hiddens_f = np.zeros((batch_size, src_len, self.hidden_size))
        for t in range(src_len):
            h_f, _ = self._rnn_step_forward(x[:, t], h_f, 
                                            self.enc_W_xh_f, self.enc_W_hh_f, self.enc_b_f)
            hiddens_f[:, t] = h_f
        
        # Backward pass
        h_b = np.zeros((batch_size, self.hidden_size))
        hiddens_b = np.zeros((batch_size, src_len, self.hidden_size))
        for t in reversed(range(src_len)):
            h_b, _ = self._rnn_step_forward(x[:, t], h_b,
                                            self.enc_W_xh_b, self.enc_W_hh_b, self.enc_b_b)
            hiddens_b[:, t] = h_b
        
        # Concatenate forward and backward
        encoder_hiddens = np.concatenate([hiddens_f, hiddens_b], axis=-1)
        return encoder_hiddens
    
    def _attention(self, decoder_hidden, encoder_hiddens, mask=None):
        """
        Compute attention weights and context vector.
        
        Args:
            decoder_hidden: (batch, hidden_size)
            encoder_hiddens: (batch, src_len, 2*hidden_size)
            mask: (batch, src_len) - optional padding mask
            
        Returns:
            context: (batch, 2*hidden_size)
            attn_weights: (batch, src_len)
        """
        batch_size, src_len, enc_dim = encoder_hiddens.shape
        
        # Compute attention scores
        # score = v^T * tanh(W_enc * h_enc + W_dec * h_dec + b)
        # encoder_hiddens @ W_enc: (batch, src_len, attn_size)
        enc_proj = encoder_hiddens @ self.attn_W_enc  # (batch, src_len, attn_size)
        
        # decoder_hidden @ W_dec: (batch, attn_size)
        dec_proj = decoder_hidden @ self.attn_W_dec    # (batch, attn_size)
        
        # Additive combination
        scores = np.tanh(enc_proj + dec_proj[:, np.newaxis, :] + self.attn_b)  # (batch, src_len, attn_size)
        
        # Score with attention vector
        scores = scores @ self.attn_v  # (batch, src_len)
        
        # Apply mask
        if mask is not None:
            scores = np.where(mask, -1e9, scores)
        
        # Softmax
        attn_weights = softmax(scores, axis=-1)  # (batch, src_len)
        
        # Context vector
        context = np.einsum('bs,bsd->bd', attn_weights, encoder_hiddens)  # (batch, 2*hidden_size)
        
        return context, attn_weights
    
    def forward(self, x, y):
        """
        Forward pass (teacher forcing).
        
        Args:
            x: Source sequence (batch, src_len, input_size)
            y: Target sequence (batch, tgt_len, output_size) - one-hot encoded
            
        Returns:
            outputs: (batch, tgt_len, output_size)
        """
        batch_size, src_len, _ = x.shape
        _, tgt_len, _ = y.shape
        
        # Encode
        encoder_hiddens = self._encode(x)
        
        # Initialize decoder hidden state (from last encoder state)
        decoder_hidden = np.tanh(np.mean(encoder_hiddens, axis=1) @ 
                                 np.random.randn(encoder_hiddens.shape[-1], self.hidden_size) * 0.01)
        
        outputs = np.zeros((batch_size, tgt_len, self.output_size))
        attn_weights_list = []
        
        for t in range(tgt_len):
            # Attention
            context, attn_weights = self._attention(decoder_hidden, encoder_hiddens)
            attn_weights_list.append(attn_weights)
            
            # Concatenate input and context
            dec_input = np.concatenate([y[:, t], context], axis=-1)  # (batch, output_size + 2*hidden_size)
            
            # Project to hidden_size
            dec_input_proj = dec_input[:, :self.output_size] @ self.dec_W_xh  # (batch, hidden_size)
            
            # Decoder step
            decoder_hidden, _ = self._rnn_step_forward(
                np.zeros((batch_size, self.input_size)),  # dummy input (we use concatenated)
                decoder_hidden,
                self.dec_W_xh, self.dec_W_hh, self.dec_b_h
            )
            
            # Actually: use y[:,t] as input to decoder
            dec_input_emb = y[:, t] @ self.dec_W_xh  # (batch, hidden_size)
            decoder_hidden = np.tanh(dec_input_emb + decoder_hidden @ self.dec_W_hh + self.dec_b_h)
            
            # Output: concatenate decoder_hidden and context
            output_input = np.concatenate([decoder_hidden, context], axis=-1)  # (batch, 3*hidden_size)
            output = output_input @ self.out_W + self.out_b  # (batch, output_size)
            outputs[:, t] = output
        
        self._cache = (x, y, encoder_hiddens, attn_weights_list, decoder_hidden)
        
        return outputs
    
    def backward(self, dout):
        """
        Backward pass.
        
        Args:
            dout: (batch, tgt_len, output_size)
            
        Returns:
            dx: (batch, src_len, input_size)
        """
        x, y, encoder_hiddens, attn_weights_list, _ = self._cache
        batch_size, src_len, _ = x.shape
        _, tgt_len, _ = y.shape
        
        self._init_grads()
        
        dx = np.zeros_like(x)
        
        # Initialize decoder hidden gradient
        dh_dec = np.zeros((batch_size, self.hidden_size))
        
        for t in reversed(range(tgt_len)):
            # Gradient through output layer
            output_input = np.concatenate([np.zeros((batch_size, self.hidden_size)), 
                                           np.zeros((batch_size, 2 * self.hidden_size))], axis=-1)
            
            self.d_out_W += output_input.T @ dout[:, t]
            self.d_out_b += np.sum(dout[:, t], axis=0)
            
            doutput_input = dout[:, t] @ self.out_W.T
            dh_dec += doutput_input[:, :self.hidden_size]
            dcontext = doutput_input[:, self.hidden_size:]
            
            # Gradient through attention
            attn_weights = attn_weights_list[t]
            
            # Gradient w.r.t. encoder hiddens through attention
            dencoder_hiddens_attn = np.einsum('bs,bd->bsd', attn_weights, dcontext)
            
            # Gradient w.r.t. attention weights
            dattn_weights = np.einsum('bd,bsd->bs', dcontext, encoder_hiddens)
            
            # Gradient through softmax
            dscores = attn_weights * (dattn_weights - np.sum(dattn_weights * attn_weights, axis=-1, keepdims=True))
            
            # Gradient w.r.t. attention parameters
            # (simplified - full implementation would back through tanh and projections)
            
            # Gradient through decoder RNN
            dpre_act = dh_dec * (1.0 - np.tanh(dh_dec) ** 2)
            
            if t > 0:
                # Previous decoder hidden gradient
                dh_dec = dpre_act @ self.dec_W_hh.T
            else:
                dh_dec = dpre_act @ self.dec_hh.T if hasattr(self, 'dec_hh') else np.zeros_like(dh_dec)
            
            self.d_dec_W_xh += y[:, t].T @ dpre_act
            self.d_dec_b_h += np.sum(dpre_act, axis=0)
        
        # Average gradients over batch
        for grad in [self.d_enc_W_xh_f, self.d_enc_W_hh_f, self.d_enc_b_f,
                     self.d_enc_W_xh_b, self.d_enc_W_hh_b, self.d_enc_b_b,
                     self.d_dec_W_xh, self.d_dec_W_hh, self.d_dec_b_h,
                     self.d_out_W, self.d_out_b]:
            grad /= batch_size
        
        return dx
    
    def zero_grad(self):
        """Zero all gradients."""
        self._init_grads()
    
    def params(self):
        """Return list of parameters."""
        return [
            self.enc_W_xh_f, self.enc_W_hh_f, self.enc_b_f,
            self.enc_W_xh_b, self.enc_W_hh_b, self.enc_b_b,
            self.dec_W_xh, self.dec_W_hh, self.dec_b_h,
            self.attn_W_enc, self.attn_W_dec, self.attn_v, self.attn_b,
            self.out_W, self.out_b
        ]
    
    def grads(self):
        """Return list of gradients."""
        return [
            self.d_enc_W_xh_f, self.d_enc_W_hh_f, self.d_enc_b_f,
            self.d_enc_W_xh_b, self.d_enc_W_hh_b, self.d_enc_b_b,
            self.d_dec_W_xh, self.d_dec_W_hh, self.d_dec_b_h,
            self.d_attn_W_enc, self.d_attn_W_dec, self.d_attn_v, self.d_attn_b,
            self.d_out_W, self.d_out_b
        ]
    
    def __call__(self, x, y):
        return self.forward(x, y)