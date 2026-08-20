"""
Batch Normalization Layer implementation.
"""

import numpy as np
from .base import Layer


class BatchNorm(Layer):
    """
    Batch Normalization layer.
    
    Normalizes the input by subtracting the batch mean and dividing by 
    the batch standard deviation, then applies learnable scale (gamma) 
    and shift (beta).
    """

    def __init__(self, num_features: int, eps: float = 1e-5, momentum: float = 0.1):
        super().__init__()
        self.num_features = num_features
        self.eps = eps
        self.momentum = momentum

        # Learnable parameters
        self._params['gamma'] = np.ones(num_features, dtype=np.float64)
        self._params['beta'] = np.zeros(num_features, dtype=np.float64)
        self._grads['gamma'] = np.zeros(num_features, dtype=np.float64)
        self._grads['beta'] = np.zeros(num_features, dtype=np.float64)

        # Running statistics for inference
        self._running_mean = np.zeros(num_features, dtype=np.float64)
        self._running_var = np.ones(num_features, dtype=np.float64)

    def forward(self, x: np.ndarray) -> np.ndarray:
        """
        Forward pass.
        
        Args:
            x: Input of shape (batch_size, num_features) or (batch, channels, h, w)
            
        Returns:
            Normalized output of same shape as input
        """
        if self.training:
            if x.ndim == 2:
                # Fully connected
                mean = np.mean(x, axis=0)
                var = np.var(x, axis=0)
                x_norm = (x - mean) / np.sqrt(var + self.eps)
                
                # Update running statistics
                self._running_mean = (1 - self.momentum) * self._running_mean + self.momentum * mean
                self._running_var = (1 - self.momentum) * self._running_var + self.momentum * var
                
                self._cache = {'x': x, 'mean': mean, 'var': var, 'x_norm': x_norm}
            else:
                # Convolutional: normalize over batch and spatial dims
                mean = np.mean(x, axis=(0, 2, 3), keepdims=True)
                var = np.var(x, axis=(0, 2, 3), keepdims=True)
                x_norm = (x - mean) / np.sqrt(var + self.eps)
                
                # Update running statistics (per-channel)
                self._running_mean = (1 - self.momentum) * self._running_mean + self.momentum * mean.reshape(-1)
                self._running_var = (1 - self.momentum) * self._running_var + self.momentum * var.reshape(-1)
                
                self._cache = {'x': x, 'mean': mean, 'var': var, 'x_norm': x_norm, 'ndim': x.ndim}
        else:
            # Inference mode
            if x.ndim == 2:
                x_norm = (x - self._running_mean) / np.sqrt(self._running_var + self.eps)
            else:
                mean = self._running_mean[None, :, None, None]
                var = self._running_var[None, :, None, None]
                x_norm = (x - mean) / np.sqrt(var + self.eps)

        # Apply scale and shift
        if x.ndim == 2:
            out = self._params['gamma'] * x_norm + self._params['beta']
        else:
            gamma = self._params['gamma'][None, :, None, None]
            beta = self._params['beta'][None, :, None, None]
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
        
        if self._cache.get('ndim', 2) == 2:
            N = x.shape[0]
            
            # Gradients for gamma and beta
            self._grads['gamma'] = np.sum(dout * x_norm, axis=0) / N
            self._grads['beta'] = np.sum(dout, axis=0) / N
            
            # Gradient for x_norm
            dx_norm = dout * self._params['gamma']
            
            # Gradient for input
            std_inv = 1.0 / np.sqrt(self._cache['var'] + self.eps)
            dx = (1.0 / N) * std_inv * (
                N * dx_norm - 
                np.sum(dx_norm, axis=0) - 
                x_norm * np.sum(dx_norm * x_norm, axis=0)
            )
        else:
            N = x.shape[0] * x.shape[2] * x.shape[3]
            
            # Gradients for gamma and beta
            self._grads['gamma'] = np.sum(dout * x_norm, axis=(0, 2, 3)) / N
            self._grads['beta'] = np.sum(dout, axis=(0, 2, 3)) / N
            
            # Gradient for x_norm
            gamma = self._params['gamma'][None, :, None, None]
            dx_norm = dout * gamma
            
            # Gradient for input
            std_inv = 1.0 / np.sqrt(self._cache['var'] + self.eps)
            dx = (1.0 / N) * std_inv * (
                N * dx_norm - 
                np.sum(dx_norm, axis=(0, 2, 3), keepdims=True) - 
                x_norm * np.sum(dx_norm * x_norm, axis=(0, 2, 3), keepdims=True)
            )
        
        return dx

    def zero_grad(self):
        self._grads['gamma'] = np.zeros_like(self._params['gamma'])
        self._grads['beta'] = np.zeros_like(self._params['beta'])

    def __repr__(self):
        return f"BatchNorm(num_features={self.num_features}, eps={self.eps})"