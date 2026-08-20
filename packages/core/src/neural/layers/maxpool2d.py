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

        # Reshape for pooling
        x_reshaped = x.reshape(batch * channels, 1, height, width)
        
        # Create patches
        shape = (batch * channels, 1, out_h, out_w, ph, pw)
        strides = (x.strides[0], x.strides[1], 
                   x.strides[2] * self.stride, x.strides[3] * self.stride,
                   x.strides[2], x.strides[3])
        
        patches = np.lib.stride_tricks.as_strided(x_reshaped, shape=shape, strides=strides)
        
        # Find max values and their positions
        patches_reshaped = patches.reshape(batch * channels, out_h, out_w, ph * pw)
        max_vals = np.max(patches_reshaped, axis=-1)
        self._cache['shape'] = x.shape
        self._cache['patches_reshaped'] = patches_reshaped
        self._cache['max_vals'] = max_vals
        
        out = max_vals.reshape(batch, channels, out_h, out_w)
        return out

    def backward(self, dout: np.ndarray) -> np.ndarray:
        """
        Backward pass.
        
        Args:
            dout: Upstream gradient of shape (batch, channels, out_h, out_w)
            
        Returns:
            Gradient with respect to input of shape (batch, channels, height, width)
        """
        batch, channels, height, width = self._cache['shape']
        ph, pw = self.pool_size
        out_h, out_w = dout.shape[2], dout.shape[3]
        
        # Create mask for max positions
        patches_reshaped = self._cache['patches_reshaped']
        max_indices = np.argmax(patches_reshaped, axis=-1)
        
        # Create one-hot encoding
        mask = np.zeros_like(patches_reshaped)
        batch_channels = batch * channels
        bc_idx = np.arange(batch_channels)[:, None, None]
        oh_idx = np.arange(out_h)[None, :, None]
        ow_idx = np.arange(out_w)[None, None, :]
        mask[bc_idx, oh_idx, ow_idx, max_indices] = 1
        
        # Distribute gradient
        dout_expanded = dout.reshape(batch * channels, out_h, out_w)[..., None]
        dpatches = (mask * dout_expanded).reshape(batch * channels, 1, out_h, out_w, ph, pw)
        
        # Accumulate gradients
        dx = np.zeros((batch * channels, 1, height, width), dtype=np.float64)
        for y in range(ph):
            for x_pos in range(pw):
                dx[:, :, y:y + self.stride * out_h:self.stride, 
                   x_pos:x_pos + self.stride * out_w:self.stride] += dpatches[:, :, :, :, y, x_pos]
        
        dx = dx.reshape(batch, channels, height, width)
        return dx

    def zero_grad(self):
        pass

    def __repr__(self):
        return f"MaxPool2D(pool_size={self.pool_size}, stride={self.stride})"