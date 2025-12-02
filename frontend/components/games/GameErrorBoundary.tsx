// frontend/components/games/GameErrorBoundary.tsx
"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface GameErrorBoundaryProps {
  children: ReactNode;
  gameId?: string;
}

interface GameErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class GameErrorBoundary extends Component<GameErrorBoundaryProps, GameErrorBoundaryState> {
  constructor(props: GameErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): GameErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Game Error Boundary caught an error:", error, errorInfo);
    // You can log the error to an error reporting service here
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-6">
            <Alert variant="destructive">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>Game Error</AlertTitle>
              <AlertDescription>
                {this.state.error?.message ||
                  "An unexpected error occurred while loading the game."}
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.handleReset} className="w-full sm:w-auto">
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/games")}
                className="w-full sm:w-auto"
              >
                Back to Games
              </Button>
            </div>

            <details className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              <summary className="cursor-pointer">Show error details</summary>
              <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-md overflow-auto">
                {this.state.error?.stack}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook to use the error boundary
export function useGameErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  if (error) {
    throw error;
  }

  return setError;
}
