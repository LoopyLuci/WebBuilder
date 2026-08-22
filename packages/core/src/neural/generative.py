# WebBuilder Native ML/AI Framework
# Generative Models: GAN, VAE, Diffusion
# Built from scratch — no external ML dependencies

import numpy as np
from abc import ABC, abstractmethod
from typing import Any, Callable, Dict, List, Optional, Tuple, Union
import sys
import os

# Add parent to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from neural.core import *


# ============================================================================
# GENERATIVE ADVERSARIAL NETWORK (GAN)
# ============================================================================

class Generator(Layer):
    """GAN Generator network"""
    
    def __init__(self, latent_dim: int, output_shape: Tuple[int, ...]):
        super().__init__()
        self.latent_dim = latent_dim
        self.output_shape = output_shape
        
        # Calculate flattened output size
        self.flat_size = int(np.prod(output_shape))
        
        # Build generator layers
        self.fc1 = Linear(latent_dim, 256)
        self.fc2 = Linear(256, 512)
        self.fc3 = Linear(512, 1024)
        self.fc4 = Linear(1024, self.flat_size)
        
        self.bn1 = BatchNorm(256)
        self.bn2 = BatchNorm(512)
        self.bn3 = BatchNorm(1024)
        
        self.layers = {
            'fc1': self.fc1, 'fc2': self.fc2, 'fc3': self.fc3, 'fc4': self.fc4,
            'bn1': self.bn1, 'bn2': self.bn2, 'bn3': self.bn3
        }
    
    def forward(self, z: Tensor) -> Tensor:
        x = self.fc1(z)
        x = self.bn1(x)
        x = x.relu()
        
        x = self.fc2(x)
        x = self.bn2(x)
        x = x.relu()
        
        x = self.fc3(x)
        x = self.bn3(x)
        x = x.relu()
        
        x = self.fc4(x)
        x = x.tanh()
        
        # Reshape to output shape
        return x.reshape(-1, *self.output_shape)
    
    def parameters(self) -> List[Tensor]:
        params = []
        for layer in self.layers.values():
            params.extend(layer.parameters())
        return params


class Discriminator(Layer):
    """GAN Discriminator network"""
    
    def __init__(self, input_shape: Tuple[int, ...]):
        super().__init__()
        self.input_shape = input_shape
        self.flat_size = int(np.prod(input_shape))
        
        self.fc1 = Linear(self.flat_size, 1024)
        self.fc2 = Linear(1024, 512)
        self.fc3 = Linear(512, 256)
        self.fc4 = Linear(256, 1)
        
        self.layers = {
            'fc1': self.fc1, 'fc2': self.fc2, 'fc3': self.fc3, 'fc4': self.fc4
        }
    
    def forward(self, x: Tensor) -> Tensor:
        # Flatten input
        x = x.reshape(x.shape[0], -1)
        
        x = self.fc1(x)
        x = Tensor(np.where(x.data > 0, x.data, 0.2 * x.data), requires_grad=True)  # LeakyReLU
        
        x = self.fc2(x)
        x = Tensor(np.where(x.data > 0, x.data, 0.2 * x.data), requires_grad=True)
        
        x = self.fc3(x)
        x = Tensor(np.where(x.data > 0, x.data, 0.2 * x.data), requires_grad=True)
        
        x = self.fc4(x)
        return x.sigmoid()
    
    def parameters(self) -> List[Tensor]:
        params = []
        for layer in self.layers.values():
            params.extend(layer.parameters())
        return params


