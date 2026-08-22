"""T5-like encoder-decoder model."""

import numpy as np
from .layers import Linear, LayerNorm, Dropout, Embedding
from .activations import gelu, softmax


class T5:
    """
    T5-like encoder-decoder model.
    
    Implements the Text-to-Text Transfer Transformer architecture with:
    - Encoder-decoder structure
    - Relative position biases
    - Layer normalization with RMS normalization
    - GELU activation
    - Tied input-output embeddings
    """
    
    def __init__(self, vocab_size, d_model=512, num_heads=8, num_encoder_layers=6,
                 num_decoder_layers=6, d_ff=2048, max_len=512, dropout=0.1,
                 num_buckets=32, decoder_start_token_id=0):
        """
        Args:
            vocab_size: Vocabulary size
            d_model: Hidden dimension
            num_heads: Number of attention heads
            num_encoder_layers: Number of encoder layers
            num_decoder_layers: Number of decoder layers
            d_ff: Feed-forward dimension
            max_len: Maximum sequence length
            dropout: Dropout rate
            num_buckets: Number of relative position buckets
            decoder_start_token_id: Start token ID for decoder
        """
        self.vocab_size = vocab_size
        self.d_model = d_model
        self.num_heads = num_heads
        self.num_encoder_layers = num_encoder_layers
        self.num_decoder_layers = num_decoder_layers
        self.d_k = d_model // num_heads
        self.decoder_start_token_id = decoder_start_token_id
        
        # Shared embedding
        self.shared_embedding = Embedding(vocab_size, d_model)
        
        # Encoder layers
        self.encoder_layers = []
        for _ in range(num_encoder_layers):
            layer = {
                'self_attention': {
                    'W_q': Linear(d_model, d_model),
                    'W_k': Linear(d_model, d_model),
                    'W_v': Linear(d_model, d_model),
                    'W_o': Linear(d_model, d_model),
                },
                'norm': LayerNorm(d_model),
                'ff1': Linear(d_model, d_ff),
                'ff2': Linear(d_ff, d_model),
                'dropout': Dropout(dropout),
            }
            self.encoder_layers.append(layer)
        
        # Decoder layers
        self.decoder_layers = []
        for _ in range(num_decoder_layers):
            layer = {
                'self_attention': {
                    'W_q': Linear(d_model, d_model),
                    'W_k': Linear(d_model, d_model),
                    'W_v': Linear(d_model, d_model),
                    'W_o': Linear(d_model, d_model),
                },
                'cross_attention': {
                    'W_q': Linear(d_model, d_model),
                    'W_k': Linear(d_model, d_model),
                    'W_v': Linear(d_model, d_model),
                    'W_o': Linear(d_model, d_model),
                },
                'norm1': LayerNorm(d_model),
                'norm2': LayerNorm(d_model),
                'ff1': Linear(d_model, d_ff),
                'ff2': Linear(d_ff, d_model),
                'dropout': Dropout(dropout),
            }
            self.decoder_layers.append(layer)
        
        # Final layer norms
        self.encoder_norm = LayerNorm(d_model)
        self.decoder_norm = LayerNorm(d_model)
        
        # Output projection (tied with shared embedding)
        self.output_bias = np.zeros(vocab_size)
        
        # Cache
        self._cache = None
    
    def _relative_position_bias(self, qlen, klen, num_buckets=32):
        """Compute relative position bias for attention."""
        context_position = np.arange(qlen)[:, np.newaxis]
        memory_position = np.arange(klen)[np.newaxis, :]
        relative_position = memory_position - context_position
        
        # Bucket positions
        max_distance = 128
        relative_buckets = np.zeros_like(relative_position)
        num_buckets_half = num_buckets // 2
        
        # Positive positions
        is_small = relative_position < 0
        relative_position = np.abs(relative_position)
        
        # Half buckets for small distances
        max_exact = num_buckets_half // 2
        is_large = relative_position >= max_exact
        
        relative_buckets = np.where(
            is_small, relative_position + num_buckets_half, relative_position
        )
        relative_buckets = np.where(
            is_large, 
            max_exact + np.log(relative_position / max_exact) / np.log(max_distance / max_exact) * (num_buckets_half - max_exact - 1),
            relative_buckets
        )
        relative_buckets = np.clip(relative_buckets, 0, num_buckets - 1).astype(int)
        
        # Create bias values (learnable in practice, here we use fixed)
        bias = np.random.randn(num_buckets) * 0.01
        return bias[relative_buckets]
    
    def _scaled_dot_product_attention(self, Q, K, V, mask=None, position_bias=None, training=True):
        """Compute scaled dot-product attention."""
        d_k = Q.shape[-1]
        scores = Q @ K.transpose(0, 1, 3, 2) / np.sqrt(d_k)
        
        if position_bias is not None:
            scores = scores + position_bias[np.newaxis, np.newaxis, :, :]
        
        if mask is not None:
            scores = np.where(mask, -1e9, scores)
        
        attn_weights = softmax(scores, axis=-1)
        
        if training:
            drop_mask = (np.random.rand(*attn_weights.shape) > 0.1).astype(np.float64)
            attn_weights = attn_weights * drop_mask / 0.9
        
        output = attn_weights @ V
        return output, attn_weights
    
    def _multi_head_attention(self, x, layer, attn_key, mask=None, position_bias=None,
                              encoder_output=None, training=True):
        """Multi-head attention (self or cross)."""
        batch_size, seq_len, _ = x.shape
        attn = layer[attn_key]
        
        Q = attn['W_q'].forward(x)
        
        if encoder_output is not None:
            K = attn['W_k'].forward(encoder_output)
            V = attn['W_v'].forward(encoder_output)
        else:
            K = attn['W_k'].forward(x)
            V = attn['W_v'].forward(x)
        
        # Reshape to (batch, heads, seq_len, d_k)
        Q = Q.reshape(batch_size, seq_len, self.num_heads, self.d_k).transpose(0, 2, 1, 3)
        K = K.reshape(batch_size, -1, self.num_heads, self.d_k).transpose(0, 2, 1, 3)
        V = V.reshape(batch_size, -1, self.num_heads, self.d_k).transpose(0, 2, 1, 3)
        
        # Attention
        attn_output, attn_weights = self._scaled_dot_product_attention(
            Q, K, V, mask, position_bias, training
        )
        
        # Reshape back
        attn_output = attn_output.transpose(0, 2, 1, 3).reshape(batch_size, seq_len, self.d_model)
        
        # Output projection
        output = attn['W_o'].forward(attn_output)
        
        if training:
            output = layer['dropout'].forward(output)
        
        return output, attn_weights
    
    def _feed_forward(self, x, layer):
        """Position-wise feed-forward network."""
        h = layer['ff1'].forward(x)
        h = gelu(h)
        h = layer['ff2'].forward(h)
        h = layer['dropout'].forward(h)
        return h
    
    def _generate_causal_mask(self, seq_len):
        """Generate causal (look-ahead) mask."""
        mask = np.triu(np.ones((seq_len, seq_len)), k=1).astype(bool)
        return mask[np.newaxis, np.newaxis, :, :]
    
    def encode(self, input_ids, attention_mask=None, training=True):
        """
        Encode input sequence.
        
        Args:
            input_ids: Token IDs (batch, seq_len)
            attention_mask: Attention mask (batch, seq_len)
            training: Whether in training mode
        """
        batch_size, seq_len = input_ids.shape
        
        # Embeddings
        x = self.shared_embedding.forward(input_ids)
        if training:
            x = self.encoder_layers[0]['dropout'].forward(x)
        
        # Position bias
        position_bias = self._relative_position_bias(seq_len, seq_len)
        
        # Encoder layers
        for layer in self.encoder_layers:
            # Self-attention with residual
            residual = x
            attn_out, _ = self._multi_head_attention(
                x, layer, 'self_attention', mask=None, position_bias=position_bias, training=training
            )
            x = residual + attn_out
            x = layer['norm'].forward(x)
            
            # Feed-forward with residual
            residual = x
            ff_out = self._feed_forward(x, layer)
            x = residual + ff_out
        
        # Final layer norm
        x = self.encoder_norm.forward(x)
        
        return x
    
    def decode(self, decoder_input_ids, encoder_output, decoder_attention_mask=None,
               encoder_attention_mask=None, training=True):
        """
        Decode with cross-attention to encoder output.
        
        Args:
            decoder_input_ids: Decoder token IDs (batch, tgt_seq_len)
            encoder_output: Encoder output (batch, src_seq_len, d_model)
            decoder_attention_mask: Decoder attention mask
            encoder_attention_mask: Encoder attention mask
            training: Whether in training mode
        """
        batch_size, tgt_seq_len = decoder_input_ids.shape
        src_seq_len = encoder_output.shape[1]
        
        # Embeddings
        x = self.shared_embedding.forward(decoder_input_ids)
        if training:
            x = self.decoder_layers[0]['dropout'].forward(x)
        
        # Causal mask for decoder self-attention
        causal_mask = self._generate_causal_mask(tgt_seq_len)
        
        # Position biases
        self_position_bias = self._relative_position_bias(tgt_seq_len, tgt_seq_len)
        cross_position_bias = self._relative_position_bias(tgt_seq_len, src_seq_len)
        
        # Decoder layers
        for layer in self.decoder_layers:
            # Self-attention with residual
            residual = x
            attn_out, _ = self._multi_head_attention(
                x, layer, 'self_attention', mask=causal_mask, position_bias=self_position_bias, training=training
            )
            x = residual + attn_out
            x = layer['norm1'].forward(x)
            
            # Cross-attention with residual
            residual = x
            cross_out, _ = self._multi_head_attention(
                x, layer, 'cross_attention', position_bias=cross_position_bias,
                encoder_output=encoder_output, training=training
            )
            x = residual + cross_out
            x = layer['norm2'].forward(x)
            
            # Feed-forward with residual
            residual = x
            ff_out = self._feed_forward(x, layer)
            x = residual + ff_out
        
        # Final layer norm
        x = self.decoder_norm.forward(x)
        
        return x
    
    def forward(self, input_ids, decoder_input_ids, attention_mask=None,
                decoder_attention_mask=None, training=True):
        """
        Forward pass.
        
        Args:
            input_ids: Encoder token IDs (batch, src_seq_len)
            decoder_input_ids: Decoder token IDs (batch, tgt_seq_len)
            attention_mask: Encoder attention mask
            decoder_attention_mask: Decoder attention mask
            training: Whether in training mode
            
        Returns:
            logits: (batch, tgt_seq_len, vocab_size)
        """
        # Encode
        encoder_output = self.encode(input_ids, attention_mask, training)
        
        # Decode
        decoder_output = self.decode(
            decoder_input_ids, encoder_output, decoder_attention_mask, attention_mask, training
        )
        
        # Output projection (tied with shared embedding)
        logits = decoder_output @ self.shared_embedding.weight.T + self.output_bias
        
        return logits
    
    def generate(self, input_ids, max_new_tokens=20, temperature=1.0, top_k=None):
        """
        Generate text using encoder-decoder.
        
        Args:
            input_ids: Encoder token IDs (batch, src_seq_len)
            max_new_tokens: Maximum number of new tokens
            temperature: Sampling temperature
            top_k: Top-k sampling
            
        Returns:
            generated: Generated token IDs (batch, max_new_tokens)
        """
        batch_size = input_ids.shape[0]
        
        # Encode once
        encoder_output = self.encode(input_ids, training=False)
        
        # Start with decoder start token
        decoder_input_ids = np.full((batch_size, 1), self.decoder_start_token_id, dtype=np.int64)
        
        generated = decoder_input_ids.copy()
        
        for _ in range(max_new_tokens):
            # Decode
            decoder_output = self.decode(generated, encoder_output, training=False)
            
            # Get logits for last position
            next_token_logits = decoder_output[:, -1, :] @ self.shared_embedding.weight.T + self.output_bias
            next_token_logits = next_token_logits / temperature
            
            # Top-k sampling
            if top_k is not None:
                indices_to_remove = next_token_logits < np.sort(next_token_logits, axis=-1)[:, -top_k][:, np.newaxis]
                next_token_logits[indices_to_remove] = -1e9
            
            # Sample
            probs = softmax(next_token_logits, axis=-1)
            next_token = np.zeros((batch_size, 1), dtype=np.int64)
            for i in range(batch_size):
                next_token[i, 0] = np.random.choice(self.vocab_size, p=probs[i])
            
            generated = np.concatenate([generated, next_token], axis=1)
        
        return generated
    
    def params(self):
        """Get all parameters."""
        params = []
        params.extend(self.shared_embedding.params())
        params.extend(self.encoder_norm.params())
        params.extend(self.decoder_norm.params())
        for layer in self.encoder_layers:
            params.extend(layer['self_attention']['W_q'].params())
            params.extend(layer['self_attention']['W_k'].params())
            params.extend(layer['self_attention']['W_v'].params())
            params.extend(layer['self_attention']['W_o'].params())
            params.extend(layer['norm'].params())
            params.extend(layer['ff1'].params())
            params.extend(layer['ff2'].params())
        for layer in self.decoder_layers:
            params.extend(layer['self_attention']['W_q'].params())
            params.extend(layer['self_attention']['W_k'].params())
            params.extend(layer['self_attention']['W_v'].params())
            params.extend(layer['self_attention']['W_o'].params())
            params.extend(layer['cross_attention']['W_q'].params())
            params.extend(layer['cross_attention']['W_k'].params())
            params.extend(layer['cross_attention']['W_v'].params())
            params.extend(layer['cross_attention']['W_o'].params())
            params.extend(layer['norm1'].params())
            params.extend(layer['norm2'].params())
            params.extend(layer['ff1'].params())
            params.extend(layer['ff2'].params())
        return params
    
    def __call__(self, input_ids, decoder_input_ids, attention_mask=None,
                 decoder_attention_mask=None, training=True):
        return self.forward(input_ids, decoder_input_ids, attention_mask,
                           decoder_attention_mask, training)