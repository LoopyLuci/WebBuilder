"""Optimizers for vision models."""

import numpy as np
from typing import List


class Optimizer:
    """Base optimizer class."""

    def __init__(self, lr: float = 0.01):
        self.lr = lr

    def step(self, params: dict, grads: dict):
        raise NotImplementedError

    def zero_grad(self, grads: dict):
        for key in grads:
            grads[key].fill(0)


class SGD(Optimizer):
    """Stochastic Gradient Descent with optional momentum."""

    def __init__(self, lr: float = 0.01, momentum: float = 0.9, weight_decay: float = 0.0):
        super().__init__(lr)
        self.momentum = momentum
        self.weight_decay = weight_decay
        self.velocities = {}

    def step(self, params: dict, grads: dict):
        for key in params:
            if key not in grads:
                continue
            if key not in self.velocities:
                self.velocities[key] = np.zeros_like(params[key])

            grad = grads[key] + self.weight_decay * params[key]
            self.velocities[key] = self.momentum * self.velocities[key] - self.lr * grad
            params[key] += self.velocities[key]


class Adam(Optimizer):
    """Adam optimizer."""

    def __init__(self, lr: float = 0.001, beta1: float = 0.9, beta2: float = 0.999,
                 eps: float = 1e-8, weight_decay: float = 0.0):
        super().__init__(lr)
        self.beta1 = beta1
        self.beta2 = beta2
        self.eps = eps
        self.weight_decay = weight_decay
        self.m = {}
        self.v = {}
        self.t = 0

    def step(self, params: dict, grads: dict):
        self.t += 1
        for key in params:
            if key not in grads:
                continue
            if key not in self.m:
                self.m[key] = np.zeros_like(params[key])
                self.v[key] = np.zeros_like(params[key])

            grad = grads[key] + self.weight_decay * params[key]
            self.m[key] = self.beta1 * self.m[key] + (1 - self.beta1) * grad
            self.v[key] = self.beta2 * self.v[key] + (1 - self.beta2) * grad ** 2

            m_hat = self.m[key] / (1 - self.beta1 ** self.t)
            v_hat = self.v[key] / (1 - self.beta2 ** self.t)
            params[key] -= self.lr * m_hat / (np.sqrt(v_hat) + self.eps)


class RMSprop(Optimizer):
    """RMSprop optimizer."""

    def __init__(self, lr: float = 0.001, rho: float = 0.9, eps: float = 1e-8):
        super().__init__(lr)
        self.rho = rho
        self.eps = eps
        self.cache = {}

    def step(self, params: dict, grads: dict):
        for key in params:
            if key not in grads:
                continue
            if key not in self.cache:
                self.cache[key] = np.zeros_like(params[key])

            self.cache[key] = self.rho * self.cache[key] + (1 - self.rho) * grads[key] ** 2
            params[key] -= self.lr * grads[key] / (np.sqrt(self.cache[key]) + self.eps)


class AdaGrad(Optimizer):
    """AdaGrad optimizer."""

    def __init__(self, lr: float = 0.01, eps: float = 1e-8):
        super().__init__(lr)
        self.eps = eps
        self.cache = {}

    def step(self, params: dict, grads: dict):
        for key in params:
            if key not in grads:
                continue
            if key not in self.cache:
                self.cache[key] = np.zeros_like(params[key])

            self.cache[key] += grads[key] ** 2
            params[key] -= self.lr * grads[key] / (np.sqrt(self.cache[key]) + self.eps)


OPTIMIZERS = {
    'sgd': SGD,
    'adam': Adam,
    'rmsprop': RMSprop,
    'adagrad': AdaGrad,
}