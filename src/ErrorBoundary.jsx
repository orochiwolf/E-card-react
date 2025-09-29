import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false, 
            error: null, 
            errorInfo: null 
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details for debugging
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        
        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // In production, you'd want to log this to an error reporting service
        // like Sentry, LogRocket, or Bugsnag
    }

    handleRefresh = () => {
        // Store the game ID for auto-rejoin after refresh
        const propsGameId = this.props.gameId;
        const currentGameId = localStorage.getItem('current-game-id');
        const fallbackGameId = propsGameId || currentGameId;
        
        // Create persistent debug log
        const debugLog = [];
        debugLog.push('🔄 ErrorBoundary handleRefresh called:');
        debugLog.push(`  props.gameId: ${propsGameId}`);
        debugLog.push(`  current-game-id from localStorage: ${currentGameId}`);
        debugLog.push(`  chosen fallbackGameId: ${fallbackGameId}`);
        
        console.log('🔄 ErrorBoundary handleRefresh called:');
        console.log('  props.gameId:', propsGameId);
        console.log('  current-game-id from localStorage:', currentGameId);
        console.log('  chosen fallbackGameId:', fallbackGameId);
        
        // First, let's see what's currently in localStorage before we try to store
        debugLog.push('📊 Before storing - localStorage state:');
        debugLog.push(`  current-game-id: ${localStorage.getItem('current-game-id')}`);
        debugLog.push(`  rejoin-game-id: ${localStorage.getItem('rejoin-game-id')}`);
        debugLog.push(`  e-card-playerId: ${localStorage.getItem('e-card-playerId')}`);
        
        console.log('📊 Before storing - localStorage state:');
        console.log('  current-game-id:', localStorage.getItem('current-game-id'));
        console.log('  rejoin-game-id:', localStorage.getItem('rejoin-game-id'));
        console.log('  e-card-playerId:', localStorage.getItem('e-card-playerId'));
        
        if (fallbackGameId) {
            debugLog.push(`⮙️ Attempting to store rejoin-game-id: "${fallbackGameId}"`);
            console.log(`⮙️ Attempting to store rejoin-game-id: "${fallbackGameId}"`);
            
            try {
                localStorage.setItem('rejoin-game-id', fallbackGameId);
                // Also store in a backup key in case the main key gets cleared
                localStorage.setItem('ecard-backup-rejoin-id', fallbackGameId);
                debugLog.push('✅ localStorage.setItem() completed successfully');
                console.log('✅ localStorage.setItem() completed successfully');
                
                // Immediate verification
                const stored = localStorage.getItem('rejoin-game-id');
                const backupStored = localStorage.getItem('ecard-backup-rejoin-id');
                debugLog.push(`🔍 Immediate verification - rejoin-game-id: "${stored}"`);
                debugLog.push(`🔍 Immediate verification - backup-rejoin-id: "${backupStored}"`);
                console.log(`🔍 Immediate verification - rejoin-game-id: "${stored}"`);
                console.log(`🔍 Immediate verification - backup-rejoin-id: "${backupStored}"`);
                
                if (stored === fallbackGameId && backupStored === fallbackGameId) {
                    debugLog.push('✅ Storage verification PASSED - both keys match');
                    console.log('✅ Storage verification PASSED - both keys match');
                } else {
                    debugLog.push(`❌ Storage verification FAILED - expected "${fallbackGameId}", got main: "${stored}", backup: "${backupStored}"`);
                    console.log(`❌ Storage verification FAILED - expected "${fallbackGameId}", got main: "${stored}", backup: "${backupStored}"`);
                }
                
                // Show all localStorage after storing
                debugLog.push('📊 After storing - localStorage state:');
                debugLog.push(`  current-game-id: ${localStorage.getItem('current-game-id')}`);
                debugLog.push(`  rejoin-game-id: ${localStorage.getItem('rejoin-game-id')}`);
                debugLog.push(`  e-card-playerId: ${localStorage.getItem('e-card-playerId')}`);
                
                console.log('📊 After storing - localStorage state:');
                console.log('  current-game-id:', localStorage.getItem('current-game-id'));
                console.log('  rejoin-game-id:', localStorage.getItem('rejoin-game-id'));
                console.log('  e-card-playerId:', localStorage.getItem('e-card-playerId'));
                
            } catch (error) {
                debugLog.push(`❌ Error storing to localStorage: ${error.message}`);
                console.error('❌ Error storing to localStorage:', error);
            }
        } else {
            debugLog.push('❌ No gameId to store - both props.gameId and current-game-id are null/undefined');
            console.log('❌ No gameId to store - both props.gameId and current-game-id are null/undefined');
        }
        
        // Store debug log and redirect with URL parameter instead of localStorage
        debugLog.push('🔄 About to redirect to home with URL parameter in 100ms...');
        localStorage.setItem('error-boundary-debug-log', JSON.stringify(debugLog));
        
        console.log('🔄 About to redirect to home with URL parameter in 100ms...');
        setTimeout(() => {
            // Use URL parameter to pass rejoin game ID since localStorage is being cleared
            window.location.href = `/?rejoin=${encodeURIComponent(fallbackGameId)}`;
        }, 100);
        
        // Reset error state
        this.setState({ hasError: false, error: null, errorInfo: null });
    }

    handleGoHome = () => {
        // Reset error state and go to home
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.href = '/';
    }

    handleCheckLocalStorage = () => {
        const currentGameId = localStorage.getItem('current-game-id');
        const rejoinGameId = localStorage.getItem('rejoin-game-id');
        const playerId = localStorage.getItem('e-card-playerId'); // Fixed key name
        
        console.log('🔍 ErrorBoundary localStorage check:');
        console.log('  current-game-id:', currentGameId);
        console.log('  rejoin-game-id:', rejoinGameId);
        console.log('  e-card-playerId:', playerId);
        console.log('  props.gameId:', this.props.gameId);
        
        alert(`localStorage contents:\n\n` +
              `current-game-id: ${currentGameId || 'null'}\n` +
              `rejoin-game-id: ${rejoinGameId || 'null'}\n` +
              `e-card-playerId: ${playerId || 'null'}\n` +
              `props.gameId: ${this.props.gameId || 'null'}`);
    }

    handleClearLocalStorage = () => {
        const keys = ['current-game-id', 'rejoin-game-id', 'e-card-playerId'];
        keys.forEach(key => localStorage.removeItem(key));
        console.log('🧹 Cleared localStorage keys:', keys);
        alert('Cleared localStorage keys: ' + keys.join(', '));
    }

    render() {
        if (this.state.hasError) {
            // Custom error UI
            return (
                <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black text-white flex items-center justify-center p-4">
                    <div className="max-w-lg mx-auto text-center">
                        <div className="mb-8">
                            <div className="text-6xl mb-4">⚠️</div>
                            <h1 className="text-4xl font-bold text-red-400 mb-4">
                                Oops! Something Went Wrong
                            </h1>
                            <p className="text-xl text-gray-300 mb-6">
                                The game encountered an unexpected error, but don't worry - 
                                we'll automatically reconnect you to your game after refreshing.
                            </p>
                        </div>

                        <div className="bg-black/30 rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-semibold text-yellow-400 mb-3">
                                What happened?
                            </h3>
                            <p className="text-gray-400 text-sm mb-4">
                                A technical error occurred while rendering the game interface. 
                                Refreshing will clean up the error and automatically reconnect you.
                            </p>
                            
                            {this.props.gameId && (
                                <div className="bg-gray-800 rounded p-3 mb-4">
                                    <p className="text-sm text-gray-300">
                                        <strong className="text-yellow-400">Game ID:</strong> {this.props.gameId}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        You'll automatically rejoin this game after refreshing
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={this.handleRefresh}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
                            >
                                🔄 Refresh & Rejoin Game
                            </button>
                            
                            <button
                                onClick={this.handleGoHome}
                                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
                            >
                                🏠 Return to Home
                            </button>
                            
                            {/* Debug buttons for development */}
                            {process.env.NODE_ENV === 'development' && (
                                <div className="mt-6 pt-4 border-t border-gray-700">
                                    <p className="text-sm text-gray-400 mb-3">Debug Tools:</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={this.handleCheckLocalStorage}
                                            className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded text-sm transition-colors duration-200"
                                        >
                                            🔍 Check localStorage
                                        </button>
                                        
                                        <button
                                            onClick={this.handleClearLocalStorage}
                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm transition-colors duration-200"
                                        >
                                            🧹 Clear localStorage
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Debug info for development */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-8 text-left">
                                <summary className="cursor-pointer text-gray-400 hover:text-white">
                                    🔧 Developer Info (click to expand)
                                </summary>
                                <div className="mt-4 bg-black rounded p-4 text-xs">
                                    <h4 className="text-red-400 font-semibold mb-2">Error:</h4>
                                    <pre className="text-red-300 whitespace-pre-wrap mb-4">
                                        {this.state.error.toString()}
                                    </pre>
                                    
                                    <h4 className="text-yellow-400 font-semibold mb-2">Stack Trace:</h4>
                                    <pre className="text-yellow-300 whitespace-pre-wrap text-xs">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                </div>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        // If no error, render children normally
        return this.props.children;
    }
}

export default ErrorBoundary;