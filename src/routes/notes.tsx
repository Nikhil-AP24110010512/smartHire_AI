import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { CheckCircle2, Clock, XCircle, TrendingUp, AlertTriangle, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from '@tanstack/react-router';

import { FLASK_API_BASE } from '@/lib/api';

export const Route = createFileRoute('/notes')({
  component: EvaluationsDashboard,
});

function EvaluationsDashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    candidate_name: '',
    role_applied: '',
    overall_score: 50,
    strengths: '',
    weaknesses: '',
    status: 'Pending',
    note: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch from the Flask Python Backend
  const fetchEvaluations = async () => {
    if (!user) return;
    
    try {
      const res = await fetch(`${FLASK_API_BASE}/evaluations?user_email=${encodeURIComponent(user.email)}`);
      if (!res.ok) throw new Error('Failed to fetch from Flask backend');
      const data = await res.json();
      setEvaluations(data);
    } catch (err: any) {
      console.error(err);
      toast.error("Could not connect to Flask backend. Is it running?");
    }
  };

  useEffect(() => {
    if (user) {
      fetchEvaluations();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to save evaluations.");
      return;
    }
    
    if (!formData.candidate_name.trim() || !formData.role_applied.trim()) {
      toast.error("Name and Role are required");
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch(`${FLASK_API_BASE}/evaluations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          user_email: user.email
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save evaluation');
      
      toast.success('Evaluation securely saved to your account!');
      setFormData({ candidate_name: '', role_applied: '', overall_score: 50, strengths: '', weaknesses: '', status: 'Pending', note: '' });
      fetchEvaluations(); // Refresh
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch(status) {
      case 'Hired': return <CheckCircle2 className="size-4 text-green-500" />;
      case 'Rejected': return <XCircle className="size-4 text-red-500" />;
      case 'Interviewing': return <TrendingUp className="size-4 text-blue-500" />;
      default: return <Clock className="size-4 text-yellow-500" />;
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-6 mt-10 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold">Candidate Evaluations Dashboard</h1>
          <p className="text-muted-foreground mt-2 text-lg">Comprehensive hiring analytics communicating strictly with the Python Flask Backend.</p>
        </div>
        <div className="bg-gradient-accent text-primary-foreground px-4 py-2 rounded-full text-sm font-bold shadow-card flex items-center gap-2 shrink-0">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-foreground"></span>
          </span>
          Python API Connected
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Form Panel */}
        <div className="lg:col-span-4">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-card sticky top-24">
            <h2 className="font-display font-semibold text-xl mb-4 border-b border-border pb-3">New Evaluation</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Candidate Name *</label>
                <Input value={formData.candidate_name} onChange={e => setFormData({...formData, candidate_name: e.target.value})} placeholder="e.g. Arjun" className="mt-1 bg-background" />
              </div>
              
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Role Applied For *</label>
                <Input value={formData.role_applied} onChange={e => setFormData({...formData, role_applied: e.target.value})} placeholder="e.g. Senior Backend Engineer" className="mt-1 bg-background" />
              </div>
              
              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Overall Score</label>
                  <span className="font-display font-bold text-accent">{formData.overall_score}/100</span>
                </div>
                <input type="range" min="0" max="100" value={formData.overall_score} onChange={e => setFormData({...formData, overall_score: parseInt(e.target.value)})} className="w-full accent-accent" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option>Pending</option>
                    <option>Interviewing</option>
                    <option>Hired</option>
                    <option>Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Key Strengths (comma separated)</label>
                <Input value={formData.strengths} onChange={e => setFormData({...formData, strengths: e.target.value})} placeholder="e.g. Python, Fast Learner" className="mt-1 bg-background" />
              </div>

              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Weaknesses / Gaps</label>
                <Input value={formData.weaknesses} onChange={e => setFormData({...formData, weaknesses: e.target.value})} placeholder="e.g. AWS Deployment" className="mt-1 bg-background" />
              </div>
              
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Detailed Evaluation Notes</label>
                <Textarea value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} placeholder="Write detailed feedback here..." className="mt-1 bg-background resize-none" rows={3} />
              </div>
              
              <Button type="submit" disabled={isLoading} className="w-full bg-gradient-accent text-primary-foreground shadow-elevated hover:opacity-95 mt-2">
                {isLoading ? 'Saving to Database...' : 'Submit Evaluation'}
              </Button>
            </form>
          </div>
        </div>

        {/* Evaluations List */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold">Evaluation History</h2>
            <span className="bg-muted px-3 py-1 rounded-full text-xs font-medium">{evaluations.length} total records</span>
          </div>
          
          {isAuthLoading ? (
            <div className="text-center p-20 bg-card/30 border border-border border-dashed rounded-2xl">
              <Loader2 className="size-10 animate-spin text-accent mx-auto mb-4" />
              <p className="text-muted-foreground">Verifying secure session...</p>
            </div>
          ) : !user ? (
            <div className="text-center p-16 border-2 border-dashed border-border rounded-2xl bg-card/50">
              <Lock className="size-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold">Authentication Required</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mt-1">Please log into your account to securely access and save your candidate evaluations.</p>
              <div className="mt-6">
                <Link to="/login" className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-2 rounded-full font-bold hover:bg-accent/90 transition-all hover:scale-105 active:scale-95 shadow-lg">
                  Go to Login <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          ) : evaluations.length === 0 ? (
            <div className="text-center p-16 border-2 border-dashed border-border rounded-2xl bg-card/50">
              <AlertTriangle className="size-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold">No Evaluations Found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mt-1">Submit your first candidate evaluation using the form to store data in the Python backend.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {evaluations.map(ev => (
                <div key={ev.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-card transition-all hover:border-accent/40 group">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    
                    {/* Header */}
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-display font-bold text-2xl">{ev.candidate_name}</h3>
                        <div className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-full text-xs font-medium border border-border">
                          <StatusIcon status={ev.status} /> {ev.status}
                        </div>
                      </div>
                      <p className="text-muted-foreground font-medium text-sm flex items-center gap-2">
                        {ev.role_applied}
                        <span className="text-xs opacity-60">|</span>
                        <span className="text-xs opacity-60">{new Date(ev.created_at).toLocaleDateString()}</span>
                      </p>
                    </div>

                    {/* Score Bar */}
                    <div className="md:text-right shrink-0">
                      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Overall Score</div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${ev.overall_score >= 80 ? 'bg-green-500' : ev.overall_score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                            style={{ width: `${ev.overall_score}%` }}
                          />
                        </div>
                        <span className="font-display font-bold text-xl w-10">{ev.overall_score}</span>
                      </div>
                    </div>
                  </div>

                  <hr className="my-4 border-border" />

                  {/* Attributes Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-green-500" /> Strengths
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {ev.strengths ? ev.strengths.split(',').map((s: string, i: number) => (
                          <span key={i} className="bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 px-2 py-0.5 rounded text-xs font-medium">
                            {s.trim()}
                          </span>
                        )) : <span className="text-xs text-muted-foreground italic">None recorded</span>}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                        <XCircle className="size-3.5 text-red-500" /> Gap Analysis
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {ev.weaknesses ? ev.weaknesses.split(',').map((s: string, i: number) => (
                          <span key={i} className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-xs font-medium">
                            {s.trim()}
                          </span>
                        )) : <span className="text-xs text-muted-foreground italic">None recorded</span>}
                      </div>
                    </div>
                  </div>

                  {ev.note && (
                    <div className="mt-4 bg-muted/50 p-4 rounded-xl border border-border/50 text-sm">
                      <strong className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">Evaluator Notes</strong>
                      {ev.note}
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
