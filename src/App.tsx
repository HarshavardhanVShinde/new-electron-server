import { useEffect, useState } from 'react';
import { ArrowRight, Key, Lock, Server, Shield } from 'lucide-react';
import { checkAuth, getLicenses } from '../app/admin/actions';
import { DashboardUI, LoginForm } from '../app/admin/dashboard/DashboardClient';

function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '5rem', height: '5rem', borderRadius: '1.5rem', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', marginBottom: '2rem', boxShadow: '0 20px 50px rgba(99, 102, 241, 0.4)' }}>
          <Shield style={{ width: '2.5rem', height: '2.5rem', color: 'white' }} />
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem', letterSpacing: '-0.025em' }}>Electron Server</h1>
        <p style={{ color: '#94a3b8', fontSize: '1.125rem', marginBottom: '2rem', lineHeight: '1.75' }}>
          Secure software licensing API for managing and validating application licenses.
        </p>
        <a href="/admin/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem', borderRadius: '0.875rem', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white', fontWeight: '600', fontSize: '1.125rem', textDecoration: 'none', boxShadow: '0 10px 40px rgba(99, 102, 241, 0.4)' }}>
          Open Dashboard <ArrowRight size={20} />
        </a>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginTop: '4rem', maxWidth: '900px', width: '100%' }}>
        <FeatureCard icon={<Server />} title="REST API" description="License verification endpoints for Electron clients" />
        <FeatureCard icon={<Lock />} title="Node Locking" description="Bind licenses to specific machine IDs" />
        <FeatureCard icon={<Key />} title="BSS-Smartbill" description="Version 1.0.0 licensing support" />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return <div style={{ background: 'rgba(30, 41, 59, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: '1rem', padding: '1.5rem', textAlign: 'center' }}>
    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '3rem', height: '3rem', borderRadius: '0.75rem', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', marginBottom: '1rem' }}>{icon}</div>
    <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem' }}>{title}</h3>
    <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>{description}</p>
  </div>;
}

export default function App() {
  const isDashboard = window.location.pathname.startsWith('/admin/dashboard');
  const [auth, setAuth] = useState<boolean | null>(isDashboard ? null : false);
  const [licenses, setLicenses] = useState<any[]>([]);

  useEffect(() => {
    if (!isDashboard) return;
    checkAuth().then(async (isAuthenticated) => {
      setAuth(isAuthenticated);
      if (isAuthenticated) setLicenses(await getLicenses());
    });
  }, [isDashboard]);

  if (!isDashboard) return <Home />;
  if (auth === null) return <div style={{ minHeight: '100vh', background: '#0f172a' }} />;
  if (!auth) return <LoginForm />;
  return <DashboardUI licenses={licenses} />;
}
