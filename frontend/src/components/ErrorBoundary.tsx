import React, { Component, ErrorInfo, ReactNode } from 'react';
import { UserIdFixer } from '../utils/userIdFix';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isFixing: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isFixing: false
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      isFixing: false
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleFixUserId = async () => {
    this.setState({ isFixing: true });
    
    try {
      const fixedUser = await UserIdFixer.fixUserId();
      
      if (fixedUser) {
        console.log('✅ User ID fixed successfully, reloading page...');
        window.location.reload();
      } else {
        this.setState({ 
          isFixing: false,
          error: new Error('Unable to fix user ID. Please log in again.')
        });
      }
    } catch (error) {
      console.error('Failed to fix user ID:', error);
      this.setState({ 
        isFixing: false,
        error: new Error('Failed to fix user ID. Please log out and log in again.')
      });
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-container">
            <div className="text-center">
              <div className="error-icon">🚨</div>
              <h2 className="error-title">Something went wrong</h2>
              <p className="error-message">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              
              <div className="error-actions">
                <button
                  onClick={this.handleFixUserId}
                  disabled={this.state.isFixing}
                  className="action-button primary"
                >
                  {this.state.isFixing ? 'Fixing...' : 'Fix User Account'}
                </button>
                
                <button
                  onClick={this.handleReload}
                  className="action-button secondary"
                >
                  Reload Page
                </button>
              </div>
              
              <details className="error-details">
                <summary>Error Details</summary>
                <pre className="error-stack">
                  {this.state.error?.stack}
                </pre>
                <pre className="error-info">
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
