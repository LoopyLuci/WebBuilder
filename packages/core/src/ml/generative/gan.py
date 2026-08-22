"""Generative Adversarial Network (GAN) implementations.

Includes: Vanilla GAN, WGAN-GP, and StyleGAN-like architecture.
All models include generator, discriminator, and training loops.
"""

import numpy as np
from .base import Module, Dense, ReLU, LeakyReLU, Sigmoid, Tanh, Sequential, AdamOptimizer, GenerativeModel


class Generator(Module):
    """Generator network for GAN."""
    
    def __init__(self, latent_dim, hidden_dims, output_dim, output_activation='tanh'):
        super().__init__()
        self.latent_dim = latent_dim
        self.output_dim = output_dim
        
        layers = []
        prev_dim = latent_dim
        for h_dim in hidden_dims:
            layers.append(Dense(prev_dim, h_dim))
            layers.append(ReLU())
            prev_dim = h_dim
        layers.append(Dense(prev_dim, output_dim))
        
        if output_activation == 'tanh':
            layers.append(Tanh())
        elif output_activation == 'sigmoid':
            layers.append(Sigmoid())
        
        self.network = Sequential(*layers)
        self._training = True
    
    def forward(self, z):
        return self.network(z)
    
    def backward(self, dout):
        return self.network.backward(dout)
    
    def parameters(self):
        return self.network.parameters()
    
    def update_params(self, lr):
        self.network.update_params(lr)
    
    def train(self, mode=True):
        self._training = mode
        self.network.train(mode)
    
    def eval(self):
        self.train(False)


class Discriminator(Module):
    """Discriminator network for GAN."""
    
    def __init__(self, input_dim, hidden_dims, output_activation='sigmoid'):
        super().__init__()
        self.input_dim = input_dim
        
        layers = []
        prev_dim = input_dim
        for h_dim in hidden_dims:
            layers.append(Dense(prev_dim, h_dim))
            layers.append(LeakyReLU(0.2))
            prev_dim = h_dim
        layers.append(Dense(prev_dim, 1))
        
        if output_activation == 'sigmoid':
            layers.append(Sigmoid())
        
        self.network = Sequential(*layers)
        self._training = True
    
    def forward(self, x):
        return self.network(x)
    
    def backward(self, dout):
        return self.network.backward(dout)
    
    def parameters(self):
        return self.network.parameters()
    
    def update_params(self, lr):
        self.network.update_params(lr)
    
    def train(self, mode=True):
        self._training = mode
        self.network.train(mode)
    
    def eval(self):
        self.train(False)


