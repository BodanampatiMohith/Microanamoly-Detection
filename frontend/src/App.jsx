import React from "react";
import Home from "./pages/Home";
import ErrorBoundary from "./components/ErrorBoundary";
import "./styles/index.css";
import "./styles/dashboard.css";
import "./styles/error-boundary.css";
import "./styles/performance-monitor.css";

function App() {
  return (
    <ErrorBoundary>
      <div>
        <Home />
      </div>
    </ErrorBoundary>
  );
}

export default App;
