"""
Test the neural network framework - validates all components work correctly.
"""
import numpy as np
import sys
import os

# Add the path to our neural module
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from neural import (
    NeuralNetwork, Sequential,
    Dense, Conv2D, MaxPool2D, Flatten, Dropout, BatchNorm, LayerNorm,
    ReLU, Sigmoid, Tanh, Softmax, GELU, SiLU, Mish, LeakyReLU,
    MSE, CrossEntropy, BCE, Huber,
    SGD, Adam, AdamW, RMSprop
)


def test_dense_layer():
    """Test Dense layer forward and backward pass."""
    print("Testing Dense layer...")
    layer = Dense(10, 5)
    x = np.random.randn(32, 10)
    out = layer.forward(x)
    assert out.shape == (32, 5), f"Expected (32, 5), got {out.shape}"
    
    dout = np.random.randn(32, 5)
    dx = layer.backward(dout)
    assert dx.shape == (32, 10), f"Expected (32, 10), got {dx.shape}"
    print("  ✓ Dense layer works correctly")


def test_conv2d_layer():
    """Test Conv2D layer forward and backward pass."""
    print("Testing Conv2D layer...")
    layer = Conv2D(3, 16, kernel_size=3, stride=1, padding=1)
    x = np.random.randn(8, 3, 32, 32)
    out = layer.forward(x)
    assert out.shape == (8, 16, 32, 32), f"Expected (8, 16, 32, 32), got {out.shape}"
    
    dout = np.random.randn(8, 16, 32, 32)
    dx = layer.backward(dout)
    assert dx.shape == (8, 3, 32, 32), f"Expected (8, 3, 32, 32), got {dx.shape}"
    print("  ✓ Conv2D layer works correctly")


def test_maxpool2d_layer():
    """Test MaxPool2D layer forward and backward pass."""
    print("Testing MaxPool2D layer...")
    layer = MaxPool2D(pool_size=2, stride=2)
    x = np.random.randn(8, 16, 16, 16)
    out = layer.forward(x)
    assert out.shape == (8, 16, 8, 8), f"Expected (8, 16, 8, 8), got {out.shape}"
    
    dout = np.random.randn(8, 16, 8, 8)
    dx = layer.backward(dout)
    assert dx.shape == (8, 16, 16, 16), f"Expected (8, 16, 16, 16), got {dx.shape}"
    print("  ✓ MaxPool2D layer works correctly")


def test_flatten_layer():
    """Test Flatten layer."""
    print("Testing Flatten layer...")
    layer = Flatten()
    x = np.random.randn(8, 16, 4, 4)
    out = layer.forward(x)
    assert out.shape == (8, 256), f"Expected (8, 256), got {out.shape}"
    
    dout = np.random.randn(8, 256)
    dx = layer.backward(dout)
    assert dx.shape == (8, 16, 4, 4), f"Expected (8, 16, 4, 4), got {dx.shape}"
    print("  ✓ Flatten layer works correctly")


def test_dropout_layer():
    """Test Dropout layer."""
    print("Testing Dropout layer...")
    layer = Dropout(p=0.5)
    x = np.random.randn(32, 100)
    
    # Training mode
    layer.train()
    out = layer.forward(x)
    assert out.shape == x.shape
    
    # Eval mode
    layer.eval()
    out = layer.forward(x)
    assert out.shape == x.shape
    assert np.allclose(out, x), "In eval mode, dropout should not modify input"
    print("  ✓ Dropout layer works correctly")


def test_batchnorm_layer():
    """Test BatchNorm layer."""
    print("Testing BatchNorm layer...")
    layer = BatchNorm(16)
    x = np.random.randn(8, 16)
    out = layer.forward(x)
    assert out.shape == (8, 16), f"Expected (8, 16), got {out.shape}"
    
    dout = np.random.randn(8, 16)
    dx = layer.backward(dout)
    assert dx.shape == (8, 16), f"Expected (8, 16), got {dx.shape}"
    print("  ✓ BatchNorm layer works correctly")


def test_layernorm_layer():
    """Test LayerNorm layer."""
    print("Testing LayerNorm layer...")
    layer = LayerNorm(100)
    x = np.random.randn(8, 100)
    out = layer.forward(x)
    assert out.shape == (8, 100), f"Expected (8, 100), got {out.shape}"
    
    dout = np.random.randn(8, 100)
    dx = layer.backward(dout)
    assert dx.shape == (8, 100), f"Expected (8, 100), got {dx.shape}"
    print("  ✓ LayerNorm layer works correctly")


def test_activations():
    """Test all activation functions."""
    print("Testing activation functions...")
    x = np.random.randn(32, 10)
    
    activations = [ReLU(), Sigmoid(), Tanh(), Softmax(), GELU(), SiLU(), Mish(), LeakyReLU()]
    
    for act in activations:
        out = act.forward(x)
        assert out.shape == x.shape, f"{act.__class__.__name__}: expected {x.shape}, got {out.shape}"
        dout = np.random.randn(32, 10)
        dx = act.backward(dout)
        assert dx.shape == x.shape, f"{act.__class__.__name__} backward: expected {x.shape}, got {dx.shape}"
        print(f"  ✓ {act.__class__.__name__} works correctly")


