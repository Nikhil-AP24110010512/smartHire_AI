import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

import { API_BASE } from '@/lib/api';

export const Route = createFileRoute('/login')({
  component: Login,
});

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to login');
      
      login(data.token, data.user);
      toast.success('Logged in successfully');
      navigate({ to: '/' });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md mt-20 p-6 bg-card rounded-xl border border-border shadow-card">
      <h2 className="text-2xl font-bold font-display mb-6">Welcome Back</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</label>
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1" />
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Password</label>
          <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1" />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full bg-gradient-accent text-primary">
          {isLoading ? 'Logging in...' : 'Log in'}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Don't have an account? <Link to="/register" className="text-accent hover:underline">Sign up</Link>
      </p>
    </div>
  );
}
