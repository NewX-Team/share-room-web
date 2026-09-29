import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register, login } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus, ArrowRight } from 'lucide-react';
import { useState } from 'react';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <>
            <Head title="Masuk ke Akun — ShareRoom" />

            {/* Segmented Animated Tab Switcher */}
            <div className="flex bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 mb-6 text-xs font-semibold">
                <div className="w-1/2 text-center py-2.5 rounded-lg bg-indigo-600 text-white shadow-md flex items-center justify-center gap-1.5 transition-all">
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Masuk</span>
                </div>
                <Link
                    href={register()}
                    className="w-1/2 text-center py-2.5 rounded-lg text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 transition-all"
                >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Daftar Akun</span>
                </Link>
            </div>

            {/* Form Container with Slide-Fade Transition */}
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <Form
                    {...store.form()}
                    resetOnSuccess={['password']}
                    className="space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            {status && (
                                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center font-medium">
                                    {status}
                                </div>
                            )}

                            {/* Email Address */}
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs font-medium text-zinc-300">
                                    Alamat Email
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="nama@email.com"
                                        className="pl-10 bg-zinc-950 border-zinc-800 focus:border-indigo-500 text-sm text-white rounded-xl py-2.5"
                                    />
                                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                </div>
                                <InputError message={errors.email} className="text-xs text-rose-400" />
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-xs font-medium text-zinc-300">
                                        Kata Sandi
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                                            tabIndex={5}
                                        >
                                            Lupa Kata Sandi?
                                        </TextLink>
                                    )}
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        className="pl-10 pr-10 bg-zinc-950 border-zinc-800 focus:border-indigo-500 text-sm text-white rounded-xl py-2.5"
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

                            {/* Remember Me */}
                            <div className="flex items-center space-x-2 pt-1">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="border-zinc-700 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 rounded"
                                />
                                <Label htmlFor="remember" className="text-xs text-zinc-400 font-normal cursor-pointer select-none">
                                    Ingat saya di perangkat ini
                                </Label>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full py-3 mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition-all text-xs sm:text-sm flex items-center justify-center gap-2"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing ? (
                                    <Spinner className="w-4 h-4 text-white" />
                                ) : (
                                    <>
                                        <span>Masuk ke Akun</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        </>
                    )}
                </Form>

                <div className="text-center text-xs text-zinc-500 pt-5">
                    Belum punya akun?{' '}
                    <Link href={register()} className="text-indigo-400 font-semibold hover:underline">
                        Daftar sekarang
                    </Link>
                </div>
            </div>
        </>
    );
}

Login.layout = {
    title: 'Selamat Datang Kembali',
    description: 'Masukkan email dan kata sandi untuk masuk ke ShareRoom',
};
