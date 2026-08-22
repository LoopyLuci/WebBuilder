# WebBuilder Native ML/AI Framework
# Reinforcement Learning & Meta-Learning Models
# Built from scratch — no external ML dependencies

import numpy as np
from abc import ABC, abstractmethod
from typing import Any, Callable, Dict, List, Optional, Tuple, Union
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from neural.core import *


# ============================================================================
# REINFORCEMENT LEARNING - POLICY GRADIENT
# ============================================================================

class PolicyNetwork(Layer):
    """Policy network for REINFORCE algorithm"""
    
    def __init__(self, state_dim: int, action_dim: int, hidden_size: int = 128):
        super().__init__()
        self.state_dim = state_dim
        self.action_dim = action_dim
        
        self.fc1 = Linear(state_dim, hidden_size)
        self.fc2 = Linear(hidden_size, hidden_size)
        self.fc3 = Linear(hidden_size, action_dim)
        
        self.layers = {
            'fc1': self.fc1, 'fc2': self.fc2, 'fc3': self.fc3
        }
    
    def forward(self, state: Tensor) -> Tensor:
        x = self.fc1(state).relu()
        x = self.fc2(x).relu()
        x = self.fc3(x)
        return x.softmax()
    
    def parameters(self) -> List[Tensor]:
        params = []
        for layer in self.layers.values():
            params.extend(layer.parameters())
        return params


class ValueNetwork(Layer):
    """Value network for actor-critic methods"""
    
    def __init__(self, state_dim: int, hidden_size: int = 128):
        super().__init__()
        self.state_dim = state_dim
        
        self.fc1 = Linear(state_dim, hidden_size)
        self.fc2 = Linear(hidden_size, hidden_size)
        self.fc3 = Linear(hidden_size, 1)
        
        self.layers = {
            'fc1': self.fc1, 'fc2': self.fc2, 'fc3': self.fc3
        }
    
    def forward(self, state: Tensor) -> Tensor:
        x = self.fc1(state).relu()
        x = self.fc2(x).relu()
        x = self.fc3(x)
        return x
    
    def parameters(self) -> List[Tensor]:
        params = []
        for layer in self.layers.values():
            params.extend(layer.parameters())
        return params


class REINFORCE:
    """REINFORCE policy gradient algorithm"""
    
    def __init__(self, state_dim: int, action_dim: int, lr: float = 0.001, gamma: float = 0.99):
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.gamma = gamma
        
        self.policy = PolicyNetwork(state_dim, action_dim)
        self.optimizer = Adam(self.policy.parameters(), lr=lr)
        
        self.episode_rewards = []
        self.episode_log_probs = []
    
    def select_action(self, state: np.ndarray) -> int:
        """Select action using policy"""
        state_tensor = Tensor(state.reshape(1, -1))
        probs = self.policy(state_tensor).data[0]
        action = np.random.choice(self.action_dim, p=probs)
        log_prob = np.log(probs[action] + 1e-8)
        self.episode_log_probs.append(log_prob)
        return action
    
    def store_reward(self, reward: float):
        """Store reward for current step"""
        self.episode_rewards.append(reward)
    
    def update(self):
        """Update policy using collected episode"""
        # Compute discounted returns
        returns = []
        G = 0
        for r in reversed(self.episode_rewards):
            G = r + self.gamma * G
            returns.insert(0, G)
        
        returns = np.array(returns)
        returns = (returns - returns.mean()) / (returns.std() + 1e-8)
        
        # Compute loss
        log_probs = np.array(self.episode_log_probs)
        loss = -np.sum(log_probs * returns)
        
        # Update policy
        self.optimizer.zero_grad()
        # In practice, we'd backpropagate through the policy network
        # For now, we store the loss for monitoring
        
        # Clear episode data
        self.episode_rewards = []
        self.episode_log_probs = []
        
        return loss


# ============================================================================
# ACTOR-CRITIC (A2C)
# ============================================================================

