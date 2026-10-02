import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// Check if dark mode is active on documentElement safely
const isDarkMode = () => {
    if (typeof document === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
};

export const getSwalConfig = () => {
    const dark = isDarkMode();
    return Swal.mixin({
        background: dark ? '#18181b' : '#ffffff',
        color: dark ? '#f4f4f5' : '#18181b',
        confirmButtonColor: '#008080', // Teal brand
        cancelButtonColor: '#71717a',  // Zinc-500
        customClass: {
            popup: 'rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 font-sans',
            title: 'text-lg font-bold text-zinc-900 dark:text-white',
            htmlContainer: 'text-xs text-zinc-600 dark:text-zinc-400 mt-2',
            confirmButton: 'px-5 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-md',
            cancelButton: 'px-5 py-2.5 rounded-xl font-semibold text-xs transition-all',
        },
        buttonsStyling: true,
    });
};

export const showSuccessAlert = (message: string, title: string = 'Berhasil!') => {
    return getSwalConfig().fire({
        icon: 'success',
        title,
        text: message,
        timer: 3500,
        timerProgressBar: true,
        confirmButtonText: 'OK',
    });
};

export const showErrorAlert = (message: string, title: string = 'Gagal / Error') => {
    return getSwalConfig().fire({
        icon: 'error',
        title,
        text: message,
        confirmButtonText: 'Mengerti',
        confirmButtonColor: '#e11d48', // Rose-600
    });
};

export const showWarningAlert = (message: string, title: string = 'Peringatan') => {
    return getSwalConfig().fire({
        icon: 'warning',
        title,
        text: message,
        confirmButtonText: 'OK',
        confirmButtonColor: '#f59e0b', // Amber-500
    });
};

export const showInfoAlert = (message: string, title: string = 'Informasi') => {
    return getSwalConfig().fire({
        icon: 'info',
        title,
        text: message,
        confirmButtonText: 'OK',
    });
};

interface ConfirmOptions {
    title: string;
    text?: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    icon?: 'warning' | 'error' | 'info' | 'question';
}

export const showConfirmDialog = (options: ConfirmOptions, onConfirm: () => void) => {
    return getSwalConfig().fire({
        title: options.title,
        text: options.text || '',
        icon: options.icon || 'warning',
        showCancelButton: true,
        confirmButtonText: options.confirmButtonText || 'Ya, Lanjutkan',
        cancelButtonText: options.cancelButtonText || 'Batal',
        reverseButtons: true,
        confirmButtonColor: options.icon === 'error' ? '#e11d48' : '#008080',
    }).then((result) => {
        if (result.isConfirmed) {
            onConfirm();
        }
    });
};
