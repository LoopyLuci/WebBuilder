"""Diffusion Model implementations.

Includes: DDPM (Denoising Diffusion Probabilistic Models), DDIM (Denoising Diffusion
Implicit Models), U-Net denoising architecture, forward/reverse diffusion processes,
and noise schedules (linear, cosine).
"""

import numpy as np
from .base import Module, Dense, ReLU, LeakyReLU, Sigmoid, Sequential, AdamOptimizer, GenerativeModel


def linear_noise_schedule(timesteps, beta_start=1e-4, beta_end=0.02):
    """Linear noise schedule for beta values."""
    return np.linspace(beta_start, beta_end, timesteps)


def cosine_noise_schedule(timesteps, s=0.008):
    """Cosine noise schedule as proposed in Improved DDPM."""
    t = np.linspace(0, timesteps, timesteps + 1)
    alpha_bar = np.cos((t / timesteps + s) / (1 + s) * np.pi * 0.5) ** 2
    alpha_bar = alpha_bar / alpha_bar[0]
    betas = 1 - (alpha_bar[1:] / alpha_bar[:-1])
    return np.clip(betas, 0.0001, 0.999)


def get_noise_schedule(name, timesteps, **kwargs):
    """Get noise schedule by name."""
    if name == 'linear':
        return linear_noise_schedule(timesteps, **kwargs)
    elif name == 'cosine':
        return cosine_noise_schedule(timesteps, **kwargs)
    else:
        raise ValueError(f"Unknown noise schedule: {name}")


class NoiseSchedule:
    """Precomputed noise schedule for diffusion process."""
    
    def __init__(self, timesteps=1000, schedule_type='linear'):
        self.timesteps = timesteps
        self.betas = get_noise_schedule(schedule_type, timesteps)
        self.alphas = 1.0 - self.betas
        self.alpha_bars = np.cumprod(self.alphas)
        self.alpha_bars_prev = np.concatenate([[1.0], self.alpha_bars[:-1]])
        
        # Precompute useful quantities
        self.sqrt_alpha_bars = np.sqrt(self.alpha_bars)
        self.sqrt_one_minus_alpha_bars = np.sqrt(1.0 - self.alpha_bars)
        self.sqrt_recip_alpha_bars = 1.0 / np.sqrt(self.alphas)
        self.posterior_variance = self.betas * (1.0 - self.alpha_bars_prev) / (1.0 - self.alpha_bars)
    
    def add_noise(self, x_0, t):
        """Add noise to data at timestep t (forward diffusion)."""
        batch_size = x_0.shape[0]
        # Sample random timesteps if scalar
        if np.isscalar(t):
            t = np.full(batch_size, t)
        
        sqrt_alpha_bar = self.sqrt_alpha_bars[t][:, np.newaxis]
        sqrt_one_minus_alpha_bar = self.sqrt_one_minus_alpha_bars[t][:, np.newaxis]
        
        noise = np.random.randn(*x_0.shape)
        x_t = sqrt_alpha_bar * x_0 + sqrt_one_minus_alpha_bar * noise
        
        return x_t, noise, t
    
    def sample_timestep(self, batch_size):
        """Sample random timesteps."""
        return np.random.randint(0, self.timesteps, batch_size)


class TimeEmbedding(Module):
    """Time step embedding using sinusoidal positions."""
    
    def __init__(self, embed_dim, max_len=10000):
        super().__init__()
        self.embed_dim = embed_dim
        
        # Precompute sinusoidal embeddings
        position = np.arange(max_len)[:, np.newaxis]
        div_term = np.exp(np.arange(0, embed_dim, 2) * -(np.log(max_len) / embed_dim))
        
        pe = np.zeros((max_len, embed_dim))
        pe[:, 0::2] = np.sin(position * div_term)
        pe[:, 1::2] = np.cos(position * div_term[:pe[:, 1::2].shape[1]])
        
        self.pe = pe
        self.cache = None
    
    def forward(self, t):
        """Embed timesteps."""
        self.cache = t
        return self.pe[t % len(self.pe)]
    
    def backward(self, dout):
        """No gradient for fixed embedding."""
        return np.zeros_like(dout)


