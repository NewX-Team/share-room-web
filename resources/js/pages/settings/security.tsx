import { Form, Head } from '@inertiajs/react';
import { useRef, useState } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { edit } from '@/routes/security';
import { ShieldCheck, Lock, KeyRound, CheckCircle2, ShieldAlert } from 'lucide-react';

type Props = {
    passwordRules: string;
};

export default function Security(props: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const [savedSuccess, setSavedSuccess] = useState(false);

    return (
        <>
            <Head title="Keamanan & Kata Sandi — ShareRoom" />

            <div className="space-y-8">
                {/* Header Title Section */}
                <div className="border-b border-border/60 dark:border-zinc-800 pb-4 space-y-1">
                    <h2 className="text-xl font-bold text-foreground dark:text-white flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-indigo-500" /> Keamanan & Kata Sandi
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        Pastikan akun Anda terlindungi dengan menggunakan kata sandi yang kuat dan unik.
                    </p>
                </div>

                {/* Password Recommendation Info Box */}
                <div className="p-4 rounded-2xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                        <ShieldAlert className="w-4 h-4" /> Tips Keamanan Kata Sandi:
                    </div>
                    <ul className="text-[11px] text-muted-foreground space-y-1 pl-5 list-disc">
                        <li>Gunakan minimal 8 karakter dengan kombinasi huruf besar, kecil, dan angka.</li>
                        <li>Hindari menggunakan kata sandi yang sama dengan akun platform lain.</li>
                        <li>Jangan pernah membagikan kata sandi atau kode akses Anda kepada siapa pun.</li>
                    </ul>
                </div>

                {/* Password Form */}
                <Form
                    {...SecurityController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    onSuccess={() => {
                        setSavedSuccess(true);
                        setTimeout(() => setSavedSuccess(false), 3000);
                    }}
                    resetOnError={[
                        'password',
                        'password_confirmation',
                        'current_password',
                    ]}
                    resetOnSuccess
                    onError={(errors) => {
                        if (errors.password) {
                            passwordInput.current?.focus();
                        }
                        if (errors.current_password) {
                            currentPasswordInput.current?.focus();
                        }
                    }}
                    className="space-y-5"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="current_password"
                                    className="text-xs font-semibold text-foreground dark:text-zinc-300 flex items-center gap-1.5"
                                >
                                    <KeyRound className="w-3.5 h-3.5 text-indigo-500" /> Kata Sandi Saat Ini <span className="text-rose-500">*</span>
                                </label>

                                <PasswordInput
                                    id="current_password"
                                    ref={currentPasswordInput}
                                    name="current_password"
                                    autoComplete="current-password"
                                    placeholder="Masukkan kata sandi lama Anda"
                                    className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-foreground dark:text-white font-medium focus:outline-none focus:border-indigo-500 transition-colors"
                                />

                                <InputError message={errors.current_password} className="text-xs" />
                            </div>

                            <div className="space-y-1.5">
                                <label
                                    htmlFor="password"
                                    className="text-xs font-semibold text-foreground dark:text-zinc-300 flex items-center gap-1.5"
                                >
                                    <Lock className="w-3.5 h-3.5 text-indigo-500" /> Kata Sandi Baru <span className="text-rose-500">*</span>
                                </label>

                                <PasswordInput
                                    id="password"
                                    ref={passwordInput}
                                    name="password"
                                    autoComplete="new-password"
                                    placeholder="Masukkan kata sandi baru yang kuat"
                                    passwordrules={props.passwordRules}
                                    className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-foreground dark:text-white font-medium focus:outline-none focus:border-indigo-500 transition-colors"
                                />

                                <InputError message={errors.password} className="text-xs" />
                            </div>

                            <div className="space-y-1.5">
                                <label
                                    htmlFor="password_confirmation"
                                    className="text-xs font-semibold text-foreground dark:text-zinc-300 flex items-center gap-1.5"
                                >
                                    <Lock className="w-3.5 h-3.5 text-indigo-500" /> Konfirmasi Kata Sandi Baru <span className="text-rose-500">*</span>
                                </label>

                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    autoComplete="new-password"
                                    placeholder="Ketik ulang kata sandi baru Anda"
                                    passwordrules={props.passwordRules}
                                    className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-foreground dark:text-white font-medium focus:outline-none focus:border-indigo-500 transition-colors"
                                />

                                <InputError message={errors.password_confirmation} className="text-xs" />
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    data-test="update-password-button"
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Lock className="w-4 h-4" />
                                    <span>Perbarui Kata Sandi</span>
                                </button>

                                {savedSuccess && (
                                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-in fade-in duration-200">
                                        <CheckCircle2 className="w-4 h-4" /> Kata sandi berhasil diperbarui!
                                    </span>
                                )}
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

Security.layout = {
    breadcrumbs: [
        {
            title: 'Keamanan & Kata Sandi',
            href: edit(),
        },
    ],
};
