"""
Convolutional 2D Layer implementation using im2col approach.
"""

import numpy as np
from .base import Layer


class Conv2D(Layer):
    """
    2D Convolutional layer.
    
    Applies a convolution operation over an input composed of several input planes.
    """

    def __init__(self, in_channels: int, out_channels: int, kernel_size: int,
                 stride: int = 1, padding: int = 0, bias: bool = True):
        super().__init__()
        self.in_channels = in_channels
        self.out_channels = out_channels
        self.kernel_size = kernel_size if isinstance(kernel_size, tuple) else (kernel_size, kernel_size)
        self.stride = stride
        self.padding = padding
        self.use_bias = bias

        # He initialization
        kh, kw = self.kernel_size
        scale = np.sqrt(2.0 / (in_channels * kh * kw))
        self._params['weight'] = np.random.randn(
            out_channels, in_channels, kh, kw
        ).astype(np.float64) * scale
        self._grads['weight'] = np.zeros_like(self._params['weight'])

        if bias:
            self._params['bias'] = np.zeros(out_channels, dtype=np.float64)
            self._grads['bias'] = np.zeros(out_channels, dtype=np.float64)

    def _im2col(self, x: np.ndarray) -> np.ndarray:
        """
        Convert image batches to column format for efficient convolution.
        
        Args:
            x: Input of shape (batch, channels, height, width)
            
        Returns:
            Columns of shape (batch * out_h * out_w, channels * kh * kw)
        """
        batch, channels, height, width = x.shape
        kh, kw = self.kernel_size
        out_h = (height + 2 * self.padding - kh) // self.stride + 1
        out_w = (width + 2 * self.padding - kw) // self.stride + 1

        # Pad input
        padded = np.pad(x, ((0, 0), (0, 0), (self.padding, self.padding),
                           (self.padding, self.padding)), mode='constant')

        # Create column matrix
        col = np.zeros((batch, channels, kh, kw, out_h, out_w))
        for y in range(kh):
            y_max = y + self.stride * out_h
            for x_pos in range(kw):
                x_max = x_pos + self.stride * out_w
                col[:, :, y, x_pos, :, :] = padded[:, :, y:y_max:self.stride, x_pos:x_max:self.stride]

        col = col.transpose(0, 4, 5, 1, 2, 3).reshape(batch * out_h * out_w, -1)
        return col

    def _col2im(self, col: np.ndarray, input_shape: tuple) -> np.ndarray:
        """
        Convert column format back to image format.
        
        Args:
            col: Columns of shape (batch * out_h * out_w, channels * kh * kw)
            input_shape: Original input shape (batch, channels, height, width)
            
        Returns:
            Image of shape (batch, channels, height, width)
        """
        batch, channels, height, width = input_shape
        kh, kw = self.kernel_size
        out_h = (height + 2 * self.padding - kh) // self.stride + 1
        out_w = (width + 2 * self.padding - kw) // self.stride + 1

        col = col.reshape(batch, out_h, out_w, channels, kh, kw).transpose(0, 3, 4, 5, 1, 2)

        img = np.zeros((batch, channels, height + 2 * self.padding, width + 2 * self.padding))
        for y in range(kh):
            y_max = y + self.stride * out_h
            for x_pos in range(kw):
                x_max = x_pos + self.stride * out_w
                img[:, :, y:y_max:self.stride, x_pos:x_max:self.stride] += col[:, :, y, x_pos, :, :]

        return img[:, :, self.padding:height + self.padding, self.padding:width + self.padding]

    def forward(self, x: np.ndarray) -> np.ndarray:
        """
        Forward pass.
        
        Args:
            x: Input of shape (batch, channels, height, width)
            
        Returns:
            Output of shape (batch, out_channels, out_h, out_w)
        """
        batch, channels, height, width = x.shape
        kh, kw = self.kernel_size
        out_h = (height + 2 * self.padding - kh) // self.stride + 1
        out_w = (width + 2 * self.padding - kw) // self.stride + 1

        self._cache['input_shape'] = x.shape
        col = self._im2col(x)
        self._cache['col'] = col

        # Reshape weights for matrix multiplication
        col_weight = self._params['weight'].reshape(self.out_channels, -1)
        out = col @ col_weight.T

        if self.use_bias:
            out = out + self._params['bias']

        out = out.reshape(batch, out_h, out_w, self.out_channels).transpose(0, 3, 1, 2)
        return out

    def backward(self, dout: np.ndarray) -> np.ndarray:
        """
        Backward pass.
        
        Args:
            dout: Upstream gradient of shape (batch, out_channels, out_h, out_w)
            
        Returns:
            Gradient with respect to input of shape (batch, channels, height, width)
        """
        batch = dout.shape[0]
        col = self._cache['col']

        # Reshape dout
        dout_reshaped = dout.transpose(0, 2, 3, 1).reshape(-1, self.out_channels)

        # Gradient for bias
        if self.use_bias:
            self._grads['bias'] = np.mean(dout_reshaped, axis=0)

        # Gradient for weights
        col_weight = self._params['weight'].reshape(self.out_channels, -1)
        self._grads['weight'] = (dout_reshaped.T @ col).reshape(self._params['weight'].shape) / batch

        # Gradient for input
        dcol = dout_reshaped @ col_weight
        dx = self._col2im(dcol, self._cache['input_shape'])
        return dx

    def zero_grad(self):
        self._grads['weight'] = np.zeros_like(self._params['weight'])
        if self.use_bias:
            self._grads['bias'] = np.zeros_like(self._params['bias'])

    def __repr__(self):
        return (f"Conv2D(in_channels={self.in_channels}, out_channels={self.out_channels}, "
                f"kernel_size={self.kernel_size}, stride={self.stride}, padding={self.padding})")