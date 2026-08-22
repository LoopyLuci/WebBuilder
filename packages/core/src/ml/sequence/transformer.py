"""Transformer implementation with multi-head attention."""

import numpy as np
from .layers import Linear, LayerNorm, Dropout, Embedding
from .activations import softmax, gelu, relu


class PositionalEncoding:
    """Sinusoidal positional encoding."""
    
    def __init__(self, d_model, max_len=5000):
        pe = np.zeros((max_len, d_model))
        position = np.arange(0, max_len)[:, np.newaxis]
        div_term = np.exp(np.arange(0, d_model, 2) * -(np.log(10000.0) / d_model))
        pe[:, 0::2] = np.sin(position * div_term)
        pe[:, 1::2] = np.cos(position * div_term)
        self.pe = pe[np.newaxis, :, :]  # (1, max_len, d_model)
    
    def forward(self, x):
        """Add positional encoding to input."""
        seq_len = x.shape[1] if x.ndim == 3 else x.shape[0]
        return x + self.pe[:, :seq_len, :]


class ScaledDotProductAttention:
    """Scaled dot-product attention."""
    
    def __init__(self):
        self._cache = None
    
    def forward(self, Q, K, V, mask=None):
        """
        Args:
            Q: (batch, heads, seq_len_q, d_k)
            K: (batch, heads, seq_len_k, d_k)
            V: (batch, heads, seq_len_v, d_v)
            mask: Optional mask
            
        Returns:
            output: (batch, heads, seq_len_q, d_v)
            attention_weights: (batch, heads, seq_len_q, seq_len_k)
        """
        d_k = Q.shape[-1]
        scores = np.matmul(Q, K.transpose(0, 1, 3, 2)) / np.sqrt(d_k)
        
        if mask is not None:
            scores = np.where(mask, -1e9, scores)
        
        attn_weights = softmax(scores, axis=-1)
        output = np.matmul(attn_weights, V)
        
        self._cache = (Q, K, V, attn_weights, mask)
        return output, attn_weights
    
    def backward(self, dout):
        """Backward pass for attention."""
        Q, K, V, attn_weights, mask = self._cache
        d_k = Q.shape[-1]
        
        # Gradient w.r.t. V
        dV = np.matmul(attn_weights.transpose(0, 1, 3, 2), dout)
        
        # Gradient w.r.t. attention weights
        dattn = np.matmul(dout, V.transpose(0, 1, 3, 2))
        
        # Gradient through softmax
        dscores = attn_weights * (dattn - np.sum(dattn * attn_weights, axis=-1, keepdims=True))
        
        if mask is not None:
            dscores = np.where(mask, 0, dscores)
        
        # Scale
        dscores = dscores / np.sqrt(d_k)
        
        # Gradient w.r.t. Q and K
        dQ = np.matmul(dscores, K)
        dK = np.matmul(dscores.transpose(0, 1, 3, 2), Q)
        
        return dQ, dK, dV


