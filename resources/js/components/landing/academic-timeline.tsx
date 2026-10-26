import { ArrowDown, BookOpen, GraduationCap, School } from "lucide-react";

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

const clamp = (value: number, min = 0, max = 1) =>
    Math.max(min, Math.min(max, value));

function academicPeriod(item: AcademicEducation) {
    if (item.is_current) {
        return `${item.start_year} — Sekarang`;
    }

    if (item.end_year !== null) {
        return `${item.start_year} — ${item.end_year}`;
    }

    return String(item.start_year);
}

function EducationIcon({ level }: { level: string }) {
    const value = level.toLowerCase();

    if (
        /universitas|kuliah|sarjana|diploma|magister|doktor|s1|s2|s3|d3|d4/.test(
            value,
        )
    ) {
        return <GraduationCap size={19} strokeWidth={1.7} aria-hidden="true" />;
    }

    if (/sd|sekolah dasar|smp|sma|smk|sekolah/.test(value)) {
        return <School size={18} strokeWidth={1.7} aria-hidden="true" />;
    }

    return <BookOpen size={18} strokeWidth={1.7} aria-hidden="true" />;
}

/**
 * Karakter explorer orisinal.
 * CSS menggerakkan kaki, tangan, dan badan
 * hanya ketika progres scroll berubah.
 */
