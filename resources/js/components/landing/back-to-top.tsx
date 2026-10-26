import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

import "../../../css/back-to-top.css";

const SHOW_AFTER = 420;

export default function BackToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const updateVisibility = () => {
            setVisible(window.scrollY > SHOW_AFTER);
        };

        // Cek juga saat halaman baru dibuka
        // pada posisi scroll yang tersimpan.
        updateVisibility();

        window.addEventListener("scroll", updateVisibility, { passive: true });

        return () => {
            window.removeEventListener("scroll", updateVisibility);
        };
    }, []);

    const handleBackToTop = () => {
        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;

        window.scrollTo({
            top: 0,
            behavior: reducedMotion ? "auto" : "smooth",
        });
    };

    return (
        <button
            type="button"
            className={"bt-top" + (visible ? " bt-top--visible" : "")}
            onClick={handleBackToTop}
            aria-label="Kembali ke atas halaman"
            title="Kembali ke atas"
        >
            <ArrowUp size={21} strokeWidth={1.8} aria-hidden="true" />
        </button>
    );
}