class GAN:
    """Complete GAN model"""
    
    def __init__(self, latent_dim: int, output_shape: Tuple[int, ...],
                 lr_generator: float = 0.0002, lr_discriminator: float = 0.0002):
        self.latent_dim = latent_dim
        self.output_shape = output_shape
        
        self.generator = Generator(latent_dim, output_shape)
        self.discriminator = Discriminator(output_shape)
        
        self.g_optimizer = Adam(self.generator.parameters(), lr=lr_generator)
        self.d_optimizer = Adam(self.discriminator.parameters(), lr=lr_discriminator)
        
        self.loss_fn = BCELoss()
        self.history = {'g_loss': [], 'd_loss': []}
    
    def generate(self, num_samples: int) -> np.ndarray:
        """Generate samples from random noise"""
        z = Tensor(np.random.randn(num_samples, self.latent_dim))
        return self.generator(z).data
    
    def train_step(self, real_samples: np.ndarray) -> Tuple[float, float]:
        """Single training step"""
        batch_size = real_samples.shape[0]
        
        # Train Discriminator
        self.d_optimizer.zero_grad()
        
        # Real samples
        real_tensor = Tensor(real_samples)
        real_output = self.discriminator(real_tensor)
        real_loss = self.loss_fn(real_output, np.ones((batch_size, 1)))
        
        # Fake samples
        z = Tensor(np.random.randn(batch_size, self.latent_dim))
        fake_samples = self.generator(z)
        fake_output = self.discriminator(fake_samples)
        fake_loss = self.loss_fn(fake_output, np.zeros((batch_size, 1)))
        
        d_loss = real_loss + fake_loss
        self.history['d_loss'].append(d_loss)
        
        # Train Generator
        self.g_optimizer.zero_grad()
        
        z = Tensor(np.random.randn(batch_size, self.latent_dim))
        fake_samples = self.generator(z)
        fake_output = self.discriminator(fake_samples)
        
        g_loss = self.loss_fn(fake_output, np.ones((batch_size, 1)))
        self.history['g_loss'].append(g_loss)
        
        return d_loss, g_loss


# ============================================================================
# VARIATIONAL AUTOENCODER (VAE)
# ============================================================================

class VAEEncoder(Layer):
    """VAE Encoder network"""
    
    def __init__(self, input_dim: int, hidden_dim: int, latent_dim: int):
        super().__init__()
        self.fc1 = Linear(input_dim, hidden_dim)
        self.fc_mu = Linear(hidden_dim, latent_dim)
        self.fc_logvar = Linear(hidden_dim, latent_dim)
        
        self.layers = {'fc1': self.fc1, 'fc_mu': self.fc_mu, 'fc_logvar': self.fc_logvar}
    
    def forward(self, x: Tensor) -> Tuple[Tensor, Tensor]:
        h = self.fc1(x).relu()
        mu = self.fc_mu(h)
        logvar = self.fc_logvar(h)
        return mu, logvar
    
    def parameters(self) -> List[Tensor]:
        params = []
        for layer in self.layers.values():
            params.extend(layer.parameters())
        return params


class VAEDecoder(Layer):
    """VAE Decoder network"""
    
    def __init__(self, latent_dim: int, hidden_dim: int, output_dim: int):
        super().__init__()
        self.fc1 = Linear(latent_dim, hidden_dim)
        self.fc2 = Linear(hidden_dim, output_dim)
        
        self.layers = {'fc1': self.fc1, 'fc2': self.fc2}
    
    def forward(self, z: Tensor) -> Tensor:
        h = self.fc1(z).relu()
        return self.fc2(h).sigmoid()
    
    def parameters(self) -> List[Tensor]:
        params = []
        for layer in self.layers.values():
            params.extend(layer.parameters())
        return params


