"""GPT-like autoregressive language model."""

import numpy as np
from .layers import Linear, LayerNorm, Dropout, Embedding
from .activations import gelu, softmax


class GPT:
    """
    GPT-like autoregressive language model.
    
    Uses stacked decoder-only transformer layers with causal attention
    for autoregressive text generation.
    """
    
    def __init__(self, vocab_size, d_model=768, num_heads=12, num_layers=12,
                 d_ff=3072, max_len=1024, dropout=0.1):
        """
        Args:
            vocab_size: Vocabulary size
            d_model: Hidden dimension
            num_heads: Number of attention heads
            num_layers: Number of transformer layers
            d_ff: Feed-forward dimension
            max_len: Maximum sequence length
            dropout: Dropout rate
        """
        self.vocab_size = vocab_size
        self.d_model = d_model
        self.num_heads = num_heads
        self.num_layers = num_layers
        self.d_k = d_model // num_heads
        
        # Embeddings
        self.token_embedding = Embedding(vocab_size, d_model)
        self.position_embedding = Embedding(max_len, d_model)
        self.embedding_dropout = Dropout(dropout)
        
        # Transformer decoder layers
        self.layers = []
        for _ in range(num_layers):
            layer = {
                'attention': {
                    'W_q': Linear(d_model, d_model),
                    'W_k': Linear(d_model, d_model),
                    'W_v': Linear(d_model, d_model),
                    'W_o': Linear(d_model, d_model),
                },
                'norm1': LayerNorm(d_model),
                'ff1': Linear(d_model, d_ff),
                'ff2': Linear(d_ff, d_model),
                'norm2': LayerNorm(d_model),
                'dropout': Dropout(dropout),
            }
            self.layers.append(layer)
        
        # Final layer norm
        self.final_norm = LayerNorm(d_model)
        
        # Output projection (tied with token embedding)
        self.output_bias = np.zeros(vocab_size)
        
        # Cache
        self._cache = None
    
    def _scaled_dot_product_attention(self, Q, K, V, mask=None, training=True):
        """Compute scaled dot-product attention with causal masking."""
        d_k = Q.shape[-1]
        scores = Q @ K.transpose(0, 1, 3, 2) / np.sqrt(d_k)
        
        # Apply causal mask
        if mask is not None:
            scores = np.where(mask, -1e9, scores)
        
        attn_weights = softmax(scores, axis=-1)
        
        if training:
            drop_mask = (np.random.rand(*attn_weights.shape) > 0.1).astype(np.float64)
            attn_weights = attn_weights * drop_mask / 0.9
        
        output = attn_weights @ V
        return output, attn_weights
    
    def _multi_head_attention(self, x, layer, mask=None, training=True, past_key_value=None):
        """Multi-head self-attention."""
        batch_size, seq_len, _ = x.shape
        attn = layer['attention']
        
        Q = attn['W_q'].forward(x)
        K = attn['W_k'].forward(x)
        V = attn['W_v'].forward(x)
        
        # Handle past key/value for generation
        if past_key_value is not None:
            past_K, past_V = past_key_value
            K = np.concatenate([past_K, K], axis=2)
            V = np.concatenate([past_V, V], axis=2)
        
        # Reshape to (batch, heads, seq_len, d_k)
        Q = Q.reshape(batch_size, seq_len, self.num_heads, self.d_k).transpose(0, 2, 1, 3)
        K = K.reshape(batch_size, -1, self.num_heads, self.d_k).transpose(0, 2, 1, 3)
        V = V.reshape(batch_size, -1, self.num_heads, self.d_k).transpose(0, 2, 1, 3)
        
        # Attention
        attn_output, attn_weights = self._scaled_dot_product_attention(Q, K, V, mask, training)
        
        # Reshape back
        attn_output = attn_output.transpose(0, 2, 1, 3).reshape(batch_size, seq_len, self.d_model)
        
        # Output projection
        output = attn['W_o'].forward(attn_output)
        
        if training:
            output = layer['dropout'].forward(output)
        
        return output, attn_weights, (K, V)
    
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
    
    def forward(self, input_ids, training=True, past_key_values=None):
        """
        Forward pass.
        
        Args:
            input_ids: Token IDs (batch, seq_len)
            training: Whether in training mode
            past_key_values: Cached key/value tensors from previous steps
            
        Returns:
            logits: (batch, seq_len, vocab_size)
            present_key_values: Cached key/value tensors
        """
        batch_size, seq_len = input_ids.shape
        
        # Position IDs
        if past_key_values is not None:
            past_length = past_key_values[0][0].shape[2]
            position_ids = np.tile(np.arange(past_length, past_length + seq_len), (batch_size, 1))
        else:
            position_ids = np.tile(np.arange(seq_len), (batch_size, 1))
        
        # Embeddings
        token_emb = self.token_embedding.forward(input_ids)
        position_emb = self.position_embedding.forward(position_ids)
        x = token_emb + position_emb
        if training:
            x = self.embedding_dropout.forward(x)
        
        # Causal mask
        total_len = seq_len + (past_key_values[0][0].shape[2] if past_key_values else 0)
        causal_mask = self._generate_causal_mask(total_len)
        
        # Adjust mask for current sequence
        if past_key_values is not None:
            causal_mask = causal_mask[:, :, -seq_len:, :]
        else:
            causal_mask = causal_mask[:, :, :seq_len, :total_len]
        
        # Transformer layers
        present_key_values = []
        for i, layer in enumerate(self.layers):
            past_kv = past_key_values[i] if past_key_values else None
            
            # Multi-head self-attention with residual
            residual = x
            attn_out, attn_weights, present_kv = self._multi_head_attention(
                x, layer, causal_mask, training, past_kv
            )
            x = residual + attn_out
            x = layer['norm1'].forward(x)
            present_key_values.append(present_kv)
            
            # Feed-forward with residual
            residual = x
            ff_out = self._feed_forward(x, layer)
            x = residual + ff_out
            x = layer['norm2'].forward(x)
        
        # Final layer norm
        x = self.final_norm.forward(x)
        
        # Output projection (weight tied with token embedding)
        logits = x @ self.token_embedding.weight.T + self.output_bias
        
        return logits, present_key_values
    
    def generate(self, input_ids, max_new_tokens=20, temperature=1.0, top_k=None):
        """
        Generate text autoregressively.
        
        Args:
            input_ids: Starting token IDs (batch, seq_len)
            max_new_tokens: Maximum number of new tokens to generate
            temperature: Sampling temperature
            top_k: Top-k sampling (None for no top-k)
            
        Returns:
            generated: Generated token IDs (batch, seq_len + max_new_tokens)
        """
        self.embedding_dropout.train(False)
        for layer in self.layers:
            layer['dropout'].train(False)
        
        batch_size = input_ids.shape[0]
        generated = input_ids.copy()
        past_key_values = None
        
        for _ in range(max_new_tokens):
            # Forward pass
            if past_key_values is None:
                logits, past_key_values = self.forward(generated, training=False)
            else:
                # Only use last token
                next_token_input = generated[:, -1:]
                logits, past_key_values = self.forward(
                    next_token_input, training=False, past_key_values=past_key_values
                )
            
            # Get logits for last position
            next_token_logits = logits[:, -1, :] / temperature
            
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
        
        # Reset training mode
        self.embedding_dropout.train(True)
        for layer in self.layers:
            layer['dropout'].train(True)
        
        return generated
    
    def params(self):
        """Get all parameters."""
        params = []
        params.extend(self.token_embedding.params())
        params.extend(self.position_embedding.params())
        params.extend(self.final_norm.params())
        for layer in self.layers:
            params.extend(layer['attention']['W_q'].params())
            params.extend(layer['attention']['W_k'].params())
            params.extend(layer['attention']['W_v'].params())
            params.extend(layer['attention']['W_o'].params())
            params.extend(layer['norm1'].params())
            params.extend(layer['ff1'].params())
            params.extend(layer['ff2'].params())
            params.extend(layer['norm2'].params())
        return params
    
    def __call__(self, input_ids, training=True, past_key_values=None):
        return self.forward(input_ids, training, past_key_values)