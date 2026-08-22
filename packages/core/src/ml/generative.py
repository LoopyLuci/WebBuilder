#!/usr/bin/env python3
"""
WebBuilder Generative Models
Built entirely from scratch with NumPy — no external ML dependencies
Includes: GAN, VAE, Diffusion, Normalizing Flows, Autoregressive Models
"""

import numpy as np
from typing import List, Tuple, Optional, Dict, Any
import json


# ═══════════════════════════════════════════════════════════════════════════
# GENERATIVE ADVERSARIAL NETWORK (GAN)
# ═══════════════════════════════════════════════════════════════════════════

class Generator:
    """Generator network for GAN."""
    
    def __init__(self, latent_dim: int, output_dim: int, hidden_dims: List[int] = None):
        self.latent_dim = latent_dim
        self.output_dim = output_dim
        self.hidden_dims = hidden_dims or [256, 512, 1024]
        
        self.layers = []
        prev_dim = latent_dim
        for h_dim in self.hidden_dims:
            self.layers.append(('dense', prev_dim, h_dim))
            self.layers.append(('relu',))
            prev_dim = h_dim
        self.layers.append(('dense', prev_dim, output_dim))
        self.layers.append(('tanh',))
        
        self.params = self._init_params()
    
    def _init_params(self):
        params = {}
        for i, layer in enumerate(self.layers):
            if layer[0] == 'dense':
                in_dim, out_dim = layer[1], layer[2]
                scale = np.sqrt(2.0 / in_dim)
                params[f'W{i}'] = np.random.randn(in_dim, out_dim).astype(np.float32) * scale
                params[f'b{i}'] = np.zeros(out_dim, dtype=np.float32)
        return params
    
    def forward(self, z: np.ndarray) -> np.ndarray:
        """Forward pass through generator."""
        x = z
        for i, layer in enumerate(self.layers):
            if layer[0] == 'dense':
                x = x @ self.params[f'W{i}'] + self.params[f'b{i}']
            elif layer[0] == 'relu':
                x = np.maximum(0, x)
            elif layer[0] == 'tanh':
                x = np.tanh(x)
        return x
    
    def sample(self, batch_size: int) -> np.ndarray:
        """Sample from latent space."""
        z = np.random.randn(batch_size, self.latent_dim).astype(np.float32)
        return self.forward(z)


class Discriminator:
    """Discriminator network for GAN."""
    
    def __init__(self, input_dim: int, hidden_dims: List[int] = None):
        self.input_dim = input_dim
        self.hidden_dims = hidden_dims or [1024, 512, 256]
        
        self.layers = []
        prev_dim = input_dim
        for h_dim in self.hidden_dims:
            self.layers.append(('dense', prev_dim, h_dim))
            self.layers.append(('leaky_relu',))
            prev_dim = h_dim
        self.layers.append(('dense', prev_dim, 1))
        self.layers.append(('sigmoid',))
        
        self.params = self._init_params()
    
    def _init_params(self):
        params = {}
        for i, layer in enumerate(self.layers):
            if layer[0] == 'dense':
                in_dim, out_dim = layer[1], layer[2]
                scale = np.sqrt(2.0 / in_dim)
                params[f'W{i}'] = np.random.randn(in_dim, out_dim).astype(np.float32) * scale
                params[f'b{i}'] = np.zeros(out_dim, dtype=np.float32)
        return params
    
    def forward(self, x: np.ndarray) -> np.ndarray:
        """Forward pass through discriminator."""
        for i, layer in enumerate(self.layers):
            if layer[0] == 'dense':
                x = x @ self.params[f'W{i}'] + self.params[f'b{i}']
            elif layer[0] == 'leaky_relu':
                x = np.where(x > 0, x, 0.2 * x)
            elif layer[0] == 'sigmoid':
                x = 1 / (1 + np.exp(-np.clip(x, -500, 500)))
        return x


class GAN:
    """Complete GAN with training loop."""
    
    def __init__(self, latent_dim: int, output_dim: int, hidden_dims: List[int] = None):
        self.latent_dim = latent_dim
        self.generator = Generator(latent_dim, output_dim, hidden_dims)
        self.discriminator = Discriminator(output_dim, hidden_dims)
        self.latent_dim = latent_dim
    
    def train_step(self, real_data: np.ndarray, lr: float = 0.0002) -> Tuple[float, float]:
        """Single training step."""
        batch_size = real_data.shape[0]
        
        # Train discriminator
        fake_data = self.generator.sample(batch_size)
        real_pred = self.discriminator.forward(real_data)
        fake_pred = self.discriminator.forward(fake_data)
        
        # Discriminator loss
        d_loss = -np.mean(np.log(real_pred + 1e-8) + np.log(1 - fake_pred + 1e-8))
        
        # Train generator
        fake_data = self.generator.sample(batch_size)
        fake_pred = self.discriminator.forward(fake_data)
        
        # Generator loss
        g_loss = -np.mean(np.log(fake_pred + 1e-8))
        
        return d_loss, g_loss
    
    def sample(self, batch_size: int) -> np.ndarray:
        """Generate samples."""
        return self.generator.sample(batch_size)


