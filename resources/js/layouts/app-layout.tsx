import { usePage } from '@inertiajs/react';
import FlashNotifier from '@/components/flash-notifier';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';
import type { Auth } from '@/types/auth';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const isAdmin = auth?.user?.role === 'admin';

    // Admin uses vertical Sidebar layout for scalability; Regular Users use Top Floating Navbar
    const LayoutTemplate = isAdmin ? AppSidebarLayout : AppHeaderLayout;

    return (
        <LayoutTemplate breadcrumbs={breadcrumbs}>
            <FlashNotifier />
            {children}
        </LayoutTemplate>
    );
}
