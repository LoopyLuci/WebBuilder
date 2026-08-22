"""
Sequence Model Framework
========================

A comprehensive sequence model framework implemented from scratch using NumPy.

Models included:
- RNN: Vanilla RNN with BPTT
- LSTM: Long Short-Term Memory with forget, input, output gates
- GRU: Gated Recurrent Unit
- Transformer: Multi-head attention with positional encoding
- BERT: Bidirectional encoder with masked language modeling
- GPT: Autoregressive decoder with causal attention
- T5: Encoder-decoder with relative position biases
- Seq2Seq: Sequence-to-sequence with attention

Modules:
- activations: Activation functions and their derivatives
- initializers: Parameter initialization strategies
- layers: Core layer building blocks (Linear, LayerNorm, Dropout, Embedding)
"""

from .activations import (
    sigmoid, sigmoid_derivative,
    tanh, tanh_derivative,
    relu, relu_derivative,
    gelu, gelu_derivative,
    softmax, log_softmax,
    ACTIVATIONS
)

from .initializers import (
    zeros, ones,
    random_normal, random_uniform,
    xavier_uniform, xavier_normal,
    he_uniform, he_normal,
    orthogonal,
    INITIALIZERS
)

from .layers import (
    Linear,
    LayerNorm,
    Dropout,
    Embedding
)

from .rnn import RNN
from .lstm import LSTM
from .gru import GRU
from .transformer import Transformer, TransformerBlock, MultiHeadAttention, PositionalEncoding
from .bert import BERT
from .gpt import GPT
from .t5 import T5
from .seq2seq import Seq2SeqAttention

__all__ = [
    # Activations
    'sigmoid', 'sigmoid_derivative',
    'tanh', 'tanh_derivative',
    'relu', 'relu_derivative',
    'gelu', 'gelu_derivative',
    'softmax', 'log_softmax',
    'ACTIVATIONS',
    
    # Initializers
    'zeros', 'ones',
    'random_normal', 'random_uniform',
    'xavier_uniform', 'xavier_normal',
    'he_uniform', 'he_normal',
    'orthogonal',
    'INITIALIZERS',
    
    # Layers
    'Linear', 'LayerNorm', 'Dropout', 'Embedding',
    
    # Models
    'RNN', 'LSTM', 'GRU',
    'Transformer', 'TransformerBlock', 'MultiHeadAttention', 'PositionalEncoding',
    'BERT', 'GPT', 'T5',
    'Seq2SeqAttention',
]

__version__ = '1.0.0'