import { Head, useForm, usePage, router } from '@inertiajs/react';
import { showConfirmDialog } from '@/lib/swal';
import { 
    Users, 
    UserPlus, 
    Trash2, 
    Mail, 
    Lock, 
    User as UserIcon, 
    Shield
} from 'lucide-react';
import { useState } from 'react';
import type { Auth, User } from '@/types/auth';

interface AdminUsersIndexProps {
    users: User[];
}

export default function AdminUsersIndex({ users }: AdminUsersIndexProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const currentUser = auth?.user;

    const [showModal, setShowModal] = useState(false);

    const form = useForm({
        name: '',
        email: '',
        password: '',
        role: 'user' as 'admin' | 'user',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/users', {
            onSuccess: () => {
                form.reset();
                setShowModal(false);
            },
        });
    };

    const handleDelete = (userId: number) => {
        showConfirmDialog({
            title: 'Hapus Pengguna?',
            text: 'Akun pengguna ini akan dihapus secara permanen dari sistem.',
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            icon: 'error',
        }, () => {
            router.delete(`/admin/users/${userId}`);
        });
    };

    return (
        <>
            <Head title="Manajemen Pengguna — ShareRoom Admin" />

            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 bg-background dark:bg-[#0e0f12] text-foreground dark:text-zinc-100 min-h-screen">
                {/* Header Page */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                            <Users className="w-3.5 h-3.5" /> Fitur Admin Terpisah
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground dark:text-white">
                            Manajemen Pengguna ({users?.length || 0})
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground dark:text-zinc-400">
                            Kelola seluruh pengguna terdaftar, tambah user secara manual, atau hapus akun pengguna.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>+ Tambah User Manual</span>
                    </button>
                </div>

                {/* Modal Form Tambah User */}
                {showModal && (
                    <div className="bg-card dark:bg-zinc-900 border border-indigo-500/30 rounded-2xl p-6 space-y-4 animate-in fade-in duration-200 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-border dark:border-zinc-800 pb-3">
                            <h3 className="font-bold text-foreground dark:text-white text-base flex items-center gap-2">
                                <UserPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Form Tambah Pengguna Baru
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-xs text-muted-foreground hover:text-foreground"
                            >
                                Batal ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div>
                                <label className="block text-foreground dark:text-zinc-300 font-medium mb-1">Nama Lengkap</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={form.data.name}
                                        onChange={e => form.setData('name', e.target.value)}
                                        placeholder="Nama User"
                                        required
                                        className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-foreground dark:text-white focus:outline-none focus:border-indigo-500"
                                    />
                                    <UserIcon className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                                </div>
                                {form.errors.name && <p className="text-rose-500 text-[11px] mt-1">{form.errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-foreground dark:text-zinc-300 font-medium mb-1">Alamat Email</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={form.data.email}
                                        onChange={e => form.setData('email', e.target.value)}
                                        placeholder="email@example.com"
                                        required
                                        className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-foreground dark:text-white focus:outline-none focus:border-indigo-500"
                                    />
                                    <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                                </div>
                                {form.errors.email && <p className="text-rose-500 text-[11px] mt-1">{form.errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-foreground dark:text-zinc-300 font-medium mb-1">Kata Sandi</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        value={form.data.password}
                                        onChange={e => form.setData('password', e.target.value)}
                                        placeholder="Minimal 8 karakter"
                                        required
                                        className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-foreground dark:text-white focus:outline-none focus:border-indigo-500"
                                    />
                                    <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                                </div>
                                {form.errors.password && <p className="text-rose-500 text-[11px] mt-1">{form.errors.password}</p>}
                            </div>

                            <div>
                                <label className="block text-foreground dark:text-zinc-300 font-medium mb-1">Role Akun</label>
                                <div className="relative">
                                    <select
                                        value={form.data.role}
                                        onChange={e => form.setData('role', e.target.value as 'admin' | 'user')}
                                        className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-foreground dark:text-white focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="user">User Biasa</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                    <Shield className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                                </div>
                            </div>

                            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="px-6 py-2.5 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-semibold text-xs transition-colors shadow-md"
                                >
                                    {form.processing ? 'Menyimpan...' : 'Simpan User Baru'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Table User List */}
                <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="text-muted-foreground bg-background dark:bg-zinc-950 border-b border-border dark:border-zinc-800 font-medium uppercase tracking-wider">
                                <tr>
                                    <th className="p-3.5">ID User</th>
                                    <th className="p-3.5">Nama Lengkap</th>
                                    <th className="p-3.5">Alamat Email</th>
                                    <th className="p-3.5">Role</th>
                                    <th className="p-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border dark:divide-zinc-800/60">
                                {users?.map((u) => (
                                    <tr key={u.id} className="hover:bg-background/50 dark:hover:bg-zinc-950/50 transition-colors">
                                        <td className="p-3.5 font-mono text-muted-foreground">#{u.id}</td>
                                        <td className="p-3.5 font-bold text-foreground dark:text-white flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-full bg-indigo-600/20 text-indigo-600 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
                                                {u.name.charAt(0)}
                                            </div>
                                            <span>{u.name}</span>
                                            {u.id === currentUser?.id && (
                                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Kamu</span>
                                            )}
                                        </td>
                                        <td className="p-3.5 text-muted-foreground font-mono">{u.email}</td>
                                        <td className="p-3.5">
                                            <span className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase font-bold ${u.role === 'admin' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' : 'bg-zinc-100 dark:bg-zinc-800 text-muted-foreground'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-3.5 text-right">
                                            {u.id !== currentUser?.id && (
                                                <button
                                                    onClick={() => handleDelete(u.id)}
                                                    className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-lg font-medium transition-colors inline-flex items-center gap-1.5"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Hapus
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

AdminUsersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Manajemen Pengguna',
            href: '/admin/users',
        },
    ],
};