class VAE:
    """Complete VAE model"""
    
    def __init__(self, input_dim: int, hidden_dim: int = 512, latent_dim: int = 64,
                 lr: float = 0.001):
        self.input_dim = input_dim
        self.hidden_dim = hidden_dim
        self.latent_dim = latent_dim
        
        self.encoder = VAEEncoder(input_dim, hidden_dim, latent_dim)
        self.decoder = VAEDecoder(latent_dim, hidden_dim, input_dim)
        
        self.optimizer = Adam(self.parameters(), lr=lr)
        self.history = {'loss': [], 'reconstruction': [], 'kl': []}
    
    def reparameterize(self, mu: Tensor, logvar: Tensor) -> Tensor:
        """Reparameterization trick"""
        std = Tensor(np.exp(0.5 * logvar.data))
        eps = Tensor(np.random.randn(*mu.shape))
        return mu + std * eps
    
    def forward(self, x: Tensor) -> Tuple[Tensor, Tensor, Tensor]:
        mu, logvar = self.encoder(x)
        z = self.reparameterize(mu, logvar)
        reconstruction = self.decoder(z)
        return reconstruction, mu, logvar
    
    def loss_fn(self, reconstruction: Tensor, x: Tensor, mu: Tensor, logvar: Tensor) -> float:
        """VAE loss = reconstruction + KL divergence"""
        recon_loss = np.mean((reconstruction.data - x.data) ** 2)
        kl_loss = -0.5 * np.mean(1 + logvar.data - mu.data ** 2 - np.exp(logvar.data))
        return recon_loss + kl_loss
    
    def train_step(self, x: np.ndarray) -> float:
        """Single training step"""
        self.optimizer.zero_grad()
        
        x_tensor = Tensor(x)
        reconstruction, mu, logvar = self.forward(x_tensor)
        loss = self.loss_fn(reconstruction, x_tensor, mu, logvar)
        
        self.history['loss'].append(loss)
        return loss
    
    def encode(self, x: np.ndarray) -> np.ndarray:
        """Encode input to latent space"""
        x_tensor = Tensor(x)
        mu, _ = self.encoder(x_tensor)
        return mu.data
    
    def decode(self, z: np.ndarray) -> np.ndarray:
        """Decode latent vector to output"""
        z_tensor = Tensor(z)
        return self.decoder(z_tensor).data
    
    def generate(self, num_samples: int) -> np.ndarray:
        """Generate samples from random latent vectors"""
        z = np.random.randn(num_samples, self.latent_dim)
        return self.decode(z)
    
    def parameters(self) -> List[Tensor]:
        return self.encoder.parameters() + self.decoder.parameters()


# ============================================================================
# DIFFUSION MODEL (DDPM)
# ============================================================================

class DiffusionScheduler:
    """Noise scheduler for diffusion models"""
    
    def __init__(self, num_timesteps: int = 1000, beta_start: float = 0.0001, beta_end: float = 0.02):
        self.num_timesteps = num_timesteps
        self.betas = np.linspace(beta_start, beta_end, num_timesteps)
        self.alphas = 1.0 - self.betas
        self.alpha_cumprod = np.cumprod(self.alphas)
        self.alpha_cumprod_prev = np.concatenate([[1.0], self.alpha_cumprod[:-1]])
        self.sqrt_alpha_cumprod = np.sqrt(self.alpha_cumprod)
        self.sqrt_one_minus_alpha_cumprod = np.sqrt(1.0 - self.alpha_cumprod)
    
    def add_noise(self, x_0: np.ndarray, t: int) -> Tuple[np.ndarray, np.ndarray]:
        """Add noise to image at timestep t"""
        noise = np.random.randn(*x_0.shape)
        sqrt_alpha = self.sqrt_alpha_cumprod[t]
        sqrt_one_minus = self.sqrt_one_minus_alpha_cumprod[t]
        x_t = sqrt_alpha * x_0 + sqrt_one_minus * noise
        return x_t, noise
    
    def sample_timestep(self, batch_size: int) -> np.ndarray:
        """Sample random timesteps"""
        return np.random.randint(0, self.num_timesteps, size=batch_size)


