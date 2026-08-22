"""Variational Autoencoder (VAE) implementations.

Includes: Vanilla VAE, Beta-VAE, and Conditional VAE.
All models include encoder, decoder, and training procedures.
"""

import numpy as np
from .base import Module, Dense, ReLU, LeakyReLU, Sigmoid, Tanh, Sequential, AdamOptimizer, GenerativeModel


class Encoder(Module):
    """Encoder network: maps data to latent distribution parameters."""
    
    def __init__(self, input_dim, hidden_dims, latent_dim):
        super().__init__()
        self.input_dim = input_dim
        self.latent_dim = latent_dim
        
        layers = []
        prev_dim = input_dim
        for h_dim in hidden_dims:
            layers.append(Dense(prev_dim, h_dim))
            layers.append(ReLU())
            prev_dim = h_dim
        
        self.network = Sequential(*layers)
        
        # Output layers for mean and log variance
        self.mu_layer = Dense(prev_dim, latent_dim)
        self.logvar_layer = Dense(prev_dim, latent_dim)
        
        self._training = True
    
    def forward(self, x):
        h = self.network(x)
        mu = self.mu_layer(h)
        logvar = self.logvar_layer(h)
        return mu, logvar
    
    def backward(self, dout_mu, dout_logvar):
        dout = self.mu_layer.backward(dout_mu) + self.logvar_layer.backward(dout_logvar)
        return self.network.backward(dout)
    
    def parameters(self):
        params = {}
        for k, v in self.network.parameters().items():
            params[f'network_{k}'] = v
        for k, v in self.mu_layer.params.items():
            params[f'mu_{k}'] = v
        for k, v in self.logvar_layer.params.items():
            params[f'logvar_{k}'] = v
        return params
    
    def update_params(self, lr):
        self.network.update_params(lr)
        self.mu_layer.update_params(lr)
        self.logvar_layer.update_params(lr)
    
    def train(self, mode=True):
        self._training = mode
        self.network.train(mode)
    
    def eval(self):
        self.train(False)


class Decoder(Module):
    """Decoder network: maps latent code to reconstructed data."""
    
    def __init__(self, latent_dim, hidden_dims, output_dim, output_activation='sigmoid'):
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
        
        if output_activation == 'sigmoid':
            layers.append(Sigmoid())
        elif output_activation == 'tanh':
            layers.append(Tanh())
        
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


def reparameterize(mu, logvar):
    """Reparameterization trick: z = mu + sigma * epsilon."""
    std = np.exp(0.5 * logvar)
    eps = np.random.randn(*std.shape)
    return mu + std * eps, eps, std


class VAE(GenerativeModel):
    """Vanilla Variational Autoencoder."""
    
    def __init__(self, data_dim=784, latent_dim=20, hidden_dims=None, lr=0.001):
        super().__init__(latent_dim, data_dim)
        
        if hidden_dims is None:
            hidden_dims = [512, 256]
        
        self.encoder = Encoder(data_dim, hidden_dims, latent_dim)
        self.decoder = Decoder(latent_dim, list(reversed(hidden_dims)), data_dim, 'sigmoid')
        
        self.lr = lr
        self._training = True
    
    def encode(self, x):
        """Encode data to latent parameters."""
        return self.encoder(x)
    
    def decode(self, z):
        """Decode latent code to data."""
        return self.decoder(z)
    
    def forward(self, x):
        """Full forward pass."""
        mu, logvar = self.encoder(x)
        z, eps, std = reparameterize(mu, logvar)
        recon = self.decoder(z)
        return recon, mu, logvar, z
    
    def generate(self, num_samples):
        """Generate samples from prior."""
        z = self.sample_latent(num_samples)
        self.decoder.eval()
        return self.decoder(z)
    
    def reconstruct(self, x):
        """Reconstruct input data."""
        self.encoder.eval()
        self.decoder.eval()
        mu, _ = self.encoder(x)
        return self.decoder(mu)
    
    def compute_loss(self, x, recon, mu, logvar):
        """Compute VAE loss = reconstruction + KL divergence."""
        # Binary cross-entropy reconstruction loss
        eps = 1e-8
        recon_loss = -np.mean(np.sum(x * np.log(recon + eps) + (1 - x) * np.log(1 - recon + eps), axis=1))
        
        # KL divergence: -0.5 * sum(1 + logvar - mu^2 - exp(logvar))
        kl_loss = -0.5 * np.mean(np.sum(1 + logvar - mu ** 2 - np.exp(logvar), axis=1))
        
        return recon_loss + kl_loss, recon_loss, kl_loss
    
    def train_step(self, x):
        """Single training step."""
        batch_size = x.shape[0]
        
        # Forward pass
        mu, logvar = self.encoder(x)
        z, eps, std = reparameterize(mu, logvar)
        recon = self.decoder(z)
        
        # Compute loss
        eps_val = 1e-8
        recon_loss = -np.mean(np.sum(x * np.log(recon + eps_val) + (1 - x) * np.log(1 - recon + eps_val), axis=1))
        kl_loss = -0.5 * np.mean(np.sum(1 + logvar - mu ** 2 - np.exp(logvar), axis=1))
        total_loss = recon_loss + kl_loss
        
        # Backward pass
        # Gradient of reconstruction loss w.r.t. recon
        dout_recon = -(x / (recon + eps_val) - (1 - x) / (1 - recon + eps_val)) / batch_size
        
        # Through decoder
        dout_z = self.decoder.backward(dout_recon)
        
        # Through reparameterization
        dout_mu = dout_z.copy()
        dout_std = dout_z * eps
        dout_logvar = dout_std * 0.5 * std
        
        # Add KL gradient
        dout_mu += -mu / batch_size
        dout_logvar += -0.5 * (1 - np.exp(-logvar)) / batch_size
        
        # Through encoder
        self.encoder.backward(dout_mu, dout_logvar)
        
        # Update parameters
        self.encoder.update_params(self.lr)
        self.decoder.update_params(self.lr)
        
        self.loss_history.append({
            'total': total_loss, 
            'reconstruction': recon_loss, 
            'kl': kl_loss
        })
        
        return {'total': total_loss, 'reconstruction': recon_loss, 'kl': kl_loss}
    
    def loss(self, data):
        recon, mu, logvar, _ = self.forward(data)
        total, recon_loss, kl = self.compute_loss(data, recon, mu, logvar)
        return {'total': total, 'reconstruction': recon_loss, 'kl': kl}


