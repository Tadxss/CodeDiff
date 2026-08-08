import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Uncaught error in app tree:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 px-6">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Something went wrong.</p>
            <p className="text-slate-400 text-sm">
              Please refresh the page, or reach out at{' '}
              <a href="mailto:daryltadss.workemail@gmail.com" className="text-blue-400 underline">
                daryltadss.workemail@gmail.com
              </a>
              .
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
