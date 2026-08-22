# WebBuilder Native ML/AI Framework
# Language Models: Transformer, RNN, LSTM, GRU
# Built from scratch — no external ML dependencies

import numpy as np
from abc import ABC, abstractmethod
from typing import Any, Callable, Dict, List, Optional, Tuple, Union
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from neural.core import *


# ============================================================================
# RECURRENT NEURAL NETWORK (RNN)
# ============================================================================

class RNNCell(Layer):
    """Simple RNN cell"""
    
    def __init__(self, input_size: int, hidden_size: int):
        super().__init__()
        self.input_size = input_size
        self.hidden_size = hidden_size
        
        self.wxh = Linear(input_size, hidden_size)
        self.whh = Linear(hidden_size, hidden_size)
        
        self.layers = {'wxh': self.wxh, 'whh': self.whh}
    
    def forward(self, x: Tensor, h: Tensor) -> Tensor:
        return (self.wxh(x) + self.whh(h)).tanh()
    
    def parameters(self) -> List[Tensor]:
        return list(self.layers.values())


class RNN(Layer):
    """Multi-layer RNN"""
    
    def __init__(self, input_size: int, hidden_size: int, num_layers: int = 1):
        super().__init__()
        self.input_size = input_size
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        
        self.cells = []
        for i in range(num_layers):
            layer_input = input_size if i == 0 else hidden_size
            self.cells.append(RNNCell(layer_input, hidden_size))
        
        self.layers = {f'cell_{i}': cell for i, cell in enumerate(self.cells)}
    
    def forward(self, x: Tensor, h0: Tensor = None) -> Tuple[Tensor, Tensor]:
        batch_size, seq_len, _ = x.shape
        
        if h0 is None:
            h0 = Tensor(np.zeros((batch_size, self.hidden_size)))
        
        h = h0
        outputs = []
        
        for t in range(seq_len):
            xt = Tensor(x.data[:, t, :], requires_grad=True)
            for cell in self.cells:
                h = cell(xt, h)
                xt = h
            outputs.append(h.data)
        
        output = Tensor(np.stack(outputs, axis=1), requires_grad=True)
        return output, h
    
    def parameters(self) -> List[Tensor]:
        params = []
        for cell in self.cells:
            params.extend(cell.parameters())
        return params


# ============================================================================
# LONG SHORT-TERM MEMORY (LSTM)
# ============================================================================

class LSTMCell(Layer):
    """LSTM cell with forget, input, and output gates"""
    
    def __init__(self, input_size: int, hidden_size: int):
        super().__init__()
        self.input_size = input_size
        self.hidden_size = hidden_size
        
        # Forget gate
        self.wf = Linear(input_size + hidden_size, hidden_size)
        # Input gate
        self.wi = Linear(input_size + hidden_size, hidden_size)
        # Candidate values
        self.wc = Linear(input_size + hidden_size, hidden_size)
        # Output gate
        self.wo = Linear(input_size + hidden_size, hidden_size)
        
        self.layers = {
            'wf': self.wf, 'wi': self.wi,
            'wc': self.wc, 'wo': self.wo
        }
    
    def forward(self, x: Tensor, state: Tuple[Tensor, Tensor]) -> Tuple[Tensor, Tensor]:
        h_prev, c_prev = state
        
        # Concatenate input and previous hidden state
        combined = Tensor(np.concatenate([x.data, h_prev.data], axis=1), requires_grad=True)
        
        # Forget gate
        f = self.wf(combined).sigmoid()
        
        # Input gate
        i = self.wi(combined).sigmoid()
        
        # Candidate values
        c_candidate = self.wc(combined).tanh()
        
        # Cell state
        c = f * c_prev + i * c_candidate
        
        # Output gate
        o = self.wo(combined).sigmoid()
        
        # Hidden state
        h = o * c.tanh()
        
        return h, c
    
    def parameters(self) -> List[Tensor]:
        params = []
        for layer in self.layers.values():
            params.extend(layer.parameters())
        return params


class LSTM(Layer):
    """Multi-layer LSTM"""
    
    def __init__(self, input_size: int, hidden_size: int, num_layers: int = 1):
        super().__init__()
        self.input_size = input_size
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        
        self.cells = []
        for i in range(num_layers):
            layer_input = input_size if i == 0 else hidden_size
            self.cells.append(LSTMCell(layer_input, hidden_size))
        
        self.layers = {f'cell_{i}': cell for i, cell in enumerate(self.cells)}
    
    def forward(self, x: Tensor, hidden: Tuple[Tensor, Tensor] = None) -> Tuple[Tensor, Tuple[Tensor, Tensor]]:
        batch_size, seq_len, _ = x.shape
        
        if hidden is None:
            h = Tensor(np.zeros((batch_size, self.hidden_size)))
            c = Tensor(np.zeros((batch_size, self.hidden_size)))
        else:
            h, c = hidden
        
        outputs = []
        
        for t in range(seq_len):
            xt = Tensor(x.data[:, t, :], requires_grad=True)
            for cell in self.cells:
                h, c = cell(xt, (h, c))
                xt = h
            outputs.append(h.data)
        
        output = Tensor(np.stack(outputs, axis=1), requires_grad=True)
        return output, (h, c)
    
    def parameters(self) -> List[Tensor]:
        params = []
        for cell in self.cells:
            params.extend(cell.parameters())
        return params


