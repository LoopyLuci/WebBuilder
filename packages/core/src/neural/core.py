# WebBuilder Native ML/AI Framework
# Built from scratch — no external ML dependencies
# Core neural architecture with adaptive learning

import numpy as np
from abc import ABC, abstractmethod
from typing import Any, Callable, Dict, List, Optional, Tuple, Union
import json
import hashlib
import time
import os
import pickle
from pathlib import Path


# ============================================================================
# CORE TENSOR OPERATIONS
# ============================================================================

class Tensor:
    """Lightweight tensor with automatic differentiation"""
    
    def __init__(self, data: np.ndarray, requires_grad: bool = False, name: str = ""):
        self.data = np.array(data, dtype=np.float64)
        self.grad = None
        self.requires_grad = requires_grad
        self._backward = lambda: None
        self._prev = set()
        self._op = ""
        self.name = name
    
    @property
    def shape(self):
        return self.data.shape
    
    def backward(self, grad=None):
        if grad is None:
            grad = np.ones_like(self.data)
        self.grad = grad if self.grad is None else self.grad + grad
        topo = []
        visited = set()
        def build(v):
            if v not in visited:
                visited.add(v)
                for child in v._prev:
                    build(child)
                topo.append(v)
        build(self)
        for node in reversed(topo):
            node._backward()
    
    def __add__(self, other):
        other = other if isinstance(other, Tensor) else Tensor(other)
        out = Tensor(self.data + other.data, requires_grad=self.requires_grad or other.requires_grad)
        out._prev = {self, other}
        out._op = "+"
        def _backward():
            if self.requires_grad:
                self.backward(out.grad)
            if other.requires_grad:
                other.backward(out.grad)
        out._backward = _backward
        return out
    
    def __mul__(self, other):
        other = other if isinstance(other, Tensor) else Tensor(other)
        out = Tensor(self.data * other.data, requires_grad=self.requires_grad or other.requires_grad)
        out._prev = {self, other}
        out._op = "*"
        def _backward():
            if self.requires_grad:
                self.backward(other.data * out.grad)
            if other.requires_grad:
                other.backward(self.data * out.grad)
        out._backward = _backward
        return out
    
    def matmul(self, other):
        other = other if isinstance(other, Tensor) else Tensor(other)
        out = Tensor(self.data @ other.data, requires_grad=self.requires_grad or other.requires_grad)
        out._prev = {self, other}
        out._op = "@"
        def _backward():
            if self.requires_grad:
                self.backward(out.grad @ other.data.T)
            if other.requires_grad:
                other.backward(self.data.T @ out.grad)
        out._backward = _backward
        return out
    
    def relu(self):
        out = Tensor(np.maximum(0, self.data), requires_grad=self.requires_grad)
        out._prev = {self}
        out._op = "relu"
        def _backward():
            if self.requires_grad:
                self.backward(out.grad * (self.data > 0))
        out._backward = _backward
        return out
    
    def sigmoid(self):
        s = 1 / (1 + np.exp(-self.data))
        out = Tensor(s, requires_grad=self.requires_grad)
        out._prev = {self}
        out._op = "sigmoid"
        def _backward():
            if self.requires_grad:
                self.backward(out.grad * s * (1 - s))
        out._backward = _backward
        return out
    
    def tanh(self):
        t = np.tanh(self.data)
        out = Tensor(t, requires_grad=self.requires_grad)
        out._prev = {self}
        out._op = "tanh"
        def _backward():
            if self.requires_grad:
                self.backward(out.grad * (1 - t ** 2))
        out._backward = _backward
        return out
    
    def softmax(self, axis=-1):
        e = np.exp(self.data - np.max(self.data, axis=axis, keepdims=True))
        s = e / np.sum(e, axis=axis, keepdims=True)
        out = Tensor(s, requires_grad=self.requires_grad)
        out._prev = {self}
        out._op = "softmax"
        return out
    
    def reshape(self, *shape):
        out = Tensor(self.data.reshape(*shape), requires_grad=self.requires_grad)
        out._prev = {self}
        out._op = "reshape"
        def _backward():
            if self.requires_grad:
                self.backward(out.grad.reshape(self.shape))
        out._backward = _backward
        return out
    
    def __repr__(self):
        return f"Tensor({self.shape}, requires_grad={self.requires_grad})"


