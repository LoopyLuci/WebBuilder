"""Parameter initializers for sequence models."""

import numpy as np


def zeros(shape):
    """Initialize with zeros."""
    return np.zeros(shape, dtype=np.float64)


def ones(shape):
    """Initialize with ones."""
    return np.ones(shape, dtype=np.float64)


def random_normal(shape, scale=0.01):
    """Initialize with small random normal values."""
    return np.random.randn(*shape).astype(np.float64) * scale


def random_uniform(shape, low=-0.1, high=0.1):
    """Initialize with uniform values."""
    return np.random.uniform(low, high, shape).astype(np.float64)


def xavier_uniform(shape):
    """Xavier/Glorot uniform initialization."""
    fan_in, fan_out = shape[0], shape[1] if len(shape) > 1 else shape[0]
    limit = np.sqrt(6.0 / (fan_in + fan_out))
    return np.random.uniform(-limit, limit, shape).astype(np.float64)


def xavier_normal(shape):
    """Xavier/Glorot normal initialization."""
    fan_in, fan_out = shape[0], shape[1] if len(shape) > 1 else shape[0]
    std = np.sqrt(2.0 / (fan_in + fan_out))
    return np.random.randn(*shape).astype(np.float64) * std


def he_uniform(shape):
    """He/Kaiming uniform initialization (good for ReLU)."""
    fan_in = shape[0] if len(shape) > 1 else shape[0]
    limit = np.sqrt(6.0 / fan_in)
    return np.random.uniform(-limit, limit, shape).astype(np.float64)


def he_normal(shape):
    """He/Kaiming normal initialization (good for ReLU)."""
    fan_in = shape[0] if len(shape) > 1 else shape[0]
    std = np.sqrt(2.0 / fan_in)
    return np.random.randn(*shape).astype(np.float64) * std


def orthogonal(shape, gain=1.0):
    """Orthogonal initialization (good for recurrent weights)."""
    flat_shape = (shape[0], np.prod(shape[1:]))
    a = np.random.randn(*flat_shape)
    u, _, v = np.linalg.svd(a, full_matrices=False)
    q = u if u.shape == flat_shape else v
    q = q.reshape(shape)
    return (gain * q).astype(np.float64)


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