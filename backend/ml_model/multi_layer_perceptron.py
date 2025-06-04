from sklearn.base import BaseEstimator, RegressorMixin
import torch
from torch import nn
import numpy as np
import pickle

class TensorTransformer(BaseEstimator):
    def fit(self, X, y=None):
        return self

    def transform(self, X):
        return torch.tensor(X, dtype=torch.float32)

class Model(nn.Module):
    def __init__(self, num_hidden_layers: int, n_units_last: int, dropout_rate: float):
        super().__init__()

        if num_hidden_layers < 1 or num_hidden_layers > 4:
            raise ValueError("num_hidden_layers must be between 1 and 4")

        self.layers = nn.ModuleList()
        layer_sizes = [n_units_last * (2 ** i) for i in reversed(range(num_hidden_layers))]
        
        # Add hidden layers based on num_hidden_layers parameter
        for i in range(num_hidden_layers):
            layer_size = layer_sizes[i]
            self.layers.append(nn.LazyLinear(layer_size))
            self.layers.append(nn.BatchNorm1d(layer_size))
            self.layers.append(nn.LeakyReLU())
            self.layers.append(nn.Dropout(dropout_rate))

         # Output layer
        self.layers.append(nn.LazyLinear(1))

    def forward(self, X):
        for layer in self.layers:
            X = layer(X)
            
        return X

class CustomNeuralNetRegressor(BaseEstimator, RegressorMixin):
    """A custom neural network regressor that doesn't depend on skorch."""

    def __init__(self, 
                 module,
                 module__num_hidden_layers=2, 
                 module__n_units_last=64, 
                 module__dropout_rate=0.2,
                 lr=0.01,
                 batch_size=32,
                 max_epochs=10,
                 device='cpu',
                 lambda1=0.01,
                 torch_load_kwargs=None):
        """Initialize the regressor.
        
        Parameters:
        -----------
        module : nn.Module
            The PyTorch module to use.
        module__* : Any
            Parameters to pass to the module constructor.
        lr : float
            Learning rate for the optimizer.
        batch_size : int
            Mini-batch size for training.
        max_epochs : int
            Maximum number of training epochs.
        device : str
            Device to use ('cpu' or 'cuda').
        lambda1 : float
            L1 regularization strength.
        """
        self.module = module
        self.module__num_hidden_layers = module__num_hidden_layers
        self.module__n_units_last = module__n_units_last
        self.module__dropout_rate = module__dropout_rate
        self.lr = lr
        self.batch_size = batch_size
        self.max_epochs = max_epochs
        self.device = device
        self.lambda1 = lambda1
        self.torch_load_kwargs = torch_load_kwargs or {}
        
        # These will be set during fit
        self.module_ = None
        self.optimizer_ = None
        self.history_ = []

    def initialize(self):
        """Initialize the module."""
        if self.module_ is None:
            self.module_ = self.module(
                num_hidden_layers=self.module__num_hidden_layers,
                n_units_last=self.module__n_units_last,
                dropout_rate=self.module__dropout_rate
            )
            self.module_.to(self.device)
            
            # Initialize optimizer
            self.optimizer_ = torch.optim.Adam(self.module_.parameters(), lr=self.lr)

    def fit(self, X, y):
        """Fit the model to the data.
        
        Parameters:
        -----------
        X : array-like
            Training data.
        y : array-like
            Target values.
            
        Returns:
        --------
        self
        """
        # Initialize if not already done
        if self.module_ is None:
            self.initialize()
        
        # Convert data to tensors
        X = torch.tensor(X, dtype=torch.float32).to(self.device)
        y = torch.tensor(y, dtype=torch.float32).reshape(-1, 1).to(self.device)
        
        # Create dataset and dataloader
        dataset = torch.utils.data.TensorDataset(X, y)
        dataloader = torch.utils.data.DataLoader(
            dataset, batch_size=self.batch_size, shuffle=True
        )
        
        # Training loop
        self.module_.train()
        criterion = nn.MSELoss()
        
        for epoch in range(self.max_epochs):
            epoch_loss = 0.0
            for batch_X, batch_y in dataloader:
                self.optimizer_.zero_grad()
                
                # Forward pass
                outputs = self.module_(batch_X)
                
                # Compute loss
                loss = criterion(outputs, batch_y)
                
                # Add L1 regularization for the first layer
                if self.lambda1 > 0:
                    l1_loss = 0
                    for param in self.module_.layers[0].parameters():
                        l1_loss += param.abs().sum()
                    loss += self.lambda1 * l1_loss
                
                # Backward pass and optimize
                loss.backward()
                self.optimizer_.step()
                
                epoch_loss += loss.item()
            
            avg_loss = epoch_loss / len(dataloader)
            self.history_.append(avg_loss)
            
        return self
    
    def predict(self, X):
        """Predict using the fitted model.
        
        Parameters:
        -----------
        X : array-like
            Data to predict.
            
        Returns:
        --------
        y_pred : array-like
            Predicted values.
        """
        if self.module_ is None:
            raise RuntimeError("Model is not fitted yet. Call 'fit' first.")
        
        self.module_.eval()
        
        # If X is already a tensor, use it directly
        if isinstance(X, torch.Tensor):
            X_tensor = X.to(self.device)
        else:
            X_tensor = torch.tensor(X, dtype=torch.float32).to(self.device)
        
        with torch.no_grad():
            predictions = self.module_(X_tensor)
        
        return predictions.cpu().numpy()
    
    def load_params(self, path):
        """Load model parameters from a file.
        
        Parameters:
        -----------
        path : str
            Path to the model parameters file.
        """
        if self.module_ is None:
            self.initialize()
        
        # Load the state dict
        if 'weights_only' in self.torch_load_kwargs and self.torch_load_kwargs['weights_only']:
            state_dict = torch.load(path, map_location=self.device)
            self.module_.load_state_dict(state_dict)
        else:
            with open(path, 'rb') as f:
                params = pickle.load(f)
                self.module_.load_state_dict(params)
        
        return self
    
    def get_params(self, deep=True):
        """Get parameters for this estimator.
        
        This method is required for scikit-learn compatibility.
        """
        params = {
            'module': self.module,
            'module__num_hidden_layers': self.module__num_hidden_layers,
            'module__n_units_last': self.module__n_units_last,
            'module__dropout_rate': self.module__dropout_rate,
            'lr': self.lr,
            'batch_size': self.batch_size,
            'max_epochs': self.max_epochs,
            'device': self.device,
            'lambda1': self.lambda1,
            'torch_load_kwargs': self.torch_load_kwargs
        }
        return params
    
    def set_params(self, **params):
        """Set parameters for this estimator.
        
        This method is required for scikit-learn compatibility.
        """
        for key, value in params.items():
            if key.startswith('module__'):
                setattr(self, key, value)
            else:
                setattr(self, key, value)
        return self 