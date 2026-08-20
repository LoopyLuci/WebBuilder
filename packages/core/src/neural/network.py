"""
Neural Network module - High-level API for building and training networks.
"""

import numpy as np
from typing import List, Tuple, Optional, Callable
from .layers.base import Layer, Module
from .losses import Loss
from .optimizers import Optimizer


class NeuralNetwork:
    """
    Neural Network class that orchestrates the training loop.
    
    Combines layers, loss function, and optimizer into a single trainable model.
    """

    def __init__(self, layers: Optional[List[Layer]] = None, 
                 loss: Optional[Loss] = None,
                 optimizer: Optional[Optimizer] = None):
        self._layers = layers or []
        self.loss_fn = loss
        self.optimizer = optimizer

    def add(self, layer: Layer):
        """Add a layer to the network."""
        self._layers.append(layer)
        return self

    def forward(self, x: np.ndarray) -> np.ndarray:
        """Forward pass through all layers."""
        for layer in self._layers:
            x = layer.forward(x)
        return x

    def backward(self, dout: np.ndarray) -> np.ndarray:
        """Backward pass through all layers."""
        for layer in reversed(self._layers):
            dout = layer.backward(dout)
        return dout

    def _collect_params_and_grads(self) -> Tuple[dict, dict]:
        """Collect all parameters and gradients from layers."""
        params = {}
        grads = {}
        for i, layer in enumerate(self._layers):
            for name, param in layer.params.items():
                key = f'layer_{i}_{name}'
                params[key] = param
                grads[key] = layer.grads.get(name)
        return params, grads

    def _zero_grad(self):
        """Reset all gradients."""
        for layer in self._layers:
            layer.zero_grad()

    def train(self, mode: bool = True):
        """Set training mode."""
        for layer in self._layers:
            layer.train(mode)
        return self

    def eval(self):
        """Set evaluation mode."""
        return self.train(False)

    def fit(self, X: np.ndarray, y: np.ndarray, 
            epochs: int = 10, batch_size: int = 32,
            validation_data: Optional[Tuple[np.ndarray, np.ndarray]] = None,
            verbose: int = 1) -> dict:
        """
        Train the network on the given data.
        
        Args:
            X: Training features
            y: Training labels
            epochs: Number of training epochs
            batch_size: Size of each mini-batch
            validation_data: Optional tuple of (X_val, y_val) for validation
            verbose: Verbosity level (0 = silent, 1 = progress)
            
        Returns:
            Dictionary containing training history
        """
        if self.loss_fn is None:
            raise ValueError("Loss function not set. Pass loss= to constructor.")
        if self.optimizer is None:
            raise ValueError("Optimizer not set. Pass optimizer= to constructor.")

        history = {'loss': [], 'val_loss': [], 'val_acc': []}
        n_samples = X.shape[0]
        n_batches = max(1, n_samples // batch_size)

        for epoch in range(epochs):
            # Shuffle data
            indices = np.random.permutation(n_samples)
            X_shuffled = X[indices]
            y_shuffled = y[indices]

            epoch_loss = 0.0
            self.train()

            for batch_idx in range(n_batches):
                start = batch_idx * batch_size
                end = min(start + batch_size, n_samples)

                X_batch = X_shuffled[start:end]
                y_batch = y_shuffled[start:end]

                # Forward pass
                self._zero_grad()
                y_pred = self.forward(X_batch)
                loss = self.loss_fn(y_pred, y_batch)

                # Backward pass
                dout = self.loss_fn.backward()
                self.backward(dout)

                # Update weights
                params, grads = self._collect_params_and_grads()
                self.optimizer.step(params, grads)

                epoch_loss += loss

            epoch_loss /= n_batches
            history['loss'].append(epoch_loss)

            # Validation
            if validation_data is not None:
                X_val, y_val = validation_data
                val_pred = self.predict(X_val)
                val_loss = self.loss_fn.forward(val_pred, y_val)
                history['val_loss'].append(val_loss)

                accuracy = self.compute_accuracy(val_pred, y_val)
                history['val_acc'].append(accuracy)

                if verbose >= 1:
                    print(f"Epoch {epoch+1}/{epochs} - loss: {epoch_loss:.4f} - "
                          f"val_loss: {val_loss:.4f} - val_acc: {accuracy:.4f}")
            elif verbose >= 1:
                print(f"Epoch {epoch+1}/{epochs} - loss: {epoch_loss:.4f}")

        return history

    def predict(self, X: np.ndarray) -> np.ndarray:
        """Make predictions."""
        self.eval()
        return self.forward(X)

    def compute_accuracy(self, y_pred: np.ndarray, y_true: np.ndarray) -> float:
        """Compute classification accuracy."""
        if y_true.ndim == 1:
            pred_classes = np.argmax(y_pred, axis=1)
            true_classes = y_true.astype(int)
        else:
            pred_classes = np.argmax(y_pred, axis=1)
            true_classes = np.argmax(y_true, axis=1)
        return np.mean(pred_classes == true_classes)

    @property
    def layers(self):
        return self._layers

    def summary(self):
        """Print a summary of the network architecture."""
        print("=" * 60)
        print("Neural Network Summary")
        print("=" * 60)
        print(f"{'Layer':<30} {'Output Shape':<20} {'Params'}")
        print("-" * 60)
        
        total_params = 0
        for i, layer in enumerate(self._layers):
            n_params = sum(p.size for p in layer.params.values()) if layer.params else 0
            total_params += n_params
            print(f"{f'({i}) {layer.__class__.__name__}':<30} {'-':<20} {n_params}")
        
        print("-" * 60)
        print(f"Total parameters: {total_params}")
        print(f"Loss: {self.loss_fn}")
        print(f"Optimizer: {self.optimizer}")
        print("=" * 60)


# Convenience class for sequential models
class Sequential(NeuralNetwork):
    """Sequential neural network (same as NeuralNetwork, explicit naming)."""
    pass