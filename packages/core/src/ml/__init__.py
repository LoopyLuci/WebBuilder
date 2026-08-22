#!/usr/bin/env python3
"""
WebBuilder ML Core Framework
Built entirely from scratch with NumPy — no external ML dependencies
Complete neural network framework with all layer types, optimizers, and utilities
"""

import numpy as np
from abc import ABC, abstractmethod
from typing import List, Tuple, Optional, Dict, Any, Callable
import json
import pickle
import os


# ═══════════════════════════════════════════════════════════════════════════
# BASE CLASSES
# ═══════════════════════════════════════════════════════════════════════════

class Layer(ABC):
    """Base class for all neural network layers."""
    
    def __init__(self):
        self.params: Dict[str, np.ndarray] = {}
        self.grads: Dict[str, np.ndarray] = {}
        self.training = True
        self.cache: Dict[str, Any] = {}
    
    @abstractmethod
    def forward(self, x: np.ndarray) -> np.ndarray:
        pass
    
    @abstractmethod
    def backward(self, dout: np.ndarray) -> np.ndarray:
        pass
    
    def __call__(self, x: np.ndarray) -> np.ndarray:
        return self.forward(x)
    
    def get_params(self) -> Dict[str, np.ndarray]:
        return self.params
    
    def get_grads(self) -> Dict[str, np.ndarray]:
        return self.grads
    
    def set_training(self, training: bool):
        self.training = training


class Activation(ABC):
    """Base class for activation functions."""
    
    @abstractmethod
    def forward(self, x: np.ndarray) -> np.ndarray:
        pass
    
    @abstractmethod
    def backward(self, x: np.ndarray) -> np.ndarray:
        pass
    
    def __call__(self, x: np.ndarray) -> np.ndarray:
        return self.forward(x)


class Loss(ABC):
    """Base class for loss functions."""
    
    @abstractmethod
    def forward(self, y_pred: np.ndarray, y_true: np.ndarray) -> float:
        pass
    
    @abstractmethod
    def backward(self, y_pred: np.ndarray, y_true: np.ndarray) -> np.ndarray:
        pass
    
    def __call__(self, y_pred: np.ndarray, y_true: np.ndarray) -> float:
        return self.forward(y_pred, y_true)


class Optimizer(ABC):
    """Base class for optimizers."""
    
    def __init__(self, lr: float = 0.001):
        self.lr = lr
        self.t = 0
    
    @abstractmethod
    def update(self, params: Dict[str, np.ndarray], grads: Dict[str, np.ndarray]):
        pass
    
    def step(self):
        self.t += 1


# ═══════════════════════════════════════════════════════════════════════════
# LAYERS
# ═══════════════════════════════════════════════════════════════════════════

class Dense(Layer):
    """Fully connected (dense) layer."""
    
    def __init__(self, in_features: int, out_features: int, bias: bool = True):
        super().__init__()
        scale = np.sqrt(2.0 / in_features)
        self.params['W'] = np.random.randn(in_features, out_features).astype(np.float32) * scale
        if bias:
            self.params['b'] = np.zeros(out_features, dtype=np.float32)
    
    def forward(self, x: np.ndarray) -> np.ndarray:
        self.cache['x'] = x
        out = x @ self.params['W']
        if 'b' in self.params:
            out = out + self.params['b']
        return out
    
    def backward(self, dout: np.ndarray) -> np.ndarray:
        x = self.cache['x']
        self.grads['W'] = x.T @ dout
        if 'b' in self.params:
            self.grads['b'] = np.sum(dout, axis=0)
        return dout @ self.params['W'].T


