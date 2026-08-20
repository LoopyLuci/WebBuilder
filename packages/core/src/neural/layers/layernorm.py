"""
Layer Normalization Layer implementation.
"""

import numpy as np
from .base import Layer


class LayerNorm(Layer):
    """
    Layer Normalization layer.
    
    Normalizes the input by subtracting the mean and dividing by the 
    standard deviation computed over the last dimension(s), then applies 
    learnable scale (gamma) and shift (beta).
    """

    def __init__(self, normalized_shape: int or tuple, eps: float = 1e-5):
        super().__init__()
        self.normalized_shape = (normalized_shape,) if isinstance(normalized_shape, int) else normalized_shape
        self.eps = eps
        self.num_features = int(np.prod(self.normalized_shape))

        # Learnable parameters
        self._params['gamma'] = np.ones(self.num_features, dtype=np.float64)
        self._params['beta'] = np.zeros(self.num_features, dtype=np.float64)
        self._grads['gamma'] = np.zeros(self.num_features, dtype=np.float64)
        self._grads['beta'] = np.zeros(self.num_features, dtype=np.float64)

    def forward(self, x: np.ndarray) -> np.ndarray:
        """
        Forward pass.
        
        Args:
            x: Input of shape (batch_size, ..., features)
            
        Returns:
            Normalized output of same shape as input
        """
        # Calculate the axes to normalize over (last n dimensions)
        ndim = len(self.normalized_shape)
        norm_axes = tuple(range(x.ndim - ndim, x.ndim))
        
        # Compute mean and variance
        mean = np.mean(x, axis=norm_axes, keepdims=True)
        var = np.var(x, axis=norm_axes, keepdims=True)
        x_norm = (x - mean) / np.sqrt(var + self.eps)
        
        self._cache = {
            'x': x, 'mean': mean, 'var': var, 
            'x_norm': x_norm, 'norm_axes': norm_axes
        }
        
        # Apply scale and shift
        gamma = self._params['gamma'].reshape(*([1] * (x.ndim - ndim)) + [-1])
        beta = self._params['beta'].reshape(*([1] * (x.ndim - ndim)) + [-1])
        out = gamma * x_norm + beta
        
        return out

    def backward(self, dout: np.ndarray) -> np.ndarray:
        """
        Backward pass.
        
        Args:
            dout: Upstream gradient
            
        Returns:
            Gradient with respect to input
        """
        x = self._cache['x']
        x_norm = self._cache['x_norm']
        norm_axes = self._cache['norm_axes']
        N = self.num_features  # Number of elements in normalized dimensions
        
        # Reshape gamma for broadcasting
        ndim = len(self.normalized_shape)
        gamma_shape = [1] * x.ndim
        for i, ax in enumerate(norm_axes):
            gamma_shape[ax] = self.normalized_shape[i] if i < len(self.normalized_shape) else 1
        gamma = self._params['gamma'].reshape(gamma_shape)
        
        # Gradients for gamma and beta
        self._grads['gamma'] = np.sum(dout * x_norm, axis=tuple(i for i in range(x.ndim) if i not in norm_axes)).reshape(-1)
        self._grads['beta'] = np.sum(dout, axis=tuple(i for i in range(x.ndim) if i not in norm_axes)).reshape(-1)
        
        # Gradient for x_norm
        dx_norm = dout * gamma
        
        # Gradient for input using the full backward formula
        std_inv = 1.0 / np.sqrt(self._cache['var'] + self.eps)
        dx = (1.0 / N) * std_inv * (
            N * dx_norm - 
            np.sum(dx_norm, axis=norm_axes, keepdims=True) - 
            x_norm * np.sum(dx_norm * x_norm, axis=norm_axes, keepdims=True)
        )
        
        return dx

    def zero_grad(self):
        self._grads['gamma'] = np.zeros_like(self._params['gamma'])
        self._grads['beta'] = np.zeros_like(self._params['beta'])

    def __repr__(self):
        return f"LayerNorm(normalized_shape={self.normalized_shape}, eps={self.eps})"