function WalkingExplorer() {
    return (
        <svg
            className="at-walker__figure"
            viewBox="0 0 60 82"
            aria-hidden="true"
            focusable="false"
        >
            <defs>
                <linearGradient
                    id="at-explorer-jacket"
                    x1="0"
                    x2="1"
                    y1="0"
                    y2="1"
                >
                    <stop offset="0" stopColor="#FF984E" />
                    <stop offset=".55" stopColor="#FF6A00" />
                    <stop offset="1" stopColor="#B94300" />
                </linearGradient>
            </defs>

            <ellipse
                cx="30"
                cy="77"
                rx="14"
                ry="2.5"
                fill="#000"
                opacity=".25"
            />

            <g className="at-walker__body">
                {/* Kaki belakang */}
                <g className="at-walker__leg at-walker__leg--back">
                    <path
                        d="M31 48 L35 61 L39 71"
                        fill="none"
                        stroke="#333C48"
                        strokeWidth="7"
                        strokeLinecap="round"
                    />
                    <path
                        d="M37 72 L44 73"
                        fill="none"
                        stroke="#E8E9EA"
                        strokeWidth="5"
                        strokeLinecap="round"
                    />
                </g>

                {/* Kaki depan */}
                <g className="at-walker__leg at-walker__leg--front">
                    <path
                        d="M29 48 L24 61 L20 71"
                        fill="none"
                        stroke="#424D5B"
                        strokeWidth="7"
                        strokeLinecap="round"
                    />
                    <path
                        d="M17 73 L25 73"
                        fill="none"
                        stroke="#F4F4F2"
                        strokeWidth="5"
                        strokeLinecap="round"
                    />
                </g>

                {/* Ransel */}
                <rect
                    x="36"
                    y="29"
                    width="11"
                    height="20"
                    rx="5"
                    fill="#292D33"
                    stroke="#FF8736"
                    strokeWidth="1.4"
                />

                {/* Tangan belakang */}
                <g className="at-walker__arm at-walker__arm--back">
                    <path
                        d="M37 32 L43 42 L40 49"
                        fill="none"
                        stroke="#C88E67"
                        strokeWidth="5"
                        strokeLinecap="round"
                    />
                </g>

                {/* Jaket explorer */}
                <path
                    d="M21 28 Q30 24 39 29 L37 49 Q30 53 22 49 Z"
                    fill="url(#at-explorer-jacket)"
                    stroke="#A94407"
                    strokeWidth="1"
                />

                <path
                    d="M30 29 L30 50"
                    stroke="#FFD2AC"
                    strokeWidth="1.2"
                    opacity=".8"
                />

                <path
                    d="M24 39 L36 39"
                    stroke="#7D3008"
                    strokeWidth="1"
                    opacity=".55"
                />

                {/* Tangan depan */}
                <g className="at-walker__arm at-walker__arm--front">
                    <path
                        d="M22 32 L16 41 L19 49"
                        fill="none"
                        stroke="#D7A079"
                        strokeWidth="5"
                        strokeLinecap="round"
                    />
                </g>

                {/* Leher */}
                <rect
                    x="27"
                    y="23"
                    width="6"
                    height="7"
                    rx="2"
                    fill="#C99169"
                />

                {/* Kepala */}
                <ellipse cx="30" cy="17" rx="10" ry="11" fill="#D5A17A" />

                {/* Rambut */}
                <path
                    d="M20 16 Q18 5 28 4 Q42 2 41 16
                       L38 12 Q33 13 29 10
                       Q25 15 21 13 Z"
                    fill="#17191D"
                />

                {/* Wajah */}
                <circle cx="34" cy="18" r="1" fill="#382B27" />

                <path
                    d="M32 23 Q35 24 37 22"
                    stroke="#925F4B"
                    strokeWidth="1"
                    fill="none"
                    strokeLinecap="round"
                />

                {/* Detail kerah */}
                <path
                    d="M26 28 L30 34 L34 28"
                    fill="none"
                    stroke="#FFE0C4"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                />
            </g>
        </svg>
    );
}

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

        let positions: number[] = [];
        let start = 0;
        let distance = 1;

        let frame = 0;
        let measureFrame = 0;
        let walkingTimeout = 0;

        let previousProgress = -1;
        let previousActive = -1;
        let destroyed = false;

        // ==================================
        // UPDATE TIMELINE POSITION
        // ==================================

        const update = () => {
            frame = 0;

            if (destroyed || positions.length === 0) {
                return;
            }

            if (reduceMotion) {
                rail.style.setProperty("--at-progress", "100%");

                items.forEach((item) => {
                    item.classList.add("at-item--reached", "at-item--current");
                });

                return;
            }

            const rect = root.getBoundingClientRect();

            const header = document.querySelector<HTMLElement>(".lp-header");

            const headerBottom = header?.getBoundingClientRect().bottom ?? 0;

            const viewportTarget = Math.max(
                window.innerHeight * 0.52,
                headerBottom + 75,
            );

            const walkerPosition = viewportTarget - rect.top;

            const progress = clamp((walkerPosition - start) / distance);

            rail.style.setProperty(
                "--at-progress",
                `${(progress * 100).toFixed(3)}%`,
            );

            // Active milestone mengikuti lokasi walker.
            const cursorY = start + progress * distance;

            let activeIndex = 0;

            positions.forEach((position, index) => {
                if (cursorY >= position - 2) {
                    activeIndex = index;
                }
            });

            if (activeIndex !== previousActive) {
                items.forEach((item, index) => {
                    item.classList.toggle(
                        "at-item--reached",
                        index <= activeIndex,
                    );

                    item.classList.toggle(
                        "at-item--current",
                        index === activeIndex,
                    );
                });

                previousActive = activeIndex;
            }

            // Animasi langkah hanya aktif
            // ketika posisi benar-benar berubah.
            if (
                previousProgress >= 0 &&
                Math.abs(progress - previousProgress) > 0.00015
            ) {
                root.classList.add("at-timeline--walking");

                window.clearTimeout(walkingTimeout);

                walkingTimeout = window.setTimeout(() => {
                    root.classList.remove("at-timeline--walking");
                }, 160);
            }

            previousProgress = progress;
        };

        const requestUpdate = () => {
            if (frame !== 0) return;

            frame = window.requestAnimationFrame(update);
        };

        // ==================================
        // MEASURE NODES
        // ==================================

        const measure = () => {
            if (destroyed) return;

            const rootBounds = root.getBoundingClientRect();

            positions = nodes.map((node) => {
                const bounds = node.getBoundingClientRect();

                return bounds.top - rootBounds.top + bounds.height / 2;
            });

            start = positions[0] ?? 0;

            const end = positions[positions.length - 1] ?? start;

            distance = Math.max(1, end - start);

            rail.style.top = `${start}px`;
            rail.style.height = `${distance}px`;

            update();
        };

        const requestMeasure = () => {
            if (measureFrame !== 0) {
                window.cancelAnimationFrame(measureFrame);
            }

            measureFrame = window.requestAnimationFrame(() => {
                measureFrame = 0;
                measure();
            });
        };

        measure();

        window.addEventListener("scroll", requestUpdate, { passive: true });

        window.addEventListener("resize", requestMeasure);

        const resizeObserver =
            typeof ResizeObserver !== "undefined"
                ? new ResizeObserver(requestMeasure)
                : null;

        resizeObserver?.observe(root);

        // ==================================
        // SUBTLE ENTRANCE REVEAL
        // ==================================

        let revealObserver: IntersectionObserver | null = null;

        if (!reduceMotion && "IntersectionObserver" in window) {
            root.classList.add("at-timeline--enhanced");

            revealObserver = new IntersectionObserver(
                (entries, observer) => {
                    entries.forEach((entry) => {
                        if (!entry.isIntersecting) {
                            return;
                        }

                        entry.target.classList.add("at-item--visible");

                        observer.unobserve(entry.target);
                    });
                },
                {
                    threshold: 0.05,
                    rootMargin: "0px 0px -20px 0px",
                },
            );

            items.forEach((item) => {
                revealObserver?.observe(item);
            });
        }

        return () => {
            destroyed = true;

            window.removeEventListener("scroll", requestUpdate);

            window.removeEventListener("resize", requestMeasure);

            if (frame !== 0) {
                window.cancelAnimationFrame(frame);
            }

            if (measureFrame !== 0) {
                window.cancelAnimationFrame(measureFrame);
            }

            window.clearTimeout(walkingTimeout);

            resizeObserver?.disconnect();
            revealObserver?.disconnect();
        };
    }, [ordered]);

    if (ordered.length === 0) return null;

    return (
        <div className="at-shell">
            {/* TIMELINE HEADER */}
            <div className="at-shell__top">
                <div className="at-shell__top-left">
                    <span className="at-shell__eyebrow">
                        CHRONOLOGICAL RECORD
                    </span>

                    <strong>ACADEMIC TIMELINE</strong>
                </div>

                <span className="at-shell__scroll-hint">
                    <ArrowDown size={14} strokeWidth={1.7} aria-hidden="true" />
                    Ikuti perjalanan
                </span>
            </div>

            {/* CENTRAL TIMELINE */}
            <div ref={timelineRef} className="at-timeline">
                {/* MOVING RAIL & WALKER */}
                <div ref={railRef} className="at-rail" aria-hidden="true">
                    <span className="at-rail__base" />
                    <span className="at-rail__fill" />

                    <div className="at-walker">
                        <span className="at-walker__halo" />
                        <WalkingExplorer />
                    </div>
                </div>

                <ol className="at-items">
                    {ordered.map((education, index) => {
                        const alignment = index % 2 === 0 ? "left" : "right";

                        return (
                            <li
                                key={education.id}
                                data-academic-item
                                className={`at-item at-item--${alignment}`}
                            >
                                {/* EDUCATION CONTENT */}
                                <article className="at-entry">
                                    <div className="at-entry__meta">
                                        <span className="at-entry__step">
                                            {String(index + 1).padStart(2, "0")}
                                            {" / "}
                                            {String(ordered.length).padStart(
                                                2,
                                                "0",
                                            )}
                                        </span>

                                        {education.is_current && (
                                            <span className="at-entry__current">
                                                BERLANGSUNG
                                            </span>
                                        )}
                                    </div>

                                    <div className="at-entry__year">
                                        {education.start_year}
                                    </div>

                                    <span className="at-entry__period">
                                        {academicPeriod(education)}
                                    </span>

                                    <h3>{education.institution_name}</h3>

                                    <p className="at-entry__level">
                                        {education.level}
                                    </p>

                                    {education.major && (
                                        <p className="at-entry__major">
                                            {education.major}
                                        </p>
                                    )}
                                </article>

                                {/* CENTER MILESTONE */}
                                <span
                                    className="at-node"
                                    data-academic-node
                                    aria-hidden="true"
                                >
                                    <span className="at-node__icon">
                                        <EducationIcon
                                            level={education.level}
                                        />
                                    </span>
                                </span>
                            </li>
                        );
                    })}
                </ol>
            </div>

            {/* TIMELINE END */}
            <div className="at-shell__bottom">
                <span className="at-shell__bottom-rule" />

                <span>KEEP MOVING FORWARD</span>

                <span className="at-shell__bottom-rule" />
            </div>
        </div>
    );
}
