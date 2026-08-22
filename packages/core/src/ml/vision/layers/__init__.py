"""Core neural network layers implemented from scratch with NumPy."""

import numpy as np
from typing import Tuple, Optional


class Layer:
    """Base layer class."""

    def __init__(self):
        self.params: dict = {}
        self.grads: dict = {}
        self.training: bool = True

    def forward(self, x: np.ndarray) -> np.ndarray:
        raise NotImplementedError

    def backward(self, dout: np.ndarray) -> np.ndarray:
        raise NotImplementedError


class Conv2D(Layer):
    """2D Convolutional layer with im2col for efficiency."""

    def __init__(self, in_channels: int, out_channels: int, kernel_size: int,
                 stride: int = 1, padding: int = 0, initializer: str = 'he_normal'):
        super().__init__()
        self.in_channels = in_channels
        self.out_channels = out_channels
        self.kernel_size = kernel_size
        self.stride = stride
        self.padding = padding
        self.weight_shape = (out_channels, in_channels, kernel_size, kernel_size)

        from .initializers import INITIALIZERS
        init_fn = INITIALIZERS[initializer]
        self.params['W'] = init_fn(self.weight_shape)
        self.params['b'] = np.zeros(out_channels, dtype=np.float64)

    def _im2col(self, x: np.ndarray) -> np.ndarray:
        """Convert image batches to column format for convolution."""
        N, C, H, W = x.shape
        k = self.kernel_size
        H_out = (H + 2 * self.padding - k) // self.stride + 1
        W_out = (W + 2 * self.padding - k) // self.stride + 1

        if self.padding > 0:
            x_padded = np.pad(x, ((0, 0), (0, 0), (self.padding, self.padding),
                                   (self.padding, self.padding)), mode='constant')
        else:
            x_padded = x

        cols = np.zeros((N, C, k, k, H_out, W_out), dtype=np.float64)
        for i in range(k):
            for j in range(k):
                cols[:, :, i, j, :, :] = x_padded[:, :, i:i + H_out * self.stride:self.stride,
                                                   j:j + W_out * self.stride:self.stride]
        cols = cols.transpose(0, 4, 5, 1, 2, 3).reshape(N * H_out * W_out, -1)
        return cols

    def _col2im(self, cols: np.ndarray, x_shape: tuple) -> np.ndarray:
        """Convert column format back to image batches."""
        N, C, H, W = x_shape
        k = self.kernel_size
        H_out = (H + 2 * self.padding - k) // self.stride + 1
        W_out = (W + 2 * self.padding - k) // self.stride + 1

        if self.padding > 0:
            x_padded = np.zeros((N, C, H + 2 * self.padding, W + 2 * self.padding), dtype=np.float64)
        else:
            x_padded = np.zeros(x_shape, dtype=np.float64)

        cols_reshaped = cols.reshape(N, H_out, W_out, C, k, k).transpose(0, 3, 4, 5, 1, 2)
        for i in range(k):
            for j in range(k):
                x_padded[:, :, i:i + H_out * self.stride:self.stride,
                         j:j + W_out * self.stride:self.stride] += cols_reshaped[:, :, i, j, :, :]

        if self.padding > 0:
            return x_padded[:, :, self.padding:-self.padding, self.padding:-self.padding]
        return x_padded

    def forward(self, x: np.ndarray) -> np.ndarray:
        N, C, H, W = x.shape
        k = self.kernel_size
        H_out = (H + 2 * self.padding - k) // self.stride + 1
        W_out = (W + 2 * self.padding - k) // self.stride + 1

        self.x = x
        cols = self._im2col(x)
        self.cols = cols

        W_reshaped = self.params['W'].reshape(self.out_channels, -1)
        out = cols @ W_reshaped.T + self.params['b']
        out = out.reshape(N, H_out, W_out, self.out_channels).transpose(0, 3, 1, 2)
        return out

    def backward(self, dout: np.ndarray) -> np.ndarray:
        N = dout.shape[0]
        dout_reshaped = dout.transpose(0, 2, 3, 1).reshape(-1, self.out_channels)

        self.grads['b'] = np.sum(dout_reshaped, axis=0)
        self.grads['W'] = (dout_reshaped.T @ self.cols).reshape(self.weight_shape)

        W_reshaped = self.params['W'].reshape(self.out_channels, -1)
        dcols = dout_reshaped @ W_reshaped
        dx = self._col2im(dcols, self.x.shape)
        return dx