class Conv2D(Layer):
    """2D convolutional layer."""
    
    def __init__(self, in_channels: int, out_channels: int, kernel_size: int,
                 stride: int = 1, padding: int = 0):
        super().__init__()
        self.in_channels = in_channels
        self.out_channels = out_channels
        self.kernel_size = kernel_size
        self.stride = stride
        self.padding = padding
        
        scale = np.sqrt(2.0 / (in_channels * kernel_size * kernel_size))
        self.params['W'] = np.random.randn(
            out_channels, in_channels, kernel_size, kernel_size
        ).astype(np.float32) * scale
        self.params['b'] = np.zeros(out_channels, dtype=np.float32)
    
    def forward(self, x: np.ndarray) -> np.ndarray:
        self.cache['x'] = x
        N, C, H, W = x.shape
        K = self.kernel_size
        S = self.stride
        P = self.padding
        
        if P > 0:
            x_padded = np.pad(x, ((0,0), (0,0), (P,P), (P,P)), mode='constant')
        else:
            x_padded = x
        
        H_out = (H + 2*P - K) // S + 1
        W_out = (W + 2*P - K) // S + 1
        
        cols = self._im2col(x_padded, K, S)
        W_col = self.params['W'].reshape(self.out_channels, -1)
        
        out = W_col @ cols + self.params['b'].reshape(-1, 1)
        out = out.reshape(self.out_channels, H_out, W_out, N)
        out = out.transpose(3, 0, 1, 2)
        
        self.cache['cols'] = cols
        return out
    
    def backward(self, dout: np.ndarray) -> np.ndarray:
        x = self.cache['x']
        cols = self.cache['cols']
        N, C, H, W = x.shape
        
        dout_reshaped = dout.transpose(1, 2, 3, 0).reshape(self.out_channels, -1)
        
        self.grads['W'] = (dout_reshaped @ cols.T).reshape(self.params['W'].shape)
        self.grads['b'] = np.sum(dout, axis=(0, 2, 3))
        
        W_col = self.params['W'].reshape(self.out_channels, -1)
        dcols = W_col.T @ dout_reshaped
        dx = self._col2im(dcols, x.shape, self.kernel_size, self.stride, self.padding)
        
        return dx
    
    def _im2col(self, x: np.ndarray, kernel_size: int, stride: int) -> np.ndarray:
        N, C, H, W = x.shape
        K = kernel_size
        H_out = (H - K) // stride + 1
        W_out = (W - K) // stride + 1
        
        cols = np.zeros((C * K * K, H_out * W_out * N), dtype=np.float32)
        
        for y in range(H_out):
            y_max = y * stride + K
            for x_pos in range(W_out):
                x_max = x_pos * stride + K
                cols[:, y * W_out * N + x_pos * N: y * W_out * N + x_pos * N + N] = \
                    x[0:N, 0:C, y * stride:y_max, x_pos * stride:x_max].reshape(C * K * K, N)
        
        return cols
    
    def _col2im(self, cols: np.ndarray, x_shape: tuple, kernel_size: int,
                stride: int, padding: int) -> np.ndarray:
        N, C, H, W = x_shape
        K = kernel_size
        H_out = (H + 2*padding - K) // stride + 1
        W_out = (W + 2*padding - K) // stride + 1
        
        if padding > 0:
            x_padded = np.zeros((N, C, H + 2*padding, W + 2*padding), dtype=np.float32)
        else:
            x_padded = np.zeros(x_shape, dtype=np.float32)
        
        for y in range(H_out):
            y_max = y * stride + K
            for x_pos in range(W_out):
                x_max = x_pos * stride + K
                if padding > 0:
                    x_padded[0:N, 0:C, y * stride:y_max, x_pos * stride:x_max] += \
                        cols[:, y * W_out * N + x_pos * N: y * W_out * N + x_pos * N + N].reshape(C, K, K, N).transpose(3, 0, 1, 2)
                else:
                    x_padded[0:N, 0:C, y * stride:y_max, x_pos * stride:x_max] += \
                        cols[:, y * W_out * N + x_pos * N: y * W_out * N + x_pos * N + N].reshape(C, K, K, N).transpose(3, 0, 1, 2)
        
        if padding > 0:
            return x_padded[:, :, padding:-padding, padding:-padding]
        return x_padded


