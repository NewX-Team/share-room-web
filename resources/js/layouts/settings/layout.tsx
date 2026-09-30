import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { User, ShieldCheck, Palette, Settings as SettingsIcon } from 'lucide-react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { NavItem } from '@/types';
import type { Auth } from '@/types/auth';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profil & Identitas',
        href: edit(),
        icon: User,
    },
    {
        title: 'Keamanan & Kata Sandi',
        href: editSecurity(),
        icon: ShieldCheck,
    },
    {
        title: 'Tampilan & Tema',
        href: editAppearance(),
        icon: Palette,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { auth } = usePage<{ auth: Auth }>().props;
    const user = auth?.user;
    const isAdmin = user?.role === 'admin';

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 text-foreground dark:text-zinc-100">
            {/* Header Settings Card */}
            <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                        <SettingsIcon className="w-3.5 h-3.5" /> Pengaturan Akun
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground dark:text-white">
                        Pengaturan & Privasi
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground dark:text-zinc-400">
                        Kelola informasi profil, preferensi kata sandi, serta tema tampilan aplikasi ShareRoom Anda.
                    </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center bg-secondary/50 dark:bg-zinc-950/60 border border-border/60 dark:border-zinc-800/60 px-3 py-1.5 rounded-2xl">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-foreground dark:text-zinc-200">
                        {isAdmin ? 'Akun Administrator' : 'Pengguna Regular'}
                    </span>
                </div>
            </div>

            {/* Sidebar Tabs & Content Body */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Navigation Aside */}
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <nav className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 p-2 rounded-3xl shadow-sm flex flex-row lg:flex-col gap-1 overflow-x-auto">
                        {sidebarNavItems.map((item, index) => {
                            const active = isCurrentOrParentUrl(item.href);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={`${toUrl(item.href)}-${index}`}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-semibold transition-all whitespace-nowrap lg:w-full',
                                        active
                                            ? 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-bold shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60 dark:hover:bg-zinc-800/50'
                                    )}
                                >
                                    {Icon && (
                                        <Icon
                                            className={cn(
                                                'w-4 h-4 flex-shrink-0',
                                                active ? 'text-indigo-500' : 'text-muted-foreground'
                                            )}
                                        />
                                    )}
                                    <span>{item.title}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Settings Panel */}
                <main className="flex-1 bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-sm min-h-[400px]">
                    <div className="max-w-2xl space-y-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
