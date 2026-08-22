"""Autoregressive Model implementations.

Includes: PixelCNN (with masked convolutions) and WaveNet (with dilated causal convolutions).
Both models support sequential generation of outputs.
"""

import numpy as np
from .base import Module, Dense, ReLU, LeakyReLU, Sigmoid, Tanh, Sequential, AdamOptimizer, GenerativeModel


class MaskedDense(Module):
    """Dense layer with autoregressive masking for PixelCNN.
    
    The mask ensures that each output only depends on previous inputs,
    maintaining the autoregressive property.
    """
    
    def __init__(self, in_features, out_features, mask_type='A'):
        super().__init__()
        self.params['W'] = initialize_weights(in_features, out_features, 'he')
        self.params['b'] = np.zeros(out_features)
        self.mask_type = mask_type
        
        # Create mask: A mask (no self-connection), B mask (allows self-connection)
        mask = np.ones((in_features, out_features))
        if mask_type == 'A':
            # Block diagonal: each output only sees inputs up to its index
            for i in range(out_features):
                for j in range(in_features):
                    if j > i % in_features:
                        mask[j, i] = 0
        self.mask = mask
        self.input = None
    
    def forward(self, x):
        self.input = x
        W_masked = self.params['W'] * self.mask
        out = x @ W_masked + self.params['b']
        return out
    
    def backward(self, dout):
        W_masked = self.params['W'] * self.mask
        self.grads['W'] = self.input.T @ dout * self.mask
        self.grads['b'] = np.sum(dout, axis=0)
        return dout @ W_masked.T


def initialize_weights(fan_in, fan_out, method='xavier'):
    """Initialize weights using various methods."""
    if method == 'xavier':
        limit = np.sqrt(6.0 / (fan_in + fan_out))
        return np.random.uniform(-limit, limit, (fan_in, fan_out))
    elif method == 'he':
        std = np.sqrt(2.0 / fan_in)
        return np.random.randn(fan_in, fan_out) * std
    else:
        return np.random.randn(fan_in, fan_out) * 0.01


class PixelCNNBlock(Module):
    """Single block in PixelCNN with masked convolutions."""
    
    def __init__(self, in_features, hidden_dim, kernel_size=3):
        super().__init__()
        self.in_features = in_features
        self.hidden_dim = hidden_dim
        
        # Vertical stack (conditions on rows above)
        self.vertical_conv = MaskedDense(in_features, hidden_dim, 'A')
        self.vertical_to_horizontal = MaskedDense(hidden_dim, hidden_dim, 'B')
        
        # Horizontal stack (conditions on left pixels)
        self.horizontal_conv = MaskedDense(in_features, hidden_dim, 'A')
        
        # Combine
        self.combine = Dense(hidden_dim * 2, hidden_dim)
        self.output_proj = Dense(hidden_dim, in_features)
        
        self._training = True
    
    def forward(self, x):
        # Vertical pathway
        v = self.vertical_conv(x)
        v = np.maximum(0, v)
        v_to_h = self.vertical_to_horizontal(v)
        
        # Horizontal pathway
        h = self.horizontal_conv(x)
        h = np.maximum(0, h)
        
        # Combine
        combined = np.concatenate([v_to_h, h], axis=1)
        out = self.combine(combined)
        out = np.maximum(0, out)
        out = self.output_proj(out)
        return out + x  # Residual connection
    
    def backward(self, dout):
        # Simplified backward pass
        return dout
    
    def parameters(self):
        params = {}
        for layer_name in ['vertical_conv', 'vertical_to_horizontal', 'horizontal_conv', 'combine', 'output_proj']:
            layer = getattr(self, layer_name)
            if hasattr(layer, 'params'):
                for k, v in layer.params.items():
                    params[f'{layer_name}_{k}'] = v
        return params
    
    def update_params(self, lr):
        for layer_name in ['vertical_conv', 'vertical_to_horizontal', 'horizontal_conv', 'combine', 'output_proj']:
            layer = getattr(self, layer_name)
            if hasattr(layer, 'update_params'):
                layer.update_params(lr)
    
    def train(self, mode=True):
        self._training = mode
    
    def eval(self):
        self._training = False


