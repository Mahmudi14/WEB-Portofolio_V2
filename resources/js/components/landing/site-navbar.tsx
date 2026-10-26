import { ArrowUpRight, Layers3, Menu, X } from "lucide-react";

import { useEffect, useRef, useState } from "react";

import "./../../../css/site-navbar.css";

type Props = {
    name: string;
    logoUrl: string | null;
};

const navigation = [
    { id: "about", label: "Tentang" },
    { id: "skills", label: "Keahlian" },
    { id: "experience", label: "Pengalaman" },
    { id: "education", label: "Pendidikan" },
    { id: "achievements", label: "Pencapaian" },
    { id: "projects", label: "Proyek" },
    { id: "research", label: "Penelitian" },
];

const sectionIds = ["home", ...navigation.map((item) => item.id), "contact"];

/**
 * Coding Bot
 *
 * Robot SVG ringan, tanpa image dan tanpa
 * library animasi tambahan.
 *
 * Perjalanan dan gerakan kaki menggunakan CSS.
 */
function CodingBot() {
    return (
        <div className="nb-runner" aria-hidden="true">
            <span className="nb-runner__track" />

            <div className="nb-runner__traveler">
                <svg
                    className="nb-bot"
                    viewBox="0 0 48 44"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    focusable="false"
                >
                    {/* ANTENNA */}
                    <g className="nb-bot__antenna">
                        <path
                            d="M24 10V5"
                            stroke="#FF6A00"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                        <circle cx="24" cy="3.5" r="2.5" fill="#FF6A00" />
                    </g>

                    {/* LEGS */}
                    <g className="nb-bot__leg nb-bot__leg--left">
                        <path
                            d="M19 29V37L15 40"
                            stroke="#F0F0EE"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </g>

                    <g className="nb-bot__leg nb-bot__leg--right">
                        <path
                            d="M29 29V37L33 40"
                            stroke="#F0F0EE"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </g>

                    {/* LEFT ARM */}
                    <g className="nb-bot__arm nb-bot__arm--left">
                        <path
                            d="M11 18L6 21V27"
                            stroke="#FF8E42"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </g>

                    {/* RIGHT ARM */}
                    <g className="nb-bot__arm nb-bot__arm--right">
                        <path
                            d="M37 18L42 21V27"
                            stroke="#FF8E42"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </g>

                    {/* ROBOT BODY */}
                    <rect
                        x="11"
                        y="10"
                        width="26"
                        height="21"
                        rx="5"
                        fill="#171B20"
                        stroke="#FF6A00"
                        strokeWidth="1.8"
                    />

                    {/* TERMINAL DISPLAY */}
                    <rect
                        x="15"
                        y="14"
                        width="18"
                        height="12"
                        rx="2"
                        fill="#070A0D"
                    />

                    {/* TERMINAL PROMPT >_ */}
                    <path
                        d="M18 17L22 20L18 23"
                        stroke="#FF984E"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    <path
                        className="nb-bot__cursor"
                        d="M25 23H30"
                        stroke="#F4F4F2"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                    />

                    {/* TINY BODY DETAILS */}
                    <circle cx="24" cy="28.5" r=".8" fill="#FF6A00" />
                </svg>
            </div>
        </div>
    );
}

