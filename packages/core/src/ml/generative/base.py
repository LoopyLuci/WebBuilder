"""Base classes and utilities for generative models."""

import numpy as np


def initialize_weights(fan_in, fan_out, method='xavier'):
    """Initialize weights using various methods."""
    if method == 'xavier':
        limit = np.sqrt(6.0 / (fan_in + fan_out))
        return np.random.uniform(-limit, limit, (fan_in, fan_out))
    elif method == 'he':
        std = np.sqrt(2.0 / fan_in)
        return np.random.randn(fan_in, fan_out) * std
    elif method == 'normal':
        return np.random.randn(fan_in, fan_out) * 0.02
    else:
        return np.random.randn(fan_in, fan_out) * 0.01


class Module:
    """Base module class with parameter tracking."""
    
    def __init__(self):
        self.params = {}
        self.grads = {}
        self._training = True
    
    def forward(self, x):
        raise NotImplementedError
    
    def backward(self, dout):
        raise NotImplementedError
    
    def __call__(self, x):
        return self.forward(x)
    
    def parameters(self):
        return self.params
    
    def zero_grad(self):
        for key in self.grads:
            self.grads[key] = np.zeros_like(self.params[key])
    
    def train(self, mode=True):
        self._training = mode
    
    def eval(self):
        self._training = False
    
    def update_params(self, lr):
        for key in self.params:
            if key in self.grads:
                self.params[key] -= lr * self.grads[key]


class Dense(Module):
    """Fully connected layer."""
    
    def __init__(self, in_features, out_features, bias=True):
        super().__init__()
        self.params['W'] = initialize_weights(in_features, out_features, 'he')
        if bias:
            self.params['b'] = np.zeros(out_features)
        self.use_bias = bias
        self.input = None
        self.output = None
    
    def forward(self, x):
        self.input = x
        out = x @ self.params['W']
        if self.use_bias:
            out += self.params['b']
        self.output = out
        return out
    
    def backward(self, dout):
        self.grads['W'] = self.input.T @ dout
        if self.use_bias:
            self.grads['b'] = np.sum(dout, axis=0)
        return dout @ self.params['W'].T


class ReLU(Module):
    """ReLU activation."""
    
    def __init__(self):
        super().__init__()
        self.input = None
    
    def forward(self, x):
        self.input = x
        return np.maximum(0, x)
    
    def backward(self, dout):
        return dout * (self.input > 0).astype(float)


class LeakyReLU(Module):
    """Leaky ReLU activation."""
    
    def __init__(self, alpha=0.2):
        super().__init__()
        self.alpha = alpha
        self.input = None
    
    def forward(self, x):
        self.input = x
        return np.where(x > 0, x, self.alpha * x)
    
    def backward(self, dout):
        return dout * np.where(self.input > 0, 1.0, self.alpha)


class Tanh(Module):
    """Tanh activation."""
    
    def __init__(self):
        super().__init__()
        self.output = None
    
    def forward(self, x):
        self.output = np.tanh(x)
        return self.output
    
    def backward(self, dout):
        return dout * (1.0 - self.output ** 2)


class Sigmoid(Module):
    """Sigmoid activation."""
    
    def __init__(self):
        super().__init__()
        self.output = None
    
    def forward(self, x):
        x_clipped = np.clip(x, -500, 500)
        self.output = 1.0 / (1.0 + np.exp(-x_clipped))
        return self.output
    
    def backward(self, dout):
        return dout * self.output * (1.0 - self.output)


