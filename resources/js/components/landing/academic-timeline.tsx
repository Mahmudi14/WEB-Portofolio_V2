import { ArrowDown, BookOpen, CalendarDays, GraduationCap } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";

import "../../../css/academic-timeline.css";

export type AcademicEducation = {
    id: number;
    level: string;
    institution_name: string;
    major: string | null;
    start_year: number;
    end_year: number | null;
    is_current: boolean;
};

type Props = {
    educations: AcademicEducation[];
};

const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));

function academicPeriod(item: AcademicEducation) {
    if (item.is_current) return `${item.start_year} — Sekarang`;
    if (item.end_year !== null) {
        return `${item.start_year} — ${item.end_year}`;
    }
    return String(item.start_year);
}

/** Figur traveler orisinal dalam SVG; tidak memerlukan library animasi. */
function WalkingFigure() {
    return (
        <svg
            className="at-walker__figure"
            viewBox="0 0 52 74"
            aria-hidden="true"
            focusable="false"
        >
            <defs>
                <linearGradient id="at-jacket" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0" stopColor="#435361" />
                    <stop offset="1" stopColor="#1c2831" />
                </linearGradient>
                <linearGradient id="at-pants" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#41464c" />
                    <stop offset="1" stopColor="#20282e" />
                </linearGradient>
            </defs>

            {/* Bayangan lantai, bergerak bersama penanda. */}
            <ellipse cx="26" cy="70" rx="13" ry="2.6" fill="#060709" opacity=".35" />

            <g className="at-walker__body">
                {/* Kaki berada di belakang tubuh. */}
                <g className="at-walker__leg at-walker__leg--back">
                    <path d="M25 43 L28 56 L32 65" stroke="url(#at-pants)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M29.5 65 L36 66" stroke="#b68d60" strokeWidth="5" strokeLinecap="round" />
                </g>
                <g className="at-walker__leg at-walker__leg--front">
                    <path d="M25 43 L22 56 L18 65" stroke="url(#at-pants)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M15 66 L22 66" stroke="#d0aa78" strokeWidth="5" strokeLinecap="round" />
                </g>

                {/* Ransel beraksen copper untuk memberi karakter. */}
                <rect x="30" y="26" width="9" height="19" rx="4" fill="#594632" stroke="#c7a473" strokeWidth="1" />

                <g className="at-walker__arm at-walker__arm--back">
                    <path d="M30 29 L36 37 L34 46" stroke="#c79b75" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </g>

                {/* Jaket */}
                <path d="M18 24 Q26 20 34 25 L32 44 Q26 47 19 44 Z" fill="url(#at-jacket)" stroke="#bd9a70" strokeWidth="1" />
                <path d="M25 25 L25 44" stroke="#c4a078" strokeWidth="1.2" opacity=".75" />
                <path d="M20 30 L30 30" stroke="#e0bf8f" strokeWidth=".9" opacity=".25" />

                <g className="at-walker__arm at-walker__arm--front">
                    <path d="M20 29 L14 37 L16 46" stroke="#d2aa83" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </g>

                {/* Kepala dan rambut. */}
                <rect x="23" y="19" width="6" height="7" rx="2" fill="#c79c78" />
                <ellipse cx="26" cy="12" rx="8" ry="9.5" fill="#dbb18a" />
                <path d="M18 12 Q17 2 25 2 Q34 1 34 10 L31 8 Q27 11 20 9 Z" fill="#201a19" />
                <circle cx="28.5" cy="13" r=".8" fill="#3c2b25" />
                <path d="M28 17 Q30 18 31 16.8" stroke="#966d54" strokeWidth=".75" fill="none" strokeLinecap="round" />
            </g>
        </svg>
    );
}

/**
 * Rail mengikuti seluruh perjalanan akademik. Ketika titik lintasan melewati
 * bagian tengah viewport, figur bergerak pada jalurnya seirama dengan scroll.
 * Tidak ada state React yang diubah pada tiap frame scroll.
 */