class UNetDenoiser(Layer):
    """U-Net denoising network for diffusion"""
    
    def __init__(self, in_channels: int = 3, hidden_channels: int = 64, time_embed_dim: int = 128):
        super().__init__()
        self.time_embed = Linear(1, time_embed_dim)
        
        # Encoder path
        self.enc1 = Conv2D(in_channels, hidden_channels, 3, padding=1)
        self.enc2 = Conv2D(hidden_channels, hidden_channels * 2, 3, padding=1)
        self.enc3 = Conv2D(hidden_channels * 2, hidden_channels * 4, 3, padding=1)
        
        # Decoder path
        self.dec3 = Conv2D(hidden_channels * 4, hidden_channels * 2, 3, padding=1)
        self.dec2 = Conv2D(hidden_channels * 2, hidden_channels, 3, padding=1)
        self.dec1 = Conv2D(hidden_channels, in_channels, 3, padding=1)
        
        # Pooling
        self.pool = MaxPool2D(2, 2)
        
        self.layers = {
            'time_embed': self.time_embed,
            'enc1': self.enc1, 'enc2': self.enc2, 'enc3': self.enc3,
            'dec3': self.dec3, 'dec2': self.dec2, 'dec1': self.dec1
        }
    
    def forward(self, x: Tensor, t: Tensor) -> Tensor:
        # Time embedding
        t_embed = self.time_embed(t)
        
        # Encoder
        e1 = Tensor(np.maximum(0, self.enc1(x).data))
        e2 = Tensor(np.maximum(0, self.enc2(self.pool(e1)).data))
        e3 = Tensor(np.maximum(0, self.enc3(self.pool(e2)).data))
        
        # Decoder (simplified - no skip connections for brevity)
        d3 = Tensor(np.maximum(0, self.dec3(e3).data))
        d2 = Tensor(np.maximum(0, self.dec2(d3).data))
        d1 = self.dec1(d2)
        
        return d1
    
    def parameters(self) -> List[Tensor]:
        params = []
        for layer in self.layers.values():
            params.extend(layer.parameters())
        return params


class DiffusionModel:
    """Complete DDPM model"""
    
    def __init__(self, image_shape: Tuple[int, ...], num_timesteps: int = 1000,
                 lr: float = 0.0001):
        self.image_shape = image_shape
        self.num_timesteps = num_timesteps
        
        self.scheduler = DiffusionScheduler(num_timesteps)
        self.denoiser = UNetDenoiser(in_channels=image_shape[0])
        
        self.optimizer = Adam(self.denoiser.parameters(), lr=lr)
        self.loss_fn = MSELoss()
        self.history = {'loss': []}
    
    def forward_diffusion(self, x_0: np.ndarray, t: int) -> Tuple[np.ndarray, np.ndarray]:
        """Add noise to images"""
        return self.scheduler.add_noise(x_0, t)
    
    def train_step(self, x_0: np.ndarray) -> float:
        """Single training step"""
        self.optimizer.zero_grad()
        
        batch_size = x_0.shape[0]
        t = self.scheduler.sample_timestep(batch_size)
        
        # Add noise
        x_t, noise = self.forward_diffusion(x_0, t[0])
        
        # Predict noise
        x_t_tensor = Tensor(x_t)
        t_tensor = Tensor(t.reshape(-1, 1).astype(np.float64))
        predicted_noise = self.denoiser(x_t_tensor, t_tensor)
        
        # Compute loss
        loss = self.loss_fn(predicted_noise, noise)
        self.history['loss'].append(loss)
        
        return loss
    
    @torch.no_grad()
    def generate(self, num_samples: int) -> np.ndarray:
        """Generate images by denoising random noise"""
        # Start from random noise
        x = np.random.randn(num_samples, *self.image_shape)
        
        # Reverse diffusion process
        for t in reversed(range(self.num_timesteps)):
            t_batch = np.full((num_samples,), t)
            x_tensor = Tensor(x)
            t_tensor = Tensor(t_batch.reshape(-1, 1).astype(np.float64))
            
            predicted_noise = self.denoiser(x_tensor, t_tensor).data
            
            alpha = self.scheduler.alphas[t]
            alpha_cumprod = self.scheduler.alpha_cumprod[t]
            beta = self.scheduler.betas[t]
            
            if t > 0:
                noise = np.random.randn(*x.shape)
            else:
                noise = 0
            
            x = (1 / np.sqrt(alpha)) * (x - ((1 - alpha) / np.sqrt(1 - alpha_cumprod)) * predicted_noise) + np.sqrt(beta) * noise
        
        return x


