# WebBuilder Native ML/AI Framework
# Vision Models: CNN, Vision Transformer
# Built from scratch — no external ML dependencies

import numpy as np
from abc import ABC, abstractmethod
from typing import Any, Callable, Dict, List, Optional, Tuple, Union
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from neural.core import *


# ============================================================================
# CONVOLUTIONAL NEURAL NETWORK (CNN)
# ============================================================================

class CNN(Layer):
    """Convolutional Neural Network"""
    
    def __init__(self, in_channels: int, num_classes: int, image_size: int = 28):
        super().__init__()
        self.in_channels = in_channels
        self.num_classes = num_classes
        self.image_size = image_size
        
        # Convolutional blocks
        self.conv1 = Conv2D(in_channels, 32, 3, padding=1)
        self.conv2 = Conv2D(32, 64, 3, padding=1)
        self.conv3 = Conv2D(64, 128, 3, padding=1)
        
        self.pool = MaxPool2D(2, 2)
        self.dropout1 = Dropout(0.25)
        self.dropout2 = Dropout(0.5)
        
        # Calculate size after convolutions and pooling
        self.feature_size = 128 * (image_size // 8) * (image_size // 8)
        
        # Fully connected layers
        self.fc1 = Linear(self.feature_size, 256)
        self.fc2 = Linear(256, num_classes)
        
        self.layers = {
            'conv1': self.conv1, 'conv2': self.conv2, 'conv3': self.conv3,
            'fc1': self.fc1, 'fc2': self.fc2
        }
    
    def forward(self, x: Tensor) -> Tensor:
        # Conv block 1
        x = self.conv1(x)
        x = x.relu()
        x = self.pool(x)
        
        # Conv block 2
        x = self.conv2(x)
        x = x.relu()
        x = self.pool(x)
        
        # Conv block 3
        x = self.conv3(x)
        x = x.relu()
        x = self.pool(x)
        
        # Flatten
        x = x.reshape(x.shape[0], -1)
        
        # FC layers
        x = self.fc1(x)
        x = x.relu()
        x = self.dropout1(x)
        x = self.fc2(x)
        
        return x
    
    def parameters(self) -> List[Tensor]:
        params = []
        for layer in self.layers.values():
            params.extend(layer.parameters())
        return params


# ============================================================================
# RESIDUAL NETWORK (ResNet)
# ============================================================================

class ResidualBlock(Layer):
    """Residual block with skip connections"""
    
    def __init__(self, in_channels: int, out_channels: int, stride: int = 1):
        super().__init__()
        self.conv1 = Conv2D(in_channels, out_channels, 3, stride=stride, padding=1)
        self.bn1 = BatchNorm(out_channels)
        self.conv2 = Conv2D(out_channels, out_channels, 3, padding=1)
        self.bn2 = BatchNorm(out_channels)
        
        self.shortcut = None
        if stride != 1 or in_channels != out_channels:
            self.shortcut = Conv2D(in_channels, out_channels, 1, stride=stride)
        
        self.layers = {
            'conv1': self.conv1, 'bn1': self.bn1,
            'conv2': self.conv2, 'bn2': self.bn2
        }
        if self.shortcut:
            self.layers['shortcut'] = self.shortcut
    
    def forward(self, x: Tensor) -> Tensor:
        identity = x
        
        out = self.conv1(x)
        out = self.bn1(out)
        out = out.relu()
        
        out = self.conv2(out)
        out = self.bn2(out)
        
        if self.shortcut:
            identity = self.shortcut(x)
        
        out = out + identity
        out = out.relu()
        
        return out
    
    def parameters(self) -> List[Tensor]:
        params = []
        for layer in self.layers.values():
            params.extend(layer.parameters())
        return params


class ResNet(Layer):
    """Residual Network"""
    
    def __init__(self, in_channels: int, num_classes: int, num_blocks: List[int] = [2, 2, 2, 2]):
        super().__init__()
        self.in_channels = in_channels
        self.num_classes = num_classes
        
        self.conv1 = Conv2D(in_channels, 64, 7, stride=2, padding=3)
        self.bn1 = BatchNorm(64)
        self.pool = MaxPool2D(3, 2, 1)
        
        # Residual layers
        self.layer1 = self._make_layer(64, 64, num_blocks[0], stride=1)
        self.layer2 = self._make_layer(64, 128, num_blocks[1], stride=2)
        self.layer3 = self._make_layer(128, 256, num_blocks[2], stride=2)
        self.layer4 = self._make_layer(256, 512, num_blocks[3], stride=2)
        
        self.fc = Linear(512, num_classes)
        
        self.layers = {
            'conv1': self.conv1, 'bn1': self.bn1,
            'fc': self.fc
        }
    
    def _make_layer(self, in_channels: int, out_channels: int, num_blocks: int, stride: int) -> List[ResidualBlock]:
        layers = [ResidualBlock(in_channels, out_channels, stride)]
        for _ in range(1, num_blocks):
            layers.append(ResidualBlock(out_channels, out_channels, 1))
        return layers
    
    def forward(self, x: Tensor) -> Tensor:
        x = self.conv1(x)
        x = self.bn1(x)
        x = x.relu()
        x = self.pool(x)
        
        for block in self.layer1:
            x = block(x)
        for block in self.layer2:
            x = block(x)
        for block in self.layer3:
            x = block(x)
        for block in self.layer4:
            x = block(x)
        
        # Global average pooling
        x = x.reshape(x.shape[0], x.shape[1], -1)
        x = Tensor(x.data.mean(axis=2), requires_grad=True)
        
        x = self.fc(x)
        return x
    
    def parameters(self) -> List[Tensor]:
        params = []
        for layer in self.layers.values():
            params.extend(layer.parameters())
        for layer_list in [self.layer1, self.layer2, self.layer3, self.layer4]:
            for block in layer_list:
                params.extend(block.parameters())
        return params


# ============================================================================
# VISION TRANSFORMER (ViT)
# ============================================================================

class PatchEmbedding(Layer):
    """Convert image to patch embeddings"""
    
    def __init__(self, image_size: int = 224, patch_size: int = 16, in_channels: int = 3, embed_dim: int = 768):
        super().__init__()
        self.image_size = image_size
        self.patch_size = patch_size
        self.num_patches = (image_size // patch_size) ** 2
        
        self.projection = Conv2D(in_channels, embed_dim, patch_size, stride=patch_size)
        
        # Learnable CLS token and position embeddings
        self.cls_token = Tensor(np.random.randn(1, 1, embed_dim) * 0.02, requires_grad=True)
        self.position_embedding = Tensor(
            np.random.randn(1, self.num_patches + 1, embed_dim) * 0.02,
            requires_grad=True
        )
        
        self.layers = {'projection': self.projection}
    
    def forward(self, x: Tensor) -> Tensor:
        batch_size = x.shape[0]
        
        # Project patches
        x = self.projection(x)
        x = x.reshape(batch_size, x.shape[1], -1)
        x = Tensor(x.data.transpose(0, 2, 1), requires_grad=True)
        
        # Prepend CLS token
        cls_tokens = Tensor(np.tile(self.cls_token.data, (batch_size, 1, 1)))
        x = Tensor(np.concatenate([cls_tokens.data, x.data], axis=1), requires_grad=True)
        
        # Add position embedding
        x = x + self.position_embedding
        
        return x
    
    def parameters(self) -> List[Tensor]:
        params = [self.cls_token, self.position_embedding]
        params.extend(self.projection.parameters())
        return params


class MultiHeadAttention(Layer):
    """Multi-head self-attention mechanism"""
    
    def __init__(self, embed_dim: int, num_heads: int = 8, dropout: float = 0.1):
        super().__init__()
        self.embed_dim = embed_dim
        self.num_heads = num_heads
        self.head_dim = embed_dim // num_heads
        self.scale = np.sqrt(self.head_dim)
        
        self.q_proj = Linear(embed_dim, embed_dim)
        self.k_proj = Linear(embed_dim, embed_dim)
        self.v_proj = Linear(embed_dim, embed_dim)
        self.out_proj = Linear(embed_dim, embed_dim)
        
        self.dropout = Dropout(dropout)
        
        self.layers = {
            'q_proj': self.q_proj, 'k_proj': self.k_proj,
            'v_proj': self.v_proj, 'out_proj': self.out_proj
        }
    
    def forward(self, x: Tensor) -> Tensor:
        batch_size, seq_len, _ = x.shape
        
        # Project queries, keys, values
        q = self.q_proj(x)
        k = self.k_proj(x)
        v = self.v_proj(x)
        
        # Reshape for multi-head attention
        q = q.reshape(batch_size, seq_len, self.num_heads, self.head_dim)
        k = k.reshape(batch_size, seq_len, self.num_heads, self.head_dim)
        v = v.reshape(batch_size, seq_len, self.num_heads, self.head_dim)
        
        # Compute attention scores
        scores = np.zeros((batch_size, self.num_heads, seq_len, seq_len))
        for h in range(self.num_heads):
            q_h = q.data[:, :, h, :]
            k_h = k.data[:, :, h, :]
            scores[:, h] = q_h @ k_h.transpose(0, 2, 1) / self.scale
        
        # Apply softmax
        attn_weights = Tensor(scores, requires_grad=True).softmax()
        
        # Apply attention to values
        context = np.zeros((batch_size, self.num_heads, seq_len, self.head_dim))
        for h in range(self.num_heads):
            context[:, h] = attn_weights.data[:, h] @ v.data[:, :, h, :]
        
        # Reshape and project output
        context = Tensor(context.transpose(0, 2, 1, 3).reshape(batch_size, seq_len, self.embed_dim))
        out = self.out_proj(context)
        out = self.dropout(out)
        
        return out
    
    def parameters(self) -> List[Tensor]:
        params = []
        for layer in self.layers.values():
            params.extend(layer.parameters())
        return params


class TransformerBlock(Layer):
    """Transformer encoder block"""
    
    def __init__(self, embed_dim: int, num_heads: int, mlp_ratio: float = 4.0, dropout: float = 0.1):
        super().__init__()
        self.norm1 = BatchNorm(embed_dim)
        self.attn = MultiHeadAttention(embed_dim, num_heads, dropout)
        self.norm2 = BatchNorm(embed_dim)
        
        mlp_hidden = int(embed_dim * mlp_ratio)
        self.mlp = Linear(embed_dim, mlp_hidden)
        self.mlp_out = Linear(mlp_hidden, embed_dim)
        self.dropout = Dropout(dropout)
        
        self.layers = {
            'norm1': self.norm1, 'norm2': self.norm2,
            'mlp': self.mlp, 'mlp_out': self.mlp_out
        }
    
    def forward(self, x: Tensor) -> Tensor:
        # Self-attention with residual
        normed = self.norm1(x)
        attn_out = self.attn(normed)
        x = x + attn_out
        
        # MLP with residual
        normed = self.norm2(x)
        mlp_out = self.mlp(normed)
        mlp_out = mlp_out.relu()
        mlp_out = self.mlp_out(mlp_out)
        mlp_out = self.dropout(mlp_out)
        x = x + mlp_out
        
        return x
    
    def parameters(self) -> List[Tensor]:
        params = []
        for layer in self.layers.values():
            params.extend(layer.parameters())
        params.extend(self.attn.parameters())
        return params


class VisionTransformer(Layer):
    """Vision Transformer (ViT)"""
    
    def __init__(self, image_size: int = 224, patch_size: int = 16, in_channels: int = 3,
                 num_classes: int = 1000, embed_dim: int = 768, depth: int = 12,
                 num_heads: int = 12, mlp_ratio: float = 4.0, dropout: float = 0.1):
        super().__init__()
        self.image_size = image_size
        self.patch_size = patch_size
        self.num_classes = num_classes
        
        # Patch embedding
        self.patch_embed = PatchEmbedding(image_size, patch_size, in_channels, embed_dim)
        
        # Transformer blocks
        self.blocks = [
            TransformerBlock(embed_dim, num_heads, mlp_ratio, dropout)
            for _ in range(depth)
        ]
        
        # Classification head
        self.norm = BatchNorm(embed_dim)
        self.head = Linear(embed_dim, num_classes)
        
        self.layers = {
            'patch_embed': self.patch_embed,
            'norm': self.norm,
            'head': self.head
        }
    
    def forward(self, x: Tensor) -> Tensor:
        # Patch embedding
        x = self.patch_embed(x)
        
        # Transformer blocks
        for block in self.blocks:
            x = block(x)
        
        # Classification head (use CLS token)
        x = self.norm(x)
        cls_token = Tensor(x.data[:, 0, :], requires_grad=True)
        x = self.head(cls_token)
        
        return x
    
    def parameters(self) -> List[Tensor]:
        params = []
        for layer in self.layers.values():
            params.extend(layer.parameters())
        for block in self.blocks:
            params.extend(block.parameters())
        return params


# ============================================================================
# EXPORT
# ============================================================================

__all__ = [
    'CNN', 'ResidualBlock', 'ResNet',
    'PatchEmbedding', 'MultiHeadAttention', 'TransformerBlock', 'VisionTransformer'
]
