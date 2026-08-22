"""Weight initializers for vision models."""

import numpy as np


def zeros(shape: tuple) -> np.ndarray:
    """Initialize weights to zeros."""
    return np.zeros(shape, dtype=np.float64)


def ones(shape: tuple) -> np.ndarray:
    """Initialize weights to ones."""
    return np.ones(shape, dtype=np.float64)


def random_normal(shape: tuple, mean: float = 0.0, std: float = 0.01) -> np.ndarray:
    """Initialize weights from a normal distribution."""
    return np.random.normal(mean, std, shape).astype(np.float64)


def random_uniform(shape: tuple, low: float = -0.05, high: float = 0.05) -> np.ndarray:
    """Initialize weights from a uniform distribution."""
    return np.random.uniform(low, high, shape).astype(np.float64)


def xavier_uniform(shape: tuple) -> np.ndarray:
    """Xavier/Glorot uniform initialization."""
    fan_in, fan_out = shape[0], shape[1] if len(shape) >= 2 else (shape[0], 1)
    limit = np.sqrt(6 / (fan_in + fan_out))
    return np.random.uniform(-limit, limit, shape).astype(np.float64)


def xavier_normal(shape: tuple) -> np.ndarray:
    """Xavier/Glorot normal initialization."""
    fan_in, fan_out = shape[0], shape[1] if len(shape) >= 2 else (shape[0], 1)
    std = np.sqrt(2 / (fan_in + fan_out))
    return np.random.normal(0, std, shape).astype(np.float64)


def he_uniform(shape: tuple) -> np.ndarray:
    """He/Kaiming uniform initialization (good for ReLU)."""
    fan_in = shape[0] if len(shape) >= 2 else shape[0]
    limit = np.sqrt(6 / fan_in)
    return np.random.uniform(-limit, limit, shape).astype(np.float64)


def he_normal(shape: tuple) -> np.ndarray:
    """He/Kaiming normal initialization (good for ReLU)."""
    fan_in = shape[0] if len(shape) >= 2 else shape[0]
    std = np.sqrt(2 / fan_in)
    return np.random.normal(0, std, shape).astype(np.float64)


def orthogonal(shape: tuple, gain: float = 1.0) -> np.ndarray:
    """Orthogonal initialization."""
    flat_shape = (shape[0], np.prod(shape[1:])) if len(shape) >= 2 else shape
    a = np.random.normal(0, 1, flat_shape)
    u, _, v = np.linalg.svd(a, full_matrices=False)
    q = u if u.shape == flat_shape else v
    q = q.reshape(shape)
    return gain * q.astype(np.float64)


INITIALIZERS = {
    'zeros': zeros,
    'ones': ones,
    'random_normal': random_normal,
    'random_uniform': random_uniform,
    'xavier_uniform': xavier_uniform,
    'xavier_normal': xavier_normal,
    'he_uniform': he_uniform,
    'he_normal': he_normal,
    'orthogonal': orthogonal,
}