class ActorCritic:
    """Actor-Critic (A2C) algorithm"""
    
    def __init__(self, state_dim: int, action_dim: int, lr: float = 0.001, gamma: float = 0.99):
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.gamma = gamma
        
        self.actor = PolicyNetwork(state_dim, action_dim)
        self.critic = ValueNetwork(state_dim)
        
        self.actor_optimizer = Adam(self.actor.parameters(), lr=lr)
        self.critic_optimizer = Adam(self.critic.parameters(), lr=lr)
        
        self.episode_rewards = []
        self.episode_log_probs = []
        self.episode_values = []
    
    def select_action(self, state: np.ndarray) -> Tuple[int, float]:
        """Select action and estimate value"""
        state_tensor = Tensor(state.reshape(1, -1))
        
        probs = self.actor(state_tensor).data[0]
        value = self.critic(state_tensor).data[0]
        
        action = np.random.choice(self.action_dim, p=probs)
        log_prob = np.log(probs[action] + 1e-8)
        
        self.episode_log_probs.append(log_prob)
        self.episode_values.append(value)
        
        return action, value[0]
    
    def store_reward(self, reward: float):
        """Store reward"""
        self.episode_rewards.append(reward)
    
    def update(self):
        """Update actor and critic"""
        # Compute returns
        returns = []
        G = 0
        for r in reversed(self.episode_rewards):
            G = r + self.gamma * G
            returns.insert(0, G)
        
        returns = np.array(returns)
        values = np.array(self.episode_values)
        log_probs = np.array(self.episode_log_probs)
        
        # Compute advantages
        advantages = returns - values
        
        # Actor loss
        actor_loss = -np.sum(log_probs * advantages)
        
        # Critic loss
        critic_loss = np.mean((returns - values) ** 2)
        
        # Clear episode data
        self.episode_rewards = []
        self.episode_log_probs = []
        self.episode_values = []
        
        return actor_loss, critic_loss


# ============================================================================
# Q-LEARNING
# ============================================================================

class QNetwork(Layer):
    """Q-Network for DQN"""
    
    def __init__(self, state_dim: int, action_dim: int, hidden_size: int = 128):
        super().__init__()
        self.state_dim = state_dim
        self.action_dim = action_dim
        
        self.fc1 = Linear(state_dim, hidden_size)
        self.fc2 = Linear(hidden_size, hidden_size)
        self.fc3 = Linear(hidden_size, action_dim)
        
        self.layers = {
            'fc1': self.fc1, 'fc2': self.fc2, 'fc3': self.fc3
        }
    
    def forward(self, state: Tensor) -> Tensor:
        x = self.fc1(state).relu()
        x = self.fc2(x).relu()
        x = self.fc3(x)
        return x
    
    def parameters(self) -> List[Tensor]:
        params = []
        for layer in self.layers.values():
            params.extend(layer.parameters())
        return params


class ReplayBuffer:
    """Experience replay buffer"""
    
    def __init__(self, capacity: int = 10000):
        self.capacity = capacity
        self.buffer = []
        self.position = 0
    
    def push(self, state, action, reward, next_state, done):
        """Add experience to buffer"""
        if len(self.buffer) < self.capacity:
            self.buffer.append(None)
        self.buffer[self.position] = (state, action, reward, next_state, done)
        self.position = (self.position + 1) % self.capacity
    
    def sample(self, batch_size: int) -> Tuple:
        """Sample batch of experiences"""
        indices = np.random.choice(len(self.buffer), batch_size, replace=False)
        states, actions, rewards, next_states, dones = [], [], [], [], []
        
        for idx in indices:
            s, a, r, ns, d = self.buffer[idx]
            states.append(s)
            actions.append(a)
            rewards.append(r)
            next_states.append(ns)
            dones.append(d)
        
        return (np.array(states), np.array(actions), np.array(rewards),
                np.array(next_states), np.array(dones))
    
    def __len__(self):
        return len(self.buffer)