class MaxPool2D(Layer):
    """Max pooling layer."""

    def __init__(self, pool_size: int = 2, stride: int = 2):
        super().__init__()
        self.pool_size = pool_size
        self.stride = stride

    def forward(self, x: np.ndarray) -> np.ndarray:
        N, C, H, W = x.shape
        k = self.pool_size
        H_out = (H - k) // self.stride + 1
        W_out = (W - k) // self.stride + 1

        self.x_shape = x.shape
        out = np.zeros((N, C, H_out, W_out), dtype=np.float64)
        self.max_mask = np.zeros_like(x, dtype=bool)

        for i in range(H_out):
            for j in range(W_out):
                patch = x[:, :, i * self.stride:i * self.stride + k,
                          j * self.stride:j * self.stride + k]
                patch_reshaped = patch.reshape(N, C, -1)
                max_vals = np.max(patch_reshaped, axis=2)
                out[:, :, i, j] = max_vals
                max_idx = np.argmax(patch_reshaped, axis=2)
                for n in range(N):
                    for c in range(C):
                        idx = max_idx[n, c]
                        pi, pj = divmod(idx, k)
                        self.max_mask[n, c, i * self.stride + pi, j * self.stride + pj] = True
        return out

    def backward(self, dout: np.ndarray) -> np.ndarray:
        N, C, H_out, W_out = dout.shape
        dx = np.zeros(self.x_shape, dtype=np.float64)
        k = self.pool_size

        for i in range(H_out):
            for j in range(W_out):
                mask_patch = self.max_mask[:, :, i * self.stride:i * self.stride + k,
                                           j * self.stride:j * self.stride + k]
                dx[:, :, i * self.stride:i * self.stride + k,
                   j * self.stride:j * self.stride + k] += mask_patch * dout[:, :, i, j][:, :, np.newaxis, np.newaxis]
        return dx


class AvgPool2D(Layer):
    """Average pooling layer."""

    def __init__(self, pool_size: int = 2, stride: int = 2):
        super().__init__()
        self.pool_size = pool_size
        self.stride = stride

    def forward(self, x: np.ndarray) -> np.ndarray:
        N, C, H, W = x.shape
        k = self.pool_size
        H_out = (H - k) // self.stride + 1
        W_out = (W - k) // self.stride + 1

        self.x_shape = x.shape
        out = np.zeros((N, C, H_out, W_out), dtype=np.float64)

        for i in range(H_out):
            for j in range(W_out):
                patch = x[:, :, i * self.stride:i * self.stride + k,
                          j * self.stride:j * self.stride + k]
                out[:, :, i, j] = np.mean(patch, axis=(2, 3))
        return out

    def backward(self, dout: np.ndarray) -> np.ndarray:
        N, C, H, W = self.x_shape
        dx = np.zeros(self.x_shape, dtype=np.float64)
        k = self.pool_size
        scale = 1.0 / (k * k)

        for i in range(dout.shape[2]):
            for j in range(dout.shape[3]):
                dx[:, :, i * self.stride:i * self.stride + k,
                   j * self.stride:j * self.stride + k] += scale * dout[:, :, i, j][:, :, np.newaxis, np.newaxis]
        return dx


class GlobalAvgPool2D(Layer):
    """Global Average Pooling layer."""

    def forward(self, x: np.ndarray) -> np.ndarray:
        self.x_shape = x.shape
        return np.mean(x, axis=(2, 3))

    def backward(self, dout: np.ndarray) -> np.ndarray:
        N, C = dout.shape
        H, W = self.x_shape[2], self.x_shape[3]
        dx = np.broadcast_to(dout[:, :, np.newaxis, np.newaxis], (N, C, H, W)).copy()
        return dx / (H * W)


class Dense(Layer):
    """Fully connected (dense) layer."""

    def __init__(self, in_features: int, out_features: int,
                 initializer: str = 'xavier_normal'):
        super().__init__()
        from .initializers import INITIALIZERS
        init_fn = INITIALIZERS[initializer]
        self.params['W'] = init_fn((in_features, out_features))
        self.params['b'] = np.zeros(out_features, dtype=np.float64)

    def forward(self, x: np.ndarray) -> np.ndarray:
        self.x = x
        return x @ self.params['W'] + self.params['b']

    def backward(self, dout: np.ndarray) -> np.ndarray:
        self.grads['W'] = self.x.T @ dout
        self.grads['b'] = np.sum(dout, axis=0)
        return dout @ self.params['W'].T


