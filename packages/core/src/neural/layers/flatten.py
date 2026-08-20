"""
Flatten Layer implementation.
"""

import numpy as np
from .base import Layer


class Flatten(Layer):
    """
    Flatten layer that reshapes multi-dimensional input into 1D.
    """

    def forward(self, x: np.ndarray) -> np.ndarray:
        """
        Forward pass.
        
        Args:
            x: Input of shape (batch, ...)
            
        Returns:
            Output of shape (batch, -1)
        """
        self._cache['input_shape'] = x.shape
        return x.reshape(x.shape[0], -1)

    def backward(self, dout: np.ndarray) -> np.ndarray:
        """
        Backward pass.
        
        Args:
            dout: Upstream gradient
            
        Returns:
            Gradient reshaped to original input shape
        """
        return dout.reshape(self._cache['input_shape'])

    def zero_grad(self):
        pass

    def __repr__(self):
        return "Flatten()"