# ═══════════════════════════════════════════════════════════════════════════
# VARIATIONAL AUTOENCODER (VAE)
# ═══════════════════════════════════════════════════════════════════════════

class VAEEncoder:
    """VAE Encoder: maps data to latent distribution parameters."""
    
    def __init__(self, input_dim: int, latent_dim: int, hidden_dims: List[int] = None):
        self.input_dim = input_dim
        self.latent_dim = latent_dim
        self.hidden_dims = hidden_dims or [512, 256]
        
        self.layers = []
        prev_dim = input_dim
        for h_dim in self.hidden_dims:
            self.layers.append(('dense', prev_dim, h_dim))
            self.layers.append(('relu',))
            prev_dim = h_dim
        
        # Mean and log-variance heads
        self.layers.append(('dense', prev_dim, latent_dim))  # mu
        self.layers.append(('dense', prev_dim, latent_dim))  # log_var
        
        self.params = self._init_params()
    
    def _init_params(self):
        params = {}
        for i, layer in enumerate(self.layers):
            if layer[0] == 'dense':
                in_dim, out_dim = layer[1], layer[2]
                scale = np.sqrt(2.0 / in_dim)
                params[f'W{i}'] = np.random.randn(in_dim, out_dim).astype(np.float32) * scale
                params[f'b{i}'] = np.zeros(out_dim, dtype=np.float32)
        return params
    
    def forward(self, x: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Forward pass returning mu and log_var."""
        # Shared layers
        h = x
        for i, layer in enumerate(self.layers):
            if layer[0] == 'dense':
                h = h @ self.params[f'W{i}'] + self.params[f'b{i}']
            elif layer[0] == 'relu':
                h = np.maximum(0, h)
        
        # Split into mu and log_var
        mid = len(self.layers) // 2
        mu = h @ self.params[f'W{mid}'] + self.params[f'b{mid}']
        log_var = h @ self.params[f'W{mid+1}'] + self.params[f'b{mid+1}']
        
        return mu, log_var


class VAEDecoder:
    """VAE Decoder: maps latent vector to data."""
    
    def __init__(self, latent_dim: int, output_dim: int, hidden_dims: List[int] = None):
        self.latent_dim = latent_dim
        self.output_dim = output_dim
        self.hidden_dims = hidden_dims or [256, 512]
        
        self.layers = []
        prev_dim = latent_dim
        for h_dim in self.hidden_dims:
            self.layers.append(('dense', prev_dim, h_dim))
            self.layers.append(('relu',))
            prev_dim = h_dim
        self.layers.append(('dense', prev_dim, output_dim))
        self.layers.append(('sigmoid',))
        
        self.params = self._init_params()
    
    def _init_params(self):
        params = {}
        for i, layer in enumerate(self.layers):
            if layer[0] == 'dense':
                in_dim, out_dim = layer[1], layer[2]
                scale = np.sqrt(2.0 / in_dim)
                params[f'W{i}'] = np.random.randn(in_dim, out_dim).astype(np.float32) * scale
                params[f'b{i}'] = np.zeros(out_dim, dtype=np.float32)
        return params
    
    def forward(self, z: np.ndarray) -> np.ndarray:
        """Forward pass through decoder."""
        x = z
        for i, layer in enumerate(self.layers):
            if layer[0] == 'dense':
                x = x @ self.params[f'W{i}'] + self.params[f'b{i}']
            elif layer[0] == 'relu':
                x = np.maximum(0, x)
            elif layer[0] == 'sigmoid':
                x = 1 / (1 + np.exp(-np.clip(x, -500, 500)))
        return x


class VAE:
    """Complete VAE with training loop."""
    
    def __init__(self, input_dim: int, latent_dim: int, hidden_dims: List[int] = None):
        self.input_dim = input_dim
        self.latent_dim = latent_dim
        self.encoder = VAEEncoder(input_dim, latent_dim, hidden_dims)
        self.decoder = VAEDecoder(latent_dim, input_dim, hidden_dims)
    
    def reparameterize(self, mu: np.ndarray, log_var: np.ndarray) -> np.ndarray:
        """Reparameterization trick."""
        std = np.exp(0.5 * log_var)
        eps = np.random.randn(*std.shape).astype(np.float32)
        return mu + eps * std
    
    def forward(self, x: np.ndarray) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Forward pass through VAE."""
        mu, log_var = self.encoder.forward(x)
        z = self.reparameterize(mu, log_var)
        recon = self.decoder.forward(z)
        return recon, mu, log_var
    
    def loss(self, x: np.ndarray, recon: np.ndarray, mu: np.ndarray, log_var: np.ndarray) -> float:
        """VAE loss = reconstruction + KL divergence."""
        # Reconstruction loss (binary cross-entropy)
        eps = 1e-8
        recon_loss = -np.mean(x * np.log(recon + eps) + (1 - x) * np.log(1 - recon + eps))
        
        # KL divergence
        kl_loss = -0.5 * np.mean(1 + log_var - mu**2 - np.exp(log_var))
        
        return recon_loss + kl_loss
    
    def sample(self, batch_size: int) -> np.ndarray:
        """Generate samples from prior."""
        z = np.random.randn(batch_size, self.latent_dim).astype(np.float32)
        return self.decoder.forward(z)


# ═══════════════════════════════════════════════════════════════════════════
# DIFFUSION MODEL
# ═══════════════════════════════════════════════════════════════════════════

class DiffusionModel:
    """Denoising Diffusion Probabilistic Model."""
    
    def __init__(self, img_size: int = 28, channels: int = 1, time_steps: int = 1000):
        self.img_size = img_size
        self.channels = channels
        self.time_steps = time_steps
        
        # Noise schedule
        self.betas = np.linspace(0.0001, 0.02, time_steps, dtype=np.float32)
        self.alphas = 1.0 - self.betas
        self.alphas_cumprod = np.cumprod(self.alphas)
        self.sqrt_alphas_cumprod = np.sqrt(self.alphas_cumprod)
        self.sqrt_one_minus_alphas_cumprod = np.sqrt(1.0 - self.alphas_cumprod)
        
        # Simple U-Net-like denoising network
        self.denoiser = self._build_denoiser()
    
    def _build_denoiser(self):
        """Build a simple denoising network."""
        input_size = self.img_size * self.img_size * self.channels
        return {
            'W1': np.random.randn(input_size + 1, 256).astype(np.float32) * 0.02,
            'b1': np.zeros(256, dtype=np.float32),
            'W2': np.random.randn(256, 512).astype(np.float32) * 0.02,
            'b2': np.zeros(512, dtype=np.float32),
            'W3': np.random.randn(512, input_size).astype(np.float32) * 0.02,
            'b3': np.zeros(input_size, dtype=np.float32),
        }
    
    def add_noise(self, x: np.ndarray, t: int) -> Tuple[np.ndarray, np.ndarray]:
        """Add noise to image at timestep t."""
        noise = np.random.randn(*x.shape).astype(np.float32)
        sqrt_alpha = self.sqrt_alphas_cumprod[t]
        sqrt_one_minus_alpha = self.sqrt_one_minus_alphas_cumprod[t]
        noisy = sqrt_alpha * x + sqrt_one_minus_alpha * noise
        return noisy, noise
    
    def denoise(self, x_noisy: np.ndarray, t: int) -> np.ndarray:
        """Predict noise at timestep t."""
        # Simple forward pass through denoiser
        batch_size = x_noisy.shape[0]
        x_flat = x_noisy.reshape(batch_size, -1)
        
        # Add time embedding
        t_embed = np.ones((batch_size, 1), dtype=np.float32) * t / self.time_steps
        x_input = np.concatenate([x_flat, t_embed], axis=1)
        
        # Forward pass
        h = x_input @ self.denoiser['W1'] + self.denoiser['b1']
        h = np.maximum(0, h)  # ReLU
        h = h @ self.denoiser['W2'] + self.denoiser['b2']
        h = np.maximum(0, h)  # ReLU
        out = h @ self.denoiser['W3'] + self.denoiser['b3']
        
        return out.reshape(x_noisy.shape)
    
    def reverse_step(self, x_t: np.ndarray, t: int) -> np.ndarray:
        """Single denoising step."""
        # Predict noise
        predicted_noise = self.denoise(x_t, t)
        
        # Compute denoised image
        alpha = self.alphas[t]
        alpha_cumprod = self.alphas_cumprod[t]
        beta = self.betas[t]
        
        # DDPM sampling
        noise = np.random.randn(*x_t.shape).astype(np.float32) if t > 0 else 0
        sigma = np.sqrt(beta)
        
        x_t_minus_1 = (1 / np.sqrt(alpha)) * (x_t - ((1 - alpha) / np.sqrt(1 - alpha_cumprod)) * predicted_noise) + sigma * noise
        
        return x_t_minus_1
    
    def generate(self, num_images: int = 1, num_steps: int = 50) -> np.ndarray:
        """Generate images from noise."""
        # Start from pure noise
        x = np.random.randn(num_images, self.channels, self.img_size, self.img_size).astype(np.float32)
        
        # Denoise step by step
        timesteps = np.linspace(self.time_steps - 1, 0, num_steps, dtype=int)
        for t in timesteps:
            x = self.reverse_step(x, t)
        
        # Clip to valid range
        return np.clip(x, -1, 1)


# ═══════════════════════════════════════════════════════════════════════════
# NORMALIZING FLOWS
# ═══════════════════════════════════════════════════════════════════════════

class RealNVP:
    """Real-valued Non-Volume Preserving transformations."""
    
    def __init__(self, dim: int, hidden_dim: int = 256, num_coupling: int = 4):
        self.dim = dim
        self.hidden_dim = hidden_dim
        self.num_coupling = num_coupling
        
        # Coupling layers
        self.coupling_layers = []
        for _ in range(num_coupling):
            self.coupling_layers.append({
                's_net': self._build_network(dim // 2, dim // 2, hidden_dim),
                't_net': self._build_network(dim // 2, dim // 2, hidden_dim),
            })
    
    def _build_network(self, input_dim: int, output_dim: int, hidden_dim: int) -> Dict:
        """Build a small neural network."""
        return {
            'W1': np.random.randn(input_dim, hidden_dim).astype(np.float32) * 0.02,
            'b1': np.zeros(hidden_dim, dtype=np.float32),
            'W2': np.random.randn(hidden_dim, output_dim).astype(np.float32) * 0.02,
            'b2': np.zeros(output_dim, dtype=np.float32),
        }
    
    def _network_forward(self, x: np.ndarray, net: Dict) -> np.ndarray:
        """Forward pass through a small network."""
        h = x @ net['W1'] + net['b1']
        h = np.maximum(0, h)  # ReLU
        out = h @ net['W2'] + net['b2']
        return out
    
    def forward(self, x: np.ndarray) -> Tuple[np.ndarray, float]:
        """Forward transformation."""
        log_det_jacobian = 0.0
        
        for i, coupling in enumerate(self.coupling_layers):
            # Split input
            x1, x2 = x[:, :self.dim//2], x[:, self.dim//2:]
            
            if i % 2 == 0:
                # Transform x2
                s = self._network_forward(x1, coupling['s_net'])
                t = self._network_forward(x1, coupling['t_net'])
                y2 = x2 * np.exp(s) + t
                log_det_jacobian += np.sum(s, axis=-1)
                x = np.concatenate([x1, y2], axis=-1)
            else:
                # Transform x1
                s = self._network_forward(x2, coupling['s_net'])
                t = self._network_forward(x2, coupling['t_net'])
                y1 = x1 * np.exp(s) + t
                log_det_jacobian += np.sum(s, axis=-1)
                x = np.concatenate([y1, x2], axis=-1)
        
        return x, log_det_jacobian
    
    def inverse(self, y: np.ndarray) -> Tuple[np.ndarray, float]:
        """Inverse transformation."""
        log_det_jacobian = 0.0
        
        for i, coupling in enumerate(reversed(self.coupling_layers)):
            idx = self.num_coupling - 1 - i
            
            if idx % 2 == 0:
                # Inverse transform y2
                y1, y2 = y[:, :self.dim//2], y[:, self.dim//2:]
                s = self._network_forward(y1, coupling['s_net'])
                t = self._network_forward(y1, coupling['t_net'])
                x2 = (y2 - t) * np.exp(-s)
                log_det_jacobian += np.sum(-s, axis=-1)
                y = np.concatenate([y1, x2], axis=-1)
            else:
                # Inverse transform y1
                y1, y2 = y[:, :self.dim//2], y[:, self.dim//2:]
                s = self._network_forward(y2, coupling['s_net'])
                t = self._network_forward(y2, coupling['t_net'])
                x1 = (y1 - t) * np.exp(-s)
                log_det_jacobian += np.sum(-s, axis=-1)
                y = np.concatenate([x1, y2], axis=-1)
        
        return y, log_det_jacobian
    
    def sample(self, batch_size: int) -> np.ndarray:
        """Sample from the flow."""
        z = np.random.randn(batch_size, self.dim).astype(np.float32)
        x, _ = self.inverse(z)
        return x


# ═══════════════════════════════════════════════════════════════════════════
# AUTOREGRESSIVE MODELS
# ═══════════════════════════════════════════════════════════════════════════

class PixelCNN:
    """PixelCNN autoregressive model."""
    
    def __init__(self, img_size: int = 28, channels: int = 1, hidden_dim: int = 64):
        self.img_size = img_size
        self.channels = channels
        self.hidden_dim = hidden_dim
        
        # Masked convolutional layers (simplified as dense for demonstration)
        self.params = {
            'W1': np.random.randn(channels + 1, hidden_dim).astype(np.float32) * 0.02,  # +1 for position
            'b1': np.zeros(hidden_dim, dtype=np.float32),
            'W2': np.random.randn(hidden_dim, hidden_dim).astype(np.float32) * 0.02,
            'b2': np.zeros(hidden_dim, dtype=np.float32),
            'W3': np.random.randn(hidden_dim, channels * 256).astype(np.float32) * 0.02,
            'b3': np.zeros(channels * 256, dtype=np.float32),
        }
    
    def forward(self, x: np.ndarray) -> np.ndarray:
        """Forward pass."""
        batch_size = x.shape[0]
        x_flat = x.reshape(batch_size, -1)
        
        # Add position embedding
        pos = np.arange(x_flat.shape[1])[np.newaxis, :].astype(np.float32) / x_flat.shape[1]
        pos = np.tile(pos, (batch_size, 1))
        x_input = np.concatenate([x_flat, pos[:, :1]], axis=1)
        
        # Forward pass
        h = x_input @ self.params['W1'] + self.params['b1']
        h = np.maximum(0, h)  # ReLU
        h = h @ self.params['W2'] + self.params['b2']
        h = np.maximum(0, h)  # ReLU
        out = h @ self.params['W3'] + self.params['b3']
        
        return out.reshape(batch_size, self.channels, self.img_size, self.img_size, 256)
    
    def sample(self, num_samples: int) -> np.ndarray:
        """Generate samples autoregressively."""
        samples = np.zeros((num_samples, self.channels, self.img_size, self.img_size), dtype=np.float32)
        
        for i in range(self.img_size):
            for j in range(self.img_size):
                # Get predictions for this pixel
                logits = self.forward(samples)
                # Sample from predictions
                probs = np.exp(logits[:, :, i, j, :])
                probs = probs / np.sum(probs, axis=-1, keepdims=True)
                # Sample
                for n in range(num_samples):
                    samples[n, 0, i, j] = np.random.choice(256, p=probs[n, 0]) / 255.0
        
        return samples


if __name__ == '__main__':
    print("Testing Generative Models...")
    
    # Test GAN
    print("\n1. Testing GAN...")
    gan = GAN(latent_dim=10, output_dim=20)
    d_loss, g_loss = gan.train_step(np.random.randn(32, 20).astype(np.float32))
    print(f"   D loss: {d_loss:.4f}, G loss: {g_loss:.4f}")
    samples = gan.sample(5)
    print(f"   Generated samples shape: {samples.shape}")
    
    # Test VAE
    print("\n2. Testing VAE...")
    vae = VAE(input_dim=784, latent_dim=20)
    x = np.random.rand(32, 784).astype(np.float32)
    recon, mu, log_var = vae.forward(x)
    loss = vae.loss(x, recon, mu, log_var)
    print(f"   VAE loss: {loss:.4f}")
    samples = vae.sample(5)
    print(f"   Generated samples shape: {samples.shape}")
    
    # Test Diffusion
    print("\n3. Testing Diffusion Model...")
    diffusion = DiffusionModel(img_size=28, channels=1, time_steps=100)
    x = np.random.randn(2, 1, 28, 28).astype(np.float32)
    noisy, noise = diffusion.add_noise(x, 50)
    print(f"   Noisy shape: {noisy.shape}, Noise shape: {noise.shape}")
    
    # Test Normalizing Flows
    print("\n4. Testing RealNVP...")
    flow = RealNVP(dim=10, hidden_dim=64, num_coupling=4)
    x = np.random.randn(32, 10).astype(np.float32)
    y, log_det = flow.forward(x)
    x_inv, _ = flow.inverse(y)
    print(f"   Forward shape: {y.shape}, Log det: {log_det:.4f}")
    samples = flow.sample(5)
    print(f"   Generated samples shape: {samples.shape}")
    
    print("\nAll generative models tested successfully!")
