"""
Dense (Fully Connected) Layer implementation.
"""

import numpy as np
from .base import Layer


class Dense(Layer):
    """
    Fully connected (dense) layer.
    
    output = input @ weight + bias
    """

    def __init__(self, in_features: int, out_features: int, bias: bool = True):
        super().__init__()
        self.in_features = in_features
        self.out_features = out_features
        self.use_bias = bias

        # He initialization for weights
        scale = np.sqrt(2.0 / in_features)
        self._params['weight'] = np.random.randn(in_features, out_features).astype(np.float64) * scale
        self._grads['weight'] = np.zeros((in_features, out_features), dtype=np.float64)

        if bias:
            self._params['bias'] = np.zeros(out_features, dtype=np.float64)
            self._grads['bias'] = np.zeros(out_features, dtype=np.float64)

    def forward(self, x: np.ndarray) -> np.ndarray:
        """
        Forward pass.
        
        Args:
            x: Input array of shape (batch_size, in_features)
            
        Returns:
            Output array of shape (batch_size, out_features)
        """
        self._cache['x'] = x
        out = x @ self._params['weight']
        if self.use_bias:
            out = out + self._params['bias']
        return out

    def backward(self, dout: np.ndarray) -> np.ndarray:
        """
        Backward pass.
        
        Args:
            dout: Upstream gradient of shape (batch_size, out_features)
            
        Returns:
            Gradient with respect to input of shape (batch_size, in_features)
        """
        x = self._cache['x']
        batch_size = x.shape[0]

        # Gradient for weights
        self._grads['weight'] = (x.T @ dout) / batch_size

        # Gradient for bias
        if self.use_bias:
            self._grads['bias'] = np.mean(dout, axis=0)

        # Gradient for input
        dx = dout @ self._params['weight'].T
        return dx

    def zero_grad(self):
        self._grads['weight'] = np.zeros_like(self._params['weight'])
        if self.use_bias:
            self._grads['bias'] = np.zeros_like(self._params['bias'])

    def __repr__(self):
        return f"Dense(in_features={self.in_features}, out_features={self.out_features})"


# Alias
Linear = Dense