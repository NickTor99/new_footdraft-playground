import {useState} from "react";
import {AlertCircle, Loader2, ShieldCheck, Mail, Eye, ArrowRight, Lock, EyeOff} from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const login = async (email, password) => {
        let body;
        if(!validateEmail(email)){
            const username = email
            body = JSON.stringify({username, password});
        } else body = JSON.stringify({email, password})

        const response = await fetch('http://localhost:8000/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: body
        });
        const data = await response.json();
        console.log(data)
        if (!response.ok) throw new Error('Credenziali non valide');

        localStorage.setItem('token', data.access_token);
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await login(email, password)
            window.location.href = '/';
        } catch (err) {
            setError('Email o password non corretti. Riprova.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full">
                {/* Logo & Intro */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-[22px] shadow-xl shadow-blue-200 mb-6">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Bentornato!</h1>
                    <p className="text-slate-500 mt-2 font-medium">Accedi per gestire i tuoi gruppi virtuali.</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10">
                    <form onSubmit={handleLogin} className="space-y-6">

                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-1">
                                <AlertCircle size={18} />
                                <span className="font-semibold">{error}</span>
                            </div>
                        )}

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Indirizzo Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                                <input
                                    required
                                    placeholder="nome@esempio.com"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-bold text-slate-700">Password</label>
                                <button type="button" className="text-xs font-bold text-blue-600 hover:underline">Dimenticata?</button>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    Accedi ora
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-50 text-center">
                        <p className="text-sm text-slate-500 font-medium">
                            Non hai un account? <button className="text-blue-600 font-bold hover:underline" onClick={() => window.location.href='/register'}>Registrati</button>
                        </p>
                    </div>
                </div>

                {/* Footer info */}
                <p className="text-center text-slate-400 text-xs mt-8 font-medium">
                    Protetto da crittografia end-to-end e standard JWT.
                </p>
            </div>
        </div>
    );
}