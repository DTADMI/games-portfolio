// libs/shared/src/components/GameContainer.tsx
import React, { type ReactNode } from "react";
import { ErrorBoundary } from "../lib/ErrorBoundary";

export interface GameContainerProps {
  children: ReactNode;
  title: string;
  description?: string;
  className?: string;
}

// Prefer a standard function component that explicitly returns JSX.Element
// This avoids React.FC typing nuances (e.g., ReactNode | Promise<ReactNode> in some type versions)
function GameContainer({ children, title, description, className = "" }: GameContainerProps) {
  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
          {description && (
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </header>

        <ErrorBoundary>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="relative w-full aspect-video max-w-4xl mx-auto">{children}</div>
          </div>
        </ErrorBoundary>

        <div className="mt-8 text-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reset Game
          </button>
        </div>
      </div>
    </div>
  );
}

// Export the component as default
export default GameContainer;
