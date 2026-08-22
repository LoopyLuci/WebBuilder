"""Gated Recurrent Unit (GRU) network implementation."""

import numpy as np
from .layers import Linear
from .activations import sigmoid, tanh


class GRU:
    """
    Gated Recurrent Unit (GRU) network.
    
    The GRU cell uses two gates:
    - Reset gate: r_t = sigmoid(x_t @ W_r + h_{t-1} @ U_r + b_r)
    - Update gate: z_t = sigmoid(x_t @ W_z + h_{t-1} @ U_z + b_z)
    - Candidate hidden state: h_tilde = tanh(x_t @ W_h + (r_t * h_{t-1}) @ U_h + b_h)
    - Hidden state: h_t = (1 - z_t) * h_tilde + z_t * h_{t-1}
    """
    
    def __init__(self, input_size, hidden_size, output_size):
        """
        Args:
            input_size: Dimensionality of input features
            hidden_size: Number of hidden units
            output_size: Dimensionality of output
        """
        self.input_size = input_size
        self.hidden_size = hidden_size
        self.output_size = output_size
        
        limit_x = np.sqrt(6.0 / (input_size + hidden_size))
        limit_h = np.sqrt(6.0 / (hidden_size + hidden_size))
        limit_y = np.sqrt(6.0 / (hidden_size + output_size))
        
        # Combined weights for gates
        # Gates: r (reset), z (update), h (candidate)
        self.W_ir = np.random.uniform(-limit_x, limit_x, (input_size, hidden_size))  # Reset gate input
        self.W_iz = np.random.uniform(-limit_x, limit_x, (input_size, hidden_size))  # Update gate input
        self.W_ih = np.random.uniform(-limit_x, limit_x, (input_size, hidden_size))  # Candidate input
        
        self.W_hr = np.random.uniform(-limit_h, limit_h, (hidden_size, hidden_size))  # Reset gate hidden
        self.W_hz = np.random.uniform(-limit_h, limit_h, (hidden_size, hidden_size))  # Update gate hidden
        self.W_hh = np.random.uniform(-limit_h, limit_h, (hidden_size, hidden_size))  # Candidate hidden
        
        self.b_ir = np.zeros(hidden_size)
        self.b_iz = np.zeros(hidden_size)
        self.b_ih = np.zeros(hidden_size)
        
        self.b_hr = np.zeros(hidden_size)
        self.b_hz = np.zeros(hidden_size)
        self.b_hh = np.zeros(hidden_size)
        
        # Output layer
        self.W_out = np.random.uniform(-limit_y, limit_y, (hidden_size, output_size))
        self.b_out = np.zeros(output_size)
        
        # Gradients
        self.dW_ir = np.zeros_like(self.W_ir)
        self.dW_iz = np.zeros_like(self.W_iz)
        self.dW_ih = np.zeros_like(self.W_ih)
        self.dW_hr = np.zeros_like(self.W_hr)
        self.dW_hz = np.zeros_like(self.W_hz)
        self.dW_hh = np.zeros_like(self.W_hh)
        self.db_ir = np.zeros_like(self.b_ir)
        self.db_iz = np.zeros_like(self.b_iz)
        self.db_ih = np.zeros_like(self.b_ih)
        self.db_hr = np.zeros_like(self.b_hr)
        self.db_hz = np.zeros_like(self.b_hz)
        self.db_hh = np.zeros_like(self.b_hh)
        self.dW_out = np.zeros_like(self.W_out)
        self.db_out = np.zeros_like(self.b_out)
        
        # Cache for BPTT
        self._cache = None
    
    def _step_forward(self, x_t, h_prev):
        """Single GRU step forward."""
        # Gates
        r = sigmoid(x_t @ self.W_ir + h_prev @ self.W_hr + self.b_ir + self.b_hr)
        z = sigmoid(x_t @ self.W_iz + h_prev @ self.W_hz + self.b_iz + self.b_hz)
        
        # Candidate hidden state
        h_tilde = np.tanh(x_t @ self.W_ih + (r * h_prev) @ self.W_hh + self.b_ih + self.b_hh)
        
        # Hidden state update
        h = (1.0 - z) * h_tilde + z * h_prev
        
        return h, (r, z, h_tilde, h_prev)
    
    def forward(self, x, h_prev=None):
        """
        Forward pass through time.
        
        Args:
            x: Input sequence of shape (batch_size, seq_len, input_size) or (seq_len, input_size)
            h_prev: Previous hidden state
            
        Returns:
            outputs: (batch_size, seq_len, output_size)
            hiddens: (batch_size, seq_len, hidden_size)
        """
        single_sample = x.ndim == 2
        if single_sample:
            x = x[np.newaxis, :, :]
        
        batch_size, seq_len, _ = x.shape
        
        if h_prev is None:
            h_prev = np.zeros((batch_size, self.hidden_size))
        
        hiddens = np.zeros((batch_size, seq_len, self.hidden_size))
        outputs = np.zeros((batch_size, seq_len, self.output_size))
        cache_list = []
        
        h = h_prev
        for t in range(seq_len):
            h, cache_t = self._step_forward(x[:, t], h)
            hiddens[:, t] = h
            outputs[:, t] = h @ self.W_out + self.b_out
            cache_list.append(cache_t)
        
        self._cache = (x, hiddens, cache_list, h_prev)
        
        if single_sample:
            return outputs[:, 0], hiddens[:, 0]
        return outputs, hiddens
    
    def backward(self, dout):
        """
        Backward pass through time.
        
        Args:
            dout: Gradient w.r.t. outputs, shape (batch_size, seq_len, output_size)
            
        Returns:
            dx: Gradient w.r.t. inputs
            dh_prev: Gradient w.r.t. initial hidden state
        """
        x, hiddens, cache_list, h_prev = self._cache
        batch_size, seq_len, _ = x.shape
        
        self.zero_grad()
        
        dx = np.zeros_like(x)
        dh_next = np.zeros((batch_size, self.hidden_size))
        
        for t in reversed(range(seq_len)):
            # Gradient through output layer
            self.dW_out += hiddens[:, t].T @ dout[:, t]
            self.db_out += np.sum(dout[:, t], axis=0)
            
            # Gradient w.r.t. hidden state
            dh = dout[:, t] @ self.W_out.T + dh_next
            
            # Retrieve cached values
            r, z, h_tilde, h_prev_t = cache_list[t]
            
            # Gradient through update equation: h = (1-z)*h_tilde + z*h_prev
            dz = dh * (h_prev_t - h_tilde)
            dh_tilde = dh * (1.0 - z)
            
            if t > 0:
                dh_prev_from_update = dh * z
            else:
                dh_prev_from_update = dh * z
            
            # Gradient through tanh for candidate
            dcan = dh_tilde * (1.0 - h_tilde ** 2)
            
            # Gradient through reset gate
            if t > 0:
                dr = (dcan @ self.W_hh.T) * hiddens[:, t-1]
            else:
                dr = (dcan @ self.W_hh.T) * h_prev
            
            # Accumulate gradients for candidate
            self.dW_ih += x[:, t].T @ dcan
            self.db_ih += np.sum(dcan, axis=0)
            if t > 0:
                self.dW_hh += (r * hiddens[:, t-1]).T @ dcan
            else:
                self.dW_hh += (r * h_prev).T @ dcan
            self.db_hh += np.sum(dcan, axis=0)
            
            # Accumulate gradients for reset gate
            dr_raw = dr * r * (1.0 - r)
            self.dW_ir += x[:, t].T @ dr_raw
            self.db_ir += np.sum(dr_raw, axis=0)
            if t > 0:
                self.dW_hr += hiddens[:, t-1].T @ dr_raw
            else:
                self.dW_hr += h_prev.T @ dr_raw
            self.db_hr += np.sum(dr_raw, axis=0)
            
            # Accumulate gradients for update gate
            dz_raw = dz * z * (1.0 - z)
            self.dW_iz += x[:, t].T @ dz_raw
            self.db_iz += np.sum(dz_raw, axis=0)
            if t > 0:
                self.dW_hz += hiddens[:, t-1].T @ dz_raw
            else:
                self.dW_hz += h_prev.T @ dz_raw
            self.db_hz += np.sum(dz_raw, axis=0)
            
            # Compute gradient w.r.t. input and previous hidden
            dx[:, t] = dcan @ self.W_ih.T + dr_raw @ self.W_ir.T + dz_raw @ self.W_iz.T
            
            # Previous hidden gradient
            if t > 0:
                dh_next = (dh_prev_from_update + 
                          dcan @ self.W_hh.T * r + 
                          dr_raw @ self.W_hr.T + 
                          dz_raw @ self.W_hz.T)
            else:
                dh_next = (dh_prev_from_update + 
                          dcan @ self.W_hh.T * r + 
                          dr_raw @ self.W_hr.T + 
                          dz_raw @ self.W_hz.T)
        
        # Average over batch
        for grad in [self.dW_out, self.db_out, self.dW_ir, self.dW_iz, self.dW_ih,
                     self.dW_hr, self.dW_hz, self.dW_hh, self.db_ir, self.db_iz,
                     self.db_ih, self.db_hr, self.db_hz, self.db_hh]:
            grad /= batch_size
        
        return dx, dh_next
    
    def zero_grad(self):
        """Zero all gradients."""
        self.dW_ir.fill(0)
        self.dW_iz.fill(0)
        self.dW_ih.fill(0)
        self.dW_hr.fill(0)
        self.dW_hz.fill(0)
        self.dW_hh.fill(0)
        self.db_ir.fill(0)
        self.db_iz.fill(0)
        self.db_ih.fill(0)
        self.db_hr.fill(0)
        self.db_hz.fill(0)
        self.db_hh.fill(0)
        self.dW_out.fill(0)
        self.db_out.fill(0)
    
    def params(self):
        """Return list of parameters."""
        return [self.W_ir, self.W_iz, self.W_ih, self.W_hr, self.W_hz, self.W_hh,
                self.b_ir, self.b_iz, self.b_ih, self.b_hr, self.b_hz, self.b_hh,
                self.W_out, self.b_out]
    
    def grads(self):
        """Return list of gradients."""
        return [self.dW_ir, self.dW_iz, self.dW_ih, self.dW_hr, self.dW_hz, self.dW_hh,
                self.db_ir, self.db_iz, self.db_ih, self.db_hr, self.db_hz, self.db_hh,
                self.dW_out, self.db_out]
    
    def __call__(self, x, h_prev=None):
        return self.forward(x, h_prev)