class MaxPool2D(Layer):
    """2D max pooling layer."""
    
    def __init__(self, pool_size: int = 2, stride: int = 2):
        super().__init__()
        self.pool_size = pool_size
        self.stride = stride
    
    def forward(self, x: np.ndarray) -> np.ndarray:
        self.cache['x'] = x
        N, C, H, W = x.shape
        K = self.pool_size
        S = self.stride
        
        H_out = (H - K) // S + 1
        W_out = (W - K) // S + 1
        
        x_reshaped = x.reshape(N, C, H_out, K, W_out, K)
        out = x_reshaped.max(axis=(3, 5))
        
        self.cache['x_reshaped'] = x_reshaped
        return out
    
    def backward(self, dout: np.ndarray) -> np.ndarray:
        x = self.cache['x']
        x_reshaped = self.cache['x_reshaped']
        N, C, H, W = x.shape
        K = self.pool_size
        S = self.stride
        H_out, W_out = dout.shape[2], dout.shape[3]
        
        max_vals = x_reshaped.max(axis=(3, 5), keepdims=True)
        mask = (x_reshaped == max_vals)
        
        dout_expanded = dout[:, :, :, np.newaxis, :, np.newaxis]
        dx_reshaped = mask * dout_expanded
        
        dx = dx_reshaped.reshape(N, C, H, W)
        return dx


class Flatten(Layer):
    """Flatten layer to convert 4D to 2D."""
    
    def forward(self, x: np.ndarray) -> np.ndarray:
        self.cache['shape'] = x.shape
        return x.reshape(x.shape[0], -1)
    
    def backward(self, dout: np.ndarray) -> np.ndarray:
        return dout.reshape(self.cache['shape'])


class Dropout(Layer):
    """Dropout layer for regularization."""
    
    def __init__(self, p: float = 0.5):
        super().__init__()
        self.p = p
    
    def forward(self, x: np.ndarray) -> np.ndarray:
        if self.training:
            self.cache['mask'] = (np.random.rand(*x.shape) > self.p).astype(np.float32)
            return x * self.cache['mask'] / (1 - self.p)
        return x
    
    def backward(self, dout: np.ndarray) -> np.ndarray:
        if self.training:
            return dout * self.cache['mask'] / (1 - self.p)
        return dout


