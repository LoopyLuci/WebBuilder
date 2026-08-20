"""
Base Layer class for the neural network framework.
All layers inherit from this class and must implement forward() and backward().
"""

from abc import ABC, abstractmethod
import numpy as np


class Layer(ABC):
    """Abstract base class for all neural network layers."""

    def __init__(self):
        self.training = True
        self._cache = {}
        self._params = {}
        self._grads = {}

    @abstractmethod
    def forward(self, x: np.ndarray) -> np.ndarray:
        """Forward pass: compute output from input."""
        pass

    @abstractmethod
    def backward(self, dout: np.ndarray) -> np.ndarray:
        """Backward pass: compute gradients."""
        pass

    def __call__(self, x: np.ndarray) -> np.ndarray:
        return self.forward(x)

    def train(self, mode: bool = True):
        """Set training mode."""
        self.training = mode
        return self

    def eval(self):
        """Set evaluation mode."""
        self.training = False
        return self

    @property
    def params(self) -> dict:
        return self._params

    @property
    def grads(self) -> dict:
        return self._grads

    def zero_grad(self):
        """Reset gradients to zero."""
        for key in self._grads:
            self._grads[key] = np.zeros_like(self._params[key]) if key in self._params else None


class Module(Layer):
    """
    Composable layer that can contain sub-layers.
    Used to build sequential networks.
    """

    def __init__(self):
        super().__init__()
        self._layers = []

    def add(self, layer: Layer):
        """Add a layer to the module."""
        self._layers.append(layer)
        return self

    def forward(self, x: np.ndarray) -> np.ndarray:
        for layer in self._layers:
            x = layer.forward(x)
        return x

    def backward(self, dout: np.ndarray) -> np.ndarray:
        for layer in reversed(self._layers):
            dout = layer.backward(dout)
        return dout

    def train(self, mode: bool = True):
        self.training = mode
        for layer in self._layers:
            layer.train(mode)
        return self

    def eval(self):
        return self.train(False)

    def zero_grad(self):
        for layer in self._layers:
            layer.zero_grad()

    @property
    def params(self) -> dict:
        all_params = {}
        for i, layer in enumerate(self._layers):
            for name, param in layer.params.items():
                all_params[f'layer_{i}_{name}'] = param
        return all_params

    @property
    def grads(self) -> dict:
        all_grads = {}
        for i, layer in enumerate(self._layers):
            for name, grad in layer.grads.items():
                all_grads[f'layer_{i}_{name}'] = grad
        return all_grads

    @property
    def layers(self):
        return self._layers