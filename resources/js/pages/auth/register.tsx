import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login, register } from '@/routes';
import { store } from '@/routes/register';
import { User, Mail, Lock, Eye, EyeOff, LogIn, UserPlus, ArrowRight, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <>
            <Head title="Daftar Akun Baru — ShareRoom" />

            {/* Segmented Animated Tab Switcher */}
            <div className="flex bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 mb-6 text-xs font-semibold">
                <Link
                    href={login()}
                    className="w-1/2 text-center py-2.5 rounded-lg text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 transition-all"
                >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Masuk</span>
                </Link>
                <div className="w-1/2 text-center py-2.5 rounded-lg bg-[#008080] text-white shadow-md flex items-center justify-center gap-1.5 transition-all">
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Daftar Akun</span>
                </div>
            </div>

            {/* Form Container with Slide-Fade Transition */}
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                <Form
                    {...store.form()}
                    resetOnSuccess={['password', 'password_confirmation']}
                    disableWhileProcessing
                    className="space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            {/* Full Name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="name" className="text-xs font-medium text-zinc-300">
                                    Nama Lengkap
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="name"
                                        name="name"
                                        placeholder="Nama kamu"
                                        className="pl-10 bg-zinc-950 border-zinc-800 focus:border-[#007BFF] text-sm text-white rounded-xl py-2.5"
                                    />
                                    <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                </div>
                                <InputError message={errors.name} className="text-xs text-rose-400" />
                            </div>

                            {/* Email Address */}
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs font-medium text-zinc-300">
                                    Alamat Email
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        tabIndex={2}
                                        autoComplete="email"
                                        name="email"
                                        placeholder="nama@email.com"
                                        className="pl-10 bg-zinc-950 border-zinc-800 focus:border-[#007BFF] text-sm text-white rounded-xl py-2.5"
                                    />
                                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                </div>
                                <InputError message={errors.email} className="text-xs text-rose-400" />
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-xs font-medium text-zinc-300">
                                    Kata Sandi
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        tabIndex={3}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="Minimal 8 karakter"
                                        passwordrules={passwordRules}
                                        className="pl-10 pr-10 bg-zinc-950 border-zinc-800 focus:border-[#007BFF] text-sm text-white rounded-xl py-2.5"
                                    />
                                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <InputError message={errors.password} className="text-xs text-rose-400" />
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-1.5">
                                <Label htmlFor="password_confirmation" className="text-xs font-medium text-zinc-300">
                                    Konfirmasi Kata Sandi
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password_confirmation"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="Ulangi kata sandi"
                                        passwordrules={passwordRules}
                                        className="pl-10 pr-10 bg-zinc-950 border-zinc-800 focus:border-[#007BFF] text-sm text-white rounded-xl py-2.5"
                                    />
                                    <ShieldCheck className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <InputError message={errors.password_confirmation} className="text-xs text-rose-400" />
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full py-3 mt-2 bg-[#008080] hover:bg-[#006666] text-white font-semibold rounded-xl shadow-lg shadow-teal-900/30 transition-all text-xs sm:text-sm flex items-center justify-center gap-2"
                                tabIndex={5}
                                disabled={processing}
                                data-test="register-user-button"
                            >
                                {processing ? (
                                    <Spinner className="w-4 h-4 text-white" />
                                ) : (
                                    <>
                                        <span>Buat Akun Gratis</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        </>
                    )}
                </Form>

                <div className="text-center text-xs text-zinc-500 pt-5">
                    Sudah punya akun?{' '}
                    <Link href={login()} className="text-[#007BFF] font-semibold hover:underline">
                        Masuk di sini
                    </Link>
                </div>
            </div>
        </>
    );
}

Register.layout = {
    title: 'Buat Akun ShareRoom',
    description: 'Daftar gratis dalam hitungan detik untuk mulai membuat room',
};
