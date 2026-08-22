"""Long Short-Term Memory (LSTM) network implementation."""

import numpy as np
from .layers import Linear
from .activations import sigmoid, tanh


class LSTM:
    """
    Long Short-Term Memory (LSTM) network.
    
    The LSTM cell uses three gates:
    - Forget gate: f_t = sigmoid(x_t @ W_f + h_{t-1} @ U_f + b_f)
    - Input gate:  i_t = sigmoid(x_t @ W_i + h_{t-1} @ U_i + b_i)
    - Output gate: o_t = sigmoid(x_t @ W_o + h_{t-1} @ U_o + b_o)
    - Cell state:  c_t = f_t * c_{t-1} + i_t * tanh(x_t @ W_c + h_{t-1} @ U_c + b_c)
    - Hidden state: h_t = o_t * tanh(c_t)
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
        
        # Combined weights for all gates (for efficiency)
        # Gates: f (forget), i (input), o (output), g (cell candidate)
        limit_x = np.sqrt(6.0 / (input_size + hidden_size))
        limit_h = np.sqrt(6.0 / (hidden_size + hidden_size))
        limit_y = np.sqrt(6.0 / (hidden_size + output_size))
        
        # Input weights (for all gates concatenated)
        self.W_ih = np.random.uniform(-limit_x, limit_x, (input_size, 4 * hidden_size))
        # Hidden weights (for all gates concatenated)
        self.W_hh = np.random.uniform(-limit_h, limit_h, (hidden_size, 4 * hidden_size))
        # Biases
        self.b_ih = np.zeros(4 * hidden_size)
        self.b_hh = np.zeros(4 * hidden_size)
        # Set forget gate bias to 1.0 for better gradient flow
        self.b_ih[:hidden_size] = 1.0
        
        # Output layer
        self.W_out = np.random.uniform(-limit_y, limit_y, (hidden_size, output_size))
        self.b_out = np.zeros(output_size)
        
        # Gradients
        self.dW_ih = np.zeros_like(self.W_ih)
        self.dW_hh = np.zeros_like(self.W_hh)
        self.db_ih = np.zeros_like(self.b_ih)
        self.db_hh = np.zeros_like(self.b_hh)
        self.dW_out = np.zeros_like(self.W_out)
        self.db_out = np.zeros_like(self.b_out)
        
        # Cache for BPTT
        self._cache = None
    
    def _step_forward(self, x_t, h_prev, c_prev):
        """Single LSTM step forward."""
        # Compute all gate activations at once
        gates = x_t @ self.W_ih + h_prev @ self.W_hh + self.b_ih + self.b_hh
        
        # Split into individual gates
        H = self.hidden_size
        f = sigmoid(gates[:, :H])        # Forget gate
        i = sigmoid(gates[:, H:2*H])     # Input gate
        o = sigmoid(gates[:, 2*H:3*H])   # Output gate
        g = np.tanh(gates[:, 3*H:4*H])   # Cell candidate
        
        # Update cell state and hidden state
        c = f * c_prev + i * g
        h = o * np.tanh(c)
        
        return h, c, (f, i, o, g, c_prev)
    
    def forward(self, x, h_prev=None, c_prev=None):
        """
        Forward pass through time.
        
        Args:
            x: Input sequence of shape (batch_size, seq_len, input_size) or (seq_len, input_size)
            h_prev: Previous hidden state
            c_prev: Previous cell state
            
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
        if c_prev is None:
            c_prev = np.zeros((batch_size, self.hidden_size))
        
        hiddens = np.zeros((batch_size, seq_len, self.hidden_size))
        outputs = np.zeros((batch_size, seq_len, self.output_size))
        cache_list = []
        
        h, c = h_prev, c_prev
        for t in range(seq_len):
            h, c, cache_t = self._step_forward(x[:, t], h, c)
            hiddens[:, t] = h
            outputs[:, t] = h @ self.W_out + self.b_out
            cache_list.append(cache_t)
        
        self._cache = (x, hiddens, cache_list, h_prev, c_prev)
        
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
            dc_prev: Gradient w.r.t. initial cell state
        """
        x, hiddens, cache_list, h_prev, c_prev = self._cache
        batch_size, seq_len, _ = x.shape
        
        self.zero_grad()
        
        dx = np.zeros_like(x)
        dh_next = np.zeros((batch_size, self.hidden_size))
        dc_next = np.zeros((batch_size, self.hidden_size))
        
        for t in reversed(range(seq_len)):
            # Gradient through output layer
            self.dW_out += hiddens[:, t].T @ dout[:, t]
            self.db_out += np.sum(dout[:, t], axis=0)
            
            # Gradient w.r.t. hidden state
            dh = dout[:, t] @ self.W_out.T + dh_next
            
            # Retrieve cached values
            f, i, o, g, c_prev_t = cache_list[t]
            
            # Gradient through output gate
            dtanh_c = dh * o
            dc = dtanh_c * (1.0 - np.tanh(f * c_prev_t + i * g) ** 2) + dc_next
            
            # Gradient through gates
            df = dc * c_prev_t
            di = dc * g
            dg = dc * i
            do = dh * np.tanh(f * c_prev_t + i * g)
            
            # Gradient through sigmoid/tanh
            H = self.hidden_size
            dgates = np.zeros((batch_size, 4 * H))
            dgates[:, :H] = df * f * (1.0 - f)         # Forget gate
            dgates[:, H:2*H] = di * i * (1.0 - i)       # Input gate
            dgates[:, 2*H:3*H] = do * o * (1.0 - o)     # Output gate
            dgates[:, 3*H:4*H] = dg * (1.0 - g ** 2)    # Cell candidate
            
            # Gradient w.r.t. parameters
            self.dW_ih += x[:, t].T @ dgates
            self.db_ih += np.sum(dgates, axis=0)
            
            if t > 0:
                self.dW_hh += hiddens[:, t-1].T @ dgates
                dh_next = dgates @ self.W_hh.T
            else:
                self.dW_hh += h_prev.T @ dgates
                dh_next = dgates @ self.W_hh.T
            
            dc_next = dc * f
            dx[:, t] = dgates @ self.W_ih.T
        
        # Average over batch
        self.dW_out /= batch_size
        self.db_out /= batch_size
        self.dW_ih /= batch_size
        self.dW_hh /= batch_size
        self.db_ih /= batch_size
        self.db_hh /= batch_size
        
        return dx, dh_next, dc_next
    
    def zero_grad(self):
        """Zero all gradients."""
        self.dW_ih.fill(0)
        self.dW_hh.fill(0)
        self.db_ih.fill(0)
        self.db_hh.fill(0)
        self.dW_out.fill(0)
        self.db_out.fill(0)
    
    def params(self):
        """Return list of parameters."""
        return [self.W_ih, self.W_hh, self.b_ih, self.b_hh, self.W_out, self.b_out]
    
    def grads(self):
        """Return list of gradients."""
        return [self.dW_ih, self.dW_hh, self.db_ih, self.db_hh, self.dW_out, self.db_out]
    
    def __call__(self, x, h_prev=None, c_prev=None):
        return self.forward(x, h_prev, c_prev)