class BatchNorm(Module):
    """Batch normalization."""
    
    def __init__(self, num_features, eps=1e-5, momentum=0.1):
        super().__init__()
        self.params['gamma'] = np.ones(num_features)
        self.params['beta'] = np.zeros(num_features)
        self.running_mean = np.zeros(num_features)
        self.running_var = np.ones(num_features)
        self.eps = eps
        self.momentum = momentum
        self.cache = None
    
    def forward(self, x):
        if self._training:
            mu = np.mean(x, axis=0)
            var = np.var(x, axis=0)
            x_hat = (x - mu) / np.sqrt(var + self.eps)
            out = self.params['gamma'] * x_hat + self.params['beta']
            
            self.running_mean = (1 - self.momentum) * self.running_mean + self.momentum * mu
            self.running_var = (1 - self.momentum) * self.running_var + self.momentum * var
            self.cache = (x, x_hat, mu, var)
        else:
            x_hat = (x - self.running_mean) / np.sqrt(self.running_var + self.eps)
            out = self.params['gamma'] * x_hat + self.params['beta']
        return out
    
    def backward(self, dout):
        x, x_hat, mu, var = self.cache
        N = x.shape[0]
        std_inv = 1.0 / np.sqrt(var + self.eps)
        
        self.grads['gamma'] = np.sum(dout * x_hat, axis=0)
        self.grads['beta'] = np.sum(dout, axis=0)
        
        dx_hat = dout * self.params['gamma']
        dvar = np.sum(dx_hat * (x - mu) * (-0.5) * std_inv ** 3, axis=0)
        dmu = np.sum(dx_hat * (-std_inv), axis=0) + dvar * np.mean(-2.0 * (x - mu), axis=0)
        
        dx = dx_hat * std_inv + dvar * 2.0 * (x - mu) / N + dmu / N
        return dx


class Sequential(Module):
    """Sequential container."""
    
    def __init__(self, *layers):
        super().__init__()
        self.layers = layers
    
    def forward(self, x):
        for layer in self.layers:
            x = layer(x)
        return x
    
    def backward(self, dout):
        for layer in reversed(self.layers):
            dout = layer.backward(dout)
        return dout
    
    def parameters(self):
        params = {}
        for i, layer in enumerate(self.layers):
            if hasattr(layer, 'params'):
                for k, v in layer.params.items():
                    params[f'layer_{i}_{k}'] = v
        return params
    
    def update_params(self, lr):
        for layer in self.layers:
            if hasattr(layer, 'update_params'):
                layer.update_params(lr)
    
    def train(self, mode=True):
        self._training = mode
        for layer in self.layers:
            if hasattr(layer, 'train'):
                layer.train(mode)
    
    def eval(self):
        self.train(False)


class AdamOptimizer:
    """Adam optimizer."""
    
    def __init__(self, params, grads, lr=0.001, beta1=0.9, beta2=0.999, eps=1e-8):
        self.params = params
        self.grads = grads
        self.lr = lr
        self.beta1 = beta1
        self.beta2 = beta2
        self.eps = eps
        self.m = {}
        self.v = {}
        self.t = 0
        for key in params:
            self.m[key] = np.zeros_like(params[key])
            self.v[key] = np.zeros_like(params[key])
    
    def step(self):
        self.t += 1
        for key in self.params:
            if key in self.grads:
                self.m[key] = self.beta1 * self.m[key] + (1 - self.beta1) * self.grads[key]
                self.v[key] = self.beta2 * self.v[key] + (1 - self.beta2) * (self.grads[key] ** 2)
                m_hat = self.m[key] / (1 - self.beta1 ** self.t)
                v_hat = self.v[key] / (1 - self.beta2 ** self.t)
                self.params[key] -= self.lr * m_hat / (np.sqrt(v_hat) + self.eps)


class GenerativeModel(Module):
    """Base class for all generative models."""
    
    def __init__(self, latent_dim, data_dim):
        super().__init__()
        self.latent_dim = latent_dim
        self.data_dim = data_dim
        self.loss_history = []
    
    def sample_latent(self, batch_size):
        """Sample from prior distribution."""
        return np.random.randn(batch_size, self.latent_dim)
    
    def generate(self, num_samples):
        """Generate samples."""
        raise NotImplementedError
    
    def train_step(self, data):
        """Single training step."""
        raise NotImplementedError
    
    def loss(self, data):
        """Compute loss."""
        raise NotImplementedError