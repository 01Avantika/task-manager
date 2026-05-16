import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    this.error = error;
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page">
          <div className="rounded-app border border-red-100 bg-red-50 p-6 text-red-700">
            <h1 className="text-xl font-extrabold">This page hit a rendering error.</h1>
            <p className="mt-2 text-sm">Refresh the page or return to the dashboard. The app shell stayed intact so you are not stuck on a blank screen.</p>
            <button className="btn surface mt-4" onClick={() => this.setState({ hasError: false })}>
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