# ============================================================================
# LAYER BASE CLASSES
# ============================================================================

class Layer(ABC):
    """Base class for all neural network layers"""
    
    def __init__(self):
        self._params = {}
        self._grads = {}
        self.training = True
    
    @abstractmethod
    def forward(self, x: Tensor) -> Tensor:
        pass
    
    def __call__(self, x: Tensor) -> Tensor:
        return self.forward(x)
    
    def parameters(self) -> List[Tensor]:
        return list(self._params.values())
    
    def zero_grad(self):
        for p in self.parameters():
            p.grad = None
    
    def save_params(self) -> Dict:
        return {k: v.data.copy() for k, v in self._params.items()}
    
    def load_params(self, params: Dict):
        for k, v in params.items():
            if k in self._params:
                self._params[k].data = v.copy()


class Linear(Layer):
    """Fully connected linear layer"""
    
    def __init__(self, in_features: int, out_features: int, bias: bool = True):
        super().__init__()
        scale = np.sqrt(2.0 / in_features)
        self._params['weight'] = Tensor(
            np.random.randn(in_features, out_features) * scale,
            requires_grad=True
        )
        if bias:
            self._params['bias'] = Tensor(np.zeros(out_features), requires_grad=True)
        self.in_features = in_features
        self.out_features = out_features
    
    def forward(self, x: Tensor) -> Tensor:
        out = x.matmul(self._params['weight'])
        if 'bias' in self._params:
            out = out + self._params['bias']
        return out
    
    def __repr__(self):
        return f"Linear({self.in_features}, {self.out_features})"


class Conv2D(Layer):
    """2D Convolutional layer"""
    
    def __init__(self, in_channels: int, out_channels: int, kernel_size: int,
                 stride: int = 1, padding: int = 0):
        super().__init__()
        self.in_channels = in_channels
        self.out_channels = out_channels
        self.kernel_size = kernel_size
        self.stride = stride
        self.padding = padding
        
        scale = np.sqrt(2.0 / (in_channels * kernel_size * kernel_size))
        self._params['weight'] = Tensor(
            np.random.randn(out_channels, in_channels, kernel_size, kernel_size) * scale,
            requires_grad=True
        )
        self._params['bias'] = Tensor(np.zeros(out_channels), requires_grad=True)
    
    def forward(self, x: Tensor) -> Tensor:
        batch, channels, height, width = x.shape
        k = self.kernel_size
        s = self.stride
        p = self.padding
        
        if p > 0:
            x_padded = np.pad(x.data, ((0,0), (0,0), (p,p), (p,p)), mode='constant')
        else:
            x_padded = x.data
        
        out_h = (height + 2*p - k) // s + 1
        out_w = (width + 2*p - k) // s + 1
        
        output = np.zeros((batch, self.out_channels, out_h, out_w))
        
        for i in range(out_h):
            for j in range(out_w):
                i0, i1 = i*s, i*s+k
                j0, j1 = j*s, j*s+k
                receptive_field = x_padded[:, :, i0:i1, j0:j1]
                for oc in range(self.out_channels):
                    output[:, oc, i, j] = np.sum(
                        receptive_field * self._params['weight'].data[oc], axis=(1,2,3)
                    )
        
        output += self._params['bias'].data[np.newaxis, :, np.newaxis, np.newaxis]
        return Tensor(output, requires_grad=True)


class MaxPool2D(Layer):
    """2D Max Pooling layer"""
    
    def __init__(self, kernel_size: int = 2, stride: int = 2):
        super().__init__()
        self.kernel_size = kernel_size
        self.stride = stride
    
    def forward(self, x: Tensor) -> Tensor:
        batch, channels, height, width = x.shape
        k = self.kernel_size
        s = self.stride
        out_h = (height - k) // s + 1
        out_w = (width - k) // s + 1
        
        output = np.zeros((batch, channels, out_h, out_w))
        for i in range(out_h):
            for j in range(out_w):
                i0, i1 = i*s, i*s+k
                j0, j1 = j*s, j*s+k
                output[:, :, i, j] = np.max(x.data[:, :, i0:i1, j0:j1], axis=(2,3))
        return Tensor(output, requires_grad=True)