class BetaVAE(GenerativeModel):
    """Beta-VAE with controllable KL divergence weight.
    
    The beta parameter controls the trade-off between reconstruction quality
    and latent space regularity. Higher beta encourages more disentangled
    representations.
    """
    
    def __init__(self, data_dim=784, latent_dim=20, hidden_dims=None, 
                 beta=4.0, lr=0.001):
        super().__init__(latent_dim, data_dim)
        
        if hidden_dims is None:
            hidden_dims = [512, 256]
        
        self.beta = beta
        self.encoder = Encoder(data_dim, hidden_dims, latent_dim)
        self.decoder = Decoder(latent_dim, list(reversed(hidden_dims)), data_dim, 'sigmoid')
        
        self.lr = lr
        self._training = True
    
    def generate(self, num_samples):
        z = self.sample_latent(num_samples)
        self.decoder.eval()
        return self.decoder(z)
    
    def train_step(self, x):
        batch_size = x.shape[0]
        
        mu, logvar = self.encoder(x)
        z, eps, std = reparameterize(mu, logvar)
        recon = self.decoder(z)
        
        eps_val = 1e-8
        recon_loss = -np.mean(np.sum(x * np.log(recon + eps_val) + (1 - x) * np.log(1 - recon + eps_val), axis=1))
        kl_loss = -0.5 * np.mean(np.sum(1 + logvar - mu ** 2 - np.exp(logvar), axis=1))
        total_loss = recon_loss + self.beta * kl_loss
        
        # Backward
        dout_recon = -(x / (recon + eps_val) - (1 - x) / (1 - recon + eps_val)) / batch_size
        dout_z = self.decoder.backward(dout_recon)
        
        dout_mu = dout_z.copy()
        dout_std = dout_z * eps
        dout_logvar = dout_std * 0.5 * std
        
        dout_mu += -self.beta * mu / batch_size
        dout_logvar += -self.beta * 0.5 * (1 - np.exp(-logvar)) / batch_size
        
        self.encoder.backward(dout_mu, dout_logvar)
        
        self.encoder.update_params(self.lr)
        self.decoder.update_params(self.lr)
        
        self.loss_history.append({
            'total': total_loss,
            'reconstruction': recon_loss,
            'kl': kl_loss
        })
        
        return {'total': total_loss, 'reconstruction': recon_loss, 'kl': kl}
    
    def loss(self, data):
        batch_size = data.shape[0]
        mu, logvar = self.encoder(data)
        z, _, _ = reparameterize(mu, logvar)
        recon = self.decoder(z)
        
        eps_val = 1e-8
        recon_loss = -np.mean(np.sum(data * np.log(recon + eps_val) + (1 - data) * np.log(1 - recon + eps_val), axis=1))
        kl_loss = -0.5 * np.mean(np.sum(1 + logvar - mu ** 2 - np.exp(logvar), axis=1))
        
        return {'total': recon_loss + self.beta * kl_loss, 'reconstruction': recon_loss, 'kl': kl_loss}