class BatchNorm(Layer):
    """Batch normalization layer."""
    
    def __init__(self, num_features: int, eps: float = 1e-5, momentum: float = 0.1):
        super().__init__()
        self.eps = eps
        self.momentum = momentum
        
        self.params['gamma'] = np.ones(num_features, dtype=np.float32)
        self.params['beta'] = np.zeros(num_features, dtype=np.float32)
        
        self.running_mean = np.zeros(num_features, dtype=np.float32)
        self.running_var = np.ones(num_features, dtype=np.float32)
    
    def forward(self, x: np.ndarray) -> np.ndarray:
        if x.ndim == 2:
            if self.training:
                mean = np.mean(x, axis=0)
                var = np.var(x, axis=0)
                x_norm = (x - mean) / np.sqrt(var + self.eps)
                self.cache = {'x': x, 'mean': mean, 'var': var, 'x_norm': x_norm}
                
                self.running_mean = (1 - self.momentum) * self.running_mean + self.momentum * mean
                self.running_var = (1 - self.momentum) * self.running_var + self.momentum * var
            else:
                x_norm = (x - self.running_mean) / np.sqrt(self.running_var + self.eps)
            
            return self.params['gamma'] * x_norm + self.params['beta']
        else:
            if self.training:
                mean = np.mean(x, axis=(0, 2, 3))
                var = np.var(x, axis=(0, 2, 3))
                x_norm = (x - mean[np.newaxis, :, np.newaxis, np.newaxis]) / np.sqrt(var[np.newaxis, :, np.newaxis, np.newaxis] + self.eps)
                self.cache = {'x': x, 'mean': mean, 'var': var, 'x_norm': x_norm}
                
                self.running_mean = (1 - self.momentum) * self.running_mean + self.momentum * mean
                self.running_var = (1 - self.momentum) * self.running_var + self.momentum * var
            else:
                x_norm = (x - self.running_mean[np.newaxis, :, np.newaxis, np.newaxis]) / \
                         np.sqrt(self.running_var[np.newaxis, :, np.newaxis, np.newaxis] + self.eps)
            
            return self.params['gamma'][np.newaxis, :, np.newaxis, np.newaxis] * x_norm + \
                   self.params['beta'][np.newaxis, :, np.newaxis, np.newaxis]
    
    def backward(self, dout: np.ndarray) -> np.ndarray:
        x = self.cache['x']
        x_norm = self.cache['x_norm']
        mean = self.cache['mean']
        var = self.cache['var']
        
        if x.ndim == 2:
            N = x.shape[0]
            self.grads['gamma'] = np.sum(dout * x_norm, axis=0)
            self.grads['beta'] = np.sum(dout, axis=0)
            
            dx_norm = dout * self.params['gamma']
            dvar = np.sum(dx_norm * (x - mean) * -0.5 * (var + self.eps)**(-1.5), axis=0)
            dmean = np.sum(dx_norm * -1 / np.sqrt(var + self.eps), axis=0) + dvar * np.sum(-2 * (x - mean), axis=0) / N
            
            dx = dx_norm / np.sqrt(var + self.eps) + dvar * 2 * (x - mean) / N + dmean / N
        else:
            N, C, H, W = x.shape
            self.grads['gamma'] = np.sum(dout * x_norm, axis=(0, 2, 3))
            self.grads['beta'] = np.sum(dout, axis=(0, 2, 3))
            
            dx_norm = dout * self.params['gamma'][np.newaxis, :, np.newaxis, np.newaxis]
            dvar = np.sum(dx_norm * (x - mean[np.newaxis, :, np.newaxis, np.newaxis]) * -0.5 * \
                   (var[np.newaxis, :, np.newaxis, np.newaxis] + self.eps)**(-1.5), axis=(0, 2, 3))
            dmean = np.sum(dx_norm * -1 / np.sqrt(var[np.newaxis, :, np.newaxis, np.newaxis] + self.eps), axis=(0, 2, 3)) + \
                    dvar * np.sum(-2 * (x - mean[np.newaxis, :, np.newaxis, np.newaxis]), axis=(0, 2, 3)) / (N * H * W)
            
            dx = dx_norm / np.sqrt(var[np.newaxis, :, np.newaxis, np.newaxis] + self.eps) + \
                 dvar[np.newaxis, :, np.newaxis, np.newaxis] * 2 * (x - mean[np.newaxis, :, np.newaxis, np.newaxis]) / (N * H * W) + \
                 dmean[np.newaxis, :, np.newaxis, np.newaxis] / (N * H * W)
        
        return dx


class LayerNorm(Layer):
    """Layer normalization."""
    
    def __init__(self, normalized_shape: int, eps: float = 1e-5):
        super().__init__()
        self.eps = eps
        self.params['gamma'] = np.ones(normalized_shape, dtype=np.float32)
        self.params['beta'] = np.zeros(normalized_shape, dtype=np.float32)
    
    def forward(self, x: np.ndarray) -> np.ndarray:
        self.cache['x'] = x
        mean = np.mean(x, axis=-1, keepdims=True)
        var = np.var(x, axis=-1, keepdims=True)
        x_norm = (x - mean) / np.sqrt(var + self.eps)
        self.cache['x_norm'] = x_norm
        return self.params['gamma'] * x_norm + self.params['beta']
    
    def backward(self, dout: np.ndarray) -> np.ndarray:
        x = self.cache['x']
        x_norm = self.cache['x_norm']
        N = x.shape[-1]
        
        self.grads['gamma'] = np.sum(dout * x_norm, axis=0)
        self.grads['beta'] = np.sum(dout, axis=0)
        
        dx_norm = dout * self.params['gamma']
        dvar = np.sum(dx_norm * (x - np.mean(x, axis=-1, keepdims=True)) * -0.5 * (np.var(x, axis=-1, keepdims=True) + self.eps)**(-1.5), axis=-1, keepdims=True)
        dmean = np.sum(dx_norm * -1 / np.sqrt(np.var(x, axis=-1, keepdims=True) + self.eps), axis=-1, keepdims=True)
        
        dx = dx_norm / np.sqrt(np.var(x, axis=-1, keepdims=True) + self.eps) + dvar * 2 * (x - np.mean(x, axis=-1, keepdims=True)) / N + dmean / N
        return dx


