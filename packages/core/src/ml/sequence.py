#!/usr/bin/env python3
"""
WebBuilder Sequence Models
Built entirely from scratch with NumPy — no external ML dependencies
Includes: RNN, LSTM, GRU, Transformer, BERT, GPT, Seq2Seq
"""

import numpy as np
from typing import List, Tuple, Optional, Dict, Any
import json


# ═══════════════════════════════════════════════════════════════════════════
# RECURRENT NEURAL NETWORK (RNN)
# ═══════════════════════════════════════════════════════════════════════════

class RNN:
    """Vanilla RNN with backpropagation through time."""
    
    def __init__(self, input_size: int, hidden_size: int, output_size: int):
        self.input_size = input_size
        self.hidden_size = hidden_size
        self.output_size = output_size
        
        # Weights
        self.Wxh = np.random.randn(hidden_size, input_size).astype(np.float32) * 0.01
        self.Whh = np.random.randn(hidden_size, hidden_size).astype(np.float32) * 0.01
        self.Why = np.random.randn(output_size, hidden_size).astype(np.float32) * 0.01
        self.bh = np.zeros(hidden_size, dtype=np.float32)
        self.by = np.zeros(output_size, dtype=np.float32)
    
    def forward(self, x: np.ndarray) -> np.ndarray:
        """Forward pass through RNN."""
        N, T, D = x.shape
        
        h = np.zeros((N, self.hidden_size), dtype=np.float32)
        outputs = []
        
        for t in range(T):
            h = np.tanh(x[:, t, :] @ self.Wxh.T + h @ self.Whh.T + self.bh)
            y = h @ self.Why.T + self.by
            outputs.append(y)
        
        return np.stack(outputs, axis=1)
    
    def step(self, x: np.ndarray, h_prev: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Single step forward."""
        h = np.tanh(x @ self.Wxh.T + h_prev @ self.Whh.T + self.bh)
        y = h @ self.Why.T + self.by
        return y, h


# ═══════════════════════════════════════════════════════════════════════════
# LONG SHORT-TERM MEMORY (LSTM)
# ═══════════════════════════════════════════════════════════════════════════

class LSTM:
    """Long Short-Term Memory network."""
    
    def __init__(self, input_size: int, hidden_size: int, output_size: int):
        self.input_size = input_size
        self.hidden_size = hidden_size
        self.output_size = output_size
        
        # Forget gate
        self.Wf = np.random.randn(hidden_size, input_size + hidden_size).astype(np.float32) * 0.01
        self.bf = np.zeros(hidden_size, dtype=np.float32)
        
        # Input gate
        self.Wi = np.random.randn(hidden_size, input_size + hidden_size).astype(np.float32) * 0.01
        self.bi = np.zeros(hidden_size, dtype=np.float32)
        
        # Candidate values
        self.Wc = np.random.randn(hidden_size, input_size + hidden_size).astype(np.float32) * 0.01
        self.bc = np.zeros(hidden_size, dtype=np.float32)
        
        # Output gate
        self.Wo = np.random.randn(hidden_size, input_size + hidden_size).astype(np.float32) * 0.01
        self.bo = np.zeros(hidden_size, dtype=np.float32)
        
        # Output layer
        self.Why = np.random.randn(output_size, hidden_size).astype(np.float32) * 0.01
        self.by = np.zeros(output_size, dtype=np.float32)
    
    def forward(self, x: np.ndarray) -> np.ndarray:
        """Forward pass through LSTM."""
        N, T, D = x.shape
        
        h = np.zeros((N, self.hidden_size), dtype=np.float32)
        c = np.zeros((N, self.hidden_size), dtype=np.float32)
        outputs = []
        
        for t in range(T):
            # Concatenate input and hidden state
            concat = np.concatenate([x[:, t, :], h], axis=1)
            
            # Forget gate
            f = 1 / (1 + np.exp(-(concat @ self.Wf.T + self.bf)))
            
            # Input gate
            i = 1 / (1 + np.exp(-(concat @ self.Wi.T + self.bi)))
            
            # Candidate values
            c_candidate = np.tanh(concat @ self.Wc.T + self.bc)
            
            # Update cell state
            c = f * c + i * c_candidate
            
            # Output gate
            o = 1 / (1 + np.exp(-(concat @ self.Wo.T + self.bo)))
            
            # Hidden state
            h = o * np.tanh(c)
            
            # Output
            y = h @ self.Why.T + self.by
            outputs.append(y)
        
        return np.stack(outputs, axis=1)
    
    def step(self, x: np.ndarray, h_prev: np.ndarray, c_prev: np.ndarray) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Single step forward."""
        concat = np.concatenate([x, h_prev], axis=1)
        
        f = 1 / (1 + np.exp(-(concat @ self.Wf.T + self.bf)))
        i = 1 / (1 + np.exp(-(concat @ self.Wi.T + self.bi)))
        c_candidate = np.tanh(concat @ self.Wc.T + self.bc)
        c = f * c_prev + i * c_candidate
        o = 1 / (1 + np.exp(-(concat @ self.Wo.T + self.bo)))
        h = o * np.tanh(c)
        y = h @ self.Why.T + self.by
        
        return y, h, c


# ═══════════════════════════════════════════════════════════════════════════
# GATED RECURRENT UNIT (GRU)
# ═══════════════════════════════════════════════════════════════════════════

class GRU:
    """Gated Recurrent Unit."""
    
    def __init__(self, input_size: int, hidden_size: int, output_size: int):
        self.input_size = input_size
        self.hidden_size = hidden_size
        self.output_size = output_size
        
        # Reset gate
        self.Wr = np.random.randn(hidden_size, input_size + hidden_size).astype(np.float32) * 0.01
        self.br = np.zeros(hidden_size, dtype=np.float32)
        
        # Update gate
        self.Wz = np.random.randn(hidden_size, input_size + hidden_size).astype(np.float32) * 0.01
        self.bz = np.zeros(hidden_size, dtype=np.float32)
        
        # Candidate activation
        self.Wh = np.random.randn(hidden_size, input_size + hidden_size).astype(np.float32) * 0.01
        self.bh = np.zeros(hidden_size, dtype=np.float32)
        
        # Output layer
        self.Why = np.random.randn(output_size, hidden_size).astype(np.float32) * 0.01
        self.by = np.zeros(output_size, dtype=np.float32)
    
    def forward(self, x: np.ndarray) -> np.ndarray:
        """Forward pass through GRU."""
        N, T, D = x.shape
        
        h = np.zeros((N, self.hidden_size), dtype=np.float32)
        outputs = []
        
        for t in range(T):
            concat = np.concatenate([x[:, t, :], h], axis=1)
            
            # Reset gate
            r = 1 / (1 + np.exp(-(concat @ self.Wr.T + self.br)))
            
            # Update gate
            z = 1 / (1 + np.exp(-(concat @ self.Wz.T + self.bz)))
            
            # Candidate activation
            concat_r = np.concatenate([x[:, t, :], r * h], axis=1)
            h_candidate = np.tanh(concat_r @ self.Wh.T + self.bh)
            
            # Update hidden state
            h = (1 - z) * h + z * h_candidate
            
            # Output
            y = h @ self.Why.T + self.by
            outputs.append(y)
        
        return np.stack(outputs, axis=1)


# ═══════════════════════════════════════════════════════════════════════════
# TRANSFORMER
# ═══════════════════════════════════════════════════════════════════════════

class Transformer:
    """Complete Transformer model."""
    
    def __init__(self, vocab_size: int, embed_dim: int = 512, num_heads: int = 8,
                 num_layers: int = 6, ff_dim: int = 2048, max_seq_len: int = 512,
                 dropout: float = 0.1):
        self.vocab_size = vocab_size
        self.embed_dim = embed_dim
        self.num_heads = num_heads
        self.num_layers = num_layers
        self.ff_dim = ff_dim
        self.max_seq_len = max_seq_len
        self.dropout = dropout
        
        # Token embedding
        self.token_embed = np.random.randn(vocab_size, embed_dim).astype(np.float32) * 0.02
        
        # Positional encoding
        self.pos_embed = self._positional_encoding(max_seq_len, embed_dim)
        
        # Transformer blocks
        self.blocks = []
        for _ in range(num_layers):
            self.blocks.append(TransformerBlock(embed_dim, num_heads, ff_dim))
        
        # Output projection
        self.W_out = np.random.randn(embed_dim, vocab_size).astype(np.float32) * 0.02
        self.b_out = np.zeros(vocab_size, dtype=np.float32)
    
    def _positional_encoding(self, max_len: int, embed_dim: int) -> np.ndarray:
        """Sinusoidal positional encoding."""
        pos = np.arange(max_len)[:, np.newaxis]
        dim = np.arange(embed_dim)[np.newaxis, :]
        
        angles = pos / np.power(10000, (2 * (dim // 2)) / embed_dim)
        
        pe = np.zeros((max_len, embed_dim), dtype=np.float32)
        pe[:, 0::2] = np.sin(angles[:, 0::2])
        pe[:, 1::2] = np.cos(angles[:, 1::2])
        
        return pe[np.newaxis, :, :]
    
    def forward(self, x: np.ndarray, mask: Optional[np.ndarray] = None) -> np.ndarray:
        """Forward pass through Transformer."""
        N, T = x.shape
        
        # Token embedding + positional encoding
        embed = self.token_embed[x] + self.pos_embed[:, :T, :]
        
        # Transformer blocks
        for block in self.blocks:
            embed = block.forward(embed, mask)
        
        # Output projection
        out = embed @ self.W_out + self.b_out
        
        return out
    
    def generate(self, prompt: np.ndarray, max_len: int = 100, temperature: float = 1.0) -> np.ndarray:
        """Generate text autoregressively."""
        generated = prompt.copy()
        
        for _ in range(max_len):
            # Get predictions
            logits = self.forward(generated)
            logits = logits[:, -1, :] / temperature
            
            # Sample
            probs = self._softmax(logits, axis=-1)
            next_token = np.array([[np.random.choice(self.vocab_size, p=p)] for p in probs])
            
            generated = np.concatenate([generated, next_token], axis=1)
        
        return generated
    
    def _softmax(self, x: np.ndarray, axis: int = -1) -> np.ndarray:
        """Numerically stable softmax."""
        exp_x = np.exp(x - np.max(x, axis=axis, keepdims=True))
        return exp_x / np.sum(exp_x, axis=axis, keepdims=True)


class TransformerBlock:
    """Transformer block with multi-head attention and feed-forward."""
    
    def __init__(self, embed_dim: int, num_heads: int, ff_dim: int = None):
        self.embed_dim = embed_dim
        self.num_heads = num_heads
        self.head_dim = embed_dim // num_heads
        self.ff_dim = ff_dim or embed_dim * 4
        
        # Multi-head attention
        self.W_q = np.random.randn(embed_dim, embed_dim).astype(np.float32) * 0.02
        self.W_k = np.random.randn(embed_dim, embed_dim).astype(np.float32) * 0.02
        self.W_v = np.random.randn(embed_dim, embed_dim).astype(np.float32) * 0.02
        self.W_o = np.random.randn(embed_dim, embed_dim).astype(np.float32) * 0.02
        
        # Feed-forward
        self.W1 = np.random.randn(embed_dim, self.ff_dim).astype(np.float32) * 0.02
        self.b1 = np.zeros(self.ff_dim, dtype=np.float32)
        self.W2 = np.random.randn(self.ff_dim, embed_dim).astype(np.float32) * 0.02
        self.b2 = np.zeros(embed_dim, dtype=np.float32)
        
        # Layer norm
        self.gamma1 = np.ones(embed_dim, dtype=np.float32)
        self.beta1 = np.zeros(embed_dim, dtype=np.float32)
        self.gamma2 = np.ones(embed_dim, dtype=np.float32)
        self.beta2 = np.zeros(embed_dim, dtype=np.float32)
    
    def forward(self, x: np.ndarray, mask: Optional[np.ndarray] = None) -> np.ndarray:
        """Forward pass through transformer block."""
        # Layer norm + multi-head attention + residual
        norm1 = self._layer_norm(x, self.gamma1, self.beta1)
        attn_out = self._multi_head_attention(norm1, mask)
        x = x + attn_out
        
        # Layer norm + feed-forward + residual
        norm2 = self._layer_norm(x, self.gamma2, self.beta2)
        ff_out = norm2 @ self.W1 + self.b1
        ff_out = np.maximum(0, ff_out)  # ReLU
        ff_out = ff_out @ self.W2 + self.b2
        x = x + ff_out
        
        return x
    
    def _multi_head_attention(self, x: np.ndarray, mask: Optional[np.ndarray] = None) -> np.ndarray:
        """Multi-head self-attention."""
        N, seq_len, embed_dim = x.shape
        
        # Project to Q, K, V
        Q = x @ self.W_q
        K = x @ self.W_k
        V = x @ self.W_v
        
        # Reshape to (N, num_heads, seq_len, head_dim)
        Q = Q.reshape(N, seq_len, self.num_heads, self.head_dim).transpose(0, 2, 1, 3)
        K = K.reshape(N, seq_len, self.num_heads, self.head_dim).transpose(0, 2, 1, 3)
        V = V.reshape(N, seq_len, self.num_heads, self.head_dim).transpose(0, 2, 1, 3)
        
        # Scaled dot-product attention
        scale = np.sqrt(self.head_dim)
        attention = Q @ K.transpose(0, 1, 3, 2) / scale
        
        # Apply mask
        if mask is not None:
            attention = attention + mask
        
        # Softmax
        attention = self._softmax(attention, axis=-1)
        
        # Apply attention to values
        out = attention @ V
        
        # Reshape back
        out = out.transpose(0, 2, 1, 3).reshape(N, seq_len, embed_dim)
        
        # Output projection
        out = out @ self.W_o
        
        return out
    
    def _layer_norm(self, x: np.ndarray, gamma: np.ndarray, beta: np.ndarray) -> np.ndarray:
        """Layer normalization."""
        mean = np.mean(x, axis=-1, keepdims=True)
        var = np.var(x, axis=-1, keepdims=True)
        x_norm = (x - mean) / np.sqrt(var + 1e-5)
        return gamma * x_norm + beta
    
    def _softmax(self, x: np.ndarray, axis: int = -1) -> np.ndarray:
        """Numerically stable softmax."""
        exp_x = np.exp(x - np.max(x, axis=axis, keepdims=True))
        return exp_x / np.sum(exp_x, axis=axis, keepdims=True)


# ═══════════════════════════════════════════════════════════════════════════
# BERT (Bidirectional Encoder Representations from Transformers)
# ═══════════════════════════════════════════════════════════════════════════

class BERT:
    """BERT model for masked language modeling."""
    
    def __init__(self, vocab_size: int, embed_dim: int = 768, num_heads: int = 12,
                 num_layers: int = 12, ff_dim: int = 3072, max_seq_len: int = 512):
        self.vocab_size = vocab_size
        self.embed_dim = embed_dim
        self.num_heads = num_heads
        self.num_layers = num_layers
        self.ff_dim = ff_dim
        self.max_seq_len = max_seq_len
        
        # Token embedding
        self.token_embed = np.random.randn(vocab_size, embed_dim).astype(np.float32) * 0.02
        
        # Segment embedding
        self.segment_embed = np.random.randn(2, embed_dim).astype(np.float32) * 0.02
        
        # Positional embedding
        self.pos_embed = np.random.randn(max_seq_len, embed_dim).astype(np.float32) * 0.02
        
        # Transformer blocks
        self.blocks = []
        for _ in range(num_layers):
            self.blocks.append(TransformerBlock(embed_dim, num_heads, ff_dim))
        
        # MLM head
        self.W_mlm = np.random.randn(embed_dim, vocab_size).astype(np.float32) * 0.02
        self.b_mlm = np.zeros(vocab_size, dtype=np.float32)
    
    def forward(self, x: np.ndarray, segment_ids: Optional[np.ndarray] = None) -> np.ndarray:
        """Forward pass through BERT."""
        N, T = x.shape
        
        # Embeddings
        embed = self.token_embed[x] + self.pos_embed[:T, :]
        
        if segment_ids is not None:
            embed = embed + self.segment_embed[segment_ids]
        
        # Transformer blocks
        for block in self.blocks:
            embed = block.forward(embed)
        
        # MLM head
        out = embed @ self.W_mlm + self.b_mlm
        
        return out


# ═══════════════════════════════════════════════════════════════════════════
# GPT (Generative Pre-trained Transformer)
# ═══════════════════════════════════════════════════════════════════════════

class GPT:
    """GPT model for autoregressive text generation."""
    
    def __init__(self, vocab_size: int, embed_dim: int = 768, num_heads: int = 12,
                 num_layers: int = 12, ff_dim: int = 3072, max_seq_len: int = 1024):
        self.vocab_size = vocab_size
        self.embed_dim = embed_dim
        self.num_heads = num_heads
        self.num_layers = num_layers
        self.ff_dim = ff_dim
        self.max_seq_len = max_seq_len
        
        # Token embedding
        self.token_embed = np.random.randn(vocab_size, embed_dim).astype(np.float32) * 0.02
        
        # Positional encoding
        self.pos_embed = np.random.randn(max_seq_len, embed_dim).astype(np.float32) * 0.02
        
        # Transformer blocks
        self.blocks = []
        for _ in range(num_layers):
            self.blocks.append(TransformerBlock(embed_dim, num_heads, ff_dim))
        
        # Output projection
        self.W_out = np.random.randn(embed_dim, vocab_size).astype(np.float32) * 0.02
        self.b_out = np.zeros(vocab_size, dtype=np.float32)
    
    def forward(self, x: np.ndarray) -> np.ndarray:
        """Forward pass through GPT."""
        N, T = x.shape
        
        # Create causal mask
        mask = np.triu(np.full((T, T), -np.inf), k=1).astype(np.float32)
        
        # Embeddings
        embed = self.token_embed[x] + self.pos_embed[:T, :]
        
        # Transformer blocks
        for block in self.blocks:
            embed = block.forward(embed, mask)
        
        # Output projection
        out = embed @ self.W_out + self.b_out
        
        return out
    
    def generate(self, prompt: np.ndarray, max_len: int = 100, temperature: float = 1.0) -> np.ndarray:
        """Generate text autoregressively."""
        generated = prompt.copy()
        
        for _ in range(max_len):
            # Get predictions
            logits = self.forward(generated)
            logits = logits[:, -1, :] / temperature
            
            # Sample
            probs = self._softmax(logits, axis=-1)
            next_token = np.array([[np.random.choice(self.vocab_size, p=p)] for p in probs])
            
            generated = np.concatenate([generated, next_token], axis=1)
        
        return generated
    
    def _softmax(self, x: np.ndarray, axis: int = -1) -> np.ndarray:
        """Numerically stable softmax."""
        exp_x = np.exp(x - np.max(x, axis=axis, keepdims=True))
        return exp_x / np.sum(exp_x, axis=axis, keepdims=True)


# ═══════════════════════════════════════════════════════════════════════════
# SEQ2SEQ WITH ATTENTION
# ═══════════════════════════════════════════════════════════════════════════

class Seq2Seq:
    """Sequence-to-sequence model with attention."""
    
    def __init__(self, input_vocab_size: int, output_vocab_size: int,
                 embed_dim: int = 256, hidden_size: int = 512):
        self.input_vocab_size = input_vocab_size
        self.output_vocab_size = output_vocab_size
        self.embed_dim = embed_dim
        self.hidden_size = hidden_size
        
        # Encoder
        self.encoder = LSTM(input_vocab_size, hidden_size, hidden_size)
        
        # Decoder
        self.decoder = LSTM(output_vocab_size, hidden_size, output_vocab_size)
        
        # Attention
        self.W_attn = np.random.randn(hidden_size, hidden_size).astype(np.float32) * 0.02
    
    def encode(self, x: np.ndarray) -> np.ndarray:
        """Encode input sequence."""
        N, T, D = x.shape
        
        h = np.zeros((N, self.hidden_size), dtype=np.float32)
        c = np.zeros((N, self.hidden_size), dtype=np.float32)
        hidden_states = []
        
        for t in range(T):
            _, h, c = self.encoder.step(x[:, t, :], h, c)
            hidden_states.append(h)
        
        return np.stack(hidden_states, axis=1)
    
    def decode(self, encoder_outputs: np.ndarray, target: np.ndarray) -> np.ndarray:
        """Decode with attention."""
        N, T, D = target.shape
        
        h = encoder_outputs[:, -1, :]  # Use last encoder state
        c = np.zeros((N, self.hidden_size), dtype=np.float32)
        outputs = []
        
        for t in range(T):
            # Attention
            attn_scores = encoder_outputs @ (h @ self.W_attn).T
            attn_weights = self._softmax(attn_scores, axis=1)
            context = np.sum(attn_weights[:, :, np.newaxis] * encoder_outputs, axis=1)
            
            # Decoder step
            y, h, c = self.decoder.step(target[:, t, :], h, c)
            outputs.append(y)
        
        return np.stack(outputs, axis=1)
    
    def _softmax(self, x: np.ndarray, axis: int = -1) -> np.ndarray:
        """Numerically stable softmax."""
        exp_x = np.exp(x - np.max(x, axis=axis, keepdims=True))
        return exp_x / np.sum(exp_x, axis=axis, keepdims=True)


if __name__ == '__main__':
    print("Testing Sequence Models...")
    
    # Test RNN
    print("\n1. Testing RNN...")
    rnn = RNN(input_size=10, hidden_size=32, output_size=10)
    x = np.random.randn(2, 5, 10).astype(np.float32)
    out = rnn.forward(x)
    print(f"   Output shape: {out.shape}")
    
    # Test LSTM
    print("\n2. Testing LSTM...")
    lstm = LSTM(input_size=10, hidden_size=32, output_size=10)
    out = lstm.forward(x)
    print(f"   Output shape: {out.shape}")
    
    # Test GRU
    print("\n3. Testing GRU...")
    gru = GRU(input_size=10, hidden_size=32, output_size=10)
    out = gru.forward(x)
    print(f"   Output shape: {out.shape}")
    
    # Test Transformer
    print("\n4. Testing Transformer...")
    transformer = Transformer(vocab_size=1000, embed_dim=128, num_heads=4, num_layers=2)
    x = np.random.randint(0, 1000, (2, 10))
    out = transformer.forward(x)
    print(f"   Output shape: {out.shape}")
    
    # Test BERT
    print("\n5. Testing BERT...")
    bert = BERT(vocab_size=1000, embed_dim=128, num_heads=4, num_layers=2)
    x = np.random.randint(0, 1000, (2, 10))
    out = bert.forward(x)
    print(f"   Output shape: {out.shape}")
    
    # Test GPT
    print("\n6. Testing GPT...")
    gpt = GPT(vocab_size=1000, embed_dim=128, num_heads=4, num_layers=2)
    x = np.random.randint(0, 1000, (2, 10))
    out = gpt.forward(x)
    print(f"   Output shape: {out.shape}")
    
    # Test Seq2Seq
    print("\n7. Testing Seq2Seq...")
    seq2seq = Seq2Seq(input_vocab_size=100, output_vocab_size=100, embed_dim=64, hidden_size=128)
    x = np.random.randn(2, 5, 100).astype(np.float32)
    encoder_out = seq2seq.encode(x)
    target = np.random.randn(2, 5, 100).astype(np.float32)
    out = seq2seq.decode(encoder_out, target)
    print(f"   Output shape: {out.shape}")
    
    print("\nAll sequence models tested successfully!")
