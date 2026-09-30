import { Form } from '@inertiajs/react';
import { useRef } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Trash2, ShieldAlert } from 'lucide-react';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h3 className="text-base font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5" /> Zona Bahaya — Hapus Akun
                </h3>
                <p className="text-xs text-muted-foreground">
                    Menghapus akun Anda akan menghapus seluruh data profil dan riwayat room secara permanen.
                </p>
            </div>

            <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5 dark:bg-rose-500/10 space-y-3">
                <div className="flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
                    <div>
                        <p className="font-bold">Peringatan Penting</p>
                        <p className="text-[11px] opacity-90">
                            Harap lakukan dengan hati-hati. Setelah akun dihapus, tindakan ini tidak dapat dibatalkan.
                        </p>
                    </div>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            variant="destructive"
                            data-test="delete-user-button"
                            className="rounded-xl text-xs font-semibold px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 flex items-center gap-1.5"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Hapus Akun Permanen
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl max-w-md p-6 border border-border dark:border-zinc-800 bg-card dark:bg-zinc-900 shadow-2xl">
                        <DialogTitle className="text-base font-bold text-foreground dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-rose-500" /> Konfirmasi Penghapusan Akun
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
                            Apakah Anda benar-benar yakin ingin menghapus akun Anda? Semua data room dan profil akan dihapus secara permanen. Silakan masukkan kata sandi Anda untuk mengonfirmasi.
                        </DialogDescription>

                        <Form
                            {...ProfileController.destroy.form()}
                            options={{
                                preserveScroll: true,
                            }}
                            onError={() => passwordInput.current?.focus()}
                            resetOnSuccess
                            className="space-y-4 pt-2"
                        >
                            {({ resetAndClearErrors, processing, errors }) => (
                                <>
                                    <div className="space-y-1">
                                        <Label
                                            htmlFor="password"
                                            className="text-xs font-semibold text-foreground dark:text-zinc-300"
                                        >
                                            Kata Sandi Anda <span className="text-rose-500">*</span>
                                        </Label>

                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            ref={passwordInput}
                                            placeholder="Masukkan kata sandi untuk konfirmasi"
                                            autoComplete="current-password"
                                            className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-foreground dark:text-white"
                                        />

                                        <InputError message={errors.password} className="text-xs" />
                                    </div>

                                    <DialogFooter className="gap-2 pt-2">
                                        <DialogClose asChild>
                                            <Button
                                                variant="secondary"
                                                onClick={() => resetAndClearErrors()}
                                                className="rounded-xl text-xs font-semibold"
                                            >
                                                Batal
                                            </Button>
                                        </DialogClose>

                                        <Button
                                            variant="destructive"
                                            disabled={processing}
                                            className="rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500"
                                            asChild
                                        >
                                            <button
                                                type="submit"
                                                data-test="confirm-delete-user-button"
                                            >
                                                Ya, Hapus Akun
                                            </button>
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
