#!/usr/bin/env python3
"""
WebBuilder Vision Models
Built entirely from scratch with NumPy — no external ML dependencies
Includes: CNN, Vision Transformer, U-Net, YOLO, Style Transfer, Super-Resolution
"""

import numpy as np
from typing import List, Tuple, Optional, Dict, Any
import json


# ═══════════════════════════════════════════════════════════════════════════
# CONVOLUTIONAL NEURAL NETWORK (CNN)
# ═══════════════════════════════════════════════════════════════════════════

class CNN:
    """Convolutional Neural Network with ResNet-like skip connections."""
    
    def __init__(self, input_channels: int, num_classes: int, 
                 conv_layers: List[Tuple[int, int, int]] = None,
                 fc_layers: List[int] = None,
                 use_residual: bool = True):
        """
        Args:
            input_channels: Number of input channels (e.g., 3 for RGB)
            num_classes: Number of output classes
            conv_layers: List of (out_channels, kernel_size, stride) tuples
            fc_layers: List of fully connected layer sizes
            use_residual: Whether to use residual connections
        """
        self.input_channels = input_channels
        self.num_classes = num_classes
        self.use_residual = use_residual
        
        if conv_layers is None:
            conv_layers = [(32, 3, 1), (64, 3, 2), (128, 3, 2)]
        if fc_layers is None:
            fc_layers = [256, 128]
        
        self.conv_layers = conv_layers
        self.fc_layers = fc_layers
        
        # Build convolutional layers
        self.conv_params = []
        prev_channels = input_channels
        for out_channels, kernel_size, stride in conv_layers:
            self.conv_params.append({
                'W': np.random.randn(out_channels, prev_channels, kernel_size, kernel_size).astype(np.float32) * np.sqrt(2.0 / (prev_channels * kernel_size * kernel_size)),
                'b': np.zeros(out_channels, dtype=np.float32),
            })
            prev_channels = out_channels
        
        # Build fully connected layers
        # Assume input size reduces by factor of 2 for each stride-2 conv
        fc_input_size = prev_channels * 4 * 4  # Simplified assumption
        self.fc_params = []
        prev_size = fc_input_size
        for fc_size in fc_layers:
            self.fc_params.append({
                'W': np.random.randn(prev_size, fc_size).astype(np.float32) * np.sqrt(2.0 / prev_size),
                'b': np.zeros(fc_size, dtype=np.float32),
            })
            prev_size = fc_size
        # Output layer
        self.fc_params.append({
            'W': np.random.randn(prev_size, num_classes).astype(np.float32) * np.sqrt(2.0 / prev_size),
            'b': np.zeros(num_classes, dtype=np.float32),
        })
    
    def conv_forward(self, x: np.ndarray, params: Dict, stride: int = 1, padding: int = 1) -> np.ndarray:
        """Forward pass through a convolutional layer."""
        W, b = params['W'], params['b']
        N, C, H, W = x.shape
        out_c, in_c, k, k = W.shape
        
        # Pad input
        if padding > 0:
            x_padded = np.pad(x, ((0,0), (0,0), (padding,padding), (padding,padding)), mode='constant')
        else:
            x_padded = x
        
        # Output dimensions
        H_out = (H + 2*padding - k) // stride + 1
        W_out = (W + 2*padding - k) // stride + 1
        
        # Im2col
        cols = self._im2col(x_padded, k, stride)
        W_col = W.reshape(out_c, -1)
        
        # Convolution as matrix multiplication
        out = W_col @ cols + b.reshape(-1, 1)
        out = out.reshape(out_c, H_out, W_out, N)
        out = out.transpose(3, 0, 1, 2)
        
        return out
    
    def _im2col(self, x: np.ndarray, kernel_size: int, stride: int) -> np.ndarray:
        """Convert image to column format for convolution."""
        N, C, H, W = x.shape
        K = kernel_size
        H_out = (H - K) // stride + 1
        W_out = (W - K) // stride + 1
        
        cols = np.zeros((C * K * K, H_out * W_out * N), dtype=np.float32)
        
        for y in range(H_out):
            y_max = y * stride + K
            for x_pos in range(W_out):
                x_max = x_pos * stride + K
                cols[:, y * W_out * N + x_pos * N: y * W_out * N + x_pos * N + N] = \
                    x[0:N, 0:C, y * stride:y_max, x_pos * stride:x_max].reshape(C * K * K, N)
        
        return cols
    
    def forward(self, x: np.ndarray) -> np.ndarray:
        """Forward pass through CNN."""
        # Convolutional layers
        for i, (params, (out_c, k, s)) in enumerate(zip(self.conv_params, self.conv_layers)):
            # Main path
            conv_out = self.conv_forward(x, params, stride=s, padding=1)
            # ReLU activation
            relu_out = np.maximum(0, conv_out)
            # Max pooling if stride > 1
            if s > 1:
                pool_out = self._max_pool(relu_out, pool_size=2, stride=2)
            else:
                pool_out = relu_out
            
            # Residual connection (if dimensions match)
            if self.use_residual and i > 0 and x.shape[1] == pool_out.shape[1]:
                # Add residual (with projection if needed)
                if x.shape != pool_out.shape:
                    # Project residual to match dimensions
                    x = self._project_residual(x, pool_out.shape)
                pool_out = pool_out + x
            
            x = pool_out
        
        # Flatten
        x = x.reshape(x.shape[0], -1)
        
        # Fully connected layers
        for i, params in enumerate(self.fc_params[:-1]):
            x = x @ params['W'] + params['b']
            x = np.maximum(0, x)  # ReLU
        
        # Output layer
        x = x @ self.fc_params[-1]['W'] + self.fc_params[-1]['b']
        
        return x
    
    def _max_pool(self, x: np.ndarray, pool_size: int = 2, stride: int = 2) -> np.ndarray:
        """Max pooling."""
        N, C, H, W = x.shape
        H_out = (H - pool_size) // stride + 1
        W_out = (W - pool_size) // stride + 1
        
        x_reshaped = x.reshape(N, C, H_out, pool_size, W_out, pool_size)
        out = x_reshaped.max(axis=(3, 5))
        return out
    
    def _project_residual(self, residual: np.ndarray, target_shape: tuple) -> np.ndarray:
        """Project residual to match target shape."""
        N, C, H, W = residual.shape
        target_N, target_C, target_H, target_W = target_shape
        
        # Channel projection
        if C != target_C:
            # Simple 1x1 convolution (average across channels)
            residual = residual[:, :target_C, :, :]
        
        # Spatial downsampling
        if H != target_H or W != target_W:
            # Average pooling
            residual = residual[:, :, ::2, ::2]
        
        return residual


