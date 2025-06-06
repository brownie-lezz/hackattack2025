import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.min.css'

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from './reportWebVitals';

// Global error handler
window.onerror = function (message, source, lineno, colno, error) {
  console.error('Global error:', { message, source, lineno, colno, error });
  return false;
};

// Unhandled promise rejection handler
window.onunhandledrejection = function (event) {
  console.error('Unhandled promise rejection:', event.reason);
};

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          border: '1px solid red',
          borderRadius: '5px',
          backgroundColor: '#fff3f3'
        }}>
          <h2>Something went wrong.</h2>
          <p>Please try refreshing the page. If the problem persists, contact support.</p>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>Error Details</summary>
            <p>{this.state.error && this.state.error.toString()}</p>
            <p>{this.state.errorInfo && this.state.errorInfo.componentStack}</p>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

// Create root and render with error boundary
try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found. Make sure you have a div with id 'root' in your index.html");
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to render React app:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; margin: 20px; border: 1px solid red; border-radius: 5px; background-color: #fff3f3;">
      <h2>Failed to start application</h2>
      <p>${error.message}</p>
      <p>Please check the console for more details.</p>
    </div>
  `;
}

// Report web vitals
reportWebVitals(console.log);
