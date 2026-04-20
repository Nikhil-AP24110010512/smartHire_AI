import { Outlet, Link, createRootRouteWithContext } from "@tanstack/react-router";
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { InteractiveBackground } from '../components/InteractiveBackground';

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

// Define the context type to match getRouter
export const Route = createRootRouteWithContext<{}>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function Navigation() {
  const { user, logout, isLoading } = useAuth();

  useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add('dark');
  }, []);
  
  return (
    <nav className="border-b border-border bg-card/50 px-6 py-4 flex justify-between items-center backdrop-blur-md sticky top-0 z-50 transition-colors">
      <Link to="/" className="font-display font-bold text-lg text-foreground flex items-center gap-2">
        <span className="text-accent">✧</span> SmartHire AI
      </Link>
      <div className="flex items-center gap-4 text-sm font-medium">
        <Link to="/notes" className="text-accent hover:text-foreground transition-colors flex items-center gap-1">
          <span className="bg-accent/20 px-2 py-0.5 rounded text-xs font-mono">Python API</span> Team Notes
        </Link>
        <div className="w-px h-4 bg-border mx-2"></div>
        {isLoading ? (
          <div className="size-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        ) : user ? (
          <>
            <div className="flex items-center gap-2 bg-muted/30 pl-1 pr-3 py-1 rounded-full border border-border">
              <div className="size-6 rounded-full bg-gradient-accent text-primary flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                {user.name ? user.name.charAt(0) : user.email.charAt(0)}
              </div>
              <span className="text-foreground font-semibold text-xs tracking-wide">{user.name || user.email}</span>
            </div>
            <button onClick={logout} className="text-muted-foreground hover:text-accent transition-colors ml-2 text-xs uppercase tracking-wider font-semibold">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">Log in</Link>
            <Link to="/register" className="bg-accent text-accent-foreground px-4 py-1.5 rounded-full hover:bg-accent/90 transition-colors">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <InteractiveBackground />
      <Navigation />
      <Outlet />
    </AuthProvider>
  );
}
