"""Activation functions for vision models."""

import numpy as np


def relu(x: np.ndarray) -> np.ndarray:
    """ReLU activation: max(0, x)."""
    return np.maximum(0, x)


def relu_derivative(x: np.ndarray) -> np.ndarray:
    """Derivative of ReLU."""
    return (x > 0).astype(np.float64)


def leaky_relu(x: np.ndarray, alpha: float = 0.01) -> np.ndarray:
    """Leaky ReLU activation."""
    return np.where(x > 0, x, alpha * x)


def leaky_relu_derivative(x: np.ndarray, alpha: float = 0.01) -> np.ndarray:
    """Derivative of Leaky ReLU."""
    return np.where(x > 0, 1, alpha)


def sigmoid(x: np.ndarray) -> np.ndarray:
    """Sigmoid activation: 1 / (1 + exp(-x))."""
    x_clipped = np.clip(x, -500, 500)
    return 1 / (1 + np.exp(-x_clipped))


def sigmoid_derivative(x: np.ndarray) -> np.ndarray:
    """Derivative of sigmoid."""
    s = sigmoid(x)
    return s * (1 - s)


def tanh(x: np.ndarray) -> np.ndarray:
    """Hyperbolic tangent activation."""
    return np.tanh(x)


def tanh_derivative(x: np.ndarray) -> np.ndarray:
    """Derivative of tanh."""
    return 1 - np.tanh(x) ** 2


def softmax(x: np.ndarray, axis: int = -1) -> np.ndarray:
    """Softmax activation with numerical stability."""
    e_x = np.exp(x - np.max(x, axis=axis, keepdims=True))
    return e_x / np.sum(e_x, axis=axis, keepdims=True)


def softmax_derivative_from_output(output: np.ndarray) -> np.ndarray:
    """Derivative of softmax given the output (Jacobian diagonal approximation)."""
    return output * (1 - output)


def gelu(x: np.ndarray) -> np.ndarray:
    """GELU activation used in Transformers."""
    return 0.5 * x * (1 + np.tanh(np.sqrt(2 / np.pi) * (x + 0.044715 * x ** 3)))


def gelu_derivative(x: np.ndarray) -> np.ndarray:
    """Derivative of GELU."""
    c = np.sqrt(2 / np.pi)
    inner = c * (x + 0.044715 * x ** 3)
    tanh_inner = np.tanh(inner)
    sech2 = 1 - tanh_inner ** 2
    return 0.5 * (1 + tanh_inner) + 0.5 * x * sech2 * c * (1 + 3 * 0.044715 * x ** 2)


def swish(x: np.ndarray) -> np.ndarray:
    """Swish activation: x * sigmoid(x)."""
    return x * sigmoid(x)


def elu(x: np.ndarray, alpha: float = 1.0) -> np.ndarray:
    """Exponential Linear Unit."""
    return np.where(x > 0, x, alpha * (np.exp(x) - 1))


ACTIVATIONS = {
    'relu': (relu, relu_derivative),
    'leaky_relu': (leaky_relu, leaky_relu_derivative),
    'sigmoid': (sigmoid, sigmoid_derivative),
    'tanh': (tanh, tanh_derivative),
    'softmax': (softmax, softmax_derivative_from_output),
    'gelu': (gelu, gelu_derivative),
    'swish': (swish, None),
    'elu': (elu, None),
}