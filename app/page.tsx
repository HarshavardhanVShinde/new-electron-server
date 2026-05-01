import { Shield, Server, Key, Lock } from 'lucide-react';

export default function Home() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
            padding: '2rem'
        }}>
            {/* Hero Section */}
            <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                {/* Logo */}
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '5rem',
                    height: '5rem',
                    borderRadius: '1.5rem',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    marginBottom: '2rem',
                    boxShadow: '0 20px 50px rgba(99, 102, 241, 0.4)'
                }}>
                    <Shield style={{ width: '2.5rem', height: '2.5rem', color: 'white' }} />
                </div>

                <h1 style={{
                    fontSize: '3rem',
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: '1rem',
                    letterSpacing: '-0.025em'
                }}>
                    License Server
                </h1>
                <p style={{
                    color: '#94a3b8',
                    fontSize: '1.125rem',
                    marginBottom: '2rem',
                    lineHeight: '1.75'
                }}>
                    Secure software licensing API for managing and validating your application licenses.
                </p>

                <p style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '1rem 2rem',
                    borderRadius: '0.875rem',
                    background: 'rgba(30, 41, 59, 0.6)',
                    color: '#94a3b8',
                    fontWeight: '600',
                    fontSize: '1rem',
                }}>
                    System Operational
                </p>
            </div>

            {/* Features Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginTop: '4rem',
                maxWidth: '900px',
                width: '100%'
            }}>
                <FeatureCard
                    icon={<Server style={{ width: '1.5rem', height: '1.5rem' }} />}
                    title="REST API"
                    description="Simple POST endpoint for license verification"
                />
                <FeatureCard
                    icon={<Lock style={{ width: '1.5rem', height: '1.5rem' }} />}
                    title="Node Locking"
                    description="Bind licenses to specific machine IDs"
                />
                <FeatureCard
                    icon={<Key style={{ width: '1.5rem', height: '1.5rem' }} />}
                    title="Multi-Software"
                    description="Support for UrbanBill, MediBill & KiranaBill"
                />
            </div>

            {/* API Info */}
            <div style={{
                background: 'rgba(30, 41, 59, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(99, 102, 241, 0.15)',
                borderRadius: '1rem',
                padding: '1.5rem',
                marginTop: '3rem',
                maxWidth: '600px',
                width: '100%'
            }}>
                <h3 style={{
                    color: 'white',
                    fontWeight: '600',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '1rem'
                }}>
                    <Server size={18} style={{ color: '#818cf8' }} />
                    API Endpoint
                </h3>
                <code style={{
                    display: 'block',
                    background: 'rgba(15, 23, 42, 0.6)',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    fontSize: '0.875rem',
                    overflow: 'auto'
                }}>
                    <span style={{ color: '#34d399' }}>POST</span>
                    <span style={{ color: '#cbd5e1' }}> /api/verify</span>
                </code>
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.75rem' }}>
                    Send <code style={{ color: '#a5b4fc' }}>licenseKey</code>, <code style={{ color: '#a5b4fc' }}>machineId</code>, and <code style={{ color: '#a5b4fc' }}>softwareType</code> in the request body.
                </p>
            </div>

            {/* Footer */}
            <p style={{ color: '#475569', fontSize: '0.875rem', marginTop: '3rem' }}>
                Powered by Next.js & Supabase
            </p>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div style={{
            background: 'rgba(30, 41, 59, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(99, 102, 241, 0.15)',
            borderRadius: '1rem',
            padding: '1.5rem',
            textAlign: 'center',
            transition: 'all 0.3s'
        }}>
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '3rem',
                height: '3rem',
                borderRadius: '0.75rem',
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#818cf8',
                marginBottom: '1rem'
            }}>
                {icon}
            </div>
            <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem' }}>{title}</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>{description}</p>
        </div>
    );
}
