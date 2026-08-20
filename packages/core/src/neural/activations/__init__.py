"""
Activation function implementations.
All activations operate element-wise and are used as layers.
"""

import numpy as np
from abc import ABC, abstractmethod


class Activation(ABC):
    """Base class for activation functions."""

    def __init__(self):
        self._cache = {}
        self.training = True

    @abstractmethod
    def forward(self, x: np.ndarray) -> np.ndarray:
        pass

    @abstractmethod
    def backward(self, dout: np.ndarray) -> np.ndarray:
        pass

    def __call__(self, x: np.ndarray) -> np.ndarray:
        return self.forward(x)

    def train(self, mode: bool = True):
        self.training = mode
        return self

    def eval(self):
        self.training = False
        return self

    @property
    def params(self):
        return {}

    @property
    def grads(self):
        return {}

    def zero_grad(self):
        pass


class ReLU(Activation):
    """Rectified Linear Unit activation."""

    def forward(self, x: np.ndarray) -> np.ndarray:
        self._cache['mask'] = x > 0
        return x * self._cache['mask']

    def backward(self, dout: np.ndarray) -> np.ndarray:
        return dout * self._cache['mask']

    def __repr__(self):
        return "ReLU()"


class Sigmoid(Activation):
    """Sigmoid activation function."""

    def forward(self, x: np.ndarray) -> np.ndarray:
        # Stable sigmoid
        out = np.where(
            x >= 0,
            1 / (1 + np.exp(-x)),
            np.exp(x) / (1 + np.exp(x))
        )
        self._cache['output'] = out
        return out

    def backward(self, dout: np.ndarray) -> np.ndarray:
        sig = self._cache['output']
        return dout * sig * (1 - sig)

    def __repr__(self):
        return "Sigmoid()"


class Tanh(Activation):
    """Hyperbolic tangent activation function."""

    def forward(self, x: np.ndarray) -> np.ndarray:
        out = np.tanh(x)
        self._cache['output'] = out
        return out

    def backward(self, dout: np.ndarray) -> np.ndarray:
        return dout * (1 - self._cache['output'] ** 2)

    def __repr__(self):
        return "Tanh()"


class Softmax(Activation):
    """Softmax activation function."""

    def forward(self, x: np.ndarray) -> np.ndarray:
        # Stable softmax
        shifted = x - np.max(x, axis=-1, keepdims=True)
        exp_x = np.exp(shifted)
        out = exp_x / np.sum(exp_x, axis=-1, keepdims=True)
        self._cache['output'] = out
        return out

    def backward(self, dout: np.ndarray) -> np.ndarray:
        """
        For softmax with cross-entropy loss, the gradient is simplified.
        This implements the general Jacobian-based backward pass.
        """
        s = self._cache['output']
        # For each sample in batch: dx = s * (dout - sum(dout * s))
        return s * (dout - np.sum(dout * s, axis=-1, keepdims=True))

    def __repr__(self):
        return "Softmax()"


class GELU(Activation):
    """
    Gaussian Error Linear Unit activation.
    
    GELU(x) = x * Φ(x) where Φ is the CDF of standard normal distribution.
    """

    def forward(self, x: np.ndarray) -> np.ndarray:
        # Approximation: 0.5 * x * (1 + tanh(sqrt(2/pi) * (x + 0.044715 * x^3)))
        inner = np.sqrt(2 / np.pi) * (x + 0.044715 * x ** 3)
        tanh_inner = np.tanh(inner)
        out = 0.5 * x * (1 + tanh_inner)
        self._cache = {'x': x, 'inner': inner, 'tanh_inner': tanh_inner}
        return out

    def backward(self, dout: np.ndarray) -> np.ndarray:
        x = self._cache['x']
        inner = self._cache['inner']
        tanh_inner = self._cache['tanh_inner']
        
        sech2 = 1 - tanh_inner ** 2
        d_inner = np.sqrt(2 / np.pi) * (1 + 3 * 0.044715 * x ** 2)
        
        # d/dx [0.5 * x * (1 + tanh(inner))]
        dx = 0.5 * (1 + tanh_inner) + 0.5 * x * sech2 * d_inner
        return dout * dx

    def __repr__(self):
        return "GELU()"


class SiLU(Activation):
    """
    Sigmoid Linear Unit (Swish) activation.
    
    SiLU(x) = x * sigmoid(x)
    """

    def forward(self, x: np.ndarray) -> np.ndarray:
        sigmoid_x = 1 / (1 + np.exp(-x))
        self._cache = {'x': x, 'sigmoid': sigmoid_x}
        return x * sigmoid_x

    def backward(self, dout: np.ndarray) -> np.ndarray:
        x = self._cache['x']
        sig = self._cache['sigmoid']
        # d/dx [x * sig(x)] = sig(x) + x * sig(x) * (1 - sig(x))
        dx = sig + x * sig * (1 - sig)
        return dout * dx

    def __repr__(self):
        return "SiLU()"


class Mish(Activation):
    """
    Mish activation function.
    
    Mish(x) = x * tanh(softplus(x)) = x * tanh(ln(1 + e^x))
    """

    def forward(self, x: np.ndarray) -> np.ndarray:
        softplus = np.log1p(np.exp(np.clip(x, -50, 50)))
        tanh_sp = np.tanh(softplus)
        self._cache = {'x': x, 'softplus': softplus, 'tanh_sp': tanh_sp}
        return x * tanh_sp

    def backward(self, dout: np.ndarray) -> np.ndarray:
        x = self._cache['x']
        tanh_sp = self._cache['tanh_sp']
        
        # sigmoid(x) = 1 / (1 + e^(-x))
        sigmoid = 1 / (1 + np.exp(np.clip(-x, -50, 50)))
        # tanh'(softplus(x)) = (1 - tanh^2(softplus(x))) * sigmoid(x)
        sech2 = 1 - tanh_sp ** 2
        
        # d/dx [x * tanh(softplus(x))]
        dx = tanh_sp + x * sech2 * sigmoid
        return dout * dx

    def __repr__(self):
        return "Mish()"


class LeakyReLU(Activation):
    """
    Leaky Rectified Linear Unit activation.
    
    LeakyReLU(x) = x if x > 0, alpha * x otherwise
    """

    def __init__(self, alpha: float = 0.01):
        super().__init__()
        self.alpha = alpha

    def forward(self, x: np.ndarray) -> np.ndarray:
        self._cache['mask'] = x > 0
        return np.where(self._cache['mask'], x, self.alpha * x)

    def backward(self, dout: np.ndarray) -> np.ndarray:
        return np.where(self._cache['mask'], dout, self.alpha * dout)

    def __repr__(self):
        return f"LeakyReLU(alpha={self.alpha})"


# Aliases
Swish = SiLU
ELU = LeakyReLU  # Simplified alias