"""Vanilla RNN with Backpropagation Through Time (BPTT)."""

import numpy as np
from .layers import Linear
from .activations import tanh, softmax


class RNN:
    """
    Vanilla Recurrent Neural Network.
    
    h_t = tanh(x_t @ W_hh + h_{t-1} @ W_hh + b_h)
    y_t = softmax(h_t @ W_hy + b_y)
    
    Supports Backpropagation Through Time (BPTT) for training.
    """
    
    def __init__(self, input_size, hidden_size, output_size):
        """
        Args:
            input_size: Dimensionality of input features
            hidden_size: Number of hidden units
            output_size: Dimensionality of output (e.g., vocab size for language modeling)
        """
        self.input_size = input_size
        self.hidden_size = hidden_size
        self.output_size = output_size
        
        # Xavier initialization
        limit_xh = np.sqrt(6.0 / (input_size + hidden_size))
        limit_hh = np.sqrt(6.0 / (hidden_size + hidden_size))
        limit_hy = np.sqrt(6.0 / (hidden_size + output_size))
        
        # Input to hidden weights
        self.W_xh = np.random.uniform(-limit_xh, limit_xh, (input_size, hidden_size))
        # Hidden to hidden weights
        self.W_hh = np.random.uniform(-limit_hh, limit_hh, (hidden_size, hidden_size))
        # Hidden bias
        self.b_h = np.zeros(hidden_size)
        # Hidden to output weights
        self.W_hy = np.random.uniform(-limit_hy, limit_hy, (hidden_size, output_size))
        # Output bias
        self.b_y = np.zeros(output_size)
        
        # Gradients
        self.dW_xh = np.zeros_like(self.W_xh)
        self.dW_hh = np.zeros_like(self.W_hh)
        self.db_h = np.zeros_like(self.b_h)
        self.dW_hy = np.zeros_like(self.W_hy)
        self.db_y = np.zeros_like(self.b_y)
        
        # Cache for BPTT
        self._cache = None
    
    def forward(self, x, h_prev=None):
        """
        Forward pass through time.
        
        Args:
            x: Input sequence of shape (batch_size, seq_len, input_size) or (seq_len, input_size)
            h_prev: Previous hidden state of shape (batch_size, hidden_size) or (hidden_size,)
            
        Returns:
            outputs: Output at each time step, shape (batch_size, seq_len, output_size)
            hiddens: Hidden states at each time step, shape (batch_size, seq_len, hidden_size)
        """
        single_sample = x.ndim == 2
        if single_sample:
            x = x[np.newaxis, :, :]
        
        batch_size, seq_len, _ = x.shape
        
        if h_prev is None:
            h_prev = np.zeros((batch_size, self.hidden_size))
        
        # Store states for BPTT
        hiddens = np.zeros((batch_size, seq_len, self.hidden_size))
        outputs = np.zeros((batch_size, seq_len, self.output_size))
        hiddens_pre_activation = np.zeros((batch_size, seq_len, self.hidden_size))
        
        h = h_prev
        for t in range(seq_len):
            # h_t = tanh(x_t @ W_xh + h_{t-1} @ W_hh + b_h)
            pre_act = x[:, t] @ self.W_xh + h @ self.W_hh + self.b_h
            h = np.tanh(pre_act)
            hiddens_pre_activation[:, t] = pre_act
            hiddens[:, t] = h
            
            # y_t = h_t @ W_hy + b_y
            y = h @ self.W_hy + self.b_y
            outputs[:, t] = y
        
        self._cache = (x, hiddens, hiddens_pre_activation, h_prev)
        
        if single_sample:
            return outputs[:, 0], hiddens[:, 0]
        return outputs, hiddens
    
    def backward(self, dout, truncate=None):
        """
        Backward pass using BPTT.
        
        Args:
            dout: Gradient of loss w.r.t. outputs, shape (batch_size, seq_len, output_size)
            truncate: Truncation length for truncated BPTT (None = full BPTT)
            
        Returns:
            dx: Gradient w.r.t. inputs
            dh_prev: Gradient w.r.t. initial hidden state
        """
        x, hiddens, hiddens_pre_activation, h_prev = self._cache
        batch_size, seq_len, _ = x.shape
        
        # Zero gradients
        self.zero_grad()
        
        dx = np.zeros_like(x)
        dh_next = np.zeros((batch_size, self.hidden_size))
        
        for t in reversed(range(seq_len)):
            # Gradient through output layer
            self.dW_hy += hiddens[:, t].T @ dout[:, t]
            self.db_y += np.sum(dout[:, t], axis=0)
            
            # Gradient w.r.t. hidden state
            dh = dout[:, t] @ self.W_hy.T + dh_next
            
            # Gradient through tanh
            dpre_act = dh * (1.0 - hiddens[:, t] ** 2)
            
            # Gradient w.r.t. parameters
            self.dW_xh += x[:, t].T @ dpre_act
            self.db_h += np.sum(dpre_act, axis=0)
            
            if t > 0:
                self.dW_hh += hiddens[:, t-1].T @ dpre_act
                dh_next = dpre_act @ self.W_hh.T
            else:
                self.dW_hh += h_prev.T @ dpre_act
                dh_next = dpre_act @ self.W_hh.T
            
            # Gradient w.r.t. input
            dx[:, t] = dpre_act @ self.W_xh.T
        
        self.db_y /= batch_size
        self.dW_xh /= batch_size
        self.dW_hh /= batch_size
        self.db_h /= batch_size
        self.dW_hy /= batch_size
        
        return dx, dh_next
    
    def zero_grad(self):
        """Zero all gradients."""
        self.dW_xh.fill(0)
        self.dW_hh.fill(0)
        self.db_h.fill(0)
        self.dW_hy.fill(0)
        self.db_y.fill(0)
    
    def params(self):
        """Return list of parameters."""
        return [self.W_xh, self.W_hh, self.b_h, self.W_hy, self.b_y]
    
    def grads(self):
        """Return list of gradients."""
        return [self.dW_xh, self.dW_hh, self.db_h, self.dW_hy, self.db_y]
    
    def __call__(self, x, h_prev=None):
        return self.forward(x, h_prev)