class ResidualBlock(Layer):
    """Residual connection block."""
    
    def __init__(self, layer: Layer):
        super().__init__()
        self.layer = layer
    
    def forward(self, x: np.ndarray) -> np.ndarray:
        self.cache['x'] = x
        return x + self.layer.forward(x)
    
    def backward(self, dout: np.ndarray) -> np.ndarray:
        return dout + self.layer.backward(dout)
    
    def get_params(self) -> Dict[str, np.ndarray]:
        return self.layer.get_params()
    
    def get_grads(self) -> Dict[str, np.ndarray]:
        return self.layer.get_grads()


class Embedding(Layer):
    """Embedding layer for discrete tokens."""
    
    def __init__(self, num_embeddings: int, embedding_dim: int):
        super().__init__()
        self.num_embeddings = num_embeddings
        self.embedding_dim = embedding_dim
        self.params['W'] = np.random.randn(num_embeddings, embedding_dim).astype(np.float32) * 0.02
    
    def forward(self, x: np.ndarray) -> np.ndarray:
        self.cache['x'] = x
        return self.params['W'][x]
    
    def backward(self, dout: np.ndarray) -> np.ndarray:
        x = self.cache['x']
        self.grads['W'] = np.zeros_like(self.params['W'])
        np.add.at(self.grads['W'], x, dout)
        return None  # No gradient for discrete inputs


# ═══════════════════════════════════════════════════════════════════════════
# ACTIVATIONS
# ═══════════════════════════════════════════════════════════════════════════

class ReLU(Activation):
    def forward(self, x: np.ndarray) -> np.ndarray:
        self.cache['mask'] = (x > 0).astype(np.float32)
        return x * self.cache['mask']
    
    def backward(self, x: np.ndarray) -> np.ndarray:
        return self.cache['mask']


class LeakyReLU(Activation):
    def __init__(self, alpha: float = 0.01):
        self.alpha = alpha
    
    def forward(self, x: np.ndarray) -> np.ndarray:
        self.cache['x'] = x
        return np.where(x > 0, x, self.alpha * x)
    
    def backward(self, x: np.ndarray) -> np.ndarray:
        return np.where(self.cache['x'] > 0, 1, self.alpha)


class Sigmoid(Activation):
    def forward(self, x: np.ndarray) -> np.ndarray:
        out = 1 / (1 + np.exp(-np.clip(x, -500, 500)))
        self.cache['out'] = out
        return out
    
    def backward(self, x: np.ndarray) -> np.ndarray:
        out = self.cache['out']
        return out * (1 - out)


class Tanh(Activation):
    def forward(self, x: np.ndarray) -> np.ndarray:
        out = np.tanh(x)
        self.cache['out'] = out
        return out
    
    def backward(self, x: np.ndarray) -> np.ndarray:
        return 1 - self.cache['out'] ** 2


class Softmax(Activation):
    def forward(self, x: np.ndarray) -> np.ndarray:
        exp_x = np.exp(x - np.max(x, axis=-1, keepdims=True))
        out = exp_x / np.sum(exp_x, axis=-1, keepdims=True)
        self.cache['out'] = out
        return out
    
    def backward(self, x: np.ndarray) -> np.ndarray:
        out = self.cache['out']
        return out * (1 - out)


class GELU(Activation):
    """Gaussian Error Linear Unit."""
    
    def forward(self, x: np.ndarray) -> np.ndarray:
        self.cache['x'] = x
        return 0.5 * x * (1 + np.tanh(np.sqrt(2 / np.pi) * (x + 0.044715 * x**3)))
    
    def backward(self, x: np.ndarray) -> np.ndarray:
        x = self.cache['x']
        c = np.sqrt(2 / np.pi) * (x + 0.044715 * x**3)
        sech2 = 1 / np.cosh(c)**2
        return 0.5 * (1 + np.tanh(c)) + 0.5 * x * sech2 * np.sqrt(2 / np.pi) * (1 + 3 * 0.044715 * x**2)