# ═══════════════════════════════════════════════════════════════════════════
# VISION TRANSFORMER (ViT)
# ═══════════════════════════════════════════════════════════════════════════

class MultiHeadAttention:
    """Multi-head self-attention mechanism."""
    
    def __init__(self, embed_dim: int, num_heads: int):
        self.embed_dim = embed_dim
        self.num_heads = num_heads
        self.head_dim = embed_dim // num_heads
        
        # Query, Key, Value projections
        self.W_q = np.random.randn(embed_dim, embed_dim).astype(np.float32) * 0.02
        self.W_k = np.random.randn(embed_dim, embed_dim).astype(np.float32) * 0.02
        self.W_v = np.random.randn(embed_dim, embed_dim).astype(np.float32) * 0.02
        self.W_o = np.random.randn(embed_dim, embed_dim).astype(np.float32) * 0.02
    
    def forward(self, x: np.ndarray, mask: Optional[np.ndarray] = None) -> np.ndarray:
        """Forward pass through multi-head attention."""
        N, seq_len, embed_dim = x.shape
        
        # Project to Q, K, V
        Q = x @ self.W_q
        K = x @ self.W_k
        V = x @ self.W_v
        
        # Reshape to (N, num_heads, seq_len, head_dim)
        Q = Q.reshape(N, seq_len, self.num_heads, self.head_dim).transpose(0, 2, 1, 3)
        K = K.reshape(N, seq_len, self.num_heads, self.head_dim).transpose(0, 2, 1, 3)
        V = V.reshape(N, seq_len, self.num_heads, self.head_dim).transpose(0, 2, 1, 3)
        
        # Scaled dot-product attention
        scale = np.sqrt(self.head_dim)
        attention = Q @ K.transpose(0, 1, 3, 2) / scale
        
        # Apply mask (for causal attention)
        if mask is not None:
            attention = attention + mask
        
        # Softmax
        attention = self._softmax(attention, axis=-1)
        
        # Apply attention to values
        out = attention @ V
        
        # Reshape back
        out = out.transpose(0, 2, 1, 3).reshape(N, seq_len, embed_dim)
        
        # Output projection
        out = out @ self.W_o
        
        return out
    
    def _softmax(self, x: np.ndarray, axis: int = -1) -> np.ndarray:
        """Numerically stable softmax."""
        exp_x = np.exp(x - np.max(x, axis=axis, keepdims=True))
        return exp_x / np.sum(exp_x, axis=axis, keepdims=True)