class GAN(GenerativeModel):
    """Vanilla GAN with binary cross-entropy loss."""
    
    def __init__(self, latent_dim=100, g_hidden_dims=None, d_hidden_dims=None, 
                 data_dim=784, lr_g=0.0002, lr_d=0.0002):
        super().__init__(latent_dim, data_dim)
        
        if g_hidden_dims is None:
            g_hidden_dims = [256, 512, 1024]
        if d_hidden_dims is None:
            d_hidden_dims = [1024, 512, 256]
        
        self.generator = Generator(latent_dim, g_hidden_dims, data_dim, 'tanh')
        self.discriminator = Discriminator(data_dim, d_hidden_dims, 'sigmoid')
        
        self.lr_g = lr_g
        self.lr_d = lr_d
        
        # Optimizers will be initialized on first train step
        self.g_optimizer = None
        self.d_optimizer = None
    
    def generate(self, num_samples):
        """Generate samples from random noise."""
        z = self.sample_latent(num_samples)
        self.generator.eval()
        return self.generator(z)
    
    def compute_d_loss(self, real_data, fake_data):
        """Compute discriminator loss."""
        real_pred = self.discriminator(real_data)
        fake_pred = self.discriminator(fake_data)
        
        # Binary cross-entropy
        eps = 1e-8
        real_loss = -np.mean(np.log(real_pred + eps))
        fake_loss = -np.mean(np.log(1 - fake_pred + eps))
        d_loss = real_loss + fake_loss
        return d_loss
    
    def compute_g_loss(self, fake_data):
        """Compute generator loss."""
        fake_pred = self.discriminator(fake_data)
        eps = 1e-8
        g_loss = -np.mean(np.log(fake_pred + eps))
        return g_loss
    
    def train_step(self, real_data, batch_size=None):
        """Single training step."""
        if batch_size is None:
            batch_size = real_data.shape[0]
        
        # Initialize optimizers if needed
        if self.g_optimizer is None:
            self.g_optimizer = AdamOptimizer(
                self.generator.network.layers[0].params, 
                self.generator.network.layers[0].grads,
                lr=self.lr_g
            )
            self.d_optimizer = AdamOptimizer(
                self.discriminator.network.layers[0].params,
                self.discriminator.network.layers[0].grads,
                lr=self.lr_d
            )
        
        # === Train Discriminator ===
        z = self.sample_latent(batch_size)
        fake_data = self.generator(z)
        
        # Discriminator forward and backward
        real_pred = self.discriminator(real_data)
        fake_pred = self.discriminator(fake_data)
        
        eps = 1e-8
        # Gradients for BCE loss
        d_real_grad = -1.0 / (real_pred + eps) / batch_size
        d_fake_grad = 1.0 / (1 - fake_pred + eps) / batch_size
        
        # Backprop through discriminator
        self.discriminator.network.layers[-1].output = real_pred  # Sigmoid output
        dout_real = self.discriminator.backward(d_real_grad)
        self.discriminator.network.layers[-1].output = fake_pred
        dout_fake = self.discriminator.backward(d_fake_grad)
        
        # Update discriminator
        for layer in self.discriminator.network.layers:
            if hasattr(layer, 'params'):
                for key in layer.params:
                    if key in layer.grads:
                        layer.params[key] -= self.lr_d * layer.grads[key]
        
        # === Train Generator ===
        z = self.sample_latent(batch_size)
        fake_data = self.generator(z)
        fake_pred = self.discriminator(fake_data)
        
        # Generator wants discriminator to predict 1 for fake data
        g_loss_grad = -1.0 / (fake_pred + eps) / batch_size
        
        # Backprop through discriminator then generator
        dout = self.discriminator.backward(g_loss_grad)
        self.generator.backward(dout)
        
        # Update generator
        for layer in self.generator.network.layers:
            if hasattr(layer, 'params'):
                for key in layer.params:
                    if key in layer.grads:
                        layer.params[key] -= self.lr_g * layer.grads[key]
        
        # Compute losses for logging
        d_loss = self.compute_d_loss(real_data, fake_data)
        g_loss = self.compute_g_loss(fake_data)
        
        self.loss_history.append({'d_loss': d_loss, 'g_loss': g_loss})
        return {'d_loss': d_loss, 'g_loss': g_loss}
    
    def loss(self, data):
        """Compute both losses."""
        batch_size = data.shape[0]
        z = self.sample_latent(batch_size)
        fake_data = self.generator(z)
        d_loss = self.compute_d_loss(data, fake_data)
        g_loss = self.compute_g_loss(fake_data)
        return {'d_loss': d_loss, 'g_loss': g_loss}


