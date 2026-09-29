import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { showErrorAlert, showInfoAlert, showSuccessAlert, showWarningAlert } from '@/lib/swal';

interface PageProps {
    flash?: {
        success?: string | null;
        error?: string | null;
        warning?: string | null;
        info?: string | null;
    };
    errors?: Record<string, string>;
    [key: string]: any;
}

export default function FlashNotifier() {
    const { props } = usePage<PageProps>();
    const flash = props.flash;
    const errors = props.errors;

    // Track previous messages to prevent duplicate popup triggers
    const prevFlashRef = useRef<string | null>(null);
    const prevErrorRef = useRef<string | null>(null);

    useEffect(() => {
        if (!flash) return;

        if (flash.success && flash.success !== prevFlashRef.current) {
            prevFlashRef.current = flash.success;
            showSuccessAlert(flash.success);
        } else if (flash.error && flash.error !== prevFlashRef.current) {
            prevFlashRef.current = flash.error;
            showErrorAlert(flash.error);
        } else if (flash.warning && flash.warning !== prevFlashRef.current) {
            prevFlashRef.current = flash.warning;
            showWarningAlert(flash.warning);
        } else if (flash.info && flash.info !== prevFlashRef.current) {
            prevFlashRef.current = flash.info;
            showInfoAlert(flash.info);
        }
    }, [flash]);

    useEffect(() => {
        if (!errors || Object.keys(errors).length === 0) return;

        const firstErrorKey = Object.keys(errors)[0];
        const firstErrorMessage = errors[firstErrorKey];

        if (firstErrorMessage && firstErrorMessage !== prevErrorRef.current) {
            prevErrorRef.current = firstErrorMessage;
            showErrorAlert(firstErrorMessage, 'Validasi Gagal!');
        }
    }, [errors]);

    return null;
}