# ============================================================================
# GATED RECURRENT UNIT (GRU)
# ============================================================================

class GRUCell(Layer):
    """GRU cell with reset and update gates"""
    
    def __init__(self, input_size: int, hidden_size: int):
        super().__init__()
        self.input_size = input_size
        self.hidden_size = hidden_size
        
        # Reset gate
        self.wr = Linear(input_size + hidden_size, hidden_size)
        # Update gate
        self.wz = Linear(input_size + hidden_size, hidden_size)
        # Candidate activation
        self.wh = Linear(input_size + hidden_size, hidden_size)
        
        self.layers = {'wr': self.wr, 'wz': self.wz, 'wh': self.wh}
    
    def forward(self, x: Tensor, h: Tensor) -> Tensor:
        # Concatenate input and previous hidden state
        combined = Tensor(np.concatenate([x.data, h.data], axis=1), requires_grad=True)
        
        # Reset gate
        r = self.wr(combined).sigmoid()
        
        # Update gate
        z = self.wz(combined).sigmoid()
        
        # Candidate activation
        reset_hidden = Tensor(np.concatenate([x.data, (r * h).data], axis=1), requires_grad=True)
        h_candidate = self.wh(reset_hidden).tanh()
        
        # Hidden state
        h_new = (Tensor(np.ones_like(z.data)) - z) * h + z * h_candidate
        
        return h_new
    
    def parameters(self) -> List[Tensor]:
        params = []
        for layer in self.layers.values():
            params.extend(layer.parameters())
        return params


class GRU(Layer):
    """Multi-layer GRU"""
    
    def __init__(self, input_size: int, hidden_size: int, num_layers: int = 1):
        super().__init__()
        self.input_size = input_size
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        
        self.cells = []
        for i in range(num_layers):
            layer_input = input_size if i == 0 else hidden_size
            self.cells.append(GRUCell(layer_input, hidden_size))
        
        self.layers = {f'cell_{i}': cell for i, cell in enumerate(self.cells)}
    
    def forward(self, x: Tensor, h0: Tensor = None) -> Tuple[Tensor, Tensor]:
        batch_size, seq_len, _ = x.shape
        
        if h0 is None:
            h0 = Tensor(np.zeros((batch_size, self.hidden_size)))
        
        h = h0
        outputs = []
        
        for t in range(seq_len):
            xt = Tensor(x.data[:, t, :], requires_grad=True)
            for cell in self.cells:
                h = cell(xt, h)
                xt = h
            outputs.append(h.data)
        
        output = Tensor(np.stack(outputs, axis=1), requires_grad=True)
        return output, h
    
    def parameters(self) -> List[Tensor]:
        params = []
        for cell in self.cells:
            params.extend(cell.parameters())
        return params


# ============================================================================
# TRANSFORMER (for language)
# ============================================================================

class PositionalEncoding(Layer):
    """Sinusoidal positional encoding"""
    
    def __init__(self, max_seq_len: int, d_model: int):
        super().__init__()
        self.d_model = d_model
        
        pe = np.zeros((max_seq_len, d_model))
        position = np.arange(0, max_seq_len).reshape(-1, 1)
        div_term = np.exp(np.arange(0, d_model, 2) * -(np.log(10000.0) / d_model))
        
        pe[:, 0::2] = np.sin(position * div_term)
        pe[:, 1::2] = np.cos(position * div_term)
        
        self.pe = Tensor(pe[np.newaxis, :, :], requires_grad=False)
    
    def forward(self, x: Tensor) -> Tensor:
        seq_len = x.shape[1]
        return x + Tensor(self.pe.data[:, :seq_len, :])


class FeedForward(Layer):
    """Position-wise feed-forward network"""
    
    def __init__(self, d_model: int, d_ff: int, dropout: float = 0.1):
        super().__init__()
        self.fc1 = Linear(d_model, d_ff)
        self.fc2 = Linear(d_ff, d_model)
        self.dropout = Dropout(dropout)
        
        self.layers = {'fc1': self.fc1, 'fc2': self.fc2}
    
    def forward(self, x: Tensor) -> Tensor:
        x = self.fc1(x)
        x = x.relu()
        x = self.dropout(x)
        x = self.fc2(x)
        return x
    
    def parameters(self) -> List[Tensor]:
        params = []
        for layer in self.layers.values():
            params.extend(layer.parameters())
        return params


