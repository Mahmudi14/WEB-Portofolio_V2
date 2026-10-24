import { Layers3, Menu, X, ArrowUpRight } from "lucide-react";
import { useState } from "react";

const navigation = [
    { label: "Tentang", href: "#about" },
    { label: "Keahlian", href: "#skills" },
    { label: "Pengalaman", href: "#experience" },
    { label: "Proyek", href: "#projects" },
    { label: "Penelitian", href: "#research" },
];

export default function SiteNavbar({ name, logoUrl }: { name: string; logoUrl: string | null }) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="lp-header">
            <div className="lp-container lp-header__inner">
                <a
                    href="#home"
                    className="lp-brand"
                    aria-label="Kembali ke beranda"
                >
                    <span className="lp-brand__mark">
                        {logoUrl ? (
                            <img src={logoUrl} alt="" />
                        ) : (
                            <Layers3 size={21} />
                        )}
                    </span>

                    <span className="lp-brand__text">
                        {name}
                        <b>.</b>
                    </span>
                </a>

                <nav
                    className={
                        "lp-navigation" +
                        (menuOpen ? " lp-navigation--open" : "")
                    }
                    aria-label="Navigasi utama"
                >
                    {navigation.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            onClick={() => setMenuOpen(false)}
                        >
                            {item.label}
                        </a>
                    ))}

                    <a
                        href="#contact"
                        className="lp-nav-contact"
                        onClick={() => setMenuOpen(false)}
                    >
                        Hubungi Saya
                        <ArrowUpRight size={15} />
                    </a>
                </nav>

                <button
                    type="button"
                    className="lp-menu-toggle"
                    aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>
            <div
                className="lp-header__lanyard-mount"
                data-hero-lanyard-mount
                aria-hidden="true"
            >
                <span className="lp-header__lanyard-eyelet" />
                <span className="lp-header__lanyard-eyelet" />
            </div>
        </header>
    );
}
