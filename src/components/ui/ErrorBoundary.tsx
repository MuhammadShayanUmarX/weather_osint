import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { buttonClasses } from '@/lib/ui';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message?: string;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Environmental Intelligence interface error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="panel max-w-md p-6 text-center">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-signal-red/25 bg-signal-red/10 text-signal-red">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-lg font-semibold text-content">
              Interface error
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-content-muted">
              The command center encountered an unexpected rendering error. The
              demonstration data is unchanged.
            </p>
            {this.state.message ? (
              <p className="mt-3 rounded-lg border border-line bg-black/25 px-3 py-2 font-mono text-2xs text-content-muted">
                {this.state.message}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className={buttonClasses('primary', 'md', 'mt-5')}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reload interface
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