class TransformerBlock:
    """Transformer block with attention and feed-forward."""
    
    def __init__(self, embed_dim: int, num_heads: int, ff_dim: int = None):
        self.embed_dim = embed_dim
        self.num_heads = num_heads
        self.ff_dim = ff_dim or embed_dim * 4
        
        # Multi-head attention
        self.attention = MultiHeadAttention(embed_dim, num_heads)
        
        # Feed-forward network
        self.W1 = np.random.randn(embed_dim, self.ff_dim).astype(np.float32) * 0.02
        self.b1 = np.zeros(self.ff_dim, dtype=np.float32)
        self.W2 = np.random.randn(self.ff_dim, embed_dim).astype(np.float32) * 0.02
        self.b2 = np.zeros(embed_dim, dtype=np.float32)
        
        # Layer normalization parameters
        self.gamma1 = np.ones(embed_dim, dtype=np.float32)
        self.beta1 = np.zeros(embed_dim, dtype=np.float32)
        self.gamma2 = np.ones(embed_dim, dtype=np.float32)
        self.beta2 = np.zeros(embed_dim, dtype=np.float32)
    
    def forward(self, x: np.ndarray, mask: Optional[np.ndarray] = None) -> np.ndarray:
        """Forward pass through transformer block."""
        # Layer norm + attention + residual
        norm1 = self._layer_norm(x, self.gamma1, self.beta1)
        attn_out = self.attention.forward(norm1, mask)
        x = x + attn_out
        
        # Layer norm + feed-forward + residual
        norm2 = self._layer_norm(x, self.gamma2, self.beta2)
        ff_out = norm2 @ self.W1 + self.b1
        ff_out = np.maximum(0, ff_out)  # ReLU
        ff_out = ff_out @ self.W2 + self.b2
        x = x + ff_out
        
        return x
    
    def _layer_norm(self, x: np.ndarray, gamma: np.ndarray, beta: np.ndarray) -> np.ndarray:
        """Layer normalization."""
        mean = np.mean(x, axis=-1, keepdims=True)
        var = np.var(x, axis=-1, keepdims=True)
        x_norm = (x - mean) / np.sqrt(var + 1e-5)
        return gamma * x_norm + beta


