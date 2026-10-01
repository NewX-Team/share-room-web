import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Users, DoorClosed, Sun, Moon, Monitor, Ticket, Megaphone, Timer } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import type { Auth } from '@/types/auth';
import { useAppearance } from '@/hooks/use-appearance';

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const isAdmin = auth?.user?.role === 'admin';
    const { appearance, updateAppearance } = useAppearance();
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    const mainNavItems: NavItem[] = [
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
                      title: 'Paket Perpanjang Room',
                      href: '/admin/extension-packages',
                      icon: Timer,
                  },
                  {
                      title: 'Kode Promo',
                      href: '/admin/promos',
                      icon: Ticket,
                  },
                  {
                      title: 'Manajemen Pengumuman',
                      href: '/admin/announcements',
                      icon: Megaphone,
                  },
              ]
            : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter className="gap-3">
                {/* Theme Switcher Segmented Control: Responds cleanly to Collapsed/Expanded Sidebar */}
                <div
                    className={`p-1 rounded-xl bg-sidebar-accent/50 border border-sidebar-border/60 flex text-xs transition-all ${
                        isCollapsed ? 'flex-col gap-1 items-center justify-center' : 'flex-row items-center justify-between'
                    }`}
                >
                    <button
                        onClick={() => updateAppearance('light')}
                        className={`rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                            isCollapsed ? 'w-8 h-8' : 'flex-1 py-1.5'
                        } ${
                            appearance === 'light'
                                ? 'bg-background text-foreground shadow-sm font-semibold'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                        title="Mode Terang"
                    >
                        <Sun className="w-3.5 h-3.5 flex-shrink-0" />
                        {!isCollapsed && <span className="text-[11px]">Terang</span>}
                    </button>
                    <button
                        onClick={() => updateAppearance('dark')}
                        className={`rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                            isCollapsed ? 'w-8 h-8' : 'flex-1 py-1.5'
                        } ${
                            appearance === 'dark'
                                ? 'bg-background text-foreground shadow-sm font-semibold'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                        title="Mode Gelap"
                    >
                        <Moon className="w-3.5 h-3.5 flex-shrink-0" />
                        {!isCollapsed && <span className="text-[11px]">Gelap</span>}
                    </button>
                    <button
                        onClick={() => updateAppearance('system')}
                        className={`rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                            isCollapsed ? 'w-8 h-8' : 'flex-1 py-1.5'
                        } ${
                            appearance === 'system'
                                ? 'bg-background text-foreground shadow-sm font-semibold'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                        title="Mode Auto (Sistem)"
                    >
                        <Monitor className="w-3.5 h-3.5 flex-shrink-0" />
                        {!isCollapsed && <span className="text-[11px]">Auto</span>}
                    </button>
                </div>

                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
