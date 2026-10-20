
import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

void createInertiaApp({
    title: (title) =>
        title ? `${title} - ${appName}` : appName,

    layout: (name) => {
        switch (true) {
            // Halaman publik
            case name === 'welcome':
                return null;

            // Semua halaman admin memakai layout sendiri
            case name.startsWith('Admin/'):
                return null;

            // Halaman autentikasi
            case name.startsWith('auth/'):
                return AuthLayout;

            // Halaman pengaturan Laravel
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];

            // Halaman bawaan Laravel lainnya
            default:
                return AppLayout;
        }
    },

    strictMode: true,

    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },

    progress: {
        color: '#df6a27',
    },
});

initializeTheme();