class ResidualBlock(Module):
    """Residual block with time conditioning."""
    
    def __init__(self, in_features, out_features, time_embed_dim):
        super().__init__()
        self.in_features = in_features
        self.out_features = out_features
        
        # Main path
        self.fc1 = Dense(in_features, out_features)
        self.fc2 = Dense(out_features, out_features)
        
        # Time embedding projection
        self.time_proj = Dense(time_embed_dim, out_features)
        
        # Shortcut connection
        self.shortcut = Dense(in_features, out_features) if in_features != out_features else None
        
        self._training = True
    
    def forward(self, x, t_embed):
        h = self.fc1(x)
        h = np.maximum(0, h)  # ReLU
        
        # Add time embedding
        t_proj = self.time_proj(t_embed)
        h = h + t_proj
        
        h = self.fc2(h)
        h = np.maximum(0, h)
        
        # Residual connection
        if self.shortcut is not None:
            h = h + self.shortcut(x)
        else:
            h = h + x
        
        return h
    
    def backward(self, dout):
        # Simplified backward pass
        if self.shortcut is not None:
            return self.shortcut.backward(dout)
        return dout
    
    def parameters(self):
        params = {}
        for layer in [self.fc1, self.fc2, self.time_proj]:
            for k, v in layer.params.items():
                params[f'{layer.__class__.__name__}_{k}'] = v
        if self.shortcut is not None:
            for k, v in self.shortcut.params.items():
                params[f'shortcut_{k}'] = v
        return params
    
    def update_params(self, lr):
        self.fc1.update_params(lr)
        self.fc2.update_params(lr)
        self.time_proj.update_params(lr)
        if self.shortcut is not None:
            self.shortcut.update_params(lr)


class UNetDenoiser(Module):
    """Simplified U-Net architecture for denoising diffusion models."""
    
    def __init__(self, data_dim, hidden_dims=None, time_embed_dim=128, num_resblocks=2):
        super().__init__()
        self.data_dim = data_dim
        self.time_embed_dim = time_embed_dim
        
        if hidden_dims is None:
            hidden_dims = [256, 512, 256]
        
        # Time embedding
        self.time_embed = TimeEmbedding(time_embed_dim)
        
        # Encoder (downsampling path)
        self.encoder_blocks = []
        prev_dim = data_dim
        for h_dim in hidden_dims:
            self.encoder_blocks.append(ResidualBlock(prev_dim, h_dim, time_embed_dim))
            prev_dim = h_dim
        
        # Bottleneck
        self.bottleneck = ResidualBlock(prev_dim, prev_dim, time_embed_dim)
        
        # Decoder (upsampling path)
        self.decoder_blocks = []
        for h_dim in reversed(hidden_dims[:-1]):
            self.decoder_blocks.append(ResidualBlock(prev_dim + h_dim, h_dim, time_embed_dim))
            prev_dim = h_dim
        
        # Output layer
        self.output_layer = Dense(prev_dim, data_dim)
        
        self._training = True
    
    def forward(self, x, t):
        """Forward pass predicting noise."""
        # Time embedding
        t_embed = self.time_embed(t)
        
        # Encoder
        encoder_features = []
        h = x
        for block in self.encoder_blocks:
            h = block(h, t_embed)
            encoder_features.append(h)
        
        # Bottleneck
        h = self.bottleneck(h, t_embed)
        
        # Decoder with skip connections
        for i, block in enumerate(self.decoder_blocks):
            skip = encoder_features[-(i + 2)]
            h = np.concatenate([h, skip], axis=1)
            h = block(h, t_embed)
        
        # Output
        return self.output_layer(h)
    
    def backward(self, dout):
        """Simplified backward pass."""
        # In a full implementation, this would propagate through all layers
        # For simplicity, we approximate gradients
        return dout
    
    def parameters(self):
        params = {}
        for i, block in enumerate(self.encoder_blocks):
            for k, v in block.parameters().items():
                params[f'enc_{i}_{k}'] = v
        for k, v in self.bottleneck.parameters().items():
            params[f'bottleneck_{k}'] = v
        for i, block in enumerate(self.decoder_blocks):
            for k, v in block.parameters().items():
                params[f'dec_{i}_{k}'] = v
        for k, v in self.output_layer.params.items():
            params[f'output_{k}'] = v
        return params
    
    def update_params(self, lr):
        for block in self.encoder_blocks:
            block.update_params(lr)
        self.bottleneck.update_params(lr)
        for block in self.decoder_blocks:
            block.update_params(lr)
        self.output_layer.update_params(lr)
    
    def train(self, mode=True):
        self._training = mode
    
    def eval(self):
        self._training = False


