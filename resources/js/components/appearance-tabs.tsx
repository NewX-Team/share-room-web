import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Sun, CheckCircle2 } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const options: {
        value: Appearance;
        icon: LucideIcon;
        label: string;
        description: string;
        bgPreview: string;
    }[] = [
        {
            value: 'light',
            icon: Sun,
            label: 'Mode Terang (Light)',
            description: 'Tampilan latar putih bersih yang nyaman untuk aktivitas siang hari.',
            bgPreview: 'bg-slate-100 border-slate-300 text-slate-900',
        },
        {
            value: 'dark',
            icon: Moon,
            label: 'Mode Gelap (Dark)',
            description: 'Tampilan gelap elegan beraksen neon yang nyaman untuk mata.',
            bgPreview: 'bg-zinc-950 border-zinc-800 text-zinc-100',
        },
        {
            value: 'system',
            icon: Monitor,
            label: 'Mode Otomatis (Sistem)',
            description: 'Mengikuti preferensi mode gelap/terang pada perangkat Anda secara otomatis.',
            bgPreview: 'bg-gradient-to-r from-slate-100 to-zinc-950 border-zinc-700 text-foreground',
        },
    ];

    return (
        <div className={cn('grid grid-cols-1 sm:grid-cols-3 gap-4', className)} {...props}>
            {options.map(({ value, icon: Icon, label, description, bgPreview }) => {
                const active = appearance === value;
                return (
                    <button
                        key={value}
                        type="button"
                        onClick={() => updateAppearance(value)}
                        className={cn(
                            'group relative text-left p-5 rounded-3xl border transition-all duration-200 flex flex-col justify-between space-y-4 cursor-pointer',
                            active
                                ? 'bg-card dark:bg-zinc-900 border-[#008080] ring-2 ring-[#008080]/20 shadow-lg shadow-[#008080]/10 scale-[1.02]'
                                : 'bg-card/60 dark:bg-zinc-900/60 border-border/70 dark:border-zinc-800 hover:border-[#008080]/50 hover:bg-card dark:hover:bg-zinc-900'
                        )}
                    >
                        {/* Mini Visual Mockup Box */}
                        <div className={cn('w-full h-24 rounded-2xl border p-2.5 flex flex-col justify-between shadow-inner transition-transform group-hover:scale-[1.02]', bgPreview)}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                </div>
                                <Icon className="w-4 h-4 opacity-75" />
                            </div>

                            <div className="space-y-1">
                                <div className="w-3/4 h-2 rounded-full bg-current opacity-25" />
                                <div className="w-1/2 h-2 rounded-full bg-current opacity-15" />
                            </div>
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-foreground dark:text-white flex items-center gap-1.5">
                                    <Icon className={cn('w-4 h-4', active ? 'text-[#008080]' : 'text-muted-foreground')} />
                                    {label}
                                </span>
                                {active && (
                                    <CheckCircle2 className="w-4 h-4 text-[#008080] flex-shrink-0" />
                                )}
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                {description}
                            </p>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