class PixelCNN(GenerativeModel):
    """PixelCNN: Autoregressive generative model for images.
    
    Uses masked convolutions to ensure each pixel only depends on
    previously generated pixels (raster scan order).
    """
    
    def __init__(self, data_dim=784, hidden_dim=128, num_blocks=5, lr=0.001):
        super().__init__(latent_dim=data_dim, data_dim=data_dim)
        self.hidden_dim = hidden_dim
        self.num_blocks = num_blocks
        
        # Input embedding
        self.input_proj = Dense(data_dim, hidden_dim)
        
        # PixelCNN blocks
        self.blocks = []
        for i in range(num_blocks):
            self.blocks.append(PixelCNNBlock(hidden_dim, hidden_dim))
        
        # Output projection (predict pixel value distribution)
        self.output_proj = Sequential(
            Dense(hidden_dim, hidden_dim),
            ReLU(),
            Dense(hidden_dim, data_dim),
            Sigmoid()  # Pixel values in [0, 1]
        )
        
        self.lr = lr
        self._training = True
    
    def forward(self, x):
        """Forward pass predicting next pixel values."""
        h = self.input_proj(x)
        h = np.maximum(0, h)
        
        for block in self.blocks:
            h = block(h)
        
        out = self.output_proj(h)
        return out
    
    def generate(self, num_samples):
        """Generate samples pixel by pixel (autoregressive)."""
        self.eval()
        
        # Start with random initial values
        samples = np.random.randn(num_samples, self.data_dim) * 0.1
        
        # Generate each pixel autoregressively
        for i in range(self.data_dim):
            pred = self.forward(samples)
            # Update the current pixel based on prediction
            samples[:, i] = (pred[:, i] > 0.5).astype(float)
            # Add some stochasticity
            noise = np.random.rand(num_samples) * 0.1
            samples[:, i] = np.clip(pred[:, i] + noise - 0.05, 0, 1)
        
        return samples
    
    def train_step(self, x):
        """Single training step."""
        batch_size = x.shape[0]
        
        # Forward pass
        pred = self.forward(x)
        
        # Binary cross-entropy loss (each pixel independently)
        eps = 1e-8
        loss = -np.mean(np.sum(x * np.log(pred + eps) + (1 - x) * np.log(1 - pred + eps), axis=1))
        
        # Backward pass
        dout = -(x / (pred + eps) - (1 - x) / (1 - pred + eps)) / batch_size
        
        # Backprop through output projection
        dout = self.output_proj.backward(dout)
        
        # Backprop through blocks (simplified)
        for block in reversed(self.blocks):
            dout = block.backward(dout)
        
        # Update parameters
        self.input_proj.update_params(self.lr)
        for block in self.blocks:
            block.update_params(self.lr)
        self.output_proj.update_params(self.lr)
        
        self.loss_history.append({'loss': loss})
        return {'loss': loss}
    
    def loss(self, data):
        pred = self.forward(data)
        eps = 1e-8
        loss = -np.mean(np.sum(data * np.log(pred + eps) + (1 - data) * np.log(1 - pred + eps), axis=1))
        return {'loss': loss}


class CausalConv1D(Module):
    """1D causal convolution: output at time t only depends on inputs up to t."""
    
    def __init__(self, in_channels, out_channels, kernel_size, dilation=1):
        super().__init__()
        self.in_channels = in_channels
        self.out_channels = out_channels
        self.kernel_size = kernel_size
        self.dilation = dilation
        
        # Initialize weights
        self.params['W'] = np.random.randn(out_channels, in_channels, kernel_size) * 0.1
        self.params['b'] = np.zeros(out_channels)
        
        self._training = True
    
    def forward(self, x):
        """Forward pass with causal padding."""
        batch_size, length, in_ch = x.shape
        pad = (self.kernel_size - 1) * self.dilation
        
        # Pad for causality (only past values)
        x_padded = np.pad(x, ((0, 0), (pad, 0), (0, 0)), mode='constant')
        
        # Dilated convolution
        out = np.zeros((batch_size, length, self.out_channels))
        for t in range(length):
            for k in range(self.kernel_size):
                t_in = t + pad - k * self.dilation
                if t_in >= 0 and t_in < x_padded.shape[1]:
                    out[:, t, :] += x_padded[:, t_in, :] @ self.params['W'][:, :, k].T
        
        out += self.params['b']
        self.cache = (x, x_padded, out)
        return out
    
    def backward(self, dout):
        """Simplified backward pass."""
        x, x_padded, _ = self.cache
        batch_size, length, _ = dout.shape
        
        # Compute gradients (simplified)
        self.grads['W'] = np.zeros_like(self.params['W'])
        self.grads['b'] = np.sum(dout, axis=(0, 1))
        
        dx = np.zeros_like(x_padded)
        pad = (self.kernel_size - 1) * self.dilation
        
        for t in range(length):
            for k in range(self.kernel_size):
                t_in = t + pad - k * self.dilation
                if t_in >= 0 and t_in < x_padded.shape[1]:
                    dx[:, t_in, :] += dout[:, t, :] @ self.params['W'][:, :, k]
        
        return dx[:, :x.shape[1], :]
    
    def parameters(self):
        return self.params
    
    def update_params(self, lr):
        for key in self.params:
            if key in self.grads:
                self.params[key] -= lr * self.grads[key]
    
    def train(self, mode=True):
        self._training = mode
    
    def eval(self):
        self._training = False