# ============================================================================
# STYLE-BASED GENERATOR (StyleGAN-like)
# ============================================================================

class MappingNetwork(Layer):
    """Style mapping network"""
    
    def __init__(self, latent_dim: int, style_dim: int, num_layers: int = 8):
        super().__init__()
        self.layers_list = []
        for i in range(num_layers):
            self.layers_list.append(Linear(latent_dim if i == 0 else style_dim, style_dim))
        self.layers = {f'fc{i}': layer for i, layer in enumerate(self.layers_list)}
    
    def forward(self, z: Tensor) -> Tensor:
        x = z
        for layer in self.layers_list:
            x = layer(x).relu()
        return x
    
    def parameters(self) -> List[Tensor]:
        params = []
        for layer in self.layers.values():
            params.extend(layer.parameters())
        return params


class SynthesisNetwork(Layer):
    """Style synthesis network"""
    
    def __init__(self, style_dim: int, output_channels: int, image_size: int = 64):
        super().__init__()
        self.style_dim = style_dim
        self.image_size = image_size
        
        # Learned constant input
        self.constant = Tensor(np.random.randn(1, 512, 4, 4), requires_grad=True)
        
        # Style blocks
        self.block1 = Conv2D(512, 256, 3, padding=1)
        self.block2 = Conv2D(256, 128, 3, padding=1)
        self.block3 = Conv2D(128, 64, 3, padding=1)
        self.to_rgb = Conv2D(64, output_channels, 1)
        
        self.layers = {
            'block1': self.block1, 'block2': self.block2,
            'block3': self.block3, 'to_rgb': self.to_rgb
        }
    
    def forward(self, style: Tensor) -> Tensor:
        # Broadcast constant to batch size
        batch_size = style.shape[0]
        x = Tensor(np.tile(self.constant.data, (batch_size, 1, 1, 1)))
        
        # Apply style blocks
        x = Tensor(np.maximum(0, self.block1(x).data))
        x = Tensor(np.maximum(0, self.block2(x).data))
        x = Tensor(np.maximum(0, self.block3(x).data))
        x = self.to_rgb(x)
        
        return Tensor(np.tanh(x.data), requires_grad=True)
    
    def parameters(self) -> List[Tensor]:
        params = [self.constant]
        for layer in self.layers.values():
            params.extend(layer.parameters())
        return params


class StyleGAN:
    """Style-based GAN"""
    
    def __init__(self, latent_dim: int = 512, style_dim: int = 512,
                 output_channels: int = 3, image_size: int = 64, lr: float = 0.001):
        self.latent_dim = latent_dim
        self.style_dim = style_dim
        
        self.mapping = MappingNetwork(latent_dim, style_dim)
        self.synthesis = SynthesisNetwork(style_dim, output_channels, image_size)
        
        self.optimizer = Adam(self.parameters(), lr=lr)
        self.history = {'loss': []}
    
    def generate(self, num_samples: int) -> np.ndarray:
        """Generate images"""
        z = Tensor(np.random.randn(num_samples, self.latent_dim))
        style = self.mapping(z)
        return self.synthesis(style).data
    
    def parameters(self) -> List[Tensor]:
        return self.mapping.parameters() + self.synthesis.parameters()


# ============================================================================
# EXPORT
# ============================================================================

__all__ = [
    'Generator', 'Discriminator', 'GAN',
    'VAEEncoder', 'VAEDecoder', 'VAE',
    'DiffusionScheduler', 'UNetDenoiser', 'DiffusionModel',
    'MappingNetwork', 'SynthesisNetwork', 'StyleGAN'
]
