"""Core layer building blocks for sequence models."""

import numpy as np
from .initializers import xavier_uniform, zeros


class Linear:
    """Fully-connected linear layer: y = x @ W + b."""

    def __init__(self, in_features, out_features, bias=True, initializer=None):
        self.in_features = in_features
        self.out_features = out_features
        init = initializer or xavier_uniform
        self.W = init((in_features, out_features))
        self.b = zeros(out_features) if bias else None
        # Gradients
        self.dW = np.zeros_like(self.W)
        self.db = np.zeros_like(self.b) if self.b is not None else None
        # Cache
        self._cache = None

    def forward(self, x):
        """Forward pass. x shape: (..., in_features)"""
        self._cache = x
        out = x @ self.W
        if self.b is not None:
            out = out + self.b
        return out

    def backward(self, dout):
        """Backward pass. dout shape: (..., out_features)"""
        x = self._cache
        self.dW = x.T @ dout if x.ndim == 2 else np.einsum('...i,...j->ij', x, dout)
        if self.db is not None:
            self.db = np.sum(dout, axis=0) if dout.ndim == 2 else np.sum(dout, axis=(0, 1))
        return dout @ self.W.T

    def params(self):
        if self.b is not None:
            return [self.W, self.b]
        return [self.W]

    def grads(self):
        if self.db is not None:
            return [self.dW, self.db]
        return [self.dW]

    def zero_grad(self):
        self.dW.fill(0)
        if self.db is not None:
            self.db.fill(0)


class LayerNorm:
    """Layer normalization."""

    def __init__(self, d_model, eps=1e-5):
        self.d_model = d_model
        self.eps = eps
        self.gamma = np.ones(d_model, dtype=np.float64)
        self.beta = np.zeros(d_model, dtype=np.float64)
        self.dgamma = np.zeros_like(self.gamma)
        self.dbeta = np.zeros_like(self.beta)
        self._cache = None

    def forward(self, x):
        mean = np.mean(x, axis=-1, keepdims=True)
        var = np.var(x, axis=-1, keepdims=True)
        std = np.sqrt(var + self.eps)
        x_hat = (x - mean) / std
        self._cache = (x, x_hat, mean, std)
        return self.gamma * x_hat + self.beta

    def backward(self, dout):
        x, x_hat, mean, std = self._cache
        N = x.shape[-1]
        self.dgamma = np.sum(dout * x_hat, axis=(0, 1) if dout.ndim == 3 else 0)
        self.dbeta = np.sum(dout, axis=(0, 1) if dout.ndim == 3 else 0)
        dx_hat = dout * self.gamma
        dvar = np.sum(dx_hat * (x - mean) * (-0.5) * (std ** -3), axis=-1, keepdims=True)
        dmean = np.sum(dx_hat * (-1.0 / std), axis=-1, keepdims=True) + dvar * np.mean(-2.0 * (x - mean), axis=-1, keepdims=True)
        return dx_hat / std + dvar * 2.0 * (x - mean) / N + dmean / N

    def params(self):
        return [self.gamma, self.beta]

    def grads(self):
        return [self.dgamma, self.dbeta]

    def zero_grad(self):
        self.dgamma.fill(0)
        self.dbeta.fill(0)


class Dropout:
    """Dropout regularization."""

    def __init__(self, p=0.1):
        self.p = p
        self._mask = None
        self._training = True

    def forward(self, x):
        if self._training and self.p > 0:
            self._mask = (np.random.rand(*x.shape) > self.p).astype(np.float64)
            return x * self._mask / (1.0 - self.p)
        self._mask = None
        return x

    def backward(self, dout):
        if self._mask is not None:
            return dout * self._mask / (1.0 - self.p)
        return dout

    def params(self):
        return []

    def grads(self):
        return []

    def zero_grad(self):
        pass

    def train(self, mode=True):
        self._training = mode


class Embedding:
    """Token embedding layer."""

    def __init__(self, vocab_size, d_model):
        self.vocab_size = vocab_size
        self.d_model = d_model
        self.weight = np.random.randn(vocab_size, d_model).astype(np.float64) * 0.02
        self.dweight = np.zeros_like(self.weight)
        self._cache = None

    def forward(self, tokens):
        """tokens: integer array of shape (batch, seq_len) or (seq_len,)"""
        self._cache = tokens
        return self.weight[tokens]

    def backward(self, dout):
        tokens = self._cache
        np.add.at(self.dweight, tokens, dout)

    def params(self):
        return [self.weight]

    def grads(self):
        return [self.dweight]

    def zero_grad(self):
        self.dweight.fill(0)