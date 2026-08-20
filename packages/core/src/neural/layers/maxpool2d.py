"""
MaxPool2D Layer implementation.
"""

import numpy as np
from .base import Layer


class MaxPool2D(Layer):
    """
    2D Max Pooling layer.
    
    Applies a max pooling operation over an input composed of several input planes.
    """

    def __init__(self, pool_size: int = 2, stride: int = None):
        super().__init__()
        self.pool_size = pool_size if isinstance(pool_size, tuple) else (pool_size, pool_size)
        self.stride = stride if stride is not None else pool_size

    def forward(self, x: np.ndarray) -> np.ndarray:
        """
        Forward pass.
        
        Args:
            x: Input of shape (batch, channels, height, width)
            
        Returns:
            Output of shape (batch, channels, out_h, out_w)
        """
        batch, channels, height, width = x.shape
        ph, pw = self.pool_size
        out_h = (height - ph) // self.stride + 1
        out_w = (width - pw) // self.stride + 1

        # Initialize output and mask
        out = np.zeros((batch, channels, out_h, out_w), dtype=np.float64)
        self._cache = {'input_shape': x.shape, 'max_indices': []}

        for i in range(out_h):
            for j in range(out_w):
                h_start = i * self.stride
                h_end = h_start + ph
                w_start = j * self.stride
                w_end = w_start + pw
                
                # Extract the pooling region
                region = x[:, :, h_start:h_end, w_start:w_end]
                region_reshaped = region.reshape(batch, channels, -1)
                
                # Find max values and their indices
                max_idx = np.argmax(region_reshaped, axis=-1)
                max_vals = np.max(region_reshaped, axis=-1)
                
                out[:, :, i, j] = max_vals
                self._cache['max_indices'].append((i, j, max_idx))

        return out

    def backward(self, dout: np.ndarray) -> np.ndarray:
        """
        Backward pass.
        
        Args:
            dout: Upstream gradient of shape (batch, channels, out_h, out_w)
            
        Returns:
            Gradient with respect to input of shape (batch, channels, height, width)
        """
        batch, channels, height, width = self._cache['input_shape']
        ph, pw = self.pool_size
        out_h, out_w = dout.shape[2], dout.shape[3]
        
        dx = np.zeros((batch, channels, height, width), dtype=np.float64)
        
        for idx, (i, j, max_idx) in enumerate(self._cache['max_indices']):
            h_start = i * self.stride
            h_end = h_start + ph
            w_start = j * self.stride
            w_end = w_start + pw
            
            # Get gradient for this position
            dout_ij = dout[:, :, i, j]
            
            # Create one-hot mask for max positions
            mask = np.zeros((batch, channels, ph * pw), dtype=np.float64)
            b_idx = np.arange(batch)[:, None]
            c_idx = np.arange(channels)[None, :]
            mask[b_idx, c_idx, max_idx] = 1
            
            # Reshape mask and distribute gradient
            mask = mask.reshape(batch, channels, ph, pw)
            dx[:, :, h_start:h_end, w_start:w_end] += mask * dout_ij[:, :, None, None]
        
        return dx

    def zero_grad(self):
        pass

    def __repr__(self):
        return f"MaxPool2D(pool_size={self.pool_size}, stride={self.stride})"