class Flatten(Layer):
    """Flatten layer"""
    
    def forward(self, x: Tensor) -> Tensor:
        return x.reshape(x.shape[0], -1)


class Dropout(Layer):
    """Dropout regularization layer"""
    
    def __init__(self, p: float = 0.5):
        super().__init__()
        self.p = p
        self._mask = None
    
    def forward(self, x: Tensor) -> Tensor:
        if self.training and self.p > 0:
            self._mask = np.random.binomial(1, 1 - self.p, size=x.shape) / (1 - self.p)
            return Tensor(x.data * self._mask, requires_grad=x.requires_grad)
        return x


class BatchNorm(Layer):
    """Batch normalization layer"""
    
    def __init__(self, num_features: int, eps: float = 1e-5, momentum: float = 0.1):
        super().__init__()
        self.num_features = num_features
        self.eps = eps
        self.momentum = momentum
        
        self._params['weight'] = Tensor(np.ones(num_features), requires_grad=True)
        self._params['bias'] = Tensor(np.zeros(num_features), requires_grad=True)
        
        self.running_mean = np.zeros(num_features)
        self.running_var = np.ones(num_features)
    
    def forward(self, x: Tensor) -> Tensor:
        if self.training:
            mean = np.mean(x.data, axis=0)
            var = np.var(x.data, axis=0)
            self.running_mean = (1 - self.momentum) * self.running_mean + self.momentum * mean
            self.running_var = (1 - self.momentum) * self.running_var + self.momentum * var
        else:
            mean = self.running_mean
            var = self.running_var
        
        x_norm = (x.data - mean) / np.sqrt(var + self.eps)
        out = self._params['weight'].data * x_norm + self._params['bias'].data
        return Tensor(out, requires_grad=True)


# ============================================================================
# ACTIVATION FUNCTIONS
# ============================================================================

class ReLU(Layer):
    def forward(self, x: Tensor) -> Tensor:
        return x.relu()

class Sigmoid(Layer):
    def forward(self, x: Tensor) -> Tensor:
        return x.sigmoid()

class Tanh(Layer):
    def forward(self, x: Tensor) -> Tensor:
        return x.tanh()

class Softmax(Layer):
    def forward(self, x: Tensor) -> Tensor:
        return x.softmax()

class GELU(Layer):
    """Gaussian Error Linear Unit"""
    def forward(self, x: Tensor) -> Tensor:
        return Tensor(0.5 * x.data * (1 + np.tanh(np.sqrt(2/np.pi) * (x.data + 0.044715 * x.data**3))), requires_grad=x.requires_grad)

class SiLU(Layer):
    """Sigmoid Linear Unit (Swish)"""
    def forward(self, x: Tensor) -> Tensor:
        s = 1 / (1 + np.exp(-x.data))
        return Tensor(x.data * s, requires_grad=x.requires_grad)

class Mish(Layer):
    """Mish activation: x * tanh(softplus(x))"""
    def forward(self, x: Tensor) -> Tensor:
        softplus = np.log(1 + np.exp(x.data))
        return Tensor(x.data * np.tanh(softplus), requires_grad=x.requires_grad)

class LeakyReLU(Layer):
    def __init__(self, negative_slope: float = 0.01):
        super().__init__()
        self.negative_slope = negative_slope
    
    def forward(self, x: Tensor) -> Tensor:
        return Tensor(np.where(x.data > 0, x.data, self.negative_slope * x.data), requires_grad=x.requires_grad)


# ============================================================================
# LOSS FUNCTIONS
# ============================================================================

class Loss(ABC):
    @abstractmethod
    def forward(self, pred: Tensor, target: np.ndarray) -> float:
        pass
    
    def __call__(self, pred: Tensor, target: np.ndarray) -> float:
        return self.forward(pred, target)

class MSELoss(Loss):
    def forward(self, pred: Tensor, target: np.ndarray) -> float:
        return np.mean((pred.data - target) ** 2)

class CrossEntropyLoss(Loss):
    def forward(self, pred: Tensor, target: np.ndarray) -> float:
        softmax = pred.softmax().data
        batch_size = target.shape[0]
        log_likelihood = -np.log(softmax[np.arange(batch_size), target] + 1e-8)
        return np.mean(log_likelihood)

