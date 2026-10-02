import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import { edit as editAppearance } from '@/routes/appearance';
import { Palette, Sparkles } from 'lucide-react';

export default function Appearance() {
    return (
        <>
            <Head title="Tampilan & Tema — ShareRoom" />

            <div className="space-y-8">
                {/* Header Title Section */}
                <div className="border-b border-border/60 dark:border-zinc-800 pb-4 space-y-1">
                    <h2 className="text-xl font-bold text-foreground dark:text-white flex items-center gap-2">
                        <Palette className="w-5 h-5 text-[#008080]" /> Tema Tampilan Aplikasi
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        Pilih gaya mode tampilan yang paling sesuai untuk kenyamanan mata Anda.
                    </p>
                </div>

                {/* Appearance Selector Cards */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                        <Sparkles className="w-3.5 h-3.5 text-[#008080]" /> Pilih Mode Tampilan:
                    </div>
                    <AppearanceTabs />
                </div>
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Tampilan & Tema',
            href: editAppearance(),
        },
    ],
};