export default function SiteNavbar({ name, logoUrl }: Props) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeId, setActiveId] = useState("home");

    const headerRef = useRef<HTMLElement>(null);
    const navRef = useRef<HTMLElement>(null);

    const indicatorRef = useRef<HTMLSpanElement>(null);

    const linksRef = useRef<Record<string, HTMLAnchorElement | null>>({});

    // ==========================================
    // DETECT ACTIVE SECTION ON SCROLL
    // ==========================================

    useEffect(() => {
        let frame = 0;

        function updateSection() {
            frame = 0;

            const headerHeight = headerRef.current?.offsetHeight ?? 80;

            const detectionPoint = Math.max(
                headerHeight + 32,
                window.innerHeight * 0.32,
            );

            let currentId = "home";

            for (const id of sectionIds) {
                const section = document.getElementById(id);

                if (!section) continue;

                const rect = section.getBoundingClientRect();

                if (rect.top <= detectionPoint) {
                    currentId = id;
                }
            }

            const atBottom =
                window.innerHeight + window.scrollY >=
                document.documentElement.scrollHeight - 4;

            if (atBottom && document.getElementById("contact")) {
                currentId = "contact";
            }

            setActiveId((previous) =>
                previous === currentId ? previous : currentId,
            );
        }

        function scheduleUpdate() {
            if (frame) return;

            frame = window.requestAnimationFrame(updateSection);
        }

        scheduleUpdate();

        window.addEventListener("scroll", scheduleUpdate, { passive: true });

        window.addEventListener("resize", scheduleUpdate);

        return () => {
            window.removeEventListener("scroll", scheduleUpdate);

            window.removeEventListener("resize", scheduleUpdate);

            if (frame) {
                window.cancelAnimationFrame(frame);
            }
        };
    }, []);

    // ==========================================
    // MOVING ACTIVE UNDERLINE
    // ==========================================

    useEffect(() => {
        const nav = navRef.current;
        const indicator = indicatorRef.current;

        if (!nav || !indicator) return;

        function updateIndicator() {
            if (!nav || !indicator) return;

            const mobile = window.matchMedia("(max-width: 1180px)").matches;

            const link = linksRef.current[activeId];

            if (mobile || activeId === "home" || !link) {
                indicator.style.opacity = "0";
                return;
            }

            const navBounds = nav.getBoundingClientRect();

            const linkBounds = link.getBoundingClientRect();

            const x = linkBounds.left - navBounds.left;

            indicator.style.width = `${linkBounds.width}px`;

            indicator.style.transform = `translate3d(${x}px, 0, 0)`;

            indicator.style.opacity = "1";
        }

        updateIndicator();

        const observer =
            typeof ResizeObserver !== "undefined"
                ? new ResizeObserver(updateIndicator)
                : null;

        observer?.observe(nav);

        window.addEventListener("resize", updateIndicator);

        return () => {
            observer?.disconnect();

            window.removeEventListener("resize", updateIndicator);
        };
    }, [activeId, menuOpen]);

    // ==========================================
    // MOBILE MENU
    // ==========================================

    useEffect(() => {
        if (!menuOpen) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setMenuOpen(false);
            }
        };

        const onResize = () => {
            if (window.innerWidth > 1180) {
                setMenuOpen(false);
            }
        };

        document.addEventListener("keydown", onKeyDown);

        window.addEventListener("resize", onResize);

        return () => {
            document.removeEventListener("keydown", onKeyDown);

            window.removeEventListener("resize", onResize);
        };
    }, [menuOpen]);

    function navigateTo(id: string) {
        setActiveId(id);
        setMenuOpen(false);
    }

    return (
        <header ref={headerRef} className="lp-header nb-header">
            <div className="lp-container lp-header__inner nb-header__inner">
                {/* BRAND */}
                <a
                    href="#home"
                    className={
                        "lp-brand nb-brand" +
                        (activeId === "home" ? " nb-brand--active" : "")
                    }
                    aria-label="Kembali ke beranda"
                    aria-current={activeId === "home" ? "location" : undefined}
                    onClick={() => navigateTo("home")}
                >
                    <span className="lp-brand__mark nb-brand__mark">
                        {logoUrl ? (
                            <img src={logoUrl} alt="" />
                        ) : (
                            <Layers3 size={21} aria-hidden="true" />
                        )}
                    </span>

                    <span className="lp-brand__text nb-brand__text">
                        {name}
                        <b>.</b>
                    </span>
                </a>

                {/* NAVIGATION */}
                <nav
                    ref={navRef}
                    id="portfolio-main-nav"
                    className={
                        "lp-navigation nb-nav" +
                        (menuOpen ? " lp-navigation--open" : "")
                    }
                    aria-label="Navigasi utama"
                >
                    {navigation.map((item) => {
                        const active = activeId === item.id;

                        return (
                            <a
                                key={item.id}
                                ref={(element) => {
                                    linksRef.current[item.id] = element;
                                }}
                                href={`#${item.id}`}
                                className={
                                    "nb-nav__link" +
                                    (active ? " nb-nav__link--active" : "")
                                }
                                aria-current={active ? "location" : undefined}
                                onClick={() => navigateTo(item.id)}
                            >
                                {item.label}
                            </a>
                        );
                    })}

                    <a
                        ref={(element) => {
                            linksRef.current.contact = element;
                        }}
                        href="#contact"
                        className={
                            "lp-nav-contact nb-nav__contact" +
                            (activeId === "contact"
                                ? " nb-nav__contact--active"
                                : "")
                        }
                        aria-current={
                            activeId === "contact" ? "location" : undefined
                        }
                        onClick={() => navigateTo("contact")}
                    >
                        Hubungi Saya
                        <ArrowUpRight size={15} aria-hidden="true" />
                    </a>

                    <span
                        ref={indicatorRef}
                        className="nb-nav__indicator"
                        aria-hidden="true"
                    />
                </nav>

                {/* HAMBURGER */}
                <button
                    type="button"
                    className="lp-menu-toggle nb-menu-toggle"
                    aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
                    aria-controls="portfolio-main-nav"
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((current) => !current)}
                >
                    {menuOpen ? <X size={21} /> : <Menu size={21} />}
                </button>
            </div>

            {/* ROBOT WALKING ON NAVBAR BORDER */}
            <CodingBot />

            {/* KEEP HERO ID CARD LANYARD MOUNT */}
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
