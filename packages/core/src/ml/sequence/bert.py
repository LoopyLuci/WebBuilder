"""BERT-like bidirectional encoder model."""

import numpy as np
from .layers import Linear, LayerNorm, Dropout, Embedding
from .activations import gelu, softmax


class BERT:
    """
    BERT-like bidirectional encoder model.
    
    Uses stacked Transformer encoder layers with bidirectional self-attention
    for masked language modeling.
    """
    
    def __init__(self, vocab_size, d_model=768, num_heads=12, num_layers=12,
                 d_ff=3072, max_len=512, dropout=0.1, num_segments=2):
        """
        Args:
            vocab_size: Vocabulary size
            d_model: Hidden dimension
            num_heads: Number of attention heads
            num_layers: Number of transformer layers
            d_ff: Feed-forward dimension
            max_len: Maximum sequence length
            dropout: Dropout rate
            num_segments: Number of segment types
        """
        self.vocab_size = vocab_size
        self.d_model = d_model
        self.num_heads = num_heads
        self.num_layers = num_layers
        self.d_k = d_model // num_heads
        
        # Embeddings
        self.token_embedding = Embedding(vocab_size, d_model)
        self.position_embedding = Embedding(max_len, d_model)
        self.segment_embedding = Embedding(num_segments, d_model)
        self.embedding_norm = LayerNorm(d_model)
        self.embedding_dropout = Dropout(dropout)
        
        # Transformer encoder layers
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
        
        # MLM head (for masked language modeling)
        self.mlm_dense = Linear(d_model, d_model)
        self.mlm_norm = LayerNorm(d_model)
        self.mlm_bias = np.zeros(vocab_size)
        
        # NSP head (for next sentence prediction)
        self.nsp_dense = Linear(d_model, d_model)
        self.nsp_classifier = Linear(d_model, 2)
        
        # Cache
        self._cache = None
    
    def _scaled_dot_product_attention(self, Q, K, V, mask=None, training=True):
        """Compute scaled dot-product attention."""
        d_k = Q.shape[-1]
        scores = Q @ K.transpose(0, 1, 3, 2) / np.sqrt(d_k)
        
        if mask is not None:
            scores = np.where(mask, -1e9, scores)
        
        attn_weights = softmax(scores, axis=-1)
        
        if training:
            # Apply dropout to attention weights
            drop_mask = (np.random.rand(*attn_weights.shape) > 0.1).astype(np.float64)
            attn_weights = attn_weights * drop_mask / 0.9
        
        output = attn_weights @ V
        return output, attn_weights
    
    def _multi_head_attention(self, x, layer, mask=None, training=True):
        """Multi-head self-attention."""
        batch_size, seq_len, _ = x.shape
        attn = layer['attention']
        
        Q = attn['W_q'].forward(x)
        K = attn['W_k'].forward(x)
        V = attn['W_v'].forward(x)
        
        # Reshape to (batch, heads, seq_len, d_k)
        Q = Q.reshape(batch_size, seq_len, self.num_heads, self.d_k).transpose(0, 2, 1, 3)
        K = K.reshape(batch_size, seq_len, self.num_heads, self.d_k).transpose(0, 2, 1, 3)
        V = V.reshape(batch_size, seq_len, self.num_heads, self.d_k).transpose(0, 2, 1, 3)
        
        # Attention
        attn_output, attn_weights = self._scaled_dot_product_attention(Q, K, V, mask, training)
        
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
    
    def forward(self, input_ids, segment_ids=None, mask_positions=None, training=True):
        """
        Forward pass.
        
        Args:
            input_ids: Token IDs (batch, seq_len)
            segment_ids: Segment IDs (batch, seq_len)
            mask_positions: Positions to mask for MLM (batch, num_masks)
            training: Whether in training mode
            
        Returns:
            sequence_output: (batch, seq_len, d_model)
            pooled_output: (batch, d_model) - CLS token output
            mlm_logits: (batch, num_masks, vocab_size) if mask_positions provided
            nsp_logits: (batch, 2) if segment_ids provided
        """
        batch_size, seq_len = input_ids.shape
        
        if segment_ids is None:
            segment_ids = np.zeros_like(input_ids)
        
        # Position IDs
        position_ids = np.tile(np.arange(seq_len), (batch_size, 1))
        
        # Embeddings
        token_emb = self.token_embedding.forward(input_ids)
        position_emb = self.position_embedding.forward(position_ids)
        segment_emb = self.segment_embedding.forward(segment_ids)
        
        x = token_emb + position_emb + segment_emb
        x = self.embedding_norm.forward(x)
        if training:
            x = self.embedding_dropout.forward(x)
        
        # Store attention weights for visualization
        all_attn_weights = []
        
        # Transformer layers
        for layer in self.layers:
            # Multi-head self-attention with residual
            residual = x
            attn_out, attn_weights = self._multi_head_attention(x, layer, mask=None, training=training)
            x = residual + attn_out
            x = layer['norm1'].forward(x)
            all_attn_weights.append(attn_weights)
            
            # Feed-forward with residual
            residual = x
            ff_out = self._feed_forward(x, layer)
            x = residual + ff_out
            x = layer['norm2'].forward(x)
        
        sequence_output = x
        
        # CLS token output (pooled)
        pooled_output = sequence_output[:, 0, :]
        
        outputs = (sequence_output, pooled_output)
        
        # MLM head
        if mask_positions is not None:
            # Extract masked positions
            masked_output = np.zeros((batch_size, mask_positions.shape[1], self.d_model))
            for b in range(batch_size):
                for i, pos in enumerate(mask_positions[b]):
                    masked_output[b, i] = sequence_output[b, pos]
            
            mlm_h = self.mlm_dense.forward(masked_output)
            mlm_h = gelu(mlm_h)
            mlm_h = self.mlm_norm.forward(mlm_h)
            
            # Project to vocabulary (using token embedding weights)
            mlm_logits = mlm_h @ self.token_embedding.weight.T + self.mlm_bias
            outputs = outputs + (mlm_logits,)
        
        # NSP head
        if segment_ids is not None:
            nsp_h = self.nsp_dense.forward(pooled_output)
            nsp_h = np.tanh(nsp_h)
            nsp_logits = self.nsp_classifier.forward(nsp_h)
            outputs = outputs + (nsp_logits,)
        
        return outputs
    
    def predict_masked(self, input_ids, mask_positions, training=False):
        """Predict masked tokens."""
        sequence_output, pooled_output, mlm_logits = self.forward(
            input_ids, mask_positions=mask_positions, training=training
        )
        predictions = np.argmax(mlm_logits, axis=-1)
        return predictions, mlm_logits
    
    def params(self):
        """Get all parameters."""
        params = []
        params.extend(self.token_embedding.params())
        params.extend(self.position_embedding.params())
        params.extend(self.segment_embedding.params())
        params.extend(self.embedding_norm.params())
        params.extend(self.mlm_dense.params())
        params.extend(self.mlm_norm.params())
        params.extend(self.nsp_dense.params())
        params.extend(self.nsp_classifier.params())
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
    
    def __call__(self, input_ids, segment_ids=None, mask_positions=None, training=True):
        return self.forward(input_ids, segment_ids, mask_positions, training)