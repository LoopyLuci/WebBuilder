"""
Loss function implementations.
"""

import numpy as np
from abc import ABC, abstractmethod


class Loss(ABC):
    """Base class for loss functions."""

    def __init__(self):
        self._cache = {}

    @abstractmethod
    def forward(self, y_pred: np.ndarray, y_true: np.ndarray) -> float:
        """Compute the loss value."""
        pass

    @abstractmethod
    def backward(self) -> np.ndarray:
        """Compute the gradient of the loss with respect to predictions."""
        pass

    def __call__(self, y_pred: np.ndarray, y_true: np.ndarray) -> float:
        return self.forward(y_pred, y_true)


class MSE(Loss):
    """
    Mean Squared Error Loss.
    
    L = (1/n) * sum((y_pred - y_true)^2)
    """

    def forward(self, y_pred: np.ndarray, y_true: np.ndarray) -> float:
        self._cache['y_pred'] = y_pred
        self._cache['y_true'] = y_true
        return np.mean((y_pred - y_true) ** 2)

    def backward(self) -> np.ndarray:
        y_pred = self._cache['y_pred']
        y_true = self._cache['y_true']
        n = y_pred.size
        return 2 * (y_pred - y_true) / n

    def __repr__(self):
        return "MSE()"


class CrossEntropy(Loss):
    """
    Cross Entropy Loss for multi-class classification.
    
    Expects y_pred to be probabilities (after softmax) and y_true to be 
    one-hot encoded or class indices.
    """

    def __init__(self, epsilon: float = 1e-15):
        super().__init__()
        self.epsilon = epsilon

    def forward(self, y_pred: np.ndarray, y_true: np.ndarray) -> float:
        # Clip predictions to avoid log(0)
        y_pred_clipped = np.clip(y_pred, self.epsilon, 1 - self.epsilon)
        self._cache['y_pred'] = y_pred_clipped
        self._cache['y_true'] = y_true

        if y_true.ndim == 1:
            # Class indices
            batch_size = y_pred.shape[0]
            correct_probs = y_pred_clipped[np.arange(batch_size), y_true.astype(int)]
            loss = -np.mean(np.log(correct_probs))
        else:
            # One-hot encoded
            loss = -np.mean(np.sum(y_true * np.log(y_pred_clipped), axis=-1))

        return loss

    def backward(self) -> np.ndarray:
        y_pred = self._cache['y_pred']
        y_true = self._cache['y_true']

        if y_true.ndim == 1:
            # Class indices
            batch_size = y_pred.shape[0]
            y_true_onehot = np.zeros_like(y_pred)
            y_true_onehot[np.arange(batch_size), y_true.astype(int)] = 1
            return (y_pred - y_true_onehot) / batch_size
        else:
            return (y_pred - y_true) / y_pred.shape[0]

    def __repr__(self):
        return "CrossEntropy()"


class BCE(Loss):
    """
    Binary Cross Entropy Loss.
    
    L = -(1/n) * sum(y_true * log(y_pred) + (1-y_true) * log(1-y_pred))
    """

    def __init__(self, epsilon: float = 1e-15):
        super().__init__()
        self.epsilon = epsilon

    def forward(self, y_pred: np.ndarray, y_true: np.ndarray) -> float:
        y_pred_clipped = np.clip(y_pred, self.epsilon, 1 - self.epsilon)
        self._cache['y_pred'] = y_pred_clipped
        self._cache['y_true'] = y_true

        loss = -np.mean(
            y_true * np.log(y_pred_clipped) + (1 - y_true) * np.log(1 - y_pred_clipped)
        )
        return loss

    def backward(self) -> np.ndarray:
        y_pred = self._cache['y_pred']
        y_true = self._cache['y_true']
        n = y_true.size
        return -(y_true / y_pred - (1 - y_true) / (1 - y_pred)) / n

    def __repr__(self):
        return "BCE()"


class Huber(Loss):
    """
    Huber Loss (Smooth L1 Loss).
    
    Combines MSE for small errors and MAE for large errors.
    
    L = 0.5 * (y_pred - y_true)^2           if |y_pred - y_true| <= delta
        delta * |y_pred - y_true| - 0.5 * delta^2   otherwise
    """

    def __init__(self, delta: float = 1.0):
        super().__init__()
        self.delta = delta

    def forward(self, y_pred: np.ndarray, y_true: np.ndarray) -> float:
        diff = y_pred - y_true
        abs_diff = np.abs(diff)
        self._cache['diff'] = diff
        self._cache['abs_diff'] = abs_diff

        loss = np.where(
            abs_diff <= self.delta,
            0.5 * diff ** 2,
            self.delta * abs_diff - 0.5 * self.delta ** 2
        )
        return np.mean(loss)

    def backward(self) -> np.ndarray:
        diff = self._cache['diff']
        abs_diff = self._cache['abs_diff']

        grad = np.where(
            abs_diff <= self.delta,
            diff,
            self.delta * np.sign(diff)
        )
        return grad / diff.size

    def __repr__(self):
        return f"Huber(delta={self.delta})"


# Aliases
BinaryCrossEntropy = BCE
MeanSquaredError = MSE
SmoothL1 = Huber