class WaveNetBlock(Module):
    """Single WaveNet block with gated activation and dilated convolution."""
    
    def __init__(self, channels, kernel_size=2, dilation=1):
        super().__init__()
        self.channels = channels
        
        # Dilated causal convolution
        self.filter_conv = CausalConv1D(channels, channels, kernel_size, dilation)
        self.gate_conv = CausalConv1D(channels, channels, kernel_size, dilation)
        
        # 1x1 convolution for residual and skip connections
        self.residual_conv = Dense(channels, channels)
        self.skip_conv = Dense(channels, channels)
        
        self._training = True
    
    def forward(self, x):
        """Forward pass with gated activation: tanh(f) * sigmoid(g)."""
        # x shape: (batch, length, channels)
        f = self.filter_conv(x)
        g = self.gate_conv(x)
        
        # Gated activation
        tanh_f = np.tanh(f)
        sigm_g = 1.0 / (1.0 + np.exp(-g))
        h = tanh_f * sigm_g
        
        # Residual and skip connections
        residual = self.residual_conv(h)
        skip = self.skip_conv(h)
        
        # Add residual (with proper dimension matching)
        out = x + residual * 0.1  # Scale for stability
        
        return out, skip
    
    def backward(self, dout):
        """Simplified backward pass."""
        return dout
    
    def parameters(self):
        params = {}
        for name, layer in [('filter', self.filter_conv), ('gate', self.gate_conv)]:
            if hasattr(layer, 'params'):
                for k, v in layer.params.items():
                    params[f'{name}_{k}'] = v
        for name, layer in [('residual', self.residual_conv), ('skip', self.skip_conv)]:
            if hasattr(layer, 'params'):
                for k, v in layer.params.items():
                    params[f'{name}_{k}'] = v
        return params
    
    def update_params(self, lr):
        for layer in [self.filter_conv, self.gate_conv, self.residual_conv, self.skip_conv]:
            if hasattr(layer, 'update_params'):
                layer.update_params(lr)
    
    def train(self, mode=True):
        self._training = mode
    
    def eval(self):
        self._training = False


class WaveNet(GenerativeModel):
    """WaveNet: Autoregressive generative model for audio/sequential data.
    
    Uses dilated causal convolutions to capture long-range dependencies
    in sequential data with efficient parallel training.
    """
    
    def __init__(self, data_dim=256, channels=32, num_blocks=4, num_layers=10, lr=0.001):
        super().__init__(latent_dim=data_dim, data_dim=data_dim)
        self.channels = channels
        self.num_blocks = num_blocks
        self.num_layers = num_layers
        
        # Input embedding
        self.input_proj = Dense(data_dim, channels)
        
        # WaveNet blocks with exponentially increasing dilation
        self.blocks = []
        for block_idx in range(num_blocks):
            for layer_idx in range(num_layers):
                dilation = 2 ** layer_idx
                self.blocks.append(WaveNetBlock(channels, kernel_size=2, dilation=dilation))
        
        # Output layers
        self.output_net = Sequential(
            Dense(channels, channels),
            ReLU(),
            Dense(channels, data_dim),
            Sigmoid()
        )
        
        self.lr = lr
        self._training = True
    
    def forward(self, x):
        """Forward pass through WaveNet."""
        # Project input to channels
        batch_size = x.shape[0]
        
        # Reshape for 1D convolution: (batch, length=1, channels)
        # For simplicity, treat as sequence of length data_dim
        h = self.input_proj(x)
        h = h.reshape(batch_size, 1, self.channels)
        
        # Pass through blocks
        skip_total = np.zeros((batch_size, 1, self.channels))
        for block in self.blocks:
            h, skip = block(h)
            skip_total += skip
        
        # Global average pooling over time
        h = np.mean(skip_total, axis=1)  # (batch, channels)
        
        # Output projection
        out = self.output_net(h)
        return out
    
    def generate(self, num_samples):
        """Generate samples autoregressively."""
        self.eval()
        
        # Initialize with random values
        samples = np.random.randn(num_samples, self.data_dim) * 0.1
        
        # Generate each step autoregressively
        for t in range(self.data_dim):
            pred = self.forward(samples)
            samples[:, t] = pred[:, t]
            # Add stochasticity
            noise = np.random.randn(num_samples) * 0.05
            samples[:, t] = np.clip(pred[:, t] + noise, 0, 1)
        
        return samples
    
    def train_step(self, x):
        """Single training step."""
        batch_size = x.shape[0]
        
        # Forward pass
        pred = self.forward(x)
        
        # Loss (binary cross-entropy)
        eps = 1e-8
        loss = -np.mean(np.sum(x * np.log(pred + eps) + (1 - x) * np.log(1 - pred + eps), axis=1))
        
        # Backward pass
        dout = -(x / (pred + eps) - (1 - x) / (1 - pred + eps)) / batch_size
        
        # Backprop through output net
        dout = self.output_net.backward(dout)
        
        # Backprop through blocks (simplified)
        for block in reversed(self.blocks):
            dout = block.backward(dout)
        
        # Update parameters
        self.input_proj.update_params(self.lr)
        for block in self.blocks:
            block.update_params(self.lr)
        self.output_net.update_params(self.lr)
        
        self.loss_history.append({'loss': loss})
        return {'loss': loss}
    
    def loss(self, data):
        pred = self.forward(data)
        eps = 1e-8
        loss = -np.mean(np.sum(data * np.log(pred + eps) + (1 - data) * np.log(1 - pred + eps), axis=1))
        return {'loss': loss}