'use client';

import { useState, useEffect } from 'react';
import { Wifi, Eye, EyeOff, Save, Loader2, Check, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WiFiSettings() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchWiFiPassword();
    }, []);

    const fetchWiFiPassword = async () => {
        try {
            const response = await fetch('/api/admin/wifi-settings');
            if (response.ok) {
                const data = await response.json();
                setPassword(data.password || '');
            }
        } catch (error) {
            console.error('Error fetching WiFi password:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!password.trim()) {
            setMessage({ type: 'error', text: 'Password cannot be empty' });
            return;
        }

        setSaving(true);
        setMessage(null);

        try {
            const response = await fetch('/api/admin/wifi-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'WiFi password saved successfully!' });
                router.refresh();
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            console.error('Error saving WiFi password:', error);
            setMessage({ type: 'error', text: 'Failed to save WiFi password' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Wifi className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold">WiFi Settings</h2>
                    <p className="text-sm text-muted-foreground">Manage library WiFi password</p>
                </div>
            </div>

            <div className="p-6 space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                        WiFi Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter WiFi password"
                            className="w-full h-12 px-4 pr-12 bg-background/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white/5 rounded-lg transition-colors"
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5 text-muted-foreground" />
                            ) : (
                                <Eye className="h-5 w-5 text-muted-foreground" />
                            )}
                        </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        This password will be sent to users via email when their payment is approved
                    </p>
                </div>

                {message && (
                    <div
                        className={`flex items-center gap-2 p-4 rounded-lg border ${message.type === 'success'
                                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}
                    >
                        {message.type === 'success' ? (
                            <Check className="h-5 w-5" />
                        ) : (
                            <AlertCircle className="h-5 w-5" />
                        )}
                        <span className="text-sm font-medium">{message.text}</span>
                    </div>
                )}

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Saving...</span>
                        </>
                    ) : (
                        <>
                            <Save className="h-5 w-5" />
                            <span>Save WiFi Password</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