class BCELoss(Loss):
    def forward(self, pred: Tensor, target: np.ndarray) -> float:
        p = pred.sigmoid().data
        return -np.mean(target * np.log(p + 1e-8) + (1 - target) * np.log(1 - p + 1e-8))

class HuberLoss(Loss):
    def __init__(self, delta: float = 1.0):
        self.delta = delta
    
    def forward(self, pred: Tensor, target: np.ndarray) -> float:
        diff = pred.data - target
        loss = np.where(np.abs(diff) <= self.delta, 0.5 * diff**2, self.delta * (np.abs(diff) - 0.5 * self.delta))
        return np.mean(loss)


# ============================================================================
# OPTIMIZERS
# ============================================================================

class Optimizer(ABC):
    def __init__(self, params: List[Tensor], lr: float = 0.001):
        self.params = params
        self.lr = lr
        self.steps = 0
    
    @abstractmethod
    def step(self):
        pass
    
    def zero_grad(self):
        for p in self.params:
            p.grad = None

class SGD(Optimizer):
    def __init__(self, params, lr=0.001, momentum=0.9, weight_decay=0):
        super().__init__(params, lr)
        self.momentum = momentum
        self.weight_decay = weight_decay
        self.velocities = [np.zeros_like(p.data) for p in params]
    
    def step(self):
        self.steps += 1
        for i, p in enumerate(self.params):
            if p.grad is None:
                continue
            grad = p.grad + self.weight_decay * p.data
            self.velocities[i] = self.momentum * self.velocities[i] - self.lr * grad
            p.data += self.velocities[i]

class Adam(Optimizer):
    def __init__(self, params, lr=0.001, betas=(0.9, 0.999), eps=1e-8, weight_decay=0):
        super().__init__(params, lr)
        self.beta1, self.beta2 = betas
        self.eps = eps
        self.weight_decay = weight_decay
        self.m = [np.zeros_like(p.data) for p in params]
        self.v = [np.zeros_like(p.data) for p in params]
    
    def step(self):
        self.steps += 1
        for i, p in enumerate(self.params):
            if p.grad is None:
                continue
            grad = p.grad + self.weight_decay * p.data
            self.m[i] = self.beta1 * self.m[i] + (1 - self.beta1) * grad
            self.v[i] = self.beta2 * self.v[i] + (1 - self.beta2) * grad**2
            m_hat = self.m[i] / (1 - self.beta1**self.steps)
            v_hat = self.v[i] / (1 - self.beta2**self.steps)
            p.data -= self.lr * m_hat / (np.sqrt(v_hat) + self.eps)

class AdamW(Optimizer):
    def __init__(self, params, lr=0.001, betas=(0.9, 0.999), eps=1e-8, weight_decay=0.01):
        super().__init__(params, lr)
        self.beta1, self.beta2 = betas
        self.eps = eps
        self.weight_decay = weight_decay
        self.m = [np.zeros_like(p.data) for p in params]
        self.v = [np.zeros_like(p.data) for p in params]
    
    def step(self):
        self.steps += 1
        for i, p in enumerate(self.params):
            if p.grad is None:
                continue
            p.data *= (1 - self.lr * self.weight_decay)
            self.m[i] = self.beta1 * self.m[i] + (1 - self.beta1) * p.grad
            self.v[i] = self.beta2 * self.v[i] + (1 - self.beta2) * p.grad**2
            m_hat = self.m[i] / (1 - self.beta1**self.steps)
            v_hat = self.v[i] / (1 - self.beta2**self.steps)
            p.data -= self.lr * m_hat / (np.sqrt(v_hat) + self.eps)

class RMSprop(Optimizer):
    def __init__(self, params, lr=0.001, alpha=0.99, eps=1e-8):
        super().__init__(params, lr)
        self.alpha = alpha
        self.eps = eps
        self.square_avg = [np.zeros_like(p.data) for p in params]
    
    def step(self):
        self.steps += 1
        for i, p in enumerate(self.params):
            if p.grad is None:
                continue
            self.square_avg[i] = self.alpha * self.square_avg[i] + (1 - self.alpha) * p.grad**2
            p.data -= self.lr * p.grad / (np.sqrt(self.square_avg[i]) + self.eps)