class SimpleDenoiser(Module):
    """Simplified denoiser MLP for diffusion models."""
    
    def __init__(self, data_dim, hidden_dim=256, time_embed_dim=128, num_layers=4):
        super().__init__()
        self.data_dim = data_dim
        
        # Time embedding
        self.time_embed = TimeEmbedding(time_embed_dim)
        
        # Main network
        layers = []
        prev_dim = data_dim + time_embed_dim
        for _ in range(num_layers):
            layers.append(Dense(prev_dim, hidden_dim))
            layers.append(ReLU())
            prev_dim = hidden_dim
        layers.append(Dense(prev_dim, data_dim))
        
        self.network = Sequential(*layers)
        self._training = True
    
    def forward(self, x, t):
        t_embed = self.time_embed(t)
        # Flatten and concatenate
        x_flat = x.reshape(x.shape[0], -1)
        xt = np.concatenate([x_flat, t_embed], axis=1)
        return self.network(xt)
    
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


class DDPM(GenerativeModel):
    """Denoising Diffusion Probabilistic Model (DDPM)."""
    
    def __init__(self, data_dim=784, hidden_dim=256, timesteps=1000, 
                 schedule_type='linear', lr=0.0001):
        super().__init__(latent_dim=data_dim, data_dim=data_dim)
        
        self.timesteps = timesteps
        self.noise_schedule = NoiseSchedule(timesteps, schedule_type)
        self.denoiser = SimpleDenoiser(data_dim, hidden_dim)
        
        self.lr = lr
        self._training = True
    
    def forward_diffusion(self, x_0, t):
        """Apply forward diffusion process."""
        return self.noise_schedule.add_noise(x_0, t)
    
    def reverse_step(self, x_t, t, dt=1):
        """Single reverse diffusion step."""
        batch_size = x_t.shape[0]
        if np.isscalar(t):
            t_arr = np.full(batch_size, t)
        else:
            t_arr = t
        
        # Predict noise
        predicted_noise = self.denoiser(x_t, t_arr)
        
        # Get schedule values
        alpha = self.noise_schedule.alphas[t_arr][:, np.newaxis]
        alpha_bar = self.noise_schedule.alpha_bars[t_arr][:, np.newaxis]
        beta = self.noise_schedule.betas[t_arr][:, np.newaxis]
        
        # Compute mean
        sqrt_recip_alpha = (1.0 / np.sqrt(alpha))
        mean = sqrt_recip_alpha * (x_t - (beta / np.sqrt(1.0 - alpha_bar)) * predicted_noise)
        
        # Add noise (except at t=0)
        if t > 0:
            noise = np.random.randn(*x_t.shape)
            sigma = np.sqrt(beta)
            x_prev = mean + sigma * noise
        else:
            x_prev = mean
        
        return x_prev
    
    def generate(self, num_samples):
        """Generate samples using full reverse diffusion."""
        self.denoiser.eval()
        
        # Start from pure noise
        x_t = np.random.randn(num_samples, self.data_dim)
        
        # Reverse diffusion
        for t in range(self.timesteps - 1, -1, -1):
            x_t = self.reverse_step(x_t, t)
        
        return x_t
    
    def train_step(self, x_0):
        """Single training step."""
        batch_size = x_0.shape[0]
        
        # Sample timesteps
        t = self.noise_schedule.sample_timestep(batch_size)
        
        # Add noise
        x_t, noise, t = self.forward_diffusion(x_0, t)
        
        # Predict noise
        predicted_noise = self.denoiser(x_t, t)
        
        # Compute loss (MSE between predicted and actual noise)
        loss = np.mean((predicted_noise - noise) ** 2)
        
        # Backward pass
        dout = 2.0 * (predicted_noise - noise) / batch_size
        self.denoiser.backward(dout)
        
        # Update parameters
        self.denoiser.update_params(self.lr)
        
        self.loss_history.append({'loss': loss})
        return {'loss': loss}
    
    def loss(self, data):
        batch_size = data.shape[0]
        t = self.noise_schedule.sample_timestep(batch_size)
        x_t, noise, t = self.forward_diffusion(data, t)
        predicted_noise = self.denoiser(x_t, t)
        return {'loss': np.mean((predicted_noise - noise) ** 2)}


