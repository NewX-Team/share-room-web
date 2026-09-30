import { Form, Head, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { edit } from '@/routes/profile';
import type { Auth } from '@/types';
import { User, Mail, Save, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

type PageProps = {
    auth: Auth;
};

export default function Profile() {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const getInitials = useInitials();
    const [savedSuccess, setSavedSuccess] = useState(false);

    return (
        <>
            <Head title="Profil & Identitas — ShareRoom" />

            <div className="space-y-8">
                {/* Header Title Section */}
                <div className="border-b border-border/60 dark:border-zinc-800 pb-4 space-y-1">
                    <h2 className="text-xl font-bold text-foreground dark:text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-indigo-500" /> Informasi Profil & Identitas
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        Perbarui nama lengkap dan alamat email utama yang terhubung dengan akun ShareRoom Anda.
                    </p>
                </div>

                {/* Avatar Summary Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-secondary/40 dark:bg-zinc-950/60 border border-border/60 dark:border-zinc-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14 overflow-hidden rounded-full ring-2 ring-indigo-500/30">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="bg-indigo-600 text-white font-bold text-base">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5">
                            <h3 className="font-bold text-foreground dark:text-white text-base leading-tight">
                                {user.name}
                            </h3>
                            <p className="text-xs text-muted-foreground font-mono">{user.email}</p>
                            <div className="flex items-center gap-2 pt-1">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                                    <CheckCircle2 className="w-3 h-3" /> Akun Terverifikasi
                                </span>
                            </div>
                        </div>
                    </div>

                    <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
                        <ShieldCheck className="w-4 h-4" /> {user.role === 'admin' ? 'Admin' : 'Member'}
                    </span>
                </div>

                {/* Profile Form */}
                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    onSuccess={() => {
                        setSavedSuccess(true);
                        setTimeout(() => setSavedSuccess(false), 3000);
                    }}
                    className="space-y-5"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="space-y-1.5">
                                <label htmlFor="name" className="text-xs font-semibold text-foreground dark:text-zinc-300 flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-indigo-500" /> Nama Lengkap <span className="text-rose-500">*</span>
                                </label>

                                <input
                                    id="name"
                                    type="text"
                                    defaultValue={user.name}
                                    name="name"
                                    required
                                    autoComplete="name"
                                    placeholder="Masukkan nama lengkap Anda"
                                    className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-foreground dark:text-white font-medium focus:outline-none focus:border-indigo-500 transition-colors"
                                />

                                <InputError
                                    className="mt-1 text-xs"
                                    message={errors.name}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="email" className="text-xs font-semibold text-foreground dark:text-zinc-300 flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5 text-indigo-500" /> Alamat Email <span className="text-rose-500">*</span>
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    defaultValue={user.email}
                                    name="email"
                                    required
                                    autoComplete="username"
                                    placeholder="contoh@domain.com"
                                    className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-foreground dark:text-white font-medium focus:outline-none focus:border-indigo-500 transition-colors"
                                />

                                <InputError
                                    className="mt-1 text-xs"
                                    message={errors.email}
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    data-test="update-profile-button"
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>Simpan Perubahan</span>
                                </button>

                                {savedSuccess && (
                                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-in fade-in duration-200">
                                        <CheckCircle2 className="w-4 h-4" /> Profil berhasil diperbarui!
                                    </span>
                                )}
                            </div>
                        </>
                    )}
                </Form>

                {/* Danger Zone Section */}
                <div className="pt-6 border-t border-border/60 dark:border-zinc-800">
                    <DeleteUser />
                </div>
            </div>
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Pengaturan Profil',
            href: edit(),
        },
    ],
};