export default function AcademicTimeline({ educations }: Props) {
    const timelineRef = useRef<HTMLDivElement>(null);
    const railRef = useRef<HTMLDivElement>(null);

    const ordered = useMemo(
        () =>
            [...educations].sort(
                (a, b) =>
                    a.start_year - b.start_year ||
                    (a.end_year ?? Number.MAX_SAFE_INTEGER) -
                        (b.end_year ?? Number.MAX_SAFE_INTEGER) ||
                    a.id - b.id,
            ),
        [educations],
    );

    useEffect(() => {
        const root = timelineRef.current;
        const rail = railRef.current;
        if (!root || !rail || ordered.length === 0) return;

        const nodes = Array.from(
            root.querySelectorAll<HTMLElement>("[data-academic-node]"),
        );
        const items = Array.from(
            root.querySelectorAll<HTMLElement>("[data-academic-item]"),
        );

        if (nodes.length === 0) return;

        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;

        let nodePositions: number[] = [];
        let start = 0;
        let span = 1;
        let lastActive = -1;
        let lastProgress = -1;
        let frame = 0;
        let resizeFrame = 0;
        let stopWalkingTimer = 0;
        let destroyed = false;

        const update = () => {
            frame = 0;
            if (destroyed || nodePositions.length === 0) return;

            const bounds = root.getBoundingClientRect();

            // Target figur berada di 50% tinggi layar. Batas aman menjaga
            // posisi tidak tertutup navbar sticky pada layar rendah.
            const navbar = document.querySelector<HTMLElement>(".lp-header");
            const navbarBottom = navbar?.getBoundingClientRect().bottom ?? 0;
            const targetViewportY = Math.max(
                window.innerHeight * 0.5,
                navbarBottom + 86,
            );

            // Koordinat target dalam timeline, tanpa mengunci page scroll.
            const targetY = targetViewportY - bounds.top;
            const progress = clamp((targetY - start) / span, 0, 1);

            // Walker dan track fill bergerak bersama, persis mengikuti scroll.
            rail.style.setProperty("--at-progress", `${(progress * 100).toFixed(3)}%`);

            // Titik milestone terakhir yang sudah dilalui walker.
            const walkerY = start + progress * span;
            let active = 0;
            nodePositions.forEach((nodeY, index) => {
                if (walkerY >= nodeY - 2) active = index;
            });

            if (active !== lastActive) {
                items.forEach((item, index) => {
                    item.classList.toggle("at-item--reached", index <= active);
                    item.classList.toggle("at-item--current", index === active);
                });
                lastActive = active;
            }

            // Animasi kaki hanya hidup ketika walker BENAR-BENAR bergerak.
            if (
                !reduceMotion &&
                lastProgress >= 0 &&
                Math.abs(progress - lastProgress) > 0.00015
            ) {
                root.classList.add("at-timeline--walking");
                window.clearTimeout(stopWalkingTimer);
                stopWalkingTimer = window.setTimeout(() => {
                    root.classList.remove("at-timeline--walking");
                }, 165);
            }

            lastProgress = progress;
        };

        const requestUpdate = () => {
            if (frame === 0) frame = window.requestAnimationFrame(update);
        };

        const measure = () => {
            if (destroyed) return;

            const rootBounds = root.getBoundingClientRect();
            nodePositions = nodes.map((node) => {
                const rect = node.getBoundingClientRect();
                return rect.top - rootBounds.top + rect.height / 2;
            });

            start = nodePositions[0] ?? 0;
            const end = nodePositions[nodePositions.length - 1] ?? start;
            span = Math.max(1, end - start);

            rail.style.top = `${start}px`;
            rail.style.height = `${span}px`;

            // Pastikan state progress terkini sesudah reflow/resizing.
            update();
        };

        const requestMeasure = () => {
            if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
            resizeFrame = window.requestAnimationFrame(() => {
                resizeFrame = 0;
                measure();
            });
        };

        measure();
        window.addEventListener("scroll", requestUpdate, { passive: true });
        window.addEventListener("resize", requestMeasure);

        const observer = new ResizeObserver(requestMeasure);
        observer.observe(root);

        // Reveal lembut saat kartu mencapai viewport; tidak memengaruhi layout.
        let revealObserver: IntersectionObserver | null = null;
        if (!reduceMotion && "IntersectionObserver" in window) {
            root.classList.add("at-timeline--enhanced");
            revealObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add("at-item--visible");
                            revealObserver?.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.08, rootMargin: "0px 0px -5% 0px" },
            );
            items.forEach((item) => revealObserver?.observe(item));
        }

        return () => {
            destroyed = true;
            window.removeEventListener("scroll", requestUpdate);
            window.removeEventListener("resize", requestMeasure);
            window.cancelAnimationFrame(frame);
            window.cancelAnimationFrame(resizeFrame);
            window.clearTimeout(stopWalkingTimer);
            observer.disconnect();
            revealObserver?.disconnect();
        };
    }, [ordered]);

    if (ordered.length === 0) return null;

    return (
        <div className="at-shell">
            <div className="at-shell__top">
                <div>
                    <span className="at-eyebrow">THE ACADEMIC JOURNEY</span>
                    <p>Setiap jenjang, satu langkah lebih maju.</p>
                </div>
                <span className="at-scroll-tip">
                    <ArrowDown size={14} aria-hidden="true" />
                    Ikuti langkahnya dengan scroll
                </span>
            </div>

            <div className="at-timeline" ref={timelineRef}>
                <div className="at-rail" ref={railRef} aria-hidden="true">
                    <span className="at-rail__base" />
                    <span className="at-rail__fill" />
                    <div className="at-walker">
                        <span className="at-walker__halo" />
                        <WalkingFigure />
                    </div>
                </div>

                <ol className="at-items">
                    {ordered.map((education, index) => (
                        <li
                            key={education.id}
                            className="at-item"
                            data-academic-item
                        >
                            <span
                                className="at-node"
                                data-academic-node
                                aria-hidden="true"
                            >
                                <span />
                            </span>

                            <article className="at-card">
                                <div className="at-card__top">
                                    <span className="at-card__level">
                                        <GraduationCap size={14} aria-hidden="true" />
                                        {education.level}
                                    </span>
                                    <span className="at-card__step">
                                        {String(index + 1).padStart(2, "0")}
                                        <span> / {String(ordered.length).padStart(2, "0")}</span>
                                    </span>
                                </div>

                                <h3>{education.institution_name}</h3>

                                {education.major && (
                                    <p className="at-card__major">
                                        <BookOpen size={13} aria-hidden="true" />
                                        {education.major}
                                    </p>
                                )}

                                <div className="at-card__bottom">
                                    <span className="at-card__period">
                                        <CalendarDays size={14} aria-hidden="true" />
                                        {academicPeriod(education)}
                                    </span>
                                    {education.is_current && (
                                        <span className="at-card__current">
                                            Sedang berlangsung
                                        </span>
                                    )}
                                </div>
                            </article>
                        </li>
                    ))}
                </ol>
            </div>

            <div className="at-shell__bottom" aria-hidden="true">
                <span />
                <span>KEEP MOVING FORWARD</span>
                <span />
            </div>
        </div>
    );
}
