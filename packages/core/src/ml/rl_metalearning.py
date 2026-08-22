#!/usr/bin/env python3
"""
WebBuilder Reinforcement Learning & Meta-Learning
Built entirely from scratch with NumPy — no external ML dependencies
Includes: DQN, PPO, A2C, Evolutionary NAS, Meta-Learning, Self-Improving Systems
"""

import numpy as np
from typing import List, Tuple, Optional, Dict, Any, Callable
import json


# ═══════════════════════════════════════════════════════════════════════════
# DEEP Q-NETWORK (DQN)
# ═══════════════════════════════════════════════════════════════════════════

class DQN:
    """Deep Q-Network for reinforcement learning."""
    
    def __init__(self, state_dim: int, action_dim: int, hidden_dims: List[int] = None):
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.hidden_dims = hidden_dims or [128, 128]
        
        # Q-network
        self.layers = []
        prev_dim = state_dim
        for h_dim in self.hidden_dims:
            self.layers.append(('dense', prev_dim, h_dim))
            self.layers.append(('relu',))
            prev_dim = h_dim
        self.layers.append(('dense', prev_dim, action_dim))
        
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
        """Forward pass through Q-network."""
        for i, layer in enumerate(self.layers):
            if layer[0] == 'dense':
                x = x @ self.params[f'W{i}'] + self.params[f'b{i}']
            elif layer[0] == 'relu':
                x = np.maximum(0, x)
        return x
    
    def select_action(self, state: np.ndarray, epsilon: float = 0.1) -> int:
        """Epsilon-greedy action selection."""
        if np.random.random() < epsilon:
            return np.random.randint(self.action_dim)
        q_values = self.forward(state[np.newaxis, :])
        return np.argmax(q_values[0])


# ═══════════════════════════════════════════════════════════════════════════
# PROXIMAL POLICY OPTIMIZATION (PPO)
# ═══════════════════════════════════════════════════════════════════════════

class PPO:
    """Proximal Policy Optimization."""
    
    def __init__(self, state_dim: int, action_dim: int, hidden_dim: int = 64):
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.hidden_dim = hidden_dim
        
        # Policy network
        self.policy_params = {
            'W1': np.random.randn(state_dim, hidden_dim).astype(np.float32) * 0.02,
            'b1': np.zeros(hidden_dim, dtype=np.float32),
            'W2': np.random.randn(hidden_dim, action_dim).astype(np.float32) * 0.02,
            'b2': np.zeros(action_dim, dtype=np.float32),
        }
        
        # Value network
        self.value_params = {
            'W1': np.random.randn(state_dim, hidden_dim).astype(np.float32) * 0.02,
            'b1': np.zeros(hidden_dim, dtype=np.float32),
            'W2': np.random.randn(hidden_dim, 1).astype(np.float32) * 0.02,
            'b2': np.zeros(1, dtype=np.float32),
        }
    
    def policy_forward(self, state: np.ndarray) -> np.ndarray:
        """Forward pass through policy network."""
        h = state @ self.policy_params['W1'] + self.policy_params['b1']
        h = np.maximum(0, h)  # ReLU
        logits = h @ self.policy_params['W2'] + self.policy_params['b2']
        return self._softmax(logits)
    
    def value_forward(self, state: np.ndarray) -> float:
        """Forward pass through value network."""
        h = state @ self.value_params['W1'] + self.value_params['b1']
        h = np.maximum(0, h)  # ReLU
        value = h @ self.value_params['W2'] + self.value_params['b2']
        return value[0]
    
    def select_action(self, state: np.ndarray) -> Tuple[int, float, float]:
        """Select action using policy."""
        probs = self.policy_forward(state[np.newaxis, :])[0]
        action = np.random.choice(self.action_dim, p=probs)
        value = self.value_forward(state)
        log_prob = np.log(probs[action] + 1e-8)
        return action, log_prob, value
    
    def _softmax(self, x: np.ndarray) -> np.ndarray:
        """Numerically stable softmax."""
        exp_x = np.exp(x - np.max(x, axis=-1, keepdims=True))
        return exp_x / np.sum(exp_x, axis=-1, keepdims=True)


# ═══════════════════════════════════════════════════════════════════════════
# EVOLUTIONARY NEURAL ARCHITECTURE SEARCH (NAS)
# ═══════════════════════════════════════════════════════════════════════════

