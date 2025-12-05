import React from 'react';
import { toast } from 'react-hot-toast';

/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI
 */
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
            error,
            errorInfo,
        });

        // Log error in development
        if (import.meta.env.DEV) {
            console.error('ErrorBoundary caught:', error, errorInfo);
        }

        // Show toast
        toast.error('Ocorreu um erro inesperado. A página será recarregada.');
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                        {/* Error Icon */}
                        <div className="w-16 h-16 bg-error-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <span className="text-3xl">⚠️</span>
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Algo deu errado
                        </h1>

                        {/* Description */}
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Ocorreu um erro inesperado. Por favor, recarregue a página para continuar.
                        </p>

                        {/* Error details (development only) */}
                        {import.meta.env.DEV && this.state.error && (
                            <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-left">
                                <p className="text-sm font-mono text-error-600 mb-2">
                                    {this.state.error.toString()}
                                </p>
                                <details className="text-xs text-gray-600">
                                    <summary className="cursor-pointer font-medium mb-2">
                                        Stack trace
                                    </summary>
                                    <pre className="whitespace-pre-wrap overflow-auto max-h-48">
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </details>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleReload}
                                className="btn btn-primary"
                            >
                                🔄 Recarregar Página
                            </button>
                            <button
                                onClick={() => (window.location.href = '/')}
                                className="btn btn-ghost"
                            >
                                🏠 Ir para Início
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