# ============================================================================
# LEARNING RATE SCHEDULERS
# ============================================================================

class LRScheduler(ABC):
    def __init__(self, optimizer: Optimizer):
        self.optimizer = optimizer
    
    @abstractmethod
    def step(self, epoch: int = None, loss: float = None):
        pass

class StepLR(LRScheduler):
    def __init__(self, optimizer, step_size=10, gamma=0.1):
        super().__init__(optimizer)
        self.step_size = step_size
        self.gamma = gamma
    
    def step(self, epoch=None, loss=None):
        if epoch is not None and epoch % self.step_size == 0:
            self.optimizer.lr *= self.gamma

class CosineAnnealingLR(LRScheduler):
    def __init__(self, optimizer, T_max=100, eta_min=0):
        super().__init__(optimizer)
        self.T_max = T_max
        self.eta_min = eta_min
        self.initial_lr = optimizer.lr
    
    def step(self, epoch=None, loss=None):
        if epoch is not None:
            self.optimizer.lr = self.eta_min + (self.initial_lr - self.eta_min) * (1 + np.cos(np.pi * epoch / self.T_max)) / 2

class ReduceLROnPlateau(LRScheduler):
    def __init__(self, optimizer, factor=0.5, patience=5, min_lr=1e-7):
        super().__init__(optimizer)
        self.factor = factor
        self.patience = patience
        self.min_lr = min_lr
        self.best_loss = float('inf')
        self.wait = 0
    
    def step(self, epoch=None, loss=None):
        if loss is not None:
            if loss < self.best_loss:
                self.best_loss = loss
                self.wait = 0
            else:
                self.wait += 1
                if self.wait >= self.patience:
                    self.optimizer.lr = max(self.optimizer.lr * self.factor, self.min_lr)
                    self.wait = 0


# ============================================================================
# MODEL PERSISTENCE
# ============================================================================

class ModelCheckpoint:
    """Save and load model checkpoints"""
    
    @staticmethod
    def save(model, path: str, metadata: Dict = None):
        checkpoint = {
            'model_state': {},
            'metadata': metadata or {},
            'timestamp': time.time()
        }
        for name, layer in model.layers.items():
            if hasattr(layer, 'save_params'):
                checkpoint['model_state'][name] = layer.save_params()
        
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        with open(path, 'wb') as f:
            pickle.dump(checkpoint, f)
    
    @staticmethod
    def load(model, path: str):
        with open(path, 'rb') as f:
            checkpoint = pickle.load(f)
        
        for name, params in checkpoint['model_state'].items():
            if name in model.layers and hasattr(model.layers[name], 'load_params'):
                model.layers[name].load_params(params)
        
        return checkpoint.get('metadata', {})


# ============================================================================
# ADAPTIVE LEARNING SYSTEM
# ============================================================================

class AdaptiveLearner:
    """Self-improving adaptive learning system"""
    
    def __init__(self, model, learning_rate: float = 0.001):
        self.model = model
        self.base_lr = learning_rate
        self.performance_history = []
        self.adaptation_rate = 0.01
        self.momentum = 0.9
        self.velocity = 0
    
    def adapt(self, current_loss: float):
        """Adapt learning rate based on performance"""
        self.performance_history.append(current_loss)
        
        if len(self.performance_history) >= 3:
            recent = self.performance_history[-3:]
            trend = np.polyfit(range(3), recent, 1)[0]
            
            if trend > 0:  # Loss increasing
                self.velocity = self.momentum * self.velocity - self.adaptation_rate
            elif trend < 0:  # Loss decreasing
                self.velocity = self.momentum * self.velocity + self.adaptation_rate
            
            # Apply adaptive learning rate
            for param in self.model.parameters():
                if param.requires_grad and param.grad is not None:
                    param.data += self.velocity * param.grad
    
    def get_performance_stats(self) -> Dict:
        if not self.performance_history:
            return {}
        return {
            'mean_loss': np.mean(self.performance_history),
            'std_loss': np.std(self.performance_history),
            'trend': np.polyfit(range(len(self.performance_history)), self.performance_history, 1)[0] if len(self.performance_history) > 1 else 0,
            'best_loss': min(self.performance_history),
            'worst_loss': max(self.performance_history)
        }


