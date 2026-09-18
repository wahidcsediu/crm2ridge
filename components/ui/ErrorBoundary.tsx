import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 flex flex-col items-center justify-center min-h-[300px] text-center bg-zinc-950/80 rounded-2xl border border-red-500/20 max-w-lg mx-auto my-8">
          <div className="p-3 bg-red-950/40 rounded-full text-red-400 border border-red-500/30 mb-4">
            <AlertCircle size={28} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            {this.props.fallbackTitle || 'Something went wrong rendering this section'}
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mb-6">
            {this.state.error?.message || 'An unexpected error occurred while processing data.'}
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-red-600/30 transition-all"
          >
            <RefreshCw size={14} /> Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
