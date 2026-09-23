import React, { useState } from 'react';
import {
    Lock,
    Mail,
    User,
    Eye,
    EyeOff,
    Loader2,
    AlertCircle,
    ShieldCheck,
    ArrowRight,
    CheckCircle2
} from 'lucide-react';

/**
 * Componente Pagina di Registrazione
 * Gestisce la creazione di un nuovo account utente.
 */
export default function RegisterPage() {
    const [formData, setFormData] = useState({
        nickname: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Validazione base lato client

        // Validazione formato email
        if (!validateEmail(formData.email)) {
            setError('Inserisci un indirizzo email valido.');
            setIsLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Le password non coincidono.');
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('La password deve contenere almeno 6 caratteri.');
            setIsLoading(false);
            return;
        }

        try {
            // Simulazione chiamata API di registrazione
            const response = await fetch('http://localhost:8000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.nickname,
                    email: formData.email,
                    password: formData.password
                })
            });

            if (!response.ok) {
                const data = await response.json()
                console.log(data.message)
                throw new Error(data.message || data.errors || 'Errore durante la registrazione.');
            }

            setIsSuccess(true);
            // Reindirizzamento opzionale dopo x secondi
            setTimeout(() => {
                window.location.href = '/login';
            }, 3000);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
                <div className="max-w-md w-full bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 p-10 text-center animate-in zoom-in duration-300">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mb-6">
                        <CheckCircle2 size={40} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Registrazione Completata!</h1>
                    <p className="text-slate-500 mt-4 font-medium leading-relaxed">
                        Il tuo account è stato creato con successo. Verrai reindirizzato alla pagina di login tra pochi istanti.
                    </p>
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="mt-8 w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all"
                    >
                        Vai al Login ora
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full">
                {/* Logo & Intro */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-[22px] shadow-xl shadow-blue-200 mb-6">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Crea un Account</h1>
                    <p className="text-slate-500 mt-2 font-medium">Unisciti alla community dei gestori virtuali.</p>
                </div>

                {/* Register Card */}
                <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10">
                    <form onSubmit={handleRegister} className="space-y-5">

                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-1">
                                <AlertCircle size={18} />
                                <span className="font-semibold">{error}</span>
                            </div>
                        )}

                        {/* Nickname Field */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700 ml-1">Nickname</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                                <input
                                    type="text"
                                    name="nickname"
                                    required
                                    placeholder="Il tuo nome virtuale"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    value={formData.nickname}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700 ml-1">Indirizzo Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="nome@esempio.com"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    placeholder="Minimo 6 caratteri"
                                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700 ml-1">Conferma Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    required
                                    placeholder="Ripeti la password"
                                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 outline-none transition-all ${
                                        formData.confirmPassword && formData.password !== formData.confirmPassword
                                            ? 'focus:ring-red-100 ring-2 ring-red-50'
                                            : 'focus:ring-blue-100'
                                    }`}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 mt-4"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    Registrati
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-50 text-center">
                        <p className="text-sm text-slate-500 font-medium">
                            Hai già un account? <button onClick={() => window.location.href = '/login'} className="text-blue-600 font-bold hover:underline">Accedi</button>
                        </p>
                    </div>
                </div>

                {/* Footer info */}
                <p className="text-center text-slate-400 text-[11px] mt-8 font-medium leading-relaxed px-6">
                    Creando un account, accetti i nostri Termini di Servizio e la Privacy Policy.
                </p>
            </div>
        </div>
    );
}