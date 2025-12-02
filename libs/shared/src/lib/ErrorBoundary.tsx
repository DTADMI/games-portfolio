// libs/shared/src/lib/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="error-boundary">
            <h2>Something went wrong</h2>
            <p>{this.state.error?.message}</p>
            <button onClick={this.handleReset}>Try again</button>
          </div>
        )
      );
    }

    return this.props.children;
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };
}

// Error handling utilities
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  Fallback?: React.ComponentType<{ error?: Error; reset: () => void }>,
) => {
  return (props: P) => (
    <ErrorBoundary
      fallback={
        Fallback ? <Fallback error={undefined} reset={() => window.location.reload()} /> : undefined
      }
    >
      <Component {...props} />
    </ErrorBoundary>
  );
};
