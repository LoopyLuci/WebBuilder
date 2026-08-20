"""
Optimizer implementations for training neural networks.
"""

import numpy as np
from abc import ABC, abstractmethod
from typing import List, Dict


class Optimizer(ABC):
    """Base class for optimizers."""

    def __init__(self, learning_rate: float = 0.001):
        self.lr = learning_rate
        self.t = 0  # Time step

    @abstractmethod
    def step(self, params: Dict[str, np.ndarray], grads: Dict[str, np.ndarray]):
        """
        Update parameters based on gradients.
        
        Args:
            params: Dictionary of parameter arrays (modified in-place)
            grads: Dictionary of gradient arrays
        """
        pass

    def zero_grad(self, layers: list):
        """Reset gradients for all layers."""
        for layer in layers:
            layer.zero_grad()


class SGD(Optimizer):
    """
    Stochastic Gradient Descent optimizer.
    
    Supports momentum and weight decay (L2 regularization).
    
    v = momentum * v - lr * (grad + weight_decay * params)
    params += v
    """

    def __init__(self, learning_rate: float = 0.01, momentum: float = 0.0,
                 weight_decay: float = 0.0):
        super().__init__(learning_rate)
        self.momentum = momentum
        self.weight_decay = weight_decay
        self.velocity = {}

    def step(self, params: Dict[str, np.ndarray], grads: Dict[str, np.ndarray]):
        for key in params:
            if key not in grads or grads[key] is None:
                continue

            if key not in self.velocity:
                self.velocity[key] = np.zeros_like(params[key])

            grad = grads[key]
            if self.weight_decay > 0:
                grad = grad + self.weight_decay * params[key]

            self.velocity[key] = self.momentum * self.velocity[key] - self.lr * grad
            params[key] = params[key] + self.velocity[key]

    def __repr__(self):
        return (f"SGD(lr={self.lr}, momentum={self.momentum}, "
                f"weight_decay={self.weight_decay})")


class Adam(Optimizer):
    """
    Adam optimizer (Adaptive Moment Estimation).
    
    m = beta1 * m + (1 - beta1) * grad
    v = beta2 * v + (1 - beta2) * grad^2
    m_hat = m / (1 - beta1^t)
    v_hat = v / (1 - beta2^t)
    params -= lr * m_hat / (sqrt(v_hat) + eps)
    """

    def __init__(self, learning_rate: float = 0.001, beta1: float = 0.9,
                 beta2: float = 0.999, epsilon: float = 1e-8,
                 weight_decay: float = 0.0):
        super().__init__(learning_rate)
        self.beta1 = beta1
        self.beta2 = beta2
        self.epsilon = epsilon
        self.weight_decay = weight_decay
        self.m = {}  # First moment
        self.v = {}  # Second moment

    def step(self, params: Dict[str, np.ndarray], grads: Dict[str, np.ndarray]):
        self.t += 1

        for key in params:
            if key not in grads or grads[key] is None:
                continue

            if key not in self.m:
                self.m[key] = np.zeros_like(params[key])
                self.v[key] = np.zeros_like(params[key])

            grad = grads[key]
            if self.weight_decay > 0:
                grad = grad + self.weight_decay * params[key]

            # Update moments
            self.m[key] = self.beta1 * self.m[key] + (1 - self.beta1) * grad
            self.v[key] = self.beta2 * self.v[key] + (1 - self.beta2) * grad ** 2

            # Bias correction
            m_hat = self.m[key] / (1 - self.beta1 ** self.t)
            v_hat = self.v[key] / (1 - self.beta2 ** self.t)

            # Update parameters
            params[key] = params[key] - self.lr * m_hat / (np.sqrt(v_hat) + self.epsilon)

    def __repr__(self):
        return f"Adam(lr={self.lr}, beta1={self.beta1}, beta2={self.beta2})"


class AdamW(Optimizer):
    """
    AdamW optimizer (Adam with decoupled weight decay).
    
    Unlike Adam with L2 regularization, AdamW applies weight decay directly 
    to the parameters rather than through the gradients.
    
    m = beta1 * m + (1 - beta1) * grad
    v = beta2 * v + (1 - beta2) * grad^2
    m_hat = m / (1 - beta1^t)
    v_hat = v / (1 - beta2^t)
    params -= lr * (m_hat / (sqrt(v_hat) + eps) + weight_decay * params)
    """

    def __init__(self, learning_rate: float = 0.001, beta1: float = 0.9,
                 beta2: float = 0.999, epsilon: float = 1e-8,
                 weight_decay: float = 0.01):
        super().__init__(learning_rate)
        self.beta1 = beta1
        self.beta2 = beta2
        self.epsilon = epsilon
        self.weight_decay = weight_decay
        self.m = {}
        self.v = {}

    def step(self, params: Dict[str, np.ndarray], grads: Dict[str, np.ndarray]):
        self.t += 1

        for key in params:
            if key not in grads or grads[key] is None:
                continue

            if key not in self.m:
                self.m[key] = np.zeros_like(params[key])
                self.v[key] = np.zeros_like(params[key])

            grad = grads[key]

            # Update moments (no weight decay in gradient)
            self.m[key] = self.beta1 * self.m[key] + (1 - self.beta1) * grad
            self.v[key] = self.beta2 * self.v[key] + (1 - self.beta2) * grad ** 2

            # Bias correction
            m_hat = self.m[key] / (1 - self.beta1 ** self.t)
            v_hat = self.v[key] / (1 - self.beta2 ** self.t)

            # Update parameters with decoupled weight decay
            params[key] = params[key] - self.lr * (
                m_hat / (np.sqrt(v_hat) + self.epsilon) + self.weight_decay * params[key]
            )

    def __repr__(self):
        return f"AdamW(lr={self.lr}, beta1={self.beta1}, beta2={self.beta2}, wd={self.weight_decay})"


class RMSprop(Optimizer):
    """
    RMSprop optimizer.
    
    Maintains a moving average of squared gradients and divides the 
    learning rate by this average.
    
    v = beta * v + (1 - beta) * grad^2
    params -= lr * grad / (sqrt(v) + eps)
    """

    def __init__(self, learning_rate: float = 0.001, beta: float = 0.99,
                 epsilon: float = 1e-8, weight_decay: float = 0.0):
        super().__init__(learning_rate)
        self.beta = beta
        self.epsilon = epsilon
        self.weight_decay = weight_decay
        self.v = {}

    def step(self, params: Dict[str, np.ndarray], grads: Dict[str, np.ndarray]):
        for key in params:
            if key not in grads or grads[key] is None:
                continue

            if key not in self.v:
                self.v[key] = np.zeros_like(params[key])

            grad = grads[key]
            if self.weight_decay > 0:
                grad = grad + self.weight_decay * params[key]

            # Update moving average of squared gradients
            self.v[key] = self.beta * self.v[key] + (1 - self.beta) * grad ** 2

            # Update parameters
            params[key] = params[key] - self.lr * grad / (np.sqrt(self.v[key]) + self.epsilon)

    def __repr__(self):
        return f"RMSprop(lr={self.lr}, beta={self.beta})"


# Aliases
SGDMomentum = SGD