class SiLU(Activation):
    """Sigmoid Linear Unit (Swish)."""
    
    def forward(self, x: np.ndarray) -> np.ndarray:
        self.cache['x'] = x
        sigmoid = 1 / (1 + np.exp(-np.clip(x, -500, 500)))
        return x * sigmoid
    
    def backward(self, x: np.ndarray) -> np.ndarray:
        x = self.cache['x']
        sigmoid = 1 / (1 + np.exp(-np.clip(x, -500, 500)))
        return sigmoid + x * sigmoid * (1 - sigmoid)


class Mish(Activation):
    """Mish activation: x * tanh(softplus(x))."""
    
    def forward(self, x: np.ndarray) -> np.ndarray:
        self.cache['x'] = x
        softplus = np.log(1 + np.exp(np.clip(x, -500, 500)))
        return x * np.tanh(softplus)
    
    def backward(self, x: np.ndarray) -> np.ndarray:
        x = self.cache['x']
        softplus = np.log(1 + np.exp(np.clip(x, -500, 500)))
        tanh_sp = np.tanh(softplus)
        sech2 = 1 - tanh_sp**2
        sigmoid = 1 / (1 + np.exp(-np.clip(x, -500, 500)))
        return tanh_sp + x * sech2 * sigmoid


# ═══════════════════════════════════════════════════════════════════════════
# LOSS FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════

class MSELoss(Loss):
    """Mean Squared Error loss."""
    
    def forward(self, y_pred: np.ndarray, y_true: np.ndarray) -> float:
        self.cache['diff'] = y_pred - y_true
        return np.mean(self.cache['diff'] ** 2)
    
    def backward(self, y_pred: np.ndarray, y_true: np.ndarray) -> np.ndarray:
        N = y_pred.shape[0]
        return 2 * self.cache['diff'] / N


class CrossEntropyLoss(Loss):
    """Cross-entropy loss for classification."""
    
    def forward(self, y_pred: np.ndarray, y_true: np.ndarray) -> float:
        softmax = np.exp(y_pred - np.max(y_pred, axis=-1, keepdims=True))
        softmax = softmax / np.sum(softmax, axis=-1, keepdims=True)
        self.cache['softmax'] = softmax
        self.cache['y_true'] = y_true
        
        eps = 1e-7
        return -np.mean(np.sum(y_true * np.log(softmax + eps), axis=-1))
    
    def backward(self, y_pred: np.ndarray, y_true: np.ndarray) -> np.ndarray:
        N = y_pred.shape[0]
        return (self.cache['softmax'] - y_true) / N


class BCELoss(Loss):
    """Binary Cross-Entropy loss."""
    
    def forward(self, y_pred: np.ndarray, y_true: np.ndarray) -> float:
        eps = 1e-7
        y_pred = np.clip(y_pred, eps, 1 - eps)
        self.cache['y_pred'] = y_pred
        self.cache['y_true'] = y_true
        return -np.mean(y_true * np.log(y_pred) + (1 - y_true) * np.log(1 - y_pred))
    
    def backward(self, y_pred: np.ndarray, y_true: np.ndarray) -> np.ndarray:
        eps = 1e-7
        y_pred = np.clip(y_pred, eps, 1 - eps)
        return (y_pred - y_true) / (y_pred * (1 - y_pred) * y_pred.shape[0])


class HuberLoss(Loss):
    """Huber loss for regression."""
    
    def __init__(self, delta: float = 1.0):
        self.delta = delta
    
    def forward(self, y_pred: np.ndarray, y_true: np.ndarray) -> float:
        diff = y_pred - y_true
        abs_diff = np.abs(diff)
        self.cache['diff'] = diff
        self.cache['abs_diff'] = abs_diff
        
        loss = np.where(abs_diff <= self.delta, 0.5 * diff**2, self.delta * (abs_diff - 0.5 * self.delta))
        return np.mean(loss)
    
    def backward(self, y_pred: np.ndarray, y_true: np.ndarray) -> np.ndarray:
        diff = self.cache['diff']
        abs_diff = self.cache['abs_diff']
        N = y_pred.shape[0]
        return np.where(abs_diff <= self.delta, diff / N, self.delta * np.sign(diff) / N)


