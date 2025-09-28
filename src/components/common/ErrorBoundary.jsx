import React from 'react';
import { Result, Button } from 'antd';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="Something went wrong"
          subTitle="An unexpected error occurred. You can try reloading the page or resetting the application state."
          extra={[
            <Button type="primary" key="reload" onClick={this.handleReload}>
              Reload Page
            </Button>,
            <Button key="reset" onClick={this.handleReset}>
              Try Again
            </Button>,
          ]}
        >
          {process.env.NODE_ENV === 'development' && (
            <div className="text-left bg-gray-100 p-4 rounded mt-4 text-xs font-mono">
              <details>
                <summary>Error Details (Development Only)</summary>
                <pre className="whitespace-pre-wrap mt-2">
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            </div>
          )}
        </Result>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;