def test_losses():
    """Test all loss functions."""
    print("Testing loss functions...")
    
    # MSE
    y_pred = np.random.randn(32, 5)
    y_true = np.random.randn(32, 5)
    mse = MSE()
    loss = mse(y_pred, y_true)
    grad = mse.backward()
    assert grad.shape == y_pred.shape
    print("  ✓ MSE works correctly")
    
    # CrossEntropy
    y_pred = np.random.rand(32, 10)
    y_pred = y_pred / y_pred.sum(axis=1, keepdims=True)
    y_true_idx = np.random.randint(0, 10, 32)
    ce = CrossEntropy()
    loss = ce(y_pred, y_true_idx)
    grad = ce.backward()
    assert grad.shape == y_pred.shape
    print("  ✓ CrossEntropy works correctly")
    
    # BCE
    y_pred = np.random.rand(32, 1)
    y_true = (np.random.rand(32, 1) > 0.5).astype(float)
    bce = BCE()
    loss = bce(y_pred, y_true)
    grad = bce.backward()
    assert grad.shape == y_pred.shape
    print("  ✓ BCE works correctly")
    
    # Huber
    y_pred = np.random.randn(32, 5)
    y_true = np.random.randn(32, 5)
    huber = Huber(delta=1.0)
    loss = huber(y_pred, y_true)
    grad = huber.backward()
    assert grad.shape == y_pred.shape
    print("  ✓ Huber works correctly")


def test_optimizers():
    """Test all optimizers."""
    print("Testing optimizers...")
    
    # Create dummy parameters and gradients
    params = {
        'weight': np.random.randn(10, 5),
        'bias': np.zeros(5)
    }
    grads = {
        'weight': np.random.randn(10, 5) * 0.01,
        'bias': np.random.randn(5) * 0.01
    }
    
    optimizers = [
        SGD(learning_rate=0.01),
        Adam(learning_rate=0.001),
        AdamW(learning_rate=0.001),
        RMSprop(learning_rate=0.001)
    ]
    
    for opt in optimizers:
        # Make copies for each optimizer
        p = {k: v.copy() for k, v in params.items()}
        g = {k: v.copy() for k, v in grads.items()}
        opt.step(p, g)
        assert p['weight'].shape == params['weight'].shape
        print(f"  ✓ {opt.__class__.__name__} works correctly")


def test_training_loop():
    """Test a full training loop with a simple problem."""
    print("Testing full training loop...")
    
    # XOR problem
    X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=np.float64)
    y = np.array([[0], [1], [1], [0]], dtype=np.float64)
    
    np.random.seed(42)
    
    model = NeuralNetwork(
        layers=[
            Dense(2, 8),
            ReLU(),
            Dense(8, 1),
            Sigmoid()
        ],
        loss=BCE(),
        optimizer=Adam(learning_rate=0.1)
    )
    
    history = model.fit(X, y, epochs=200, batch_size=4, verbose=0)
    
    # Check that loss decreased
    assert history['loss'][-1] < history['loss'][0], \
        f"Loss did not decrease: {history['loss'][0]} -> {history['loss'][-1]}"
    print(f"  ✓ Training loop works - loss: {history['loss'][0]:.4f} -> {history['loss'][-1]:.4f}")


def test_cnn_training():
    """Test CNN training on a simple pattern recognition task."""
    print("Testing CNN training...")
    
    # Create simple synthetic data: classify images as horizontal or vertical stripes
    np.random.seed(42)
    n_samples = 100
    
    X = np.zeros((n_samples, 1, 8, 8), dtype=np.float64)
    y = np.zeros((n_samples, 2), dtype=np.float64)
    
    for i in range(n_samples):
        if np.random.rand() > 0.5:
            # Horizontal stripes
            X[i, 0, ::2, :] = 1.0
            y[i, 0] = 1.0
        else:
            # Vertical stripes
            X[i, 0, :, ::2] = 1.0
            y[i, 1] = 1.0
    
    model = NeuralNetwork(
        layers=[
            Conv2D(1, 8, kernel_size=3, padding=1),
            ReLU(),
            MaxPool2D(pool_size=2),
            Flatten(),
            Dense(8 * 4 * 4, 2),
            Softmax()
        ],
        loss=CrossEntropy(),
        optimizer=Adam(learning_rate=0.01)
    )
    
    history = model.fit(X, y, epochs=10, batch_size=20, verbose=0)
    
    # Check that loss decreased
    assert history['loss'][-1] < history['loss'][0], \
        f"Loss did not decrease: {history['loss'][0]} -> {history['loss'][-1]}"
    print(f"  ✓ CNN training works - loss: {history['loss'][0]:.4f} -> {history['loss'][-1]:.4f}")


if __name__ == '__main__':
    print("=" * 60)
    print("Neural Network Framework Tests")
    print("=" * 60)
    
    test_dense_layer()
    test_conv2d_layer()
    test_maxpool2d_layer()
    test_flatten_layer()
    test_dropout_layer()
    test_batchnorm_layer()
    test_layernorm_layer()
    test_activations()
    test_losses()
    test_optimizers()
    test_training_loop()
    test_cnn_training()
    
    print("=" * 60)
    print("All tests passed! ✓")
    print("=" * 60)