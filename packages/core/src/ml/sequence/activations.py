"""Activation functions and their derivatives for sequence models."""

import numpy as np


def sigmoid(x):
    """Numerically stable sigmoid function."""
    x = np.clip(x, -500, 500)
    return 1.0 / (1.0 + np.exp(-x))


def sigmoid_derivative(x):
    """Derivative of sigmoid given the output of sigmoid."""
    s = sigmoid(x)
    return s * (1.0 - s)


def tanh(x):
    """Hyperbolic tangent."""
    return np.tanh(x)


def tanh_derivative(x):
    """Derivative of tanh given the output of tanh."""
    t = np.tanh(x)
    return 1.0 - t ** 2


def relu(x):
    """Rectified Linear Unit."""
    return np.maximum(0, x)


def relu_derivative(x):
    """Derivative of ReLU."""
    return (x > 0).astype(float)


def gelu(x):
    """Gaussian Error Linear Unit (used in BERT/GPT)."""
    return 0.5 * x * (1.0 + np.tanh(np.sqrt(2.0 / np.pi) * (x + 0.044715 * x ** 3)))


def gelu_derivative(x):
    """Derivative of GELU (approximation)."""
    c = np.sqrt(2.0 / np.pi)
    inner = c * (x + 0.044715 * x ** 3)
    tanh_inner = np.tanh(inner)
    sech2 = 1.0 - tanh_inner ** 2
    return 0.5 * (1.0 + tanh_inner) + 0.5 * x * sech2 * c * (1.0 + 3.0 * 0.044715 * x ** 2)


def softmax(x, axis=-1):
    """Numerically stable softmax."""
    exp_x = np.exp(x - np.max(x, axis=axis, keepdims=True))
    return exp_x / np.sum(exp_x, axis=axis, keepdims=True)


def log_softmax(x, axis=-1):
    """Numerically stable log-softmax."""
    max_x = np.max(x, axis=axis, keepdims=True)
    return x - max_x - np.log(np.sum(np.exp(x - max_x), axis=axis, keepdims=True))


ACTIVATIONS = {
    'sigmoid': (sigmoid, sigmoid_derivative),
    'tanh': (tanh, tanh_derivative),
    'relu': (relu, relu_derivative),
    'gelu': (gelu, gelu_derivative),
}