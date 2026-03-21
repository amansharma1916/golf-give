import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '../../ui';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(_error: Error, _errorInfo: ErrorInfo): void {
    // Intentionally swallowed to avoid leaking details in production UI.
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 'var(--space-8)' }}>
          <div style={{ maxWidth: 520, textAlign: 'center' }}>
            <h1 style={{ marginBottom: 'var(--space-3)' }}>Something went wrong</h1>
            <p style={{ marginBottom: 'var(--space-6)', color: 'var(--color-text-muted)' }}>
              An unexpected error occurred while rendering this page.
            </p>
            <Button variant="primary" size="md" onClick={this.handleReload}>
              Reload app
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}