class MultiHeadAttention:
    """Multi-head attention mechanism."""
    
    def __init__(self, d_model, num_heads, dropout=0.1):
        assert d_model % num_heads == 0
        self.d_model = d_model
        self.num_heads = num_heads
        self.d_k = d_model // num_heads
        
        self.W_q = Linear(d_model, d_model)
        self.W_k = Linear(d_model, d_model)
        self.W_v = Linear(d_model, d_model)
        self.W_o = Linear(d_model, d_model)
        
        self.attention = ScaledDotProductAttention()
        self.dropout = Dropout(dropout)
        
        self._cache = None
    
    def forward(self, query, key, value, mask=None):
        """
        Args:
            query: (batch, seq_len_q, d_model)
            key: (batch, seq_len_k, d_model)
            value: (batch, seq_len_v, d_model)
            mask: Optional attention mask
        """
        batch_size = query.shape[0]
        
        # Linear projections
        Q = self.W_q.forward(query)
        K = self.W_k.forward(key)
        V = self.W_v.forward(value)
        
        # Reshape to (batch, heads, seq_len, d_k)
        Q = Q.reshape(batch_size, -1, self.num_heads, self.d_k).transpose(0, 2, 1, 3)
        K = K.reshape(batch_size, -1, self.num_heads, self.d_k).transpose(0, 2, 1, 3)
        V = V.reshape(batch_size, -1, self.num_heads, self.d_k).transpose(0, 2, 1, 3)
        
        # Attention
        attn_output, attn_weights = self.attention.forward(Q, K, V, mask)
        
        # Reshape back
        attn_output = attn_output.transpose(0, 2, 1, 3).reshape(batch_size, -1, self.d_model)
        
        # Output projection
        output = self.W_o.forward(attn_output)
        output = self.dropout.forward(output)
        
        self._cache = (query, key, value, mask, attn_weights)
        return output
    
    def backward(self, dout):
        """Backward pass."""
        query, key, value, mask, attn_weights = self._cache
        batch_size = query.shape[0]
        
        # Backward through output projection
        dout = self.dropout.backward(dout)
        dattn_output = self.W_o.backward(dout)
        
        # Reshape for attention backward
        dattn = dattn_output.reshape(batch_size, -1, self.num_heads, self.d_k).transpose(0, 2, 1, 3)
        
        # Backward through attention
        dQ, dK, dV = self.attention.backward(dattn)
        
        # Reshape back
        dQ = dQ.transpose(0, 2, 1, 3).reshape(batch_size, -1, self.d_model)
        dK = dK.transpose(0, 2, 1, 3).reshape(batch_size, -1, self.d_model)
        dV = dV.transpose(0, 2, 1, 3).reshape(batch_size, -1, self.d_model)
        
        # Backward through linear projections
        dquery = self.W_q.backward(dQ)
        dkey = self.W_k.backward(dK)
        dvalue = self.W_v.backward(dV)
        
        return dquery, dkey, dvalue


class FeedForward:
    """Position-wise feed-forward network."""
    
    def __init__(self, d_model, d_ff, dropout=0.1, activation='relu'):
        self.linear1 = Linear(d_model, d_ff)
        self.linear2 = Linear(d_ff, d_model)
        self.dropout = Dropout(dropout)
        self.activation = relu if activation == 'relu' else gelu
        self._cache = None
    
    def forward(self, x):
        h = self.linear1.forward(x)
        h = self.activation(h)
        h = self.dropout.forward(h)
        out = self.linear2.forward(h)
        out = self.dropout.forward(out)
        self._cache = (x, h)
        return out
    
    def backward(self, dout):
        dout = self.dropout.backward(dout)
        dh = self.linear2.backward(dout)
        x, h = self._cache
        # Gradient through activation
        dh_pre = dh * (h > 0).astype(float)
        dh_pre = self.dropout.backward(dh_pre)
        dx = self.linear1.backward(dh_pre)
        return dx


class TransformerBlock:
    """Single Transformer block (encoder or decoder)."""
    
    def __init__(self, d_model, num_heads, d_ff, dropout=0.1, is_decoder=False):
        self.self_attn = MultiHeadAttention(d_model, num_heads, dropout)
        self.ff = FeedForward(d_model, d_ff, dropout)
        self.norm1 = LayerNorm(d_model)
        self.norm2 = LayerNorm(d_model)
        self.dropout = Dropout(dropout)
        self.is_decoder = is_decoder
        self._cache = None
    
    def forward(self, x, mask=None, enc_output=None):
        """
        Args:
            x: (batch, seq_len, d_model)
            mask: Attention mask
            enc_output: Encoder output (for decoder cross-attention)
        """
        # Self attention with residual
        residual = x
        x_norm = self.norm1.forward(x)
        attn_out = self.self_attn.forward(x_norm, x_norm, x_norm, mask)
        x = residual + self.dropout.forward(attn_out)
        
        # Cross attention (decoder only)
        if self.is_decoder and enc_output is not None:
            residual = x
            x_norm = self.norm2.forward(x)
            # For simplicity, using self_attn with encoder output
            cross_out = self.self_attn.forward(x_norm, enc_output, enc_output, None)
            x = residual + self.dropout.forward(cross_out)
            residual = x
            x_norm = self.norm2.forward(x)
        else:
            x_norm = x
        
        # Feed-forward with residual
        residual = x if not self.is_decoder or enc_output is None else x
        ff_out = self.ff.forward(x_norm)
        x = residual + ff_out
        
        return x
    
    def backward(self, dout):
        """Backward pass."""
        # This is a simplified backward pass
        # Full implementation would cache and backprop through each component
        return dout