# ============================================================================
# NEURAL ARCHITECTURE SEARCH
# ============================================================================

class ArchitectureGene:
    """Represents a neural architecture gene for NAS"""
    
    def __init__(self, layer_type: str, params: Dict):
        self.layer_type = layer_type
        self.params = params
        self.fitness = 0.0
        self.age = 0
    
    def mutate(self, mutation_rate: float = 0.1):
        """Randomly mutate architecture parameters"""
        for key in self.params:
            if np.random.random() < mutation_rate:
                if isinstance(self.params[key], int):
                    self.params[key] = max(1, self.params[key] + np.random.randint(-5, 6))
                elif isinstance(self.params[key], float):
                    self.params[key] = max(0.001, self.params[key] * (1 + np.random.randn() * 0.1))
    
    def crossover(self, other: 'ArchitectureGene') -> 'ArchitectureGene':
        """Crossover with another gene"""
        child_params = {}
        for key in self.params:
            if np.random.random() < 0.5:
                child_params[key] = self.params[key]
            else:
                child_params[key] = other.params[key]
        return ArchitectureGene(self.layer_type, child_params)


class NeuralArchitectureSearch:
    """Simple neural architecture search"""
    
    def __init__(self, population_size: int = 10, generations: int = 20):
        self.population_size = population_size
        self.generations = generations
        self.population = []
        self.best_architecture = None
        self.best_fitness = -float('inf')
    
    def initialize_population(self, layer_types: List[str], param_ranges: Dict):
        """Initialize random population"""
        self.population = []
        for _ in range(self.population_size):
            layer_type = np.random.choice(layer_types)
            params = {}
            for key, (low, high) in param_ranges.items():
                if isinstance(low, int):
                    params[key] = np.random.randint(low, high + 1)
                else:
                    params[key] = np.random.uniform(low, high)
            self.population.append(ArchitectureGene(layer_type, params))
    
    def evaluate_fitness(self, gene: ArchitectureGene, train_fn) -> float:
        """Evaluate fitness of an architecture"""
        fitness = train_fn(gene)
        gene.fitness = fitness
        gene.age += 1
        return fitness
    
    def select_parents(self, tournament_size: int = 3) -> List[ArchitectureGene]:
        """Tournament selection"""
        parents = []
        for _ in range(2):
            tournament = np.random.choice(self.population, tournament_size, replace=False)
            winner = max(tournament, key=lambda g: g.fitness)
            parents.append(winner)
        return parents
    
    def evolve(self, train_fn, layer_types: List[str], param_ranges: Dict):
        """Run NAS evolution"""
        self.initialize_population(layer_types, param_ranges)
        
        for gen in range(self.generations):
            # Evaluate fitness
            for gene in self.population:
                self.evaluate_fitness(gene, train_fn)
            
            # Track best
            gen_best = max(self.population, key=lambda g: g.fitness)
            if gen_best.fitness > self.best_fitness:
                self.best_fitness = gen_best.fitness
                self.best_architecture = gen_best
            
            # Selection and reproduction
            new_population = [self.best_architecture]  # Elitism
            while len(new_population) < self.population_size:
                parents = self.select_parents()
                child = parents[0].crossover(parents[1])
                child.mutate()
                new_population.append(child)
            
            self.population = new_population
        
        return self.best_architecture


# ============================================================================
# EXPORT
# ============================================================================

__all__ = [
    'Tensor', 'Layer', 'Linear', 'Conv2D', 'MaxPool2D', 'Flatten',
    'Dropout', 'BatchNorm', 'ReLU', 'Sigmoid', 'Tanh', 'Softmax',
    'GELU', 'SiLU', 'Mish', 'LeakyReLU',
    'Loss', 'MSELoss', 'CrossEntropyLoss', 'BCELoss', 'HuberLoss',
    'Optimizer', 'SGD', 'Adam', 'AdamW', 'RMSprop',
    'LRScheduler', 'StepLR', 'CosineAnnealingLR', 'ReduceLROnPlateau',
    'ModelCheckpoint', 'AdaptiveLearner', 'ArchitectureGene', 'NeuralArchitectureSearch'
]