class ConditionalEncoder(Module):
    """Conditional encoder that incorporates label information."""
    
    def __init__(self, input_dim, condition_dim, hidden_dims, latent_dim):
        super().__init__()
        self.input_dim = input_dim
        self.latent_dim = latent_dim
        
        layers = []
        prev_dim = input_dim + condition_dim
        for h_dim in hidden_dims:
            layers.append(Dense(prev_dim, h_dim))
            layers.append(ReLU())
            prev_dim = h_dim
        
        self.network = Sequential(*layers)
        self.mu_layer = Dense(prev_dim, latent_dim)
        self.logvar_layer = Dense(prev_dim, latent_dim)
        
        self._training = True
    
    def forward(self, x, condition):
        x_cond = np.concatenate([x, condition], axis=1)
        h = self.network(x_cond)
        mu = self.mu_layer(h)
        logvar = self.logvar_layer(h)
        return mu, logvar
    
    def backward(self, dout_mu, dout_logvar):
        dout = self.mu_layer.backward(dout_mu) + self.logvar_layer.backward(dout_logvar)
        return self.network.backward(dout)
    
    def parameters(self):
        params = {}
        for k, v in self.network.parameters().items():
            params[f'network_{k}'] = v
        for k, v in self.mu_layer.params.items():
            params[f'mu_{k}'] = v
        for k, v in self.logvar_layer.params.items():
            params[f'logvar_{k}'] = v
        return params
    
    def update_params(self, lr):
        self.network.update_params(lr)
        self.mu_layer.update_params(lr)
        self.logvar_layer.update_params(lr)


class ConditionalDecoder(Module):
    """Conditional decoder that incorporates label information."""
    
    def __init__(self, latent_dim, condition_dim, hidden_dims, output_dim, output_activation='sigmoid'):
        super().__init__()
        self.latent_dim = latent_dim
        self.output_dim = output_dim
        
        layers = []
        prev_dim = latent_dim + condition_dim
        for h_dim in hidden_dims:
            layers.append(Dense(prev_dim, h_dim))
            layers.append(ReLU())
            prev_dim = h_dim
        layers.append(Dense(prev_dim, output_dim))
        
        if output_activation == 'sigmoid':
            layers.append(Sigmoid())
        
        self.network = Sequential(*layers)
        self._training = True
    
    def forward(self, z, condition):
        z_cond = np.concatenate([z, condition], axis=1)
        return self.network(z_cond)
    
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


class ConditionalVAE(GenerativeModel):
    """Conditional VAE for label-conditioned generation."""
    
    def __init__(self, data_dim=784, latent_dim=20, condition_dim=10, 
                 hidden_dims=None, lr=0.001):
        super().__init__(latent_dim, data_dim)
        
        if hidden_dims is None:
            hidden_dims = [512, 256]
        
        self.condition_dim = condition_dim
        self.encoder = ConditionalEncoder(data_dim, condition_dim, hidden_dims, latent_dim)
        self.decoder = ConditionalDecoder(latent_dim, condition_dim, list(reversed(hidden_dims)), data_dim, 'sigmoid')
        
        self.lr = lr
        self._training = True
    
    def generate(self, num_samples, condition=None):
        """Generate samples conditioned on labels."""
        z = self.sample_latent(num_samples)
        if condition is None:
            condition = np.eye(self.condition_dim)[np.random.randint(0, self.condition_dim, num_samples)]
        self.decoder.eval()
        return self.decoder(z, condition)
    
    def train_step(self, x, condition):
        """Single training step with conditioning."""
        batch_size = x.shape[0]
        
        mu, logvar = self.encoder(x, condition)
        z, eps, std = reparameterize(mu, logvar)
        recon = self.decoder(z, condition)
        
        eps_val = 1e-8
        recon_loss = -np.mean(np.sum(x * np.log(recon + eps_val) + (1 - x) * np.log(1 - recon + eps_val), axis=1))
        kl_loss = -0.5 * np.mean(np.sum(1 + logvar - mu ** 2 - np.exp(logvar), axis=1))
        total_loss = recon_loss + kl_loss
        
        dout_recon = -(x / (recon + eps_val) - (1 - x) / (1 - recon + eps_val)) / batch_size
        dout_z = self.decoder.backward(dout_recon)
        
        dout_mu = dout_z.copy()
        dout_std = dout_z * eps
        dout_logvar = dout_std * 0.5 * std
        
        dout_mu += -mu / batch_size
        dout_logvar += -0.5 * (1 - np.exp(-logvar)) / batch_size
        
        self.encoder.backward(dout_mu, dout_logvar)
        
        self.encoder.update_params(self.lr)
        self.decoder.update_params(self.lr)
        
        self.loss_history.append({
            'total': total_loss,
            'reconstruction': recon_loss,
            'kl': kl_loss
        })
        
        return {'total': total_loss, 'reconstruction': recon_loss, 'kl': kl_loss}
    
    def loss(self, data, condition):
        mu, logvar = self.encoder(data, condition)
        z, _, _ = reparameterize(mu, logvar)
        recon = self.decoder(z, condition)
        
        eps_val = 1e-8
        recon_loss = -np.mean(np.sum(data * np.log(recon + eps_val) + (1 - data) * np.log(1 - recon + eps_val), axis=1))
        kl_loss = -0.5 * np.mean(np.sum(1 + logvar - mu ** 2 - np.exp(logvar), axis=1))
        
        return {'total': recon_loss + kl_loss, 'reconstruction': recon_loss, 'kl': kl_loss}