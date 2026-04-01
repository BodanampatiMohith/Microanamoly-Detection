import React, { useEffect, useState } from "react";

const ErrorBoundary = ({ children, onError }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);
  const [errorInfo, setErrorInfo] = useState(null);

  useEffect(() => {
    const handleError = (event) => {
      const nextError = event?.error || new Error(event?.message || "Unexpected dashboard error");
      setHasError(true);
      setError(nextError);
      setErrorInfo(event);
      onError?.(nextError, event);
      console.error("Dashboard Error:", nextError, event);
    };

    const handleUnhandledRejection = (event) => {
      const nextError = new Error(event.reason?.message || "Unhandled promise rejection");
      console.error("Unhandled Promise Rejection:", event.reason);
      setHasError(true);
      setError(nextError);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [onError]);

  const handleReset = () => {
    setHasError(false);
    setError(null);
    setErrorInfo(null);
    window.location.reload();
  };

  if (hasError) {
    return (
      <div className="error-boundary-fallback">
        <div className="error-container">
          <div className="error-icon">Warning</div>
          <h2 className="error-title">Something went wrong</h2>
          <p className="error-message">
            {error?.message || "An unexpected error occurred in the dashboard."}
          </p>

          <div className="error-actions">
            <button onClick={handleReset} className="error-button primary">
              Reload Dashboard
            </button>
            <button onClick={() => window.history.back()} className="error-button secondary">
              Go Back
            </button>
          </div>

          {import.meta.env.DEV && (
            <details className="error-details">
              <summary>Error Details</summary>
              <pre className="error-stack">{error?.stack || JSON.stringify(errorInfo, null, 2)}</pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  return children;
};

export default ErrorBoundary;