class TransformerEncoderBlock(Layer):
    """Transformer encoder block"""
    
    def __init__(self, d_model: int, num_heads: int, d_ff: int, dropout: float = 0.1):
        super().__init__()
        self.self_attn = MultiHeadAttention(d_model, num_heads, dropout)
        self.feed_forward = FeedForward(d_model, d_ff, dropout)
        self.norm1 = BatchNorm(d_model)
        self.norm2 = BatchNorm(d_model)
        self.dropout = Dropout(dropout)
        
        self.layers = {
            'norm1': self.norm1, 'norm2': self.norm2,
            'feed_forward': self.feed_forward
        }
    
    def forward(self, x: Tensor, mask: Tensor = None) -> Tensor:
        # Self-attention with residual
        normed = self.norm1(x)
        attn_out = self.self_attn(normed)
        x = x + self.dropout(attn_out)
        
        # Feed-forward with residual
        normed = self.norm2(x)
        ff_out = self.feed_forward(normed)
        x = x + self.dropout(ff_out)
        
        return x
    
    def parameters(self) -> List[Tensor]:
        params = []
        for layer in self.layers.values():
            params.extend(layer.parameters())
        params.extend(self.self_attn.parameters())
        return params


class TransformerDecoderBlock(Layer):
    """Transformer decoder block"""
    
    def __init__(self, d_model: int, num_heads: int, d_ff: int, dropout: float = 0.1):
        super().__init__()
        self.self_attn = MultiHeadAttention(d_model, num_heads, dropout)
        self.cross_attn = MultiHeadAttention(d_model, num_heads, dropout)
        self.feed_forward = FeedForward(d_model, d_ff, dropout)
        self.norm1 = BatchNorm(d_model)
        self.norm2 = BatchNorm(d_model)
        self.norm3 = BatchNorm(d_model)
        self.dropout = Dropout(dropout)
        
        self.layers = {
            'norm1': self.norm1, 'norm2': self.norm2, 'norm3': self.norm3,
            'feed_forward': self.feed_forward
        }
    
    def forward(self, x: Tensor, enc_output: Tensor, src_mask: Tensor = None, tgt_mask: Tensor = None) -> Tensor:
        # Self-attention with residual
        normed = self.norm1(x)
        attn_out = self.self_attn(normed)
        x = x + self.dropout(attn_out)
        
        # Cross-attention with residual
        normed = self.norm2(x)
        cross_out = self.cross_attn(normed)  # Simplified - should use enc_output
        x = x + self.dropout(cross_out)
        
        # Feed-forward with residual
        normed = self.norm3(x)
        ff_out = self.feed_forward(normed)
        x = x + self.dropout(ff_out)
        
        return x
    
    def parameters(self) -> List[Tensor]:
        params = []
        for layer in self.layers.values():
            params.extend(layer.parameters())
        params.extend(self.self_attn.parameters())
        params.extend(self.cross_attn.parameters())
        return params


class TransformerLM(Layer):
    """Transformer Language Model"""
    
    def __init__(self, vocab_size: int, d_model: int = 512, num_heads: int = 8,
                 num_layers: int = 6, d_ff: int = 2048, max_seq_len: int = 512,
                 dropout: float = 0.1):
        super().__init__()
        self.d_model = d_model
        self.vocab_size = vocab_size
        
        # Token embedding
        self.token_embedding = Linear(vocab_size, d_model)
        
        # Positional encoding
        self.pos_encoding = PositionalEncoding(max_seq_len, d_model)
        
        # Transformer blocks
        self.encoder_blocks = [
            TransformerEncoderBlock(d_model, num_heads, d_ff, dropout)
            for _ in range(num_layers)
        ]
        
        # Output projection
        self.norm = BatchNorm(d_model)
        self.output_projection = Linear(d_model, vocab_size)
        
        self.dropout = Dropout(dropout)
        
        self.layers = {
            'token_embedding': self.token_embedding,
            'norm': self.norm,
            'output_projection': self.output_projection
        }
    
    def forward(self, x: Tensor) -> Tensor:
        # Token embedding
        x = self.token_embedding(x)
        
        # Add positional encoding
        x = self.pos_encoding(x)
        
        x = self.dropout(x)
        
        # Transformer blocks
        for block in self.encoder_blocks:
            x = block(x)
        
        # Output projection
        x = self.norm(x)
        x = self.output_projection(x)
        
        return x
    
    def generate(self, prompt: List[int], max_length: int = 100, temperature: float = 1.0) -> List[int]:
        """Auto-regressive text generation"""
        tokens = prompt.copy()
        
        for _ in range(max_length):
            # Prepare input
            x = Tensor(np.array([tokens]))
            
            # Forward pass
            logits = self.forward(x)
            
            # Get next token probabilities
            probs = Tensor(logits.data[0, -1, :] / temperature).softmax().data
            
            # Sample next token
            next_token = np.random.choice(self.vocab_size, p=probs)
            tokens.append(next_token)
        
        return tokens
    
    def parameters(self) -> List[Tensor]:
        params = []
        for layer in self.layers.values():
            params.extend(layer.parameters())
        for block in self.encoder_blocks:
            params.extend(block.parameters())
        return params


# ============================================================================
# EXPORT
# ============================================================================

__all__ = [
    'RNNCell', 'RNN',
    'LSTMCell', 'LSTM',
    'GRUCell', 'GRU',
    'PositionalEncoding', 'FeedForward',
    'TransformerEncoderBlock', 'TransformerDecoderBlock', 'TransformerLM'
]