class Flatten(Layer):
    """Flatten layer to reshape (N, C, H, W) -> (N, C*H*W)."""

    def forward(self, x: np.ndarray) -> np.ndarray:
        self.x_shape = x.shape
        return x.reshape(x.shape[0], -1)

    def backward(self, dout: np.ndarray) -> np.ndarray:
        return dout.reshape(self.x_shape)


class Reshape(Layer):
    """Reshape layer to target shape."""

    def __init__(self, target_shape: tuple):
        super().__init__()
        self.target_shape = target_shape

    def forward(self, x: np.ndarray) -> np.ndarray:
        self.x_shape = x.shape
        return x.reshape((x.shape[0],) + self.target_shape)

    def backward(self, dout: np.ndarray) -> np.ndarray:
        return dout.reshape(self.x_shape)


class Dropout(Layer):
    """Dropout layer for regularization."""

    def __init__(self, rate: float = 0.5):
        super().__init__()
        self.rate = rate

    def forward(self, x: np.ndarray) -> np.ndarray:
        if self.training:
            self.mask = (np.random.random(x.shape) > self.rate).astype(np.float64)
            return x * self.mask / (1 - self.rate)
        return x

    def backward(self, dout: np.ndarray) -> np.ndarray:
        return dout * self.mask / (1 - self.rate)


class BatchNorm2D(Layer):
    """Batch Normalization for 2D inputs (N, C, H, W)."""

    def __init__(self, num_features: int, momentum: float = 0.1, eps: float = 1e-5):
        super().__init__()
        self.num_features = num_features
        self.momentum = momentum
        self.eps = eps
        self.params['gamma'] = np.ones(num_features, dtype=np.float64)
        self.params['beta'] = np.zeros(num_features, dtype=np.float64)
        self.running_mean = np.zeros(num_features, dtype=np.float64)
        self.running_var = np.ones(num_features, dtype=np.float64)

    def forward(self, x: np.ndarray) -> np.ndarray:
        N, C, H, W = x.shape
        if self.training:
            mean = np.mean(x, axis=(0, 2, 3))
            var = np.var(x, axis=(0, 2, 3))
            self.running_mean = (1 - self.momentum) * self.running_mean + self.momentum * mean
            self.running_var = (1 - self.momentum) * self.running_var + self.momentum * var
        else:
            mean = self.running_mean
            var = self.running_var

        self.x_norm = (x - mean[np.newaxis, :, np.newaxis, np.newaxis]) / np.sqrt(
            var[np.newaxis, :, np.newaxis, np.newaxis] + self.eps)
        self.mean = mean
        self.var = var

        out = self.params['gamma'][np.newaxis, :, np.newaxis, np.newaxis] * self.x_norm + \
              self.params['beta'][np.newaxis, :, np.newaxis, np.newaxis]
        return out

    def backward(self, dout: np.ndarray) -> np.ndarray:
        N, C, H, W = dout.shape
        num = N * H * W

        self.grads['gamma'] = np.sum(dout * self.x_norm, axis=(0, 2, 3))
        self.grads['beta'] = np.sum(dout, axis=(0, 2, 3))

        dx_norm = dout * self.params['gamma'][np.newaxis, :, np.newaxis, np.newaxis]
        std_inv = 1.0 / np.sqrt(self.var + self.eps)

        dx = (1.0 / num) * std_inv[np.newaxis, :, np.newaxis, np.newaxis] * (
            num * dx_norm - np.sum(dx_norm, axis=(0, 2, 3), keepdims=True) -
            self.x_norm * np.sum(dx_norm * self.x_norm, axis=(0, 2, 3), keepdims=True)
        )
        return dx


