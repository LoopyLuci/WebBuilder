"""
Neural Network Framework - Built from scratch with NumPy.

A complete neural network library including:
- Layers: Dense, Conv2D, MaxPool2D, Flatten, Dropout, BatchNorm, LayerNorm
- Activations: ReLU, Sigmoid, Tanh, Softmax, GELU, SiLU, Mish, LeakyReLU
- Losses: MSE, CrossEntropy, BCE, Huber
- Optimizers: SGD, Adam, AdamW, RMSprop
- NeuralNetwork class for easy model building and training
"""

# Core
from .network import NeuralNetwork, Sequential

# Layers
from .layers import (
    Layer,
    Module,
    Dense,
    Linear,
    Conv2D,
    MaxPool2D,
    Flatten,
    Dropout,
    BatchNorm,
    LayerNorm,
)

# Activations
from .activations import (
    Activation,
    ReLU,
    Sigmoid,
    Tanh,
    Softmax,
    GELU,
    SiLU,
    Mish,
    LeakyReLU,
)

# Losses
from .losses import (
    Loss,
    MSE,
    CrossEntropy,
    BCE,
    Huber,
)

# Optimizers
from .optimizers import (
    Optimizer,
    SGD,
    Adam,
    AdamW,
    RMSprop,
)

__version__ = '1.0.0'

__all__ = [
    # Core
    'NeuralNetwork',
    'Sequential',
    
    # Layers
    'Layer',
    'Module',
    'Dense',
    'Linear',
    'Conv2D',
    'MaxPool2D',
    'Flatten',
    'Dropout',
    'BatchNorm',
    'LayerNorm',
    
    # Activations
    'Activation',
    'ReLU',
    'Sigmoid',
    'Tanh',
    'Softmax',
    'GELU',
    'SiLU',
    'Mish',
    'LeakyReLU',
    
    # Losses
    'Loss',
    'MSE',
    'CrossEntropy',
    'BCE',
    'Huber',
    
    # Optimizers
    'Optimizer',
    'SGD',
    'Adam',
    'AdamW',
    'RMSprop',
]