# ═══════════════════════════════════════════════════════════════════════════
# OPTIMIZERS
# ═══════════════════════════════════════════════════════════════════════════

class SGD(Optimizer):
    """Stochastic Gradient Descent."""
    
    def __init__(self, lr: float = 0.01, momentum: float = 0.9):
        super().__init__(lr)
        self.momentum = momentum
        self.velocities: Dict[str, np.ndarray] = {}
    
    def update(self, params: Dict[str, np.ndarray], grads: Dict[str, np.ndarray]):
        for key in params:
            if key not in self.velocities:
                self.velocities[key] = np.zeros_like(params[key])
            self.velocities[key] = self.momentum * self.velocities[key] - self.lr * grads[key]
            params[key] += self.velocities[key]


class Adam(Optimizer):
    """Adam optimizer."""
    
    def __init__(self, lr: float = 0.001, beta1: float = 0.9, beta2: float = 0.999, eps: float = 1e-8):
        super().__init__(lr)
        self.beta1 = beta1
        self.beta2 = beta2
        self.eps = eps
        self.m: Dict[str, np.ndarray] = {}
        self.v: Dict[str, np.ndarray] = {}
    
    def update(self, params: Dict[str, np.ndarray], grads: Dict[str, np.ndarray]):
        self.step()
        for key in params:
            if key not in self.m:
                self.m[key] = np.zeros_like(params[key])
                self.v[key] = np.zeros_like(params[key])
            
            self.m[key] = self.beta1 * self.m[key] + (1 - self.beta1) * grads[key]
            self.v[key] = self.beta2 * self.v[key] + (1 - self.beta2) * grads[key]**2
            
            m_hat = self.m[key] / (1 - self.beta1**self.t)
            v_hat = self.v[key] / (1 - self.beta2**self.t)
            
            params[key] -= self.lr * m_hat / (np.sqrt(v_hat) + self.eps)


class AdamW(Optimizer):
    """AdamW optimizer with weight decay."""
    
    def __init__(self, lr: float = 0.001, beta1: float = 0.9, beta2: float = 0.999, eps: float = 1e-8, weight_decay: float = 0.01):
        super().__init__(lr)
        self.beta1 = beta1
        self.beta2 = beta2
        self.eps = eps
        self.weight_decay = weight_decay
        self.m: Dict[str, np.ndarray] = {}
        self.v: Dict[str, np.ndarray] = {}
    
    def update(self, params: Dict[str, np.ndarray], grads: Dict[str, np.ndarray]):
        self.step()
        for key in params:
            if key not in self.m:
                self.m[key] = np.zeros_like(params[key])
                self.v[key] = np.zeros_like(params[key])
            
            self.m[key] = self.beta1 * self.m[key] + (1 - self.beta1) * grads[key]
            self.v[key] = self.beta2 * self.v[key] + (1 - self.beta2) * grads[key]**2
            
            m_hat = self.m[key] / (1 - self.beta1**self.t)
            v_hat = self.v[key] / (1 - self.beta2**self.t)
            
            params[key] -= self.lr * (m_hat / (np.sqrt(v_hat) + self.eps) + self.weight_decay * params[key])


class RMSprop(Optimizer):
    """RMSprop optimizer."""
    
    def __init__(self, lr: float = 0.001, rho: float = 0.9, eps: float = 1e-8):
        super().__init__(lr)
        self.rho = rho
        self.eps = eps
        self.v: Dict[str, np.ndarray] = {}
    
    def update(self, params: Dict[str, np.ndarray], grads: Dict[str, np.ndarray]):
        for key in params:
            if key not in self.v:
                self.v[key] = np.zeros_like(params[key])
            self.v[key] = self.rho * self.v[key] + (1 - self.rho) * grads[key]**2
            params[key] -= self.lr * grads[key] / (np.sqrt(self.v[key]) + self.eps)


# ═══════════════════════════════════════════════════════════════════════════
# MODEL
# ═══════════════════════════════════════════════════════════════════════════