class WGAN_GP(GenerativeModel):
    """Wasserstein GAN with Gradient Penalty."""
    
    def __init__(self, latent_dim=100, g_hidden_dims=None, d_hidden_dims=None,
                 data_dim=784, lr_g=0.0001, lr_d=0.0001, lambda_gp=10, n_critic=5):
        super().__init__(latent_dim, data_dim)
        
        if g_hidden_dims is None:
            g_hidden_dims = [256, 512, 1024]
        if d_hidden_dims is None:
            d_hidden_dims = [1024, 512, 256]
        
        self.generator = Generator(latent_dim, g_hidden_dims, data_dim, 'tanh')
        # WGAN discriminator has no output activation (linear)
        self.discriminator = Discriminator(data_dim, d_hidden_dims, None)
        
        self.lr_g = lr_g
        self.lr_d = lr_d
        self.lambda_gp = lambda_gp
        self.n_critic = n_critic
        self.step_count = 0
    
    def generate(self, num_samples):
        """Generate samples from random noise."""
        z = self.sample_latent(num_samples)
        self.generator.eval()
        return self.generator(z)
    
    def gradient_penalty(self, real_data, fake_data):
        """Compute gradient penalty for WGAN-GP."""
        batch_size = real_data.shape[0]
        alpha = np.random.rand(batch_size, 1)
        interpolated = alpha * real_data + (1 - alpha) * fake_data
        
        # Forward pass
        pred = self.discriminator(interpolated)
        
        # Gradient w.r.t. interpolated
        dout = np.ones_like(pred)
        grad = self.discriminator.backward(dout)
        
        # Compute gradient penalty
        grad_norm = np.sqrt(np.sum(grad ** 2, axis=1) + 1e-8)
        gp = np.mean((grad_norm - 1.0) ** 2)
        
        return gp
    
    def train_step(self, real_data, batch_size=None):
        """Single training step for WGAN-GP."""
        if batch_size is None:
            batch_size = real_data.shape[0]
        
        self.step_count += 1
        
        # Train discriminator (n_critic times per generator step)
        z = self.sample_latent(batch_size)
        fake_data = self.generator(z)
        
        real_pred = self.discriminator(real_data)
        fake_pred = self.discriminator(fake_data)
        
        # Wasserstein loss with gradient penalty
        d_loss = np.mean(fake_pred) - np.mean(real_pred)
        gp = self.gradient_penalty(real_data, fake_data)
        d_loss_total = d_loss + self.lambda_gp * gp
        
        # Update discriminator (gradient descent, so minimize -d_loss for real > fake)
        # Since we maximize E[real] - E[fake], we minimize E[fake] - E[real]
        # Gradient for real data: -1/batch_size, for fake: 1/batch_size
        dout_real = -np.ones((batch_size, 1)) / batch_size
        dout_fake = np.ones((batch_size, 1)) / batch_size
        
        self.discriminator.backward(dout_real)
        self.discriminator.backward(dout_fake)
        
        for layer in self.discriminator.network.layers:
            if hasattr(layer, 'params'):
                for key in layer.params:
                    if key in layer.grads:
                        layer.params[key] -= self.lr_d * layer.grads[key]
        
        # Train generator every n_critic steps
        g_loss = 0
        if self.step_count % self.n_critic == 0:
            z = self.sample_latent(batch_size)
            fake_data = self.generator(z)
            fake_pred = self.discriminator(fake_data)
            
            g_loss = -np.mean(fake_pred)
            
            # Backprop through discriminator to generator
            dout = -np.ones((batch_size, 1)) / batch_size
            dout = self.discriminator.backward(dout)
            self.generator.backward(dout)
            
            for layer in self.generator.network.layers:
                if hasattr(layer, 'params'):
                    for key in layer.params:
                        if key in layer.grads:
                            layer.params[key] -= self.lr_g * layer.grads[key]
        
        self.loss_history.append({'d_loss': d_loss_total, 'g_loss': g_loss})
        return {'d_loss': d_loss_total, 'g_loss': g_loss}
    
    def loss(self, data):
        batch_size = data.shape[0]
        z = self.sample_latent(batch_size)
        fake_data = self.generator(z)
        real_pred = self.discriminator(data)
        fake_pred = self.discriminator(fake_data)
        d_loss = np.mean(fake_pred) - np.mean(real_pred)
        g_loss = -np.mean(fake_pred)
        return {'d_loss': d_loss, 'g_loss': g_loss}


class StyleMappingNetwork(Module):
    """Style mapping network for StyleGAN-like architecture."""
    
    def __init__(self, latent_dim, hidden_dim=512, num_layers=8):
        super().__init__()
        self.latent_dim = latent_dim
        
        layers = []
        prev_dim = latent_dim
        for _ in range(num_layers):
            layers.append(Dense(prev_dim, hidden_dim))
            layers.append(LeakyReLU(0.2))
            prev_dim = hidden_dim
        
        self.network = Sequential(*layers)
        self._training = True
    
    def forward(self, z):
        return self.network(z)
    
    def backward(self, dout):
        return self.network.backward(dout)
    
    def parameters(self):
        return self.network.parameters()
    
    def update_params(self, lr):
        self.network.update_params(lr)