class BatchNorm1D(Layer):
    """Batch Normalization for 1D inputs (N, features)."""

    def __init__(self, num_features: int, momentum: float = 0.1, eps: float = 1e-5):
        super().__init__()
        self.num_features = num_features
        self.momentum = momentum
        self.eps = eps
        self.params['gamma'] = np.ones(num_features, dtype=np.float64)
        self.params['beta'] = np.zeros(num_features, dtype=np.float64)
        self.running_mean = np.zeros(num_features, dtype=np.float64)
        self.running_var = np.ones(num_features, dtype=np.float64)

    def forward(self, x: np.ndarray) -> np.ndarray:
        if self.training:
            mean = np.mean(x, axis=0)
            var = np.var(x, axis=0)
            self.running_mean = (1 - self.momentum) * self.running_mean + self.momentum * mean
            self.running_var = (1 - self.momentum) * self.running_var + self.momentum * var
        else:
            mean = self.running_mean
            var = self.running_var

        self.x_norm = (x - mean) / np.sqrt(var + self.eps)
        self.mean = mean
        self.var = var

        return self.params['gamma'] * self.x_norm + self.params['beta']

    def backward(self, dout: np.ndarray) -> np.ndarray:
        N = dout.shape[0]

        self.grads['gamma'] = np.sum(dout * self.x_norm, axis=0)
        self.grads['beta'] = np.sum(dout, axis=0)

        dx_norm = dout * self.params['gamma']
        std_inv = 1.0 / np.sqrt(self.var + self.eps)

        dx = (1.0 / N) * std_inv * (
            N * dx_norm - np.sum(dx_norm, axis=0) -
            self.x_norm * np.sum(dx_norm * self.x_norm, axis=0)
        )
        return dx


class LayerNorm(Layer):
    """Layer Normalization."""

    def __init__(self, normalized_shape: int, eps: float = 1e-5):
        super().__init__()
        self.eps = eps
        self.params['gamma'] = np.ones(normalized_shape, dtype=np.float64)
        self.params['beta'] = np.zeros(normalized_shape, dtype=np.float64)

    def forward(self, x: np.ndarray) -> np.ndarray:
        self.x = x
        self.mean = np.mean(x, axis=-1, keepdims=True)
        self.var = np.var(x, axis=-1, keepdims=True)
        self.x_norm = (x - self.mean) / np.sqrt(self.var + self.eps)
        return self.params['gamma'] * self.x_norm + self.params['beta']

    def backward(self, dout: np.ndarray) -> np.ndarray:
        N = dout.shape[-1]

        self.grads['gamma'] = np.sum(dout * self.x_norm, axis=(0, 1) if dout.ndim > 1 else 0)
        self.grads['beta'] = np.sum(dout, axis=(0, 1) if dout.ndim > 1 else 0)

        dx_norm = dout * self.params['gamma']
        std_inv = 1.0 / np.sqrt(self.var + self.eps)

        dx = (1.0 / N) * std_inv * (
            N * dx_norm - np.sum(dx_norm, axis=-1, keepdims=True) -
            self.x_norm * np.sum(dx_norm * self.x_norm, axis=-1, keepdims=True)
        )
        return dx


class Upsample(Layer):
    """Upsample layer using nearest-neighbor interpolation."""

    def __init__(self, scale_factor: int = 2):
        super().__init__()
        self.scale_factor = scale_factor

    def forward(self, x: np.ndarray) -> np.ndarray:
        self.x_shape = x.shape
        s = self.scale_factor
        return np.repeat(np.repeat(x, s, axis=2), s, axis=3)

    def backward(self, dout: np.ndarray) -> np.ndarray:
        s = self.scale_factor
        dx = np.zeros(self.x_shape, dtype=np.float64)
        for i in range(s):
            for j in range(s):
                dx += dout[:, :, i::s, j::s]
        return dx


class Pad2D(Layer):
    """2D Padding layer."""

    def __init__(self, pad: int):
        super().__init__()
        self.pad = pad

    def forward(self, x: np.ndarray) -> np.ndarray:
        self.x_shape = x.shape
        return np.pad(x, ((0, 0), (0, 0), (self.pad, self.pad), (self.pad, self.pad)), mode='constant')

    def backward(self, dout: np.ndarray) -> np.ndarray:
        p = self.pad
        if p == 0:
            return dout
        return dout[:, :, p:-p, p:-p]


class ZeroPad2D(Layer):
    """2D Padding with zeros."""

    def __init__(self, pad: int):
        super().__init__()
        self.pad = pad

    def forward(self, x: np.ndarray) -> np.ndarray:
        self.x_shape = x.shape
        return np.pad(x, ((0, 0), (0, 0), (self.pad, self.pad), (self.pad, self.pad)), mode='constant')

    def backward(self, dout: np.ndarray) -> np.ndarray:
        p = self.pad
        if p == 0:
            return dout
        return dout[:, :, p:-p, p:-p]