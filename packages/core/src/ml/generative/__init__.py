"""Generative model framework.

A comprehensive collection of generative models implemented from scratch using NumPy:
- GAN (Generative Adversarial Networks): Vanilla GAN, WGAN-GP, StyleGAN-like
- VAE (Variational Autoencoders): Vanilla VAE, Beta-VAE, Conditional VAE
- Diffusion Models: DDPM, DDIM, U-Net denoising architecture
- Normalizing Flows: RealNVP, Glow
- Autoregressive Models: PixelCNN, WaveNet
"""

from .base import Module, Dense, ReLU, LeakyReLU, Sigmoid, Tanh, BatchNorm, Sequential, AdamOptimizer, GenerativeModel
from .gan import GAN, WGAN_GP, StyleGAN, Generator, Discriminator
from .vae import VAE, BetaVAE, ConditionalVAE, Encoder, Decoder
from .diffusion import DDPM, DDIM, UNetDenoiser, SimpleDenoiser, NoiseSchedule
from .flows import RealNVP, Glow, CouplingLayer
from .autoregressive import PixelCNN, WaveNet

__all__ = [
    # Base
    'Module', 'Dense', 'ReLU', 'LeakyReLU', 'Sigmoid', 'Tanh', 'BatchNorm',
    'Sequential', 'AdamOptimizer', 'GenerativeModel',
    # GAN
    'GAN', 'WGAN_GP', 'StyleGAN', 'Generator', 'Discriminator',
    # VAE
    'VAE', 'BetaVAE', 'ConditionalVAE', 'Encoder', 'Decoder',
    # Diffusion
    'DDPM', 'DDIM', 'UNetDenoiser', 'SimpleDenoiser', 'NoiseSchedule',
    # Flows
    'RealNVP', 'Glow', 'CouplingLayer',
    # Autoregressive
    'PixelCNN', 'WaveNet',
]