class StyleGenerator(Module):
    """StyleGAN-like generator with style-based generation."""
    
    def __init__(self, latent_dim, hidden_dim, output_dim, num_style_layers=8):
        super().__init__()
        self.latent_dim = latent_dim
        
        # Mapping network
        self.mapping = StyleMappingNetwork(latent_dim, hidden_dim, num_style_layers)
        
        # Synthesis network (simple MLP version)
        layers = []
        prev_dim = hidden_dim
        for _ in range(4):
            layers.append(Dense(prev_dim, hidden_dim))
            layers.append(LeakyReLU(0.2))
            prev_dim = hidden_dim
        layers.append(Dense(prev_dim, output_dim))
        layers.append(Tanh())
        
        self.synthesis = Sequential(*layers)
        self._training = True
    
    def forward(self, z):
        style = self.mapping(z)
        return self.synthesis(style)
    
    def backward(self, dout):
        dout = self.synthesis.backward(dout)
        return self.mapping.backward(dout)
    
    def parameters(self):
        params = {}
        for k, v in self.mapping.parameters().items():
            params[f'mapping_{k}'] = v
        for k, v in self.synthesis.parameters().items():
            params[f'synthesis_{k}'] = v
        return params
    
    def update_params(self, lr):
        self.mapping.update_params(lr)
        self.synthesis.update_params(lr)
    
    def train(self, mode=True):
        self._training = mode
        self.mapping.train(mode)
        self.synthesis.train(mode)
    
    def eval(self):
        self.train(False)


class StyleGAN(GenerativeModel):
    """StyleGAN-like generative model."""
    
    def __init__(self, latent_dim=512, hidden_dim=512, data_dim=784,
                 lr_g=0.0001, lr_d=0.0001, lambda_gp=10):
        super().__init__(latent_dim, data_dim)
        
        self.generator = StyleGenerator(latent_dim, hidden_dim, data_dim)
        self.discriminator = Discriminator(data_dim, [1024, 512, 256], None)
        
        self.lr_g = lr_g
        self.lr_d = lr_d
        self.lambda_gp = lambda_gp
    
    def generate(self, num_samples):
        z = self.sample_latent(num_samples)
        self.generator.eval()
        return self.generator(z)
    
    def train_step(self, real_data, batch_size=None):
        if batch_size is None:
            batch_size = real_data.shape[0]
        
        # Train discriminator
        z = self.sample_latent(batch_size)
        fake_data = self.generator(z)
        
        real_pred = self.discriminator(real_data)
        fake_pred = self.discriminator(fake_data)
        
        d_loss = np.mean(fake_pred) - np.mean(real_pred)
        
        # Update discriminator
        dout_real = -np.ones((batch_size, 1)) / batch_size
        dout_fake = np.ones((batch_size, 1)) / batch_size
        self.discriminator.backward(dout_real)
        self.discriminator.backward(dout_fake)
        
        for layer in self.discriminator.network.layers:
            if hasattr(layer, 'params'):
                for key in layer.params:
                    if key in layer.grads:
                        layer.params[key] -= self.lr_d * layer.grads[key]
        
        # Train generator
        z = self.sample_latent(batch_size)
        fake_data = self.generator(z)
        fake_pred = self.discriminator(fake_data)
        
        g_loss = -np.mean(fake_pred)
        
        dout = -np.ones((batch_size, 1)) / batch_size
        dout = self.discriminator.backward(dout)
        self.generator.backward(dout)
        
        self.generator.update_params(self.lr_g)
        
        self.loss_history.append({'d_loss': d_loss, 'g_loss': g_loss})
        return {'d_loss': d_loss, 'g_loss': g_loss}
    
    def loss(self, data):
        batch_size = data.shape[0]
        z = self.sample_latent(batch_size)
        fake_data = self.generator(z)
        real_pred = self.discriminator(data)
        fake_pred = self.discriminator(fake_data)
        d_loss = np.mean(fake_pred) - np.mean(real_pred)
        g_loss = -np.mean(fake_pred)
        return {'d_loss': d_loss, 'g_loss': g_loss}