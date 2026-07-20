"use client";

import React, { Component, ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
};

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    const safeError = error?.message ? error.message : String(error);
    console.error("ErrorBoundary caught:", safeError, info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="p-4 text-red-600 bg-red-50 rounded border border-red-200">
            <h2 className="text-lg font-bold">Something went wrong</h2>
            <p>Try reloading the page or checking your diagram syntax.</p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