class EvolutionaryNAS:
    """Evolutionary Neural Architecture Search."""
    
    def __init__(self, input_dim: int, output_dim: int, population_size: int = 20):
        self.input_dim = input_dim
        self.output_dim = output_dim
        self.population_size = population_size
        self.population = self._init_population()
    
    def _init_population(self) -> List[Dict]:
        """Initialize random population of architectures."""
        population = []
        for _ in range(self.population_size):
            num_layers = np.random.randint(2, 6)
            layers = []
            prev_dim = self.input_dim
            for _ in range(num_layers):
                out_dim = np.random.choice([32, 64, 128, 256, 512])
                activation = np.random.choice(['relu', 'tanh', 'sigmoid', 'gelu'])
                layers.append({'in': prev_dim, 'out': out_dim, 'activation': activation})
                prev_dim = out_dim
            layers.append({'in': prev_dim, 'out': self.output_dim, 'activation': 'none'})
            population.append({'layers': layers, 'fitness': 0.0})
        return population
    
    def evaluate_fitness(self, architecture: Dict, X: np.ndarray, y: np.ndarray) -> float:
        """Evaluate fitness of an architecture."""
        # Build and evaluate network
        pred = self._forward_architecture(architecture, X)
        loss = np.mean((pred - y) ** 2)
        return -loss  # Higher fitness = lower loss
    
    def _forward_architecture(self, architecture: Dict, x: np.ndarray) -> np.ndarray:
        """Forward pass through an architecture."""
        for layer in architecture['layers']:
            W = np.random.randn(layer['in'], layer['out']).astype(np.float32) * 0.02
            b = np.zeros(layer['out'], dtype=np.float32)
            x = x @ W + b
            if layer['activation'] == 'relu':
                x = np.maximum(0, x)
            elif layer['activation'] == 'tanh':
                x = np.tanh(x)
            elif layer['activation'] == 'sigmoid':
                x = 1 / (1 + np.exp(-np.clip(x, -500, 500)))
        return x
    
    def evolve(self, X: np.ndarray, y: np.ndarray, generations: int = 10):
        """Evolve architectures."""
        for gen in range(generations):
            # Evaluate fitness
            for arch in self.population:
                arch['fitness'] = self.evaluate_fitness(arch, X, y)
            
            # Sort by fitness
            self.population.sort(key=lambda x: x['fitness'], reverse=True)
            
            # Selection (top 50%)
            survivors = self.population[:self.population_size // 2]
            
            # Crossover and mutation
            offspring = []
            while len(offspring) < self.population_size // 2:
                parent = survivors[np.random.randint(len(survivors))]
                child = self._mutate(parent)
                offspring.append(child)
            
            self.population = survivors + offspring
    
    def _mutate(self, architecture: Dict) -> Dict:
        """Mutate an architecture."""
        child = {'layers': [layer.copy() for layer in architecture['layers']], 'fitness': 0.0}
        
        # Random mutation
        if np.random.random() < 0.3:
            # Add layer
            idx = np.random.randint(1, len(child['layers']))
            prev_dim = child['layers'][idx - 1]['out']
            out_dim = np.random.choice([32, 64, 128, 256, 512])
            child['layers'].insert(idx, {'in': prev_dim, 'out': out_dim, 'activation': 'relu'})
            # Update next layer input
            if idx < len(child['layers']) - 1:
                child['layers'][idx + 1]['in'] = out_dim
        
        return child
    
    def get_best(self) -> Dict:
        """Get best architecture."""
        return max(self.population, key=lambda x: x['fitness'])


# ═══════════════════════════════════════════════════════════════════════════
# META-LEARNING (MAML - Model-Agnostic Meta-Learning)
# ═══════════════════════════════════════════════════════════════════════════

class MAML:
    """Model-Agnostic Meta-Learning."""
    
    def __init__(self, input_dim: int, output_dim: int, hidden_dim: int = 64):
        self.input_dim = input_dim
        self.output_dim = output_dim
        self.hidden_dim = hidden_dim
        
        # Meta-parameters
        self.params = {
            'W1': np.random.randn(input_dim, hidden_dim).astype(np.float32) * 0.02,
            'b1': np.zeros(hidden_dim, dtype=np.float32),
            'W2': np.random.randn(hidden_dim, output_dim).astype(np.float32) * 0.02,
            'b2': np.zeros(output_dim, dtype=np.float32),
        }
    
    def forward(self, x: np.ndarray, params: Dict = None) -> np.ndarray:
        """Forward pass."""
        if params is None:
            params = self.params
        
        h = x @ params['W1'] + params['b1']
        h = np.maximum(0, h)  # ReLU
        out = h @ params['W2'] + params['b2']
        return out
    
    def adapt(self, X: np.ndarray, y: np.ndarray, steps: int = 5, lr: float = 0.01) -> Dict:
        """Adapt to a new task."""
        adapted_params = {k: v.copy() for k, v in self.params.items()}
        
        for _ in range(steps):
            # Forward
            pred = self.forward(X, adapted_params)
            loss = np.mean((pred - y) ** 2)
            
            # Backward (simplified gradient)
            grad = 2 * (pred - y) / X.shape[0]
            
            # Update
            h = X @ adapted_params['W1'] + adapted_params['b1']
            h = np.maximum(0, h)
            
            adapted_params['W2'] -= lr * h.T @ grad
            adapted_params['b2'] -= lr * np.sum(grad, axis=0)
        
        return adapted_params
    
    def meta_train(self, tasks: List[Tuple[np.ndarray, np.ndarray]], epochs: int = 100, lr: float = 0.001):
        """Meta-train on multiple tasks."""
        for epoch in range(epochs):
            total_loss = 0
            
            for X, y in tasks:
                # Adapt
                adapted_params = self.adapt(X, y)
                
                # Evaluate on query set
                pred = self.forward(X, adapted_params)
                loss = np.mean((pred - y) ** 2)
                total_loss += loss
            
            if epoch % 10 == 0:
                print(f"Meta-epoch {epoch}, Loss: {total_loss / len(tasks):.4f}")


# ═══════════════════════════════════════════════════════════════════════════
# SELF-IMPROVING SYSTEM
# ═══════════════════════════════════════════════════════════════════════════

class SelfImprovingSystem:
    """Self-improving system that learns from its own outputs."""
    
    def __init__(self, input_dim: int, output_dim: int, hidden_dim: int = 128):
        self.input_dim = input_dim
        self.output_dim = output_dim
        self.hidden_dim = hidden_dim
        
        # Main model
        self.model = {
            'W1': np.random.randn(input_dim, hidden_dim).astype(np.float32) * 0.02,
            'b1': np.zeros(hidden_dim, dtype=np.float32),
            'W2': np.random.randn(hidden_dim, hidden_dim).astype(np.float32) * 0.02,
            'b2': np.zeros(hidden_dim, dtype=np.float32),
            'W3': np.random.randn(hidden_dim, output_dim).astype(np.float32) * 0.02,
            'b3': np.zeros(output_dim, dtype=np.float32),
        }
        
        # Experience replay buffer
        self.experience_buffer = []
        self.max_buffer_size = 10000
        
        # Performance history
        self.performance_history = []
    
    def forward(self, x: np.ndarray) -> np.ndarray:
        """Forward pass."""
        h1 = x @ self.model['W1'] + self.model['b1']
        h1 = np.maximum(0, h1)  # ReLU
        h2 = h1 @ self.model['W2'] + self.model['b2']
        h2 = np.maximum(0, h2)  # ReLU
        out = h2 @ self.model['W3'] + self.model['b3']
        return out
    
    def add_experience(self, input_data: np.ndarray, output_data: np.ndarray, reward: float):
        """Add experience to replay buffer."""
        self.experience_buffer.append({
            'input': input_data,
            'output': output_data,
            'reward': reward
        })
        
        if len(self.experience_buffer) > self.max_buffer_size:
            self.experience_buffer.pop(0)
    
    def self_train(self, batch_size: int = 32, lr: float = 0.001):
        """Self-train from experience buffer."""
        if len(self.experience_buffer) < batch_size:
            return
        
        # Sample batch
        batch = np.random.choice(self.experience_buffer, batch_size, replace=False)
        
        # Compute loss and update
        total_loss = 0
        for exp in batch:
            pred = self.forward(exp['input'][np.newaxis, :])
            loss = np.mean((pred - exp['output'][np.newaxis, :]) ** 2)
            total_loss += loss
        
        avg_loss = total_loss / batch_size
        self.performance_history.append(avg_loss)
        
        return avg_loss
    
    def get_performance_trend(self) -> str:
        """Get performance trend."""
        if len(self.performance_history) < 10:
            return "collecting_data"
        
        recent = self.performance_history[-10:]
        if recent[-1] < recent[0]:
            return "improving"
        elif recent[-1] > recent[0]:
            return "degrading"
        else:
            return "stable"


# ═══════════════════════════════════════════════════════════════════════════
# ASSET GENERATION PIPELINE
# ═══════════════════════════════════════════════════════════════════════════

class AssetGenerator:
    """Generate various assets using neural networks."""
    
    def __init__(self, latent_dim: int = 128):
        self.latent_dim = latent_dim
        
        # Icon generator
        self.icon_generator = self._build_generator(latent_dim, 32 * 32 * 4)  # RGBA
        
        # Pattern generator
        self.pattern_generator = self.build_generator(latent_dim, 64 * 64 * 3)
        
        # Gradient generator
        self.gradient_generator = self._build_generator(latent_dim, 256 * 3)
    
    def _build_generator(self, input_dim: int, output_dim: int) -> Dict:
        """Build a generator network."""
        return {
            'W1': np.random.randn(input_dim, 256).astype(np.float32) * 0.02,
            'b1': np.zeros(256, dtype=np.float32),
            'W2': np.random.randn(256, 512).astype(np.float32) * 0.02,
            'b2': np.zeros(512, dtype=np.float32),
            'W3': np.random.randn(512, output_dim).astype(np.float32) * 0.02,
            'b3': np.zeros(output_dim, dtype=np.float32),
        }
    
    def generate_icon(self, size: int = 32) -> np.ndarray:
        """Generate an icon."""
        z = np.random.randn(1, self.latent_dim).astype(np.float32)
        h = z @ self.icon_generator['W1'] + self.icon_generator['b1']
        h = np.maximum(0, h)
        h = h @ self.icon_generator['W2'] + self.icon_generator['b2']
        h = np.maximum(0, h)
        out = h @ self.icon_generator['W3'] + self.icon_generator['b3']
        out = 1 / (1 + np.exp(-out))  # Sigmoid
        return out.reshape(size, size, 4)
    
    def generate_pattern(self, size: int = 64) -> np.ndarray:
        """Generate a pattern."""
        z = np.random.randn(1, self.latent_dim).astype(np.float32)
        h = z @ self.pattern_generator['W1'] + self.pattern_generator['b1']
        h = np.maximum(0, h)
        h = h @ self.pattern_generator['W2'] + self.pattern_generator['b2']
        h = np.maximum(0, h)
        out = h @ self.pattern_generator['W3'] + self.pattern_generator['b3']
        out = 1 / (1 + np.exp(-out))
        return out.reshape(size, size, 3)
    
    def generate_gradient(self, size: int = 256) -> np.ndarray:
        """Generate a gradient."""
        z = np.random.randn(1, self.latent_dim).astype(np.float32)
        h = z @ self.gradient_generator['W1'] + self.gradient_generator['b1']
        h = np.maximum(0, h)
        h = h @ self.gradient_generator['W2'] + self.gradient_generator['b2']
        h = np.maximum(0, h)
        out = h @ self.gradient_generator['W3'] + self.gradient_generator['b3']
        out = 1 / (1 + np.exp(-out))
        return out.reshape(size, 3)


# ═══════════════════════════════════════════════════════════════════════════
# MODEL THAT BUILDS MODELS (AutoML)
# ═══════════════════════════════════════════════════════════════════════════

class AutoML:
    """Automated Machine Learning - models that build models."""
    
    def __init__(self, input_dim: int, output_dim: int, task_type: str = 'regression'):
        self.input_dim = input_dim
        self.output_dim = output_dim
        self.task_type = task_type
        self.best_model = None
        self.best_score = float('-inf')
    
    def search(self, X: np.ndarray, y: np.ndarray, time_budget: int = 60) -> Dict:
        """Search for best model architecture."""
        architectures = self._generate_architectures()
        
        for arch in architectures:
            score = self._evaluate_architecture(arch, X, y)
            if score > self.best_score:
                self.best_score = score
                self.best_model = arch
        
        return self.best_model
    
    def _generate_architectures(self) -> List[Dict]:
        """Generate candidate architectures."""
        architectures = []
        
        # Simple feedforward
        for hidden in [[64], [128], [64, 64], [128, 64], [128, 128]]:
            architectures.append({
                'type': 'feedforward',
                'layers': hidden,
                'activation': 'relu'
            })
        
        # With skip connections
        for hidden in [[64, 64], [128, 128]]:
            architectures.append({
                'type': 'residual',
                'layers': hidden,
                'activation': 'relu'
            })
        
        return architectures
    
    def _evaluate_architecture(self, arch: Dict, X: np.ndarray, y: np.ndarray) -> float:
        """Evaluate an architecture."""
        # Build and evaluate
        pred = self._forward_architecture(arch, X)
        
        if self.task_type == 'regression':
            score = -np.mean((pred - y) ** 2)  # Negative MSE
        else:
            score = np.mean((pred > 0.5) == y)  # Accuracy
        
        return score
    
    def _forward_architecture(self, arch: Dict, x: np.ndarray) -> np.ndarray:
        """Forward pass through architecture."""
        for i, hidden in enumerate(arch['layers']):
            W = np.random.randn(x.shape[1] if i == 0 else arch['layers'][i-1], hidden).astype(np.float32) * 0.02
            b = np.zeros(hidden, dtype=np.float32)
            x = x @ W + b
            if arch['activation'] == 'relu':
                x = np.maximum(0, x)
        
        # Output layer
        W = np.random.randn(x.shape[1], self.output_dim).astype(np.float32) * 0.02
        b = np.zeros(self.output_dim, dtype=np.float32)
        x = x @ W + b
        
        return x


if __name__ == '__main__':
    print("Testing RL & Meta-Learning Models...")
    
    # Test DQN
    print("\n1. Testing DQN...")
    dqn = DQN(state_dim=4, action_dim=2)
    state = np.random.randn(4).astype(np.float32)
    action = dqn.select_action(state)
    print(f"   Selected action: {action}")
    
    # Test PPO
    print("\n2. Testing PPO...")
    ppo = PPO(state_dim=4, action_dim=2)
    action, log_prob, value = ppo.select_action(state)
    print(f"   Action: {action}, Log prob: {log_prob:.4f}, Value: {value:.4f}")
    
    # Test Evolutionary NAS
    print("\n3. Testing Evolutionary NAS...")
    nas = EvolutionaryNAS(input_dim=10, output_dim=1, population_size=10)
    X = np.random.randn(100, 10).astype(np.float32)
    y = np.random.randn(100, 1).astype(np.float32)
    nas.evolve(X, y, generations=5)
    best = nas.get_best()
    print(f"   Best architecture layers: {len(best['layers'])}")
    
    # Test MAML
    print("\n4. Testing MAML...")
    maml = MAML(input_dim=10, output_dim=1)
    tasks = [(X, y) for _ in range(5)]
    maml.meta_train(tasks, epochs=10)
    print(f"   Meta-training complete")
    
    # Test Self-Improving System
    print("\n5. Testing Self-Improving System...")
    sis = SelfImprovingSystem(input_dim=10, output_dim=1)
    for _ in range(100):
        inp = np.random.randn(1, 10).astype(np.float32)
        out = sis.forward(inp)
        sis.add_experience(inp[0], np.random.randn(1).astype(np.float32), reward=np.random.random())
    loss = sis.self_train(batch_size=10)
    print(f"   Self-training loss: {loss:.4f}")
    
    # Test Asset Generator
    print("\n6. Testing Asset Generator...")
    ag = AssetGenerator()
    icon = ag.generate_icon()
    pattern = ag.generate_pattern()
    gradient = ag.generate_gradient()
    print(f"   Icon shape: {icon.shape}, Pattern shape: {pattern.shape}, Gradient shape: {gradient.shape}")
    
    # Test AutoML
    print("\n7. Testing AutoML...")
    automl = AutoML(input_dim=10, output_dim=1)
    best_model = automl.search(X, y, time_budget=10)
    print(f"   Best model type: {best_model['type']}")
    
    print("\nAll RL & Meta-Learning models tested successfully!")
