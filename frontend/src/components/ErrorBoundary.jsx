import React, { useState, useEffect } from 'react';

const ErrorBoundary = ({ children, onError }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);
  const [errorInfo, setErrorInfo] = useState(null);

  useEffect(() => {
    const handleError = (error, errorInfo) => {
      setHasError(true);
      setError(error);
      setErrorInfo(errorInfo);
      
      if (onError) {
        onError(error, errorInfo);
      }
      
      // Log error to console for debugging
      console.error('Dashboard Error:', error, errorInfo);
    };

    const handleUnhandledRejection = (event) => {
      console.error('Unhandled Promise Rejection:', event.reason);
      setHasError(true);
      setError(new Error(event.reason?.message || 'Unhandled promise rejection'));
    };

    // Global error handlers
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [onError]);

  const handleReset = () => {
    setHasError(false);
    setError(null);
    setErrorInfo(null);
    
    // Reload the page to reset state
    window.location.reload();
  };

  if (hasError) {
    return (
      <div className="error-boundary-fallback">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">Something went wrong</h2>
          <p className="error-message">
            {error?.message || 'An unexpected error occurred in the dashboard.'}
          </p>
          
          <div className="error-actions">
            <button 
              onClick={handleReset}
              className="error-button primary"
            >
              Reload Dashboard
            </button>
            <button 
              onClick={() => window.history.back()}
              className="error-button secondary"
            >
              Go Back
            </button>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="error-details">
              <summary>Error Details</summary>
              <pre className="error-stack">
                {error?.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  return children;
};

export default ErrorBoundary;