class VisionTransformer:
    """Vision Transformer for image classification."""
    
    def __init__(self, img_size: int = 32, patch_size: int = 8, channels: int = 3,
                 num_classes: int = 10, embed_dim: int = 128, num_heads: int = 8,
                 num_layers: int = 6):
        self.img_size = img_size
        self.patch_size = patch_size
        self.channels = channels
        self.num_classes = num_classes
        self.embed_dim = embed_dim
        self.num_heads = num_heads
        self.num_layers = num_layers
        
        # Calculate number of patches
        self.num_patches = (img_size // patch_size) ** 2
        self.patch_dim = patch_size * patch_size * channels
        
        # Patch embedding
        self.W_patch = np.random.randn(self.patch_dim, embed_dim).astype(np.float32) * 0.02
        self.b_patch = np.zeros(embed_dim, dtype=np.float32)
        
        # Positional embedding
        self.pos_embed = np.random.randn(1, self.num_patches + 1, embed_dim).astype(np.float32) * 0.02
        
        # CLS token
        self.cls_token = np.random.randn(1, 1, embed_dim).astype(np.float32) * 0.02
        
        # Transformer blocks
        self.blocks = [TransformerBlock(embed_dim, num_heads) for _ in range(num_layers)]
        
        # Classification head
        self.W_cls = np.random.randn(embed_dim, num_classes).astype(np.float32) * 0.02
        self.b_cls = np.zeros(num_classes, dtype=np.float32)
    
    def forward(self, x: np.ndarray) -> np.ndarray:
        """Forward pass through Vision Transformer."""
        N = x.shape[0]
        
        # Extract patches
        patches = self._extract_patches(x)
        
        # Patch embedding
        patch_embed = patches @ self.W_patch + self.b_patch
        
        # Prepend CLS token
        cls_tokens = np.tile(self.cls_token, (N, 1, 1))
        x = np.concatenate([cls_tokens, patch_embed], axis=1)
        
        # Add positional embedding
        x = x + self.pos_embed
        
        # Transformer blocks
        for block in self.blocks:
            x = block.forward(x)
        
        # Extract CLS token
        cls_output = x[:, 0, :]
        
        # Classification head
        out = cls_output @ self.W_cls + self.b_cls
        
        return out
    
    def _extract_patches(self, x: np.ndarray) -> np.ndarray:
        """Extract patches from image."""
        N, C, H, W = x.shape
        P = self.patch_size
        
        # Reshape to patches
        patches = x.reshape(N, C, H // P, P, W // P, P)
        patches = patches.transpose(0, 2, 4, 1, 3, 5)
        patches = patches.reshape(N, (H // P) * (W // P), C * P * P)
        
        return patches


# ═══════════════════════════════════════════════════════════════════════════
# U-NET
# ═══════════════════════════════════════════════════════════════════════════

class UNet:
    """U-Net for image segmentation."""
    
    def __init__(self, in_channels: int = 3, out_channels: int = 1, 
                 features: List[int] = None):
        if features is None:
            features = [64, 128, 256, 512]
        
        self.features = features
        
        # Encoder (downsampling path)
        self.encoder_blocks = []
        prev_channels = in_channels
        for f in features:
            self.encoder_blocks.append(self._conv_block(prev_channels, f))
            prev_channels = f
        
        # Decoder (upsampling path)
        self.decoder_blocks = []
        for f in reversed(features[:-1]):
            self.decoder_blocks.append(self._conv_block(f * 2, f))  # *2 for skip connection
        
        # Final convolution
        self.final_conv = self._conv_block(features[0], out_channels)
    
    def _conv_block(self, in_ch: int, out_ch: int) -> Dict:
        """Create a convolutional block."""
        return {
            'W1': np.random.randn(out_ch, in_ch, 3, 3).astype(np.float32) * np.sqrt(2.0 / (in_ch * 9)),
            'b1': np.zeros(out_ch, dtype=np.float32),
            'W2': np.random.randn(out_ch, out_ch, 3, 3).astype(np.float32) * np.sqrt(2.0 / (out_ch * 9)),
            'b2': np.zeros(out_ch, dtype=np.float32),
        }
    
    def forward(self, x: np.ndarray) -> np.ndarray:
        """Forward pass through U-Net."""
        # Encoder path
        skip_connections = []
        for block in self.encoder_blocks:
            x = self._conv_forward(x, block)
            skip_connections.append(x)
            x = self._max_pool(x)
        
        # Decoder path
        for i, block in enumerate(self.decoder_blocks):
            x = self._upsample(x)
            # Skip connection
            skip = skip_connections[-(i + 2)]
            # Concatenate
            x = np.concatenate([x, skip], axis=1)
            x = self._conv_forward(x, block)
        
        # Final convolution
        x = self._conv_forward(x, self.final_conv)
        
        return x
    
    def _conv_forward(self, x: np.ndarray, block: Dict) -> np.ndarray:
        """Forward pass through a conv block."""
        # Conv + ReLU
        x = self._conv2d(x, block['W1'], block['b1'], padding=1)
        x = np.maximum(0, x)
        # Conv + ReLU
        x = self._conv2d(x, block['W2'], block['b2'], padding=1)
        x = np.maximum(0, x)
        return x
    
    def _conv2d(self, x: np.ndarray, W: np.ndarray, b: np.ndarray, padding: int = 0) -> np.ndarray:
        """Simple 2D convolution."""
        N, C, H, W = x.shape
        out_c, in_c, k, k = W.shape
        
        if padding > 0:
            x = np.pad(x, ((0,0), (0,0), (padding,padding), (padding,padding)), mode='constant')
        
        H_out = H - k + 1
        W_out = W - k + 1
        
        out = np.zeros((N, out_c, H_out, W_out), dtype=np.float32)
        
        for i in range(H_out):
            for j in range(W_out):
                patch = x[:, :, i:i+k, j:j+k]
                for oc in range(out_c):
                    out[:, oc, i, j] = np.sum(patch * W[oc], axis=(1, 2, 3)) + b[oc]
        
        return out
    
    def _max_pool(self, x: np.ndarray, pool_size: int = 2) -> np.ndarray:
        """Max pooling."""
        N, C, H, W = x.shape
        H_out = H // pool_size
        W_out = W // pool_size
        
        x_reshaped = x.reshape(N, C, H_out, pool_size, W_out, pool_size)
        return x_reshaped.max(axis=(3, 5))
    
    def _upsample(self, x: np.ndarray, scale: int = 2) -> np.ndarray:
        """Upsampling using nearest neighbor interpolation."""
        N, C, H, W = x.shape
        return np.repeat(np.repeat(x, scale, axis=2), scale, axis=3)


# ═══════════════════════════════════════════════════════════════════════════
# YOLO-LIKE OBJECT DETECTION
# ═══════════════════════════════════════════════════════════════════════════

class YOLO:
    """YOLO-like object detection model."""
    
    def __init__(self, grid_size: int = 7, num_boxes: int = 2, num_classes: int = 20):
        self.grid_size = grid_size
        self.num_boxes = num_boxes
        self.num_classes = num_classes
        
        # Output: grid_size x grid_size x (num_boxes * 5 + num_classes)
        # 5 = (x, y, w, h, confidence)
        self.output_channels = num_boxes * 5 + num_classes
        
        # Backbone CNN
        self.backbone = CNN(input_channels=3, num_classes=self.output_channels,
                           conv_layers=[(32, 3, 1), (64, 3, 2), (128, 3, 2), (256, 3, 2), (512, 3, 2)],
                           fc_layers=[4096, grid_size * grid_size * self.output_channels])
    
    def forward(self, x: np.ndarray) -> np.ndarray:
        """Forward pass through YOLO."""
        out = self.backbone.forward(x)
        # Reshape to grid
        out = out.reshape(-1, self.grid_size, self.grid_size, self.output_channels)
        return out
    
    def decode_predictions(self, predictions: np.ndarray, confidence_threshold: float = 0.5) -> List[Dict]:
        """Decode predictions to bounding boxes."""
        N = predictions.shape[0]
        boxes = []
        
        for n in range(N):
            for i in range(self.grid_size):
                for j in range(self.grid_size):
                    # Get confidence scores
                    confidences = []
                    for b in range(self.num_boxes):
                        conf_idx = b * 5 + 4
                        conf = predictions[n, i, j, conf_idx]
                        confidences.append(conf)
                    
                    # Get best box
                    best_box_idx = np.argmax(confidences)
                    best_conf = confidences[best_box_idx]
                    
                    if best_conf > confidence_threshold:
                        # Get box coordinates
                        box_start = best_box_idx * 5
                        x = predictions[n, i, j, box_start]
                        y = predictions[n, i, j, box_start + 1]
                        w = predictions[n, i, j, box_start + 2]
                        h = predictions[n, i, j, box_start + 3]
                        
                        # Get class probabilities
                        class_probs = predictions[n, i, j, self.num_boxes * 5:]
                        class_id = np.argmax(class_probs)
                        class_prob = class_probs[class_id]
                        
                        boxes.append({
                            'x': x, 'y': y, 'w': w, 'h': h,
                            'confidence': best_conf,
                            'class_id': class_id,
                            'class_probability': class_prob
                        })
        
        return boxes


# ═══════════════════════════════════════════════════════════════════════════
# STYLE TRANSFER
# ═══════════════════════════════════════════════════════════════════════════

class StyleTransfer:
    """Neural style transfer using Gram matrices."""
    
    def __init__(self, content_layers: List[int] = None, style_layers: List[int] = None):
        self.content_layers = content_layers or [2, 4, 6]
        self.style_layers = style_layers or [2, 4, 6, 8, 10]
    
    def gram_matrix(self, features: np.ndarray) -> np.ndarray:
        """Compute Gram matrix for style representation."""
        N, C, H, W = features.shape
        features_flat = features.reshape(N, C, H * W)
        
        gram = features_flat @ features_flat.transpose(0, 2, 1)
        gram = gram / (C * H * W)
        
        return gram
    
    def content_loss(self, generated_features: np.ndarray, content_features: np.ndarray) -> float:
        """Compute content loss."""
        return np.mean((generated_features - content_features) ** 2)
    
    def style_loss(self, generated_features: np.ndarray, style_features: np.ndarray) -> float:
        """Compute style loss."""
        gen_gram = self.gram_matrix(generated_features)
        style_gram = self.gram_matrix(style_features)
        return np.mean((gen_gram - style_gram) ** 2)
    
    def total_loss(self, generated: np.ndarray, content: np.ndarray, style: np.ndarray,
                   content_weight: float = 1.0, style_weight: float = 100.0) -> float:
        """Compute total loss."""
        # Extract features (simplified - using input directly)
        c_loss = self.content_loss(generated, content)
        s_loss = self.style_loss(generated, style)
        
        return content_weight * c_loss + style_weight * s_loss


# ═══════════════════════════════════════════════════════════════════════════
# SUPER-RESOLUTION
# ═══════════════════════════════════════════════════════════════════════════

class SRCNN:
    """Super-Resolution Convolutional Neural Network."""
    
    def __init__(self, num_channels: int = 3, upscale_factor: int = 2):
        self.num_channels = num_channels
        self.upscale_factor = upscale_factor
        
        # Three convolutional layers
        self.conv1 = {
            'W': np.random.randn(64, num_channels, 9, 9).astype(np.float32) * 0.02,
            'b': np.zeros(64, dtype=np.float32),
        }
        self.conv2 = {
            'W': np.random.randn(32, 64, 5, 5).astype(np.float32) * 0.02,
            'b': np.zeros(32, dtype=np.float32),
        }
        self.conv3 = {
            'W': np.random.randn(num_channels, 32, 5, 5).astype(np.float32) * 0.02,
            'b': np.zeros(num_channels, dtype=np.float32),
        }
    
    def forward(self, x: np.ndarray) -> np.ndarray:
        """Forward pass through SRCNN."""
        # Upsample input
        x = self._upsample(x)
        
        # Conv + ReLU
        x = self._conv2d(x, self.conv1['W'], self.conv1['b'], padding=4)
        x = np.maximum(0, x)
        x = self._conv2d(x, self.conv2['W'], self.conv2['b'], padding=2)
        x = np.maximum(0, x)
        x = self._conv2d(x, self.conv3['W'], self.conv3['b'], padding=2)
        
        return x
    
    def _conv2d(self, x: np.ndarray, W: np.ndarray, b: np.ndarray, padding: int = 0) -> np.ndarray:
        """Simple 2D convolution."""
        N, C, H, W = x.shape
        out_c, in_c, k, k = W.shape
        
        if padding > 0:
            x = np.pad(x, ((0,0), (0,0), (padding,padding), (padding,padding)), mode='constant')
        
        H_out = H - k + 1
        W_out = W - k + 1
        
        out = np.zeros((N, out_c, H_out, W_out), dtype=np.float32)
        
        for i in range(H_out):
            for j in range(W_out):
                patch = x[:, :, i:i+k, j:j+k]
                for oc in range(out_c):
                    out[:, oc, i, j] = np.sum(patch * W[oc], axis=(1, 2, 3)) + b[oc]
        
        return out
    
    def _upsample(self, x: np.ndarray) -> np.ndarray:
        """Upsampling using bicubic interpolation (simplified to nearest neighbor)."""
        N, C, H, W = x.shape
        s = self.upscale_factor
        return np.repeat(np.repeat(x, s, axis=2), s, axis=3)


if __name__ == '__main__':
    print("Testing Vision Models...")
    
    # Test CNN
    print("\n1. Testing CNN...")
    cnn = CNN(input_channels=3, num_classes=10)
    x = np.random.randn(2, 3, 32, 32).astype(np.float32)
    out = cnn.forward(x)
    print(f"   Output shape: {out.shape}")
    
    # Test Vision Transformer
    print("\n2. Testing Vision Transformer...")
    vit = VisionTransformer(img_size=32, patch_size=8, channels=3, num_classes=10)
    out = vit.forward(x)
    print(f"   Output shape: {out.shape}")
    
    # Test U-Net
    print("\n3. Testing U-Net...")
    unet = UNet(in_channels=3, out_channels=1)
    x = np.random.randn(2, 3, 64, 64).astype(np.float32)
    out = unet.forward(x)
    print(f"   Output shape: {out.shape}")
    
    # Test YOLO
    print("\n4. Testing YOLO...")
    yolo = YOLO(grid_size=7, num_boxes=2, num_classes=20)
    x = np.random.randn(2, 3, 224, 224).astype(np.float32)
    out = yolo.forward(x)
    print(f"   Output shape: {out.shape}")
    
    # Test Style Transfer
    print("\n5. Testing Style Transfer...")
    st = StyleTransfer()
    content = np.random.randn(1, 64, 32, 32).astype(np.float32)
    style = np.random.randn(1, 64, 32, 32).astype(np.float32)
    generated = np.random.randn(1, 64, 32, 32).astype(np.float32)
    loss = st.total_loss(generated, content, style)
    print(f"   Total loss: {loss:.4f}")
    
    # Test SRCNN
    print("\n6. Testing SRCNN...")
    srcnn = SRCNN(num_channels=3, upscale_factor=2)
    x = np.random.randn(2, 3, 32, 32).astype(np.float32)
    out = srcnn.forward(x)
    print(f"   Output shape: {out.shape}")
    
    print("\nAll vision models tested successfully!")