class DDIM(GenerativeModel):
    """Denoising Diffusion Implicit Models (DDIM) - faster sampling."""
    
    def __init__(self, data_dim=784, hidden_dim=256, timesteps=1000, 
                 schedule_type='linear', lr=0.0001, eta=0.0):
        super().__init__(latent_dim=data_dim, data_dim=data_dim)
        
        self.timesteps = timesteps
        self.eta = eta  # 0 = deterministic sampling
        self.noise_schedule = NoiseSchedule(timesteps, schedule_type)
        self.denoiser = SimpleDenoiser(data_dim, hidden_dim)
        
        self.lr = lr
        self._training = True
    
    def forward_diffusion(self, x_0, t):
        return self.noise_schedule.add_noise(x_0, t)
    
    def reverse_step(self, x_t, t, t_prev, dt=1):
        """Single DDIM reverse step."""
        batch_size = x_t.shape[0]
        if np.isscalar(t):
            t_arr = np.full(batch_size, t)
        else:
            t_arr = t
        if np.isscalar(t_prev):
            t_prev_arr = np.full(batch_size, t_prev)
        else:
            t_prev_arr = t_prev
        
        # Predict noise
        predicted_noise = self.denoiser(x_t, t_arr)
        
        # Get schedule values
        alpha_bar = self.noise_schedule.alpha_bars[t_arr][:, np.newaxis]
        alpha_bar_prev = self.noise_schedule.alpha_bars[t_prev_arr][:, np.newaxis]
        
        # Predict x_0
        sqrt_alpha_bar = np.sqrt(alpha_bar)
        sqrt_one_minus_alpha_bar = np.sqrt(1.0 - alpha_bar)
        x_0_pred = (x_t - sqrt_one_minus_alpha_bar * predicted_noise) / sqrt_alpha_bar
        
        # Clip predicted x_0
        x_0_pred = np.clip(x_0_pred, -1.0, 1.0)
        
        # Compute direction
        sigma = self.eta * np.sqrt((1.0 - alpha_bar_prev) / (1.0 - alpha_bar) * (1.0 - alpha_bar / alpha_bar_prev))
        
        # Compute x_{t-1}
        sqrt_alpha_bar_prev = np.sqrt(alpha_bar_prev)
        direction = np.sqrt(1.0 - alpha_bar_prev - sigma ** 2) * predicted_noise
        
        x_prev = sqrt_alpha_bar_prev * x_0_pred + direction
        
        if sigma > 0:
            noise = np.random.randn(*x_t.shape)
            x_prev += sigma * noise
        
        return x_prev
    
    def generate(self, num_samples, num_steps=50):
        """Generate samples with DDIM (faster than DDPM)."""
        self.denoiser.eval()
        
        # Create subsampled timesteps
        skip = self.timesteps // num_steps
        timesteps_sub = np.arange(0, self.timesteps, skip)[::-1]
        
        # Start from pure noise
        x_t = np.random.randn(num_samples, self.data_dim)
        
        # Reverse diffusion
        for i in range(len(timesteps_sub) - 1):
            t = timesteps_sub[i]
            t_prev = timesteps_sub[i + 1]
            x_t = self.reverse_step(x_t, t, t_prev)
        
        return x_t
    
    def train_step(self, x_0):
        """Single training step."""
        batch_size = x_0.shape[0]
        
        t = self.noise_schedule.sample_timestep(batch_size)
        x_t, noise, t = self.forward_diffusion(x_0, t)
        
        predicted_noise = self.denoiser(x_t, t)
        loss = np.mean((predicted_noise - noise) ** 2)
        
        dout = 2.0 * (predicted_noise - noise) / batch_size
        self.denoiser.backward(dout)
        self.denoiser.update_params(self.lr)
        
        self.loss_history.append({'loss': loss})
        return {'loss': loss}
    
    def loss(self, data):
        batch_size = data.shape[0]
        t = self.noise_schedule.sample_timestep(batch_size)
        x_t, noise, t = self.forward_diffusion(data, t)
        predicted_noise = self.denoiser(x_t, t)
        return {'loss': np.mean((predicted_noise - noise) ** 2)}