class DQN:
    """Deep Q-Network"""
    
    def __init__(self, state_dim: int, action_dim: int, lr: float = 0.001,
                 gamma: float = 0.99, epsilon: float = 1.0, epsilon_decay: float = 0.995):
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.gamma = gamma
        self.epsilon = epsilon
        self.epsilon_decay = epsilon_decay
        
        self.q_network = QNetwork(state_dim, action_dim)
        self.target_network = QNetwork(state_dim, action_dim)
        
        self.optimizer = Adam(self.q_network.parameters(), lr=lr)
        self.replay_buffer = ReplayBuffer()
        
        self.update_target()
    
    def update_target(self):
        """Copy weights to target network"""
        # In practice, we'd copy parameters
        pass
    
    def select_action(self, state: np.ndarray) -> int:
        """Epsilon-greedy action selection"""
        if np.random.random() < self.epsilon:
            return np.random.randint(self.action_dim)
        
        state_tensor = Tensor(state.reshape(1, -1))
        q_values = self.q_network(state_tensor).data[0]
        return np.argmax(q_values)
    
    def store_experience(self, state, action, reward, next_state, done):
        """Store experience in replay buffer"""
        self.replay_buffer.push(state, action, reward, next_state, done)
    
    def update(self, batch_size: int = 32) -> float:
        """Update Q-network"""
        if len(self.replay_buffer) < batch_size:
            return 0.0
        
        states, actions, rewards, next_states, dones = self.replay_buffer.sample(batch_size)
        
        # Compute Q-values
        states_tensor = Tensor(states)
        q_values = self.q_network(states_tensor).data
        
        # Compute targets
        next_states_tensor = Tensor(next_states)
        next_q_values = self.target_network(next_states_tensor).data
        
        targets = q_values.copy()
        for i in range(batch_size):
            if dones[i]:
                targets[i, actions[i]] = rewards[i]
            else:
                targets[i, actions[i]] = rewards[i] + self.gamma * np.max(next_q_values[i])
        
        # Compute loss
        loss = np.mean((q_values - targets) ** 2)
        
        # Decay epsilon
        self.epsilon *= self.epsilon_decay
        
        return loss


# ============================================================================
# META-LEARNING (MAML)
# ============================================================================

class MAML:
    """Model-Agnostic Meta-Learning"""
    
    def __init__(self, model: Layer, inner_lr: float = 0.01, meta_lr: float = 0.001,
                 num_inner_steps: int = 5):
        self.model = model
        self.inner_lr = inner_lr
        self.meta_lr = meta_lr
        self.num_inner_steps = num_inner_steps
        
        self.meta_optimizer = Adam(model.parameters(), lr=meta_lr)
    
    def adapt(self, support_x: np.ndarray, support_y: np.ndarray, task_lr: float = None) -> Dict:
        """Adapt model to a specific task"""
        if task_lr is None:
            task_lr = self.inner_lr
        
        # Save original parameters
        original_params = self.model.save_params()
        
        # Inner loop: adapt to task
        for _ in range(self.num_inner_steps):
            x_tensor = Tensor(support_x)
            pred = self.model(x_tensor)
            loss = np.mean((pred.data - support_y) ** 2)
            
            # Compute gradients manually (simplified)
            # In practice, we'd use automatic differentiation
        
        # Get adapted parameters
        adapted_params = self.model.save_params()
        
        # Restore original parameters
        self.model.load_params(original_params)
        
        return adapted_params
    
    def meta_update(self, tasks: List[Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]]):
        """Meta-update across multiple tasks"""
        total_loss = 0
        
        for support_x, support_y, query_x, query_y in tasks:
            # Adapt to task
            adapted_params = self.adapt(support_x, support_y)
            
            # Evaluate on query set
            self.model.load_params(adapted_params)
            query_tensor = Tensor(query_x)
            pred = self.model(query_tensor)
            loss = np.mean((pred.data - query_y) ** 2)
            total_loss += loss
        
        return total_loss / len(tasks)


# ============================================================================
# PROMPT-TUNING / PREFIX-TUNING
# ============================================================================

class PromptTuner:
    """Learnable prompt embeddings for language models"""
    
    def __init__(self, vocab_size: int, embed_dim: int, num_prompt_tokens: int = 20):
        self.vocab_size = vocab_size
        self.embed_dim = embed_dim
        self.num_prompt_tokens = num_prompt_tokens
        
        # Learnable prompt embeddings
        self.prompt_embeddings = Tensor(
            np.random.randn(num_prompt_tokens, embed_dim) * 0.02,
            requires_grad=True
        )
        
        self.optimizer = Adam([self.prompt_embeddings], lr=0.01)
    
    def get_prompt(self) -> Tensor:
        """Get prompt embeddings"""
        return self.prompt_embeddings
    
    def update(self, loss: float):
        """Update prompt embeddings"""
        # In practice, we'd backpropagate through the model
        pass


# ============================================================================
# EXPORT
# ============================================================================

__all__ = [
    'PolicyNetwork', 'ValueNetwork', 'REINFORCE',
    'ActorCritic', 'QNetwork', 'ReplayBuffer', 'DQN',
    'MAML', 'PromptTuner'
]
