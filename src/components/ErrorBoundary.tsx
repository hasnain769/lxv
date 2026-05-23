import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Home, AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
          <AlertTriangle className="w-16 h-16 text-red-500 mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-2">Something went wrong</h1>
          <p className="text-muted-foreground mb-8 text-center max-w-md">
            An unexpected error occurred. Please try refreshing the page or returning to the home dashboard.
          </p>
          <div className="bg-card border border-border rounded-lg p-4 mb-8 max-w-2xl w-full overflow-auto">
            <p className="text-sm font-mono text-red-400">
              {this.state.error?.message || 'Unknown error'}
            </p>
          </div>
          <Button 
            className="gap-2" 
            size="lg"
            onClick={() => {
              window.location.href = '/library';
            }}
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
