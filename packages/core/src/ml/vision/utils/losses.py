"""Loss functions for vision models."""

import numpy as np


def cross_entropy_loss(predictions: np.ndarray, targets: np.ndarray) -> float:
    """Cross-entropy loss for classification.
    
    Args:
        predictions: Softmax probabilities, shape (N, C)
        targets: One-hot encoded targets, shape (N, C)
    
    Returns:
        Scalar loss value
    """
    N = predictions.shape[0]
    log_preds = -np.log(np.clip(predictions, 1e-12, 1.0))
    loss = np.sum(targets * log_preds) / N
    return loss


def cross_entropy_derivative(predictions: np.ndarray, targets: np.ndarray) -> np.ndarray:
    """Derivative of cross-entropy loss with softmax output."""
    return (predictions - targets) / predictions.shape[0]


def mse_loss(predictions: np.ndarray, targets: np.ndarray) -> float:
    """Mean Squared Error loss."""
    return np.mean((predictions - targets) ** 2)


def mse_derivative(predictions: np.ndarray, targets: np.ndarray) -> np.ndarray:
    """Derivative of MSE loss."""
    N = predictions.shape[0]
    return 2 * (predictions - targets) / N


def binary_cross_entropy(predictions: np.ndarray, targets: np.ndarray) -> float:
    """Binary cross-entropy loss."""
    N = predictions.shape[0]
    p = np.clip(predictions, 1e-12, 1 - 1e-12)
    loss = -np.sum(targets * np.log(p) + (1 - targets) * np.log(1 - p)) / N
    return loss


def binary_cross_entropy_derivative(predictions: np.ndarray, targets: np.ndarray) -> np.ndarray:
    """Derivative of binary cross-entropy loss."""
    p = np.clip(predictions, 1e-12, 1 - 1e-12)
    return (p - targets) / (p * (1 - p) * predictions.shape[0])


def dice_loss(predictions: np.ndarray, targets: np.ndarray, smooth: float = 1.0) -> float:
    """Dice loss for segmentation."""
    N = predictions.shape[0]
    pred_flat = predictions.reshape(N, -1)
    target_flat = targets.reshape(N, -1)
    intersection = np.sum(pred_flat * target_flat, axis=1)
    loss = 1 - (2 * intersection + smooth) / (np.sum(pred_flat, axis=1) + np.sum(target_flat, axis=1) + smooth)
    return np.mean(loss)


def dice_derivative(predictions: np.ndarray, targets: np.ndarray, smooth: float = 1.0) -> np.ndarray:
    """Derivative of dice loss."""
    N = predictions.shape[0]
    pred_flat = predictions.reshape(N, -1)
    target_flat = targets.reshape(N, -1)
    
    sum_pred = np.sum(pred_flat, axis=1, keepdims=True)
    sum_target = np.sum(target_flat, axis=1, keepdims=True)
    intersection = np.sum(pred_flat * target_flat, axis=1, keepdims=True)
    
    denominator = (sum_pred + sum_target + smooth) ** 2
    grad = (-2 * target_flat * (sum_pred + sum_target + smooth) + 
            2 * pred_flat * intersection + smooth * target_flat) / denominator
    
    return grad.reshape(predictions.shape) / N


def gram_matrix(features: np.ndarray) -> np.ndarray:
    """Compute Gram matrix for style transfer.
    
    Args:
        features: Shape (N, C, H, W)
    
    Returns:
        Gram matrix: Shape (N, C, C)
    """
    N, C, H, W = features.shape
    features_reshaped = features.reshape(N, C, H * W)
    gram = np.matmul(features_reshaped, features_reshaped.transpose(0, 2, 1))
    gram = gram / (C * H * W)
    return gram


def style_loss(style_features: np.ndarray, generated_features: np.ndarray) -> float:
    """Compute style loss using Gram matrices."""
    gram_style = gram_matrix(style_features)
    gram_generated = gram_matrix(generated_features)
    N, C, _ = gram_style.shape
    loss = np.sum((gram_style - gram_generated) ** 2) / (4 * N * C ** 2)
    return loss


def content_loss(content_features: np.ndarray, generated_features: np.ndarray) -> float:
    """Compute content loss."""
    N, C, H, W = content_features.shape
    loss = np.sum((content_features - generated_features) ** 2) / (2 * N * C * H * W)
    return loss


def total_variation_loss(image: np.ndarray) -> float:
    """Total variation loss for smoothness."""
    N = image.shape[0]
    diff_h = image[:, :, 1:, :] - image[:, :, :-1, :]
    diff_w = image[:, :, :, 1:] - image[:, :, :, :-1]
    loss = np.sum(diff_h ** 2) + np.sum(diff_w ** 2)
    return loss / N


def l1_loss(predictions: np.ndarray, targets: np.ndarray) -> float:
    """L1 loss (Mean Absolute Error)."""
    return np.mean(np.abs(predictions - targets))


def l1_derivative(predictions: np.ndarray, targets: np.ndarray) -> np.ndarray:
    """Derivative of L1 loss."""
    return np.sign(predictions - targets) / predictions.shape[0]


def smooth_l1_loss(predictions: np.ndarray, targets: np.ndarray, beta: float = 1.0) -> float:
    """Smooth L1 loss (Huber loss)."""
    diff = np.abs(predictions - targets)
    loss = np.where(diff < beta, 0.5 * diff ** 2 / beta, diff - 0.5 * beta)
    return np.mean(loss)


def smooth_l1_derivative(predictions: np.ndarray, targets: np.ndarray, beta: float = 1.0) -> np.ndarray:
    """Derivative of Smooth L1 loss."""
    diff = predictions - targets
    grad = np.where(np.abs(diff) < beta, diff / beta, np.sign(diff))
    return grad / predictions.shape[0]


LOSSES = {
    'cross_entropy': (cross_entropy_loss, cross_entropy_derivative),
    'mse': (mse_loss, mse_derivative),
    'binary_cross_entropy': (binary_cross_entropy, binary_cross_entropy_derivative),
    'dice': (dice_loss, dice_derivative),
    'l1': (l1_loss, l1_derivative),
    'smooth_l1': (smooth_l1_loss, smooth_l1_derivative),
}