class Model:
    """Neural network model that combines layers."""
    
    def __init__(self, layers: List[Layer], loss: Loss, optimizer: Optimizer):
        self.layers = layers
        self.loss = loss
        self.optimizer = optimizer
    
    def forward(self, x: np.ndarray) -> np.ndarray:
        for layer in self.layers:
            x = layer.forward(x)
        return x
    
    def backward(self, dout: np.ndarray):
        for layer in reversed(self.layers):
            dout = layer.backward(dout)
    
    def train_step(self, x: np.ndarray, y: np.ndarray) -> float:
        # Forward pass
        y_pred = self.forward(x)
        loss = self.loss.forward(y_pred, y)
        
        # Backward pass
        dout = self.loss.backward(y_pred, y)
        self.backward(dout)
        
        # Update params
        for layer in self.layers:
            if layer.params:
                self.optimizer.update(layer.params, layer.grads)
        
        return loss
    
    def predict(self, x: np.ndarray) -> np.ndarray:
        self.eval()
        out = self.forward(x)
        self.train()
        return out
    
    def train(self):
        for layer in self.layers:
            layer.set_training(True)
    
    def eval(self):
        for layer in self.layers:
            layer.set_training(False)
    
    def save(self, path: str):
        params = []
        for layer in self.layers:
            params.append({k: v.tolist() for k, v in layer.params.items()})
        with open(path, 'w') as f:
            json.dump(params, f)
    
    def load(self, path: str):
        with open(path, 'r') as f:
            params = json.load(f)
        for layer, p in zip(self.layers, params):
            for k, v in p.items():
                layer.params[k] = np.array(v, dtype=np.float32)


# ═══════════════════════════════════════════════════════════════════════════
# TRAINER
# ═══════════════════════════════════════════════════════════════════════════

class Trainer:
    """Training loop with logging and checkpointing."""
    
    def __init__(self, model: Model, batch_size: int = 32, epochs: int = 100):
        self.model = model
        self.batch_size = batch_size
        self.epochs = epochs
        self.history = {'loss': [], 'val_loss': []}
    
    def fit(self, x_train: np.ndarray, y_train: np.ndarray,
            x_val: Optional[np.ndarray] = None, y_val: Optional[np.ndarray] = None):
        N = x_train.shape[0]
        
        for epoch in range(self.epochs):
            # Shuffle
            indices = np.random.permutation(N)
            x_shuffled = x_train[indices]
            y_shuffled = y_train[indices]
            
            # Mini-batch training
            epoch_loss = 0
            n_batches = 0
            for i in range(0, N, self.batch_size):
                x_batch = x_shuffled[i:i+self.batch_size]
                y_batch = y_shuffled[i:i+self.batch_size]
                loss = self.model.train_step(x_batch, y_batch)
                epoch_loss += loss
                n_batches += 1
            
            avg_loss = epoch_loss / n_batches
            self.history['loss'].append(avg_loss)
            
            # Validation
            if x_val is not None:
                val_pred = self.model.predict(x_val)
                val_loss = self.model.loss(val_pred, y_val)
                self.history['val_loss'].append(val_loss)
                print(f"Epoch {epoch+1}/{self.epochs} - loss: {avg_loss:.4f} - val_loss: {val_loss:.4f}")
            else:
                print(f"Epoch {epoch+1}/{self.epochs} - loss: {avg_loss:.4f}")
        
        return self.history


if __name__ == '__main__':
    # Simple test: learn XOR
    print("Testing neural network on XOR problem...")
    
    X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=np.float32)
    y = np.array([[0], [1], [1], [0]], dtype=np.float32)
    
    # Build model
    layers = [
        Dense(2, 8),
        ReLU(),
        Dense(8, 4),
        ReLU(),
        Dense(4, 1),
        Sigmoid()
    ]
    
    model = Model(layers, BCELoss(), Adam(lr=0.01))
    trainer = Trainer(model, batch_size=4, epochs=1000)
    trainer.fit(X, y)
    
    # Test
    predictions = model.predict(X)
    print("\nPredictions:")
    for i in range(4):
        print(f"  {X[i]} -> {predictions[i][0]:.4f} (expected {y[i][0]})")
