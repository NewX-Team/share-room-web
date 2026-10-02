import { Link, router, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Megaphone,
    Users,
    DoorClosed,
    Ticket,
    Sun,
    Moon,
    Monitor,
    Menu,
    LogOut,
    Settings,
} from 'lucide-react';
import { useState } from 'react';
import AppLogo from '@/components/app-logo';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useAppearance } from '@/hooks/use-appearance';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, NavItem } from '@/types';
import type { Auth } from '@/types/auth';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

export function AppHeader({ breadcrumbs = [] }: Props) {
    const page = usePage<{ auth: Auth }>();
    const auth = page.props.auth;
    const user = auth?.user;
    const isAdmin = user?.role === 'admin';

    const getInitials = useInitials();
    const { isCurrentUrl } = useCurrentUrl();
    const { appearance, updateAppearance } = useAppearance();
    const [mobileOpen, setMobileOpen] = useState(false);

    const navItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'Pengumuman',
            href: '/announcements',
            icon: Megaphone,
        },
        ...(isAdmin
            ? [
                  {
                      title: 'Manajemen Pengguna',
                      href: '/admin/users',
                      icon: Users,
                  },
                  {
                      title: 'Manajemen Room',
                      href: '/admin/rooms',
                      icon: DoorClosed,
                  },
                  {
                      title: 'Kode Promo',
                      href: '/admin/promos',
                      icon: Ticket,
                  },
                  {
                      title: 'Pengumuman Admin',
                      href: '/admin/announcements',
                      icon: Megaphone,
                  },
              ]
            : []),
    ];

    return (
        <div className="sticky top-3 sm:top-4 z-50 mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 mb-4">
            {/* Main Floating Navbar Pill */}
            <header className="bg-card/85 dark:bg-zinc-900/85 backdrop-blur-xl border border-border/80 dark:border-zinc-800/80 shadow-xl shadow-black/5 dark:shadow-black/30 rounded-2xl p-2.5 sm:px-5 sm:py-3 flex items-center justify-between gap-4 transition-all duration-300">
                {/* Brand Logo */}
                <Link
                    href={dashboard()}
                    prefetch
                    className="flex items-center gap-2 hover:opacity-90 transition-opacity pl-1"
                >
                    <AppLogo />
                </Link>

                {/* Center Navigation Links (Desktop View) */}
                <nav className="hidden md:flex items-center gap-1 bg-secondary/50 dark:bg-zinc-950/60 p-1.5 rounded-xl border border-border/50 dark:border-zinc-800/50">
                    {navItems.map((item) => {
                        const active = isCurrentUrl(item.href);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.title}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200',
                                    active
                                        ? 'bg-background dark:bg-zinc-800 text-[#008080] dark:text-teal-400 shadow-sm border border-border/60 dark:border-zinc-700/60 scale-[1.02]'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-background/60 dark:hover:bg-zinc-800/50 font-medium'
                                )}
                            >
                                {Icon && (
                                    <Icon
                                        className={cn(
                                            'w-4 h-4',
                                            active ? 'text-[#008080]' : 'text-muted-foreground'
                                        )}
                                    />
                                )}
                                <span>{item.title}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Right Action Tools: Theme Switcher & Profile Dropdown */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Theme Switcher Segmented Control */}
                    <div className="hidden sm:flex items-center p-1 rounded-xl bg-secondary/50 dark:bg-zinc-950/60 border border-border/50 dark:border-zinc-800/50 text-xs gap-0.5">
                        <button
                            onClick={() => updateAppearance('light')}
                            className={cn(
                                'p-1.5 rounded-lg transition-all',
                                appearance === 'light'
                                    ? 'bg-background text-foreground shadow-sm font-semibold'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                            title="Mode Terang"
                        >
                            <Sun className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => updateAppearance('dark')}
                            className={cn(
                                'p-1.5 rounded-lg transition-all',
                                appearance === 'dark'
                                    ? 'bg-background text-foreground shadow-sm font-semibold'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                            title="Mode Gelap"
                        >
                            <Moon className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => updateAppearance('system')}
                            className={cn(
                                'p-1.5 rounded-lg transition-all',
                                appearance === 'system'
                                    ? 'bg-background text-foreground shadow-sm font-semibold'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                            title="Mode Auto (Sistem)"
                        >
                            <Monitor className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* User Profile Dropdown Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="relative h-9 w-9 rounded-full ring-2 ring-[#008080]/30 hover:ring-[#008080]/60 transition-all p-0 overflow-hidden"
                            >
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={user?.avatar} alt={user?.name} />
                                    <AvatarFallback className="bg-[#008080] text-white font-bold text-xs">
                                        {getInitials(user?.name ?? '')}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-56 mt-2 rounded-2xl p-2 border border-border/80 dark:border-zinc-800 bg-card/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-2xl animate-in zoom-in-95 duration-150"
                            align="end"
                        >
                            <div className="p-3 border-b border-border/60 dark:border-zinc-800 space-y-1">
                                <p className="text-xs font-bold text-foreground leading-tight">{user?.name}</p>
                                <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-[#008080]/10 text-[#008080] dark:text-teal-400 text-[10px] font-bold uppercase tracking-wider">
                                    {isAdmin ? 'Administrator' : 'Pengguna Regular'}
                                </span>
                            </div>
                            <div className="py-1">
                                <DropdownMenuItem asChild className="rounded-xl cursor-pointer text-xs font-medium">
                                    <Link href="/settings/profile" className="flex items-center gap-2">
                                        <Settings className="w-4 h-4 text-muted-foreground" /> Pengaturan Profil
                                    </Link>
                                </DropdownMenuItem>
                            </div>
                            <DropdownMenuSeparator className="bg-border/60 dark:bg-zinc-800" />
                            <DropdownMenuItem
                                onClick={() => router.post('/logout')}
                                className="rounded-xl cursor-pointer text-xs font-medium text-rose-600 dark:text-rose-400 focus:bg-rose-500/10 flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" /> Keluar (Logout)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Mobile Hamburger Trigger */}
                    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden h-9 w-9 rounded-xl border border-border/60 bg-secondary/50 hover:bg-secondary"
                            >
                                <Menu className="w-5 h-5 text-foreground" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="top"
                            className="w-[calc(100%-1.5rem)] max-w-lg mx-auto mt-3 rounded-3xl border border-border/80 dark:border-zinc-800 bg-card/95 dark:bg-zinc-900/95 backdrop-blur-2xl p-6 shadow-2xl space-y-5"
                        >
                            <SheetHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60 dark:border-zinc-800">
                                <AppLogo />
                                <SheetTitle className="sr-only">Navigasi Utama Mobile</SheetTitle>
                            </SheetHeader>

                            {/* Mobile User Profile Summary Card */}
                            <div className="p-3.5 rounded-2xl bg-secondary/50 dark:bg-zinc-950/60 border border-border/50 dark:border-zinc-800/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-[#008080]/20">
                                        <AvatarImage src={user?.avatar} alt={user?.name} />
                                        <AvatarFallback className="bg-[#008080] text-white font-bold text-xs">
                                            {getInitials(user?.name ?? '')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-bold text-foreground">{user?.name}</p>
                                        <p className="text-[11px] text-muted-foreground">{user?.email}</p>
                                    </div>
                                </div>
                                <span className="px-2 py-0.5 rounded-full bg-[#008080]/10 text-[#008080] dark:text-teal-400 text-[10px] font-bold uppercase">
                                    {isAdmin ? 'Admin' : 'User'}
                                </span>
                            </div>

                            {/* Mobile Navigation List */}
                            <div className="space-y-1.5">
                                {navItems.map((item) => {
                                    const active = isCurrentUrl(item.href);
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.title}
                                            href={item.href}
                                            onClick={() => setMobileOpen(false)}
                                            className={cn(
                                                'flex items-center justify-between p-3 rounded-2xl text-xs font-semibold transition-all',
                                                active
                                                    ? 'bg-[#008080]/10 dark:bg-[#008080]/20 text-[#008080] dark:text-teal-400 border border-[#008080]/20 font-bold'
                                                    : 'text-foreground/80 hover:bg-secondary hover:text-foreground'
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                {Icon && (
                                                    <Icon
                                                        className={cn(
                                                            'w-4 h-4',
                                                            active ? 'text-[#008080]' : 'text-muted-foreground'
                                                        )}
                                                    />
                                                )}
                                                <span>{item.title}</span>
                                            </div>
                                            {active && (
                                                <span className="w-2 h-2 rounded-full bg-[#008080] shadow-sm" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Mobile Theme Switcher */}
                            <div className="p-3.5 rounded-2xl bg-secondary/40 dark:bg-zinc-950/40 border border-border/50 dark:border-zinc-800/50 space-y-2">
                                <p className="text-[11px] font-semibold text-muted-foreground">Mode Tampilan Aplikasi:</p>
                                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-background dark:bg-zinc-900 border border-border/60">
                                    <button
                                        onClick={() => updateAppearance('light')}
                                        className={cn(
                                            'py-1.5 rounded-lg flex items-center justify-center gap-1.5 text-[11px] transition-all',
                                            appearance === 'light'
                                                ? 'bg-[#008080] text-white font-bold shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground'
                                        )}
                                    >
                                        <Sun className="w-3.5 h-3.5" /> Terang
                                    </button>
                                    <button
                                        onClick={() => updateAppearance('dark')}
                                        className={cn(
                                            'py-1.5 rounded-lg flex items-center justify-center gap-1.5 text-[11px] transition-all',
                                            appearance === 'dark'
                                                ? 'bg-[#008080] text-white font-bold shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground'
                                        )}
                                    >
                                        <Moon className="w-3.5 h-3.5" /> Gelap
                                    </button>
                                    <button
                                        onClick={() => updateAppearance('system')}
                                        className={cn(
                                            'py-1.5 rounded-lg flex items-center justify-center gap-1.5 text-[11px] transition-all',
                                            appearance === 'system'
                                                ? 'bg-[#008080] text-white font-bold shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground'
                                        )}
                                    >
                                        <Monitor className="w-3.5 h-3.5" /> Auto
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Settings & Logout Footer */}
                            <div className="pt-3 border-t border-border/60 dark:border-zinc-800 flex items-center justify-between">
                                <Link
                                    href="/settings/profile"
                                    onClick={() => setMobileOpen(false)}
                                    className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5"
                                >
                                    <Settings className="w-4 h-4" /> Pengaturan Akun
                                </Link>
                                <button
                                    onClick={() => {
                                        setMobileOpen(false);
                                        router.post('/logout');
                                    }}
                                    className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                                >
                                    <LogOut className="w-3.5 h-3.5" /> Keluar
                                </button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </header>

            {/* Optional Breadcrumbs Sub-bar */}
            {breadcrumbs.length > 1 && (
                <div className="mt-2 mx-auto max-w-6xl px-2">
                    <div className="flex items-center h-8 text-xs text-muted-foreground">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </div>
    );
}