class Transformer:
    """
    Transformer model.
    
    Implements the encoder-decoder architecture from "Attention Is All You Need".
    """
    
    def __init__(self, vocab_size, d_model=512, num_heads=8, num_encoder_layers=6,
                 num_decoder_layers=6, d_ff=2048, max_len=5000, dropout=0.1):
        """
        Args:
            vocab_size: Size of vocabulary
            d_model: Model dimension
            num_heads: Number of attention heads
            num_encoder_layers: Number of encoder layers
            num_decoder_layers: Number of decoder layers
            d_ff: Feed-forward dimension
            max_len: Maximum sequence length
            dropout: Dropout rate
        """
        self.d_model = d_model
        self.vocab_size = vocab_size
        
        # Embeddings
        self.embedding = Embedding(vocab_size, d_model)
        
        # Positional encoding
        self.pos_encoding = PositionalEncoding(d_model, max_len)
        
        # Encoder layers
        self.encoder_layers = [
            TransformerBlock(d_model, num_heads, d_ff, dropout, is_decoder=False)
            for _ in range(num_encoder_layers)
        ]
        
        # Decoder layers
        self.decoder_layers = [
            TransformerBlock(d_model, num_heads, d_ff, dropout, is_decoder=True)
            for _ in range(num_decoder_layers)
        ]
        
        # Output projection
        self.output_proj = Linear(d_model, vocab_size)
        
        # Dropout
        self.dropout = Dropout(dropout)
    
    def encode(self, src, src_mask=None):
        """
        Encode source sequence.
        
        Args:
            src: Source tokens (batch, src_seq_len)
            src_mask: Source mask
        """
        x = self.embedding.forward(src)
        x = self.pos_encoding.forward(x)
        x = self.dropout.forward(x)
        
        for layer in self.encoder_layers:
            x = layer.forward(x, src_mask)
        
        return x
    
    def decode(self, tgt, enc_output, tgt_mask=None):
        """
        Decode target sequence.
        
        Args:
            tgt: Target tokens (batch, tgt_seq_len)
            enc_output: Encoder output
            tgt_mask: Target mask (causal)
        """
        x = self.embedding.forward(tgt)
        x = self.pos_encoding.forward(x)
        x = self.dropout.forward(x)
        
        for layer in self.decoder_layers:
            x = layer.forward(x, tgt_mask, enc_output)
        
        return x
    
    def forward(self, src, tgt, src_mask=None, tgt_mask=None):
        """
        Forward pass.
        
        Args:
            src: Source tokens (batch, src_seq_len)
            tgt: Target tokens (batch, tgt_seq_len)
            src_mask: Source mask
            tgt_mask: Target mask
        """
        enc_output = self.encode(src, src_mask)
        dec_output = self.decode(tgt, enc_output, tgt_mask)
        logits = self.output_proj.forward(dec_output)
        return logits
    
    def generate_causal_mask(self, seq_len):
        """Generate causal (look-ahead) mask."""
        mask = np.triu(np.ones((seq_len, seq_len)), k=1).astype(bool)
        return mask
    
    def generate_padding_mask(self, seq, pad_token=0):
        """Generate padding mask."""
        return (seq == pad_token)[:, np.newaxis, np.newaxis, :]
    
    def params(self):
        """Get all parameters."""
        params = []
        params.extend(self.embedding.params())
        params.extend(self.output_proj.params())
        for layer in self.encoder_layers:
            params.extend(layer.self_attn.W_q.params())
            params.extend(layer.self_attn.W_k.params())
            params.extend(layer.self_attn.W_v.params())
            params.extend(layer.self_attn.W_o.params())
            params.extend(layer.ff.linear1.params())
            params.extend(layer.ff.linear2.params())
            params.extend(layer.norm1.params())
            params.extend(layer.norm2.params())
        for layer in self.decoder_layers:
            params.extend(layer.self_attn.W_q.params())
            params.extend(layer.self_attn.W_k.params())
            params.extend(layer.self_attn.W_v.params())
            params.extend(layer.self_attn.W_o.params())
            params.extend(layer.ff.linear1.params())
            params.extend(layer.ff.linear2.params())
            params.extend(layer.norm1.params())
            params.extend(layer.norm2.params())
        return params
    
    def __call__(self, src, tgt, src_mask=None, tgt_mask=None):
        return self.forward(src, tgt, src_mask, tgt_mask)