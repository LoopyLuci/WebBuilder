"""
Dropout Layer implementation for regularization.
"""

import numpy as np
from .base import Layer


class Dropout(Layer):
    """
    Dropout layer for regularization.
    
    During training, randomly zeros some elements of the input tensor 
    with probability p. During evaluation, does nothing.
    """

    def __init__(self, p: float = 0.5):
        super().__init__()
        if not 0 <= p < 1:
            raise ValueError(f"Dropout probability must be in [0, 1), got {p}")
        self.p = p

    def forward(self, x: np.ndarray) -> np.ndarray:
        """
        Forward pass.
        
        Args:
            x: Input array
            
        Returns:
            Output array (possibly with elements zeroed out during training)
        """
        if self.training:
            # Generate dropout mask
            self._cache['mask'] = (np.random.rand(*x.shape) >= self.p).astype(np.float64)
            # Scale by 1/(1-p) for inverted dropout
            return x * self._cache['mask'] / (1 - self.p)
        else:
            return x

    def backward(self, dout: np.ndarray) -> np.ndarray:
        """
        Backward pass.
        
        Args:
            dout: Upstream gradient
            
        Returns:
            Gradient with dropout mask applied
        """
        if self.training:
            return dout * self._cache['mask'] / (1 - self.p)
        else:
            return dout

    def zero_grad(self):
        pass

    def __repr__(self):
        return f"Dropout(p={self.p})"