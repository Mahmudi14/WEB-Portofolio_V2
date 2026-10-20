
import { usePage } from '@inertiajs/react';
import { ImageIcon } from 'lucide-react';

type BrandingProps = {
    branding?: {
        logo_url?: string | null;
    };
};

type BrandLogoProps = {
    className?: string;
};

export default function BrandLogo({
    className = 'h-11 w-11',
}: BrandLogoProps) {
    const { branding } = usePage().props as BrandingProps;

    if (branding?.logo_url) {
        return (
            <img
                src={branding.logo_url}
                alt="Logo website"
                className={`${className} object-contain`}
            />
        );
    }

    return (
        <span
            aria-label="Logo belum tersedia"
            className={`${className} inline-flex items-center justify-center rounded-xl bg-[#382820] text-[#f2a06e]`}
        >
            <ImageIcon size={22} />
        </span>
    );
}
