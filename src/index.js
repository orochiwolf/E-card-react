import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';

// Wrapper to handle gameId passing to ErrorBoundary
const AppWithErrorBoundary = () => {
  const [gameId, setGameId] = React.useState(null);
  
  const handleGameIdChange = React.useCallback((newGameId) => {
    setGameId(newGameId);
  }, []);
  
  return (
    <ErrorBoundary gameId={gameId}>
      <App onGameIdChange={handleGameIdChange} />
    </ErrorBoundary>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppWithErrorBoundary />
  </React.StrictMode>
);

