'use client'
import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
            <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
              An unexpected error occurred. Please try refreshing the page or go back to the home page.
            </p>
            {this.state.error && (
              <p className="text-xs text-muted-foreground mt-3 font-mono bg-secondary px-3 py-2 rounded-lg break-all">
                {this.state.error.message}
              </p>
            )}
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => window.location.reload()} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Refresh Page
            </Button>
            <Button variant="outline" onClick={() => { this.setState({ hasError: false }); window.location.href = '/'; }} className="gap-2">
              <Home className="w-4 h-4" /> Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }
}