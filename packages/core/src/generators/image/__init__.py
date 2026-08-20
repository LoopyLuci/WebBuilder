#!/usr/bin/env python3
"""
WebBuilder Native Image Generation System
Built from scratch using only NumPy
Includes: Diffusion Model, VAE, and Procedural Generation
"""

import numpy as np
from typing import Tuple, Optional, Dict, Any
import math


# ═══════════════════════════════════════════════════════════════════════════
# VARIATIONAL AUTOENCODER (VAE)
# ═══════════════════════════════════════════════════════════════════════════

class Encoder:
    """VAE Encoder: maps image to latent distribution."""
    
    def __init__(self, in_channels: int = 3, latent_dim: int = 128, image_size: int = 64):
        self.in_channels = in_channels
        self.latent_dim = latent_dim
        self.image_size = image_size
        
        # Convolutional layers
        self.conv1 = self._make_conv(in_channels, 32, 4, 2, 1)
        self.conv2 = self._make_conv(32, 64, 4, 2, 1)
        self.conv3 = self._make_conv(64, 128, 4, 2, 1)
        self.conv4 = self._make_conv(128, 256, 4, 2, 1)
        
        # Calculate flattened size
        self.flat_size = 256 * (image_size // 16) * (image_size // 16)
        
        # Mean and log-variance heads
        self.fc_mu = self._make_linear(self.flat_size, latent_dim)
        self.fc_logvar = self._make_linear(self.flat_size, latent_dim)
    
    def _make_conv(self, in_c, out_c, k, s, p):
        return {
            'W': np.random.randn(out_c, in_c, k, k).astype(np.float32) * np.sqrt(2.0 / (in_c * k * k)),
            'b': np.zeros(out_c, dtype=np.float32)
        }
    
    def _make_linear(self, in_f, out_f):
        return {
            'W': np.random.randn(in_f, out_f).astype(np.float32) * np.sqrt(2.0 / in_f),
            'b': np.zeros(out_f, dtype=np.float32)
        }
    
    def forward(self, x: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        # Conv blocks with LeakyReLU
        h = self._conv_block(x, self.conv1)
        h = self._conv_block(h, self.conv2)
        h = self._conv_block(h, self.conv3)
        h = self._conv_block(h, self.conv4)
        
        # Flatten
        h = h.reshape(h.shape[0], -1)
        
        # Mean and log-variance
        mu = h @ self.fc_mu['W'] + self.fc_mu['b']
        logvar = h @ self.fc_logvar['W'] + self.fc_logvar['b']
        
        return mu, logvar
    
    def _conv_block(self, x: np.ndarray, conv: Dict) -> np.ndarray:
        # Simple convolution + LeakyReLU
        out = self._conv2d(x, conv['W'], conv['b'])
        return np.where(out > 0, out, 0.01 * out)
    
    def _conv2d(self, x: np.ndarray, W: np.ndarray, b: np.ndarray) -> np.ndarray:
        N, C, H, W = x.shape
        out_c, in_c, k, k = W.shape
        H_out = H - k + 1
        W_out = W - k + 1
        
        out = np.zeros((N, out_c, H_out, W_out), dtype=np.float32)
        for i in range(H_out):
            for j in range(W_out):
                patch = x[:, :, i:i+k, j:j+k]
                for oc in range(out_c):
                    out[:, oc, i, j] = np.sum(patch * W[oc], axis=(1, 2, 3)) + b[oc]
        return out
    
    def reparameterize(self, mu: np.ndarray, logvar: np.ndarray) -> np.ndarray:
        std = np.exp(0.5 * logvar)
        eps = np.random.randn(*std.shape).astype(np.float32)
        return mu + eps * std


class Decoder:
    """VAE Decoder: maps latent vector to image."""
    
    def __init__(self, latent_dim: int = 128, out_channels: int = 3, image_size: int = 64):
        self.latent_dim = latent_dim
        self.out_channels = out_channels
        self.image_size = image_size
        
        self.flat_size = 256 * (image_size // 16) * (image_size // 16)
        
        # Project and reshape
        self.fc = self._make_linear(latent_dim, self.flat_size)
        
        # Transposed convolutional layers
        self.tconv1 = self._make_tconv(256, 128, 4, 2, 1)
        self.tconv2 = self._make_tconv(128, 64, 4, 2, 1)
        self.tconv3 = self._make_tconv(64, 32, 4, 2, 1)
        self.tconv4 = self._make_tconv(32, out_channels, 4, 2, 1)
    
    def _make_linear(self, in_f, out_f):
        return {
            'W': np.random.randn(in_f, out_f).astype(np.float32) * np.sqrt(2.0 / in_f),
            'b': np.zeros(out_f, dtype=np.float32)
        }
    
    def _make_tconv(self, in_c, out_c, k, s, p):
        return {
            'W': np.random.randn(in_c, out_c, k, k).astype(np.float32) * np.sqrt(2.0 / (in_c * k * k)),
            'b': np.zeros(out_c, dtype=np.float32)
        }
    
    def forward(self, z: np.ndarray) -> np.ndarray:
        # Project
        h = z @ self.fc['W'] + self.fc['b']
        h = np.where(h > 0, h, 0.01 * h)  # LeakyReLU
        
        # Reshape
        h = h.reshape(h.shape[0], 256, self.image_size // 16, self.image_size // 16)
        
        # Transposed conv blocks
        h = self._tconv_block(h, self.tconv1)
        h = self._tconv_block(h, self.tconv2)
        h = self._tconv_block(h, self.tconv3)
        h = self._tconv_block(h, self.tconv4)
        
        # Sigmoid output
        return 1 / (1 + np.exp(-np.clip(h, -500, 500)))
    
    def _tconv_block(self, x: np.ndarray, tconv: Dict) -> np.ndarray:
        out = self._tconv2d(x, tconv['W'], tconv['b'])
        return np.where(out > 0, out, 0.01 * out)
    
    def _tconv2d(self, x: np.ndarray, W: np.ndarray, b: np.ndarray) -> np.ndarray:
        N, C, H, W = x.shape
        in_c, out_c, k, k = W.shape
        H_out = (H - 1) * 2 + k
        W_out = (W - 1) * 2 + k
        
        out = np.zeros((N, out_c, H_out, W_out), dtype=np.float32)
        for i in range(H):
            for j in range(W):
                patch = x[:, :, i:i+1, j:j+1]
                for oc in range(out_c):
                    out[:, oc, i*2:i*2+k, j*2:j*2+k] += np.sum(patch * W[:, oc], axis=1)
        out += b[np.newaxis, :, np.newaxis, np.newaxis]
        return out


class VAE:
    """Variational Autoencoder for image generation."""
    
    def __init__(self, latent_dim: int = 128, image_size: int = 64):
        self.encoder = Encoder(in_channels=3, latent_dim=latent_dim, image_size=image_size)
        self.decoder = Decoder(latent_dim=latent_dim, out_channels=3, image_size=image_size)
        self.latent_dim = latent_dim
    
    def encode(self, x: np.ndarray) -> np.ndarray:
        mu, logvar = self.encoder.forward(x)
        return self.encoder.reparameterize(mu, logvar)
    
    def decode(self, z: np.ndarray) -> np.ndarray:
        return self.decoder.forward(z)
    
    def generate(self, num_images: int = 1) -> np.ndarray:
        z = np.random.randn(num_images, self.latent_dim).astype(np.float32)
        return self.decode(z)


# ═══════════════════════════════════════════════════════════════════════════
# DIFFUSION MODEL
# ═══════════════════════════════════════════════════════════════════════════

class NoiseScheduler:
    """Manages the noise schedule for diffusion."""
    
    def __init__(self, num_timesteps: int = 1000, beta_start: float = 0.0001, beta_end: float = 0.02):
        self.num_timesteps = num_timesteps
        self.betas = np.linspace(beta_start, beta_end, num_timesteps, dtype=np.float32)
        self.alphas = 1.0 - self.betas
        self.alphas_cumprod = np.cumprod(self.alphas)
        self.alphas_cumprod_prev = np.concatenate([[1.0], self.alphas_cumprod[:-1]])
        self.sqrt_alphas_cumprod = np.sqrt(self.alphas_cumprod)
        self.sqrt_one_minus_alphas_cumprod = np.sqrt(1.0 - self.alphas_cumprod)
        self.posterior_variance = self.betas * (1.0 - self.alphas_cumprod_prev) / (1.0 - self.alphas_cumprod)
    
    def add_noise(self, x_start: np.ndarray, t: int) -> Tuple[np.ndarray, np.ndarray]:
        """Add noise to image at timestep t."""
        noise = np.random.randn(*x_start.shape).astype(np.float32)
        sqrt_alpha = self.sqrt_alphas_cumprod[t]
        sqrt_one_minus_alpha = self.sqrt_one_minus_alphas_cumprod[t]
        noisy = sqrt_alpha * x_start + sqrt_one_minus_alpha * noise
        return noisy, noise
    
    def sample_timesteps(self, batch_size: int) -> np.ndarray:
        return np.random.randint(0, self.num_timesteps, size=batch_size)


class UNet:
    """U-Net architecture for denoising in diffusion model."""
    
    def __init__(self, in_channels: int = 3, time_dim: int = 128):
        self.in_channels = in_channels
        self.time_dim = time_dim
        
        # Time embedding
        self.time_mlp = {
            'W1': np.random.randn(time_dim, time_dim * 4).astype(np.float32) * 0.02,
            'b1': np.zeros(time_dim * 4, dtype=np.float32),
            'W2': np.random.randn(time_dim * 4, time_dim).astype(np.float32) * 0.02,
            'b2': np.zeros(time_dim, dtype=np.float32)
        }
        
        # Downsampling
        self.down1 = self._make_resblock(in_channels, 64)
        self.down2 = self._make_resblock(64, 128)
        self.down3 = self._make_resblock(128, 256)
        
        # Middle
        self.mid = self._make_resblock(256, 256)
        
        # Upsampling
        self.up3 = self._make_resblock(512, 128)  # 256 + 256 skip
        self.up2 = self._make_resblock(256, 64)   # 128 + 128 skip
        self.up1 = self._make_resblock(128, 64)   # 64 + 64 skip
        
        # Output
        self.out_conv = {
            'W': np.random.randn(64, in_channels, 3, 3).astype(np.float32) * 0.02,
            'b': np.zeros(in_channels, dtype=np.float32)
        }
    
    def _make_resblock(self, in_c, out_c):
        return {
            'conv1': {'W': np.random.randn(out_c, in_c, 3, 3).astype(np.float32) * 0.02, 'b': np.zeros(out_c, dtype=np.float32)},
            'conv2': {'W': np.random.randn(out_c, out_c, 3, 3).astype(np.float32) * 0.02, 'b': np.zeros(out_c, dtype=np.float32)},
            'norm1': {'gamma': np.ones(out_c, dtype=np.float32), 'beta': np.zeros(out_c, dtype=np.float32)},
            'norm2': {'gamma': np.ones(out_c, dtype=np.float32), 'beta': np.zeros(out_c, dtype=np.float32)},
        }
    
    def time_embedding(self, t: int) -> np.ndarray:
        """Sinusoidal time embedding."""
        half_dim = self.time_dim // 2
        emb = np.log(10000) / (half_dim - 1)
        emb = np.exp(np.arange(half_dim) * -emb)
        emb = t * emb
        emb = np.concatenate([np.sin(emb), np.cos(emb)])
        return emb.astype(np.float32)
    
    def forward(self, x: np.ndarray, t: int) -> np.ndarray:
        # Time embedding
        t_emb = self.time_embedding(t)
        t_emb = t_emb @ self.time_mlp['W1'] + self.time_mlp['b1']
        t_emb = np.where(t_emb > 0, t_emb, 0.01 * t_emb)
        t_emb = t_emb @ self.time_mlp['W2'] + self.time_mlp['b2']
        
        # Downsampling
        h1 = self._resblock_forward(x, self.down1)
        h2 = self._resblock_forward(h1, self.down2)
        h3 = self._resblock_forward(h2, self.down3)
        
        # Middle
        h = self._resblock_forward(h3, self.mid)
        
        # Upsampling with skip connections
        h = self._resblock_forward(np.concatenate([h, h3], axis=1), self.up3)
        h = self._resblock_forward(np.concatenate([h, h2], axis=1), self.up2)
        h = self._resblock_forward(np.concatenate([h, h1], axis=1), self.up1)
        
        # Output
        return self._conv2d(h, self.out_conv['W'], self.out_conv['b'])
    
    def _resblock_forward(self, x: np.ndarray, resblock: Dict) -> np.ndarray:
        h = self._conv2d(x, resblock['conv1']['W'], resblock['conv1']['b'])
        h = self._group_norm(h, resblock['norm1'])
        h = np.where(h > 0, h, 0.01 * h)
        h = self._conv2d(h, resblock['conv2']['W'], resblock['conv2']['b'])
        h = self._group_norm(h, resblock['norm2'])
        return np.where(h > 0, h, 0.01 * h)
    
    def _conv2d(self, x: np.ndarray, W: np.ndarray, b: np.ndarray) -> np.ndarray:
        N, C, H, W = x.shape
        out_c, in_c, k, k = W.shape
        H_out = H - k + 1
        W_out = W - k + 1
        
        out = np.zeros((N, out_c, H_out, W_out), dtype=np.float32)
        for i in range(H_out):
            for j in range(W_out):
                patch = x[:, :, i:i+k, j:j+k]
                for oc in range(out_c):
                    out[:, oc, i, j] = np.sum(patch * W[oc], axis=(1, 2, 3)) + b[oc]
        return out
    
    def _group_norm(self, x: np.ndarray, norm: Dict, num_groups: int = 8) -> np.ndarray:
        N, C, H, W = x.shape
        x = x.reshape(N, num_groups, C // num_groups, H, W)
        mean = np.mean(x, axis=(2, 3, 4), keepdims=True)
        var = np.var(x, axis=(2, 3, 4), keepdims=True)
        x = (x - mean) / np.sqrt(var + 1e-5)
        x = x.reshape(N, C, H, W)
        return x * norm['gamma'][np.newaxis, :, np.newaxis, np.newaxis] + norm['beta'][np.newaxis, :, np.newaxis, np.newaxis]


class DiffusionModel:
    """Denoising Diffusion Probabilistic Model."""
    
    def __init__(self, num_timesteps: int = 1000, image_size: int = 64):
        self.scheduler = NoiseScheduler(num_timesteps)
        self.unet = UNet(in_channels=3)
        self.image_size = image_size
    
    def forward_diffusion(self, x_start: np.ndarray, t: int) -> Tuple[np.ndarray, np.ndarray]:
        """Add noise to image at timestep t."""
        return self.scheduler.add_noise(x_start, t)
    
    def reverse_step(self, x_t: np.ndarray, t: int) -> np.ndarray:
        """Single denoising step."""
        # Predict noise
        predicted_noise = self.unet.forward(x_t, t)
        
        # Compute denoised image
        alpha = self.scheduler.alphas[t]
        alpha_cumprod = self.scheduler.alphas_cumprod[t]
        beta = self.scheduler.betas[t]
        
        # DDPM sampling
        noise = np.random.randn(*x_t.shape).astype(np.float32) if t > 0 else 0
        sigma = np.sqrt(beta)
        
        x_t_minus_1 = (1 / np.sqrt(alpha)) * (x_t - ((1 - alpha) / np.sqrt(1 - alpha_cumprod)) * predicted_noise) + sigma * noise
        
        return x_t_minus_1
    
    def generate(self, num_images: int = 1, num_steps: int = 50) -> np.ndarray:
        """Generate images from noise."""
        # Start from pure noise
        x = np.random.randn(num_images, 3, self.image_size, self.image_size).astype(np.float32)
        
        # Denoise step by step
        timesteps = np.linspace(999, 0, num_steps, dtype=int)
        for t in timesteps:
            x = self.reverse_step(x, t)
        
        # Clip to valid range
        return np.clip(x, -1, 1)


# ═══════════════════════════════════════════════════════════════════════════
# PROCEDURAL IMAGE GENERATION
# ═══════════════════════════════════════════════════════════════════════════

class ProceduralImageGenerator:
    """Generate images procedurally without neural networks."""
    
    @staticmethod
    def generate_gradient(width: int, height: int, colors: list, direction: str = 'horizontal') -> np.ndarray:
        """Generate gradient image."""
        img = np.zeros((height, width, 3), dtype=np.uint8)
        
        if direction == 'horizontal':
            for x in range(width):
                t = x / (width - 1)
                color = ProceduralImageGenerator._lerp_colors(colors, t)
                img[:, x] = color
        elif direction == 'vertical':
            for y in range(height):
                t = y / (height - 1)
                color = ProceduralImageGenerator._lerp_colors(colors, t)
                img[y, :] = color
        elif direction == 'radial':
            cx, cy = width // 2, height // 2
            max_dist = math.sqrt(cx**2 + cy**2)
            for y in range(height):
                for x in range(width):
                    dist = math.sqrt((x - cx)**2 + (y - cy)**2) / max_dist
                    color = ProceduralImageGenerator._lerp_colors(colors, min(dist, 1.0))
                    img[y, x] = color
        
        return img
    
    @staticmethod
    def _lerp_colors(colors: list, t: float) -> list:
        """Interpolate between colors."""
        n = len(colors) - 1
        idx = int(t * n)
        idx = min(idx, n - 1)
        local_t = (t * n) - idx
        
        c1 = colors[idx]
        c2 = colors[idx + 1]
        
        return [
            int(c1[0] + (c2[0] - c1[0]) * local_t),
            int(c1[1] + (c2[1] - c1[1]) * local_t),
            int(c1[2] + (c2[2] - c1[2]) * local_t)
        ]
    
    @staticmethod
    def generate_pattern(width: int, height: int, pattern_type: str, **kwargs) -> np.ndarray:
        """Generate various patterns."""
        img = np.zeros((height, width, 3), dtype=np.uint8)
        color1 = kwargs.get('color1', [255, 255, 255])
        color2 = kwargs.get('color2', [0, 0, 0])
        size = kwargs.get('size', 20)
        
        if pattern_type == 'checkerboard':
            for y in range(height):
                for x in range(width):
                    if ((x // size) + (y // size)) % 2 == 0:
                        img[y, x] = color1
                    else:
                        img[y, x] = color2
        
        elif pattern_type == 'dots':
            for y in range(height):
                for x in range(width):
                    cx = (x // size) * size + size // 2
                    cy = (y // size) * size + size // 2
                    dist = math.sqrt((x - cx)**2 + (y - cy)**2)
                    if dist < size // 3:
                        img[y, x] = color2
                    else:
                        img[y, x] = color1
        
        elif pattern_type == 'stripes':
            for y in range(height):
                for x in range(width):
                    if (x // size) % 2 == 0:
                        img[y, x] = color1
                    else:
                        img[y, x] = color2
        
        elif pattern_type == 'waves':
            for y in range(height):
                for x in range(width):
                    wave = math.sin(x / size + y / (size * 2)) * 0.5 + 0.5
                    img[y, x] = [
                        int(color1[0] * wave + color2[0] * (1 - wave)),
                        int(color1[1] * wave + color2[1] * (1 - wave)),
                        int(color1[2] * wave + color2[2] * (1 - wave))
                    ]
        
        elif pattern_type == 'noise':
            img = np.random.randint(0, 256, (height, width, 3), dtype=np.uint8)
        
        return img
    
    @staticmethod
    def generate_icon(size: int, icon_type: str, color: list = [0, 0, 0]) -> np.ndarray:
        """Generate simple icons."""
        img = np.zeros((size, size, 4), dtype=np.uint8)  # RGBA
        center = size // 2
        
        if icon_type == 'circle':
            for y in range(size):
                for x in range(size):
                    dist = math.sqrt((x - center)**2 + (y - center)**2)
                    if dist <= center - 2:
                        img[y, x] = [*color, 255]
        
        elif icon_type == 'square':
            for y in range(size):
                for x in range(size):
                    if 4 <= x <= size - 5 and 4 <= y <= size - 5:
                        img[y, x] = [*color, 255]
        
        elif icon_type == 'triangle':
            for y in range(size):
                for x in range(size):
                    if y >= size // 2 and y <= size - 4:
                        width_at_y = (y - size // 2) * 0.8
                        if abs(x - center) <= width_at_y:
                            img[y, x] = [*color, 255]
        
        elif icon_type == 'star':
            for y in range(size):
                for x in range(size):
                    dx, dy = x - center, y - center
                    angle = math.atan2(dy, dx)
                    dist = math.sqrt(dx**2 + dy**2)
                    star_r = center * (0.5 + 0.5 * math.cos(5 * angle))
                    if dist <= star_r:
                        img[y, x] = [*color, 255]
        
        elif icon_type == 'heart':
            for y in range(size):
                for x in range(size):
                    dx = (x - center) / (size * 0.3)
                    dy = (y - center) / (size * 0.3)
                    if (dx**2 + dy**2 - 1)**3 - dx**2 * dy**3 <= 0:
                        img[y, x] = [*color, 255]
        
        return img


if __name__ == '__main__':
    print("Testing Procedural Image Generation...")
    
    # Test gradient
    gen = ProceduralImageGenerator()
    gradient = gen.generate_gradient(256, 256, [[255, 0, 0], [0, 0, 255]], 'horizontal')
    print(f"Gradient shape: {gradient.shape}")
    
    # Test pattern
    pattern = gen.generate_pattern(256, 256, 'checkerboard', color1=[255, 255, 255], color2=[0, 0, 0], size=32)
    print(f"Pattern shape: {pattern.shape}")
    
    # Test icon
    icon = gen.generate_icon(64, 'star', [255, 215, 0])
    print(f"Icon shape: {icon.shape}")
    
    print("All tests passed!")
