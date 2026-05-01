'use client';

import { useState } from 'react';
import { loginAction, generateLicense, revokeLicense, resetMachineId, deleteLicense, logoutAction } from '../actions';
import { RefreshCw, Trash2, Ban, Plus, LogOut, CheckCircle, XCircle, AlertTriangle, Key, Shield, Copy, Check, Sparkles } from 'lucide-react';

export function LoginForm() {
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    async function onSubmit(formData: FormData) {
        setIsLoading(true);
        const res = await loginAction(formData);
        if (res?.error) setError(res.error);
        setIsLoading(false);
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
            padding: '1rem'
        }}>
            <div style={{
                background: 'rgba(30, 41, 59, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '1.5rem',
                padding: '2.5rem',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
            }}>
                {/* Logo/Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '4.5rem',
                        height: '4.5rem',
                        borderRadius: '1.25rem',
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        marginBottom: '1.5rem',
                        boxShadow: '0 10px 40px rgba(99, 102, 241, 0.4)'
                    }}>
                        <Shield style={{ width: '2rem', height: '2rem', color: 'white' }} />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
                        License Manager
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                        Sign in to manage your software licenses
                    </p>
                </div>

                <form action={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                            Admin Password
                        </label>
                        <input
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            required
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                background: 'rgba(15, 23, 42, 0.6)',
                                border: '1px solid rgba(100, 116, 139, 0.3)',
                                borderRadius: '0.75rem',
                                color: 'white',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                        />
                    </div>

                    {error && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: '#f87171',
                            fontSize: '0.875rem',
                            background: 'rgba(248, 113, 113, 0.1)',
                            padding: '0.75rem',
                            borderRadius: '0.5rem'
                        }}>
                            <XCircle size={16} />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '0.875rem',
                            borderRadius: '0.75rem',
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '1rem',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.3s',
                            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)'
                        }}
                    >
                        {isLoading ? (
                            <RefreshCw style={{ width: '1.25rem', height: '1.25rem', animation: 'spin 1s linear infinite' }} />
                        ) : (
                            <>
                                <Key size={18} />
                                Sign In
                            </>
                        )}
                    </button>
                </form>

                <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.75rem', marginTop: '1.5rem' }}>
                    Secure admin access · Protected endpoint
                </p>
            </div>
        </div>
    );
}

export function DashboardUI({ licenses }: { licenses: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Stats
    const totalLicenses = licenses.length;
    const activeLicenses = licenses.filter(l => l.status === 'active').length;
    const lockedLicenses = licenses.filter(l => l.machine_id).length;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
            padding: '2rem'
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            padding: '0.875rem',
                            borderRadius: '1rem',
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            boxShadow: '0 8px 30px rgba(99, 102, 241, 0.3)'
                        }}>
                            <Shield style={{ width: '2rem', height: '2rem', color: 'white' }} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                                License Manager
                            </h1>
                            <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
                                Manage and monitor your software licenses
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            style={{
                                padding: '0.75rem 1.25rem',
                                borderRadius: '0.75rem',
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                color: 'white',
                                fontWeight: '500',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
                                transition: 'all 0.3s'
                            }}
                        >
                            <Plus size={18} />
                            Generate License
                        </button>
                        <form action={logoutAction} style={{ margin: 0 }}>
                            <button type="submit" style={{
                                padding: '0.75rem',
                                background: 'rgba(30, 41, 59, 0.8)',
                                border: '1px solid rgba(100, 116, 139, 0.3)',
                                borderRadius: '0.75rem',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <LogOut size={18} />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Stats Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    <StatCard
                        label="Total Licenses"
                        value={totalLicenses}
                        icon={<Key />}
                        color="#6366f1"
                    />
                    <StatCard
                        label="Active"
                        value={activeLicenses}
                        icon={<CheckCircle />}
                        color="#10b981"
                    />
                    <StatCard
                        label="Node-Locked"
                        value={lockedLicenses}
                        icon={<Shield />}
                        color="#f59e0b"
                    />
                </div>

                {/* Table */}
                <div style={{
                    background: 'rgba(30, 41, 59, 0.6)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(99, 102, 241, 0.15)',
                    borderRadius: '1rem',
                    overflow: 'hidden'
                }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                                    {['Client', 'Software', 'Plan', 'License Key', 'Status', 'Machine ID', 'Expires', 'Actions'].map((header) => (
                                        <th key={header} style={{
                                            padding: '1rem',
                                            textAlign: header === 'Actions' ? 'right' : 'left',
                                            color: '#94a3b8',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {licenses.map((lic) => (
                                    <tr key={lic.id} style={{ borderTop: '1px solid rgba(51, 65, 85, 0.5)' }}>
                                        <td style={{ padding: '1rem', color: 'white', fontWeight: '500' }}>{lic.client_name}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <SoftwareBadge type={lic.software_type} />
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.75rem',
                                                fontWeight: '500',
                                                background: lic.plan_type === 'Premium' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                                                color: lic.plan_type === 'Premium' ? '#c4b5fd' : '#94a3b8'
                                            }}>
                                                {lic.plan_type}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <code style={{
                                                fontSize: '0.8rem',
                                                color: '#a5b4fc',
                                                background: 'rgba(99, 102, 241, 0.15)',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '0.375rem',
                                                fontFamily: 'monospace'
                                            }}>
                                                {lic.license_key}
                                            </code>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <StatusBadge status={lic.status} />
                                        </td>
                                        <td style={{
                                            padding: '1rem',
                                            fontSize: '0.75rem',
                                            fontFamily: 'monospace',
                                            color: '#64748b',
                                            maxWidth: '120px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }} title={lic.machine_id}>
                                            {lic.machine_id || <span style={{ color: '#475569', fontStyle: 'italic' }}>Not locked</span>}
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                                            {new Date(lic.expires_at).toISOString().split('T')[0]}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                {lic.machine_id && (
                                                    <ActionButton
                                                        icon={<RefreshCw size={14} />}
                                                        title="Reset Machine ID"
                                                        color="#f59e0b"
                                                        onClick={async () => {
                                                            if (confirm('Reset machine ID?')) await resetMachineId(lic.id);
                                                        }}
                                                    />
                                                )}
                                                {lic.status === 'active' && (
                                                    <ActionButton
                                                        icon={<Ban size={14} />}
                                                        title="Revoke License"
                                                        color="#ef4444"
                                                        onClick={async () => {
                                                            if (confirm('Ban this license?')) await revokeLicense(lic.id);
                                                        }}
                                                    />
                                                )}
                                                <ActionButton
                                                    icon={<Trash2 size={14} />}
                                                    title="Delete License"
                                                    color="#64748b"
                                                    onClick={async () => {
                                                        if (confirm('Permanently delete?')) await deleteLicense(lic.id);
                                                    }}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {licenses.length === 0 && (
                                    <tr>
                                        <td colSpan={8} style={{ padding: '4rem', textAlign: 'center' }}>
                                            <Key style={{ width: '3rem', height: '3rem', color: '#475569', margin: '0 auto 1rem' }} />
                                            <p style={{ color: '#94a3b8', margin: 0 }}>No licenses found</p>
                                            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                                Generate your first license to get started
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isModalOpen && <GenerateModal onClose={() => setIsModalOpen(false)} />}
        </div>
    );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
    return (
        <div style={{
            background: 'rgba(30, 41, 59, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(99, 102, 241, 0.15)',
            borderRadius: '1rem',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        }}>
            <div>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{label}</p>
                <p style={{ color: 'white', fontSize: '2.25rem', fontWeight: 'bold', margin: 0 }}>{value}</p>
            </div>
            <div style={{
                padding: '0.875rem',
                borderRadius: '0.75rem',
                background: `${color}20`,
                color: color
            }}>
                {icon}
            </div>
        </div>
    );
}

function SoftwareBadge({ type }: { type: string }) {
    const config: Record<string, { bg: string; color: string }> = {
        UrbanBill: { bg: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd' },
        MediBill: { bg: 'rgba(20, 184, 166, 0.2)', color: '#5eead4' },
        KiranaBill: { bg: 'rgba(249, 115, 22, 0.2)', color: '#fdba74' },
        StationMaster: { bg: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe' },
        MandiBill: { bg: 'rgba(34, 197, 94, 0.2)', color: '#86efac' },
        OptiVision: { bg: 'rgba(236, 72, 153, 0.2)', color: '#f9a8d4' },
        'Mangal Seva': { bg: 'rgba(153, 27, 27, 0.2)', color: '#fca5a5' },
    };
    const style = config[type] || config.UrbanBill;
    return (
        <span style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '0.5rem',
            fontSize: '0.75rem',
            fontWeight: '500',
            background: style.bg,
            color: style.color
        }}>
            {type || 'UrbanBill'}
        </span>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, { color: string; icon: React.ReactNode }> = {
        active: { color: '#34d399', icon: <CheckCircle size={14} /> },
        banned: { color: '#f87171', icon: <Ban size={14} /> },
        expired: { color: '#fbbf24', icon: <AlertTriangle size={14} /> }
    };
    const s = styles[status] || styles.active;
    return (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: s.color }}>
            {s.icon} {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}

function ActionButton({ icon, title, color, onClick }: { icon: React.ReactNode; title: string; color: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            title={title}
            style={{
                padding: '0.5rem',
                borderRadius: '0.5rem',
                background: `${color}15`,
                color: color,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
            }}
        >
            {icon}
        </button>
    );
}

function GenerateModal({ onClose }: { onClose: () => void }) {
    const [result, setResult] = useState<{ success?: boolean; error?: string; licenseKey?: string } | null>(null);
    const [copied, setCopied] = useState(false);

    async function handleSubmit(formData: FormData) {
        const name = formData.get('clientName') as string;
        const software = formData.get('softwareType') as string;
        const plan = formData.get('planType') as string;
        const validity = parseInt(formData.get('validity') as string);

        const res = await generateLicense(name, plan, validity, software);
        setResult(res);
    }

    const copyToClipboard = () => {
        if (result?.licenseKey) {
            navigator.clipboard.writeText(result.licenseKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '0.875rem 1rem',
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(100, 116, 139, 0.3)',
        borderRadius: '0.75rem',
        color: 'white',
        fontSize: '1rem',
        outline: 'none'
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 50
        }}>
            <div style={{
                background: 'rgba(30, 41, 59, 0.95)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '1.5rem',
                padding: '2rem',
                width: '100%',
                maxWidth: '450px',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{
                        padding: '0.5rem',
                        borderRadius: '0.75rem',
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                    }}>
                        <Sparkles style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                        Generate License
                    </h2>
                </div>

                {result?.success ? (
                    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <div style={{
                            width: '4rem',
                            height: '4rem',
                            margin: '0 auto 1rem',
                            borderRadius: '50%',
                            background: 'rgba(16, 185, 129, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <CheckCircle style={{ width: '2rem', height: '2rem', color: '#34d399' }} />
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1rem' }}>
                            License Generated Successfully!
                        </p>
                        <div style={{
                            background: 'rgba(15, 23, 42, 0.6)',
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            marginBottom: '1.5rem'
                        }}>
                            <code style={{ fontSize: '1.125rem', fontFamily: 'monospace', color: '#a5b4fc' }}>
                                {result.licenseKey}
                            </code>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={copyToClipboard}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: 'rgba(51, 65, 85, 0.8)',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                                {copied ? 'Copied!' : 'Copy Key'}
                            </button>
                            <button
                                onClick={onClose}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    color: 'white',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                ) : (
                    <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                                Client Name
                            </label>
                            <input name="clientName" placeholder="Enter client name" required style={inputStyle} />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                                Software Type
                            </label>
                            <select name="softwareType" style={inputStyle}>
                                <option value="UrbanBill">💳 UrbanBill (Billing Software)</option>
                                <option value="MediBill">💊 MediBill (Medical Billing)</option>
                                <option value="KiranaBill">🛒 KiranaBill (Kirana Shop)</option>
                                <option value="StationMaster">📝 StationMaster (Stationary Billing)</option>
                                <option value="MandiBill">🌾 MandiBill (Mandi/Agriculture Billing)</option>
                                <option value="OptiVision">👓 OptiVision (Optical Store)</option>
                                <option value="Mangal Seva">🎪 Mangal Seva (Rentals)</option>
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                                    Plan
                                </label>
                                <select name="planType" style={inputStyle}>
                                    <option value="Standard">Standard</option>
                                    <option value="Premium">Premium</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                                    Validity
                                </label>
                                <select name="validity" style={inputStyle}>
                                    <option value="365">1 Year</option>
                                    <option value="180">6 Months</option>
                                    <option value="30">1 Month</option>
                                    <option value="3650">Lifetime</option>
                                </select>
                            </div>
                        </div>

                        {result?.error && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: '#f87171',
                                fontSize: '0.875rem',
                                background: 'rgba(248, 113, 113, 0.1)',
                                padding: '0.75rem',
                                borderRadius: '0.5rem'
                            }}>
                                <XCircle size={16} />
                                {result.error}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: 'rgba(51, 65, 85, 0.8)',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    color: 'white',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                Generate
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
