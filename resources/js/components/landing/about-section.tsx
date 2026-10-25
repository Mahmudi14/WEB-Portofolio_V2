
import {
    ArrowUpRight,
    CheckCheck,
    Code2,
    Search,
} from "lucide-react";

import { useEffect, useRef } from "react";

import "../../../css/about-thinking.css";

type AboutSectionProps = {
    description: string | null;
};

const fallbackDescription =
    "Cerita dan latar belakang saya akan ditampilkan setelah ditambahkan melalui dashboard admin.";

const FLOW_PATH =
    "M 62 188 C 136 188 137 77 225 77 C 314 77 318 188 398 188";

const flowPoints = [
    { x: 62, y: 188 },
    { x: 225, y: 77 },
    { x: 398, y: 188 },
];

const steps = [
    {
        number: "01",
        title: "Explore",
        description: "Memahami masalah",
        icon: Search,
    },
    {
        number: "02",
        title: "Build",
        description: "Membangun solusi",
        icon: Code2,
    },
    {
        number: "03",
        title: "Improve",
        description: "Belajar dari hasil",
        icon: CheckCheck,
    },
];

const clamp = (value: number) =>
    Math.min(1, Math.max(0, value));

export default function AboutSection({
    description,
}: AboutSectionProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const diagramRef = useRef<HTMLDivElement>(null);
    const pathRef = useRef<SVGPathElement>(null);
    const progressPathRef = useRef<SVGPathElement>(null);
    const markerRef = useRef<SVGCircleElement>(null);

    // Deskripsi tetap berasal dari database Laravel.
    const paragraphs = (description?.trim() || fallbackDescription)
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);

    useEffect(() => {
        const section = sectionRef.current;
        const diagram = diagramRef.current;
        const path = pathRef.current;
        const progressPath = progressPathRef.current;
        const marker = markerRef.current;

        if (
            !section ||
            !diagram ||
            !path ||
            !progressPath ||
            !marker
        ) {
            return;
        }

        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;

        const pointElements = Array.from(
            section.querySelectorAll<SVGGElement>(
                "[data-tp-point]",
            ),
        );

        const stepElements = Array.from(
            section.querySelectorAll<HTMLElement>(
                "[data-tp-step]",
            ),
        );

        const pathLength = path.getTotalLength();

        progressPath.style.strokeDasharray =
            `${pathLength} ${pathLength}`;

        let animationFrame = 0;
        let lastActive = -1;

        // ======================================
        // UPDATE ACTIVE STEP
        // ======================================

        const updateActiveStep = (progress: number) => {
            const activeIndex =
                progress < 0.42
                    ? 0
                    : progress < 0.82
                      ? 1
                      : 2;

            if (activeIndex === lastActive) return;

            pointElements.forEach((point, index) => {
                point.classList.toggle(
                    "tp-point--reached",
                    index <= activeIndex,
                );

                point.classList.toggle(
                    "tp-point--active",
                    index === activeIndex,
                );
            });

            stepElements.forEach((step, index) => {
                step.classList.toggle(
                    "tp-step--reached",
                    index <= activeIndex,
                );

                step.classList.toggle(
                    "tp-step--active",
                    index === activeIndex,
                );
            });

            lastActive = activeIndex;
        };

        // ======================================
        // MOVE DOT ALONG SVG PATH
        // ======================================

        const renderProgress = (progress: number) => {
            const currentLength = pathLength * progress;

            progressPath.style.strokeDashoffset = String(
                pathLength - currentLength,
            );

            const point = path.getPointAtLength(currentLength);

            marker.setAttribute("cx", point.x.toFixed(2));
            marker.setAttribute("cy", point.y.toFixed(2));

            section.style.setProperty(
                "--tp-progress",
                progress.toFixed(4),
            );

            updateActiveStep(progress);
        };

        // ======================================
        // FOLLOW PAGE SCROLL
        // ======================================

        const update = () => {
            animationFrame = 0;

            if (reduceMotion) {
                renderProgress(1);
                return;
            }

            const rect = diagram.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            const start = viewportHeight * 0.82;

            const end =
                viewportHeight * 0.24 - rect.height;

            const distance = Math.max(1, start - end);

            const progress = clamp(
                (start - rect.top) / distance,
            );

            renderProgress(progress);
        };

        const requestUpdate = () => {
            if (animationFrame !== 0) return;

            animationFrame =
                window.requestAnimationFrame(update);
        };

        update();

        if (!reduceMotion) {
            window.addEventListener(
                "scroll",
                requestUpdate,
                { passive: true },
            );

            window.addEventListener(
                "resize",
                requestUpdate,
            );
        }

        // ======================================
        // ENTRANCE REVEAL
        // ======================================

        let revealObserver: IntersectionObserver | null = null;

        if (
            !reduceMotion &&
            "IntersectionObserver" in window
        ) {
            section.classList.add("tp-motion");

            revealObserver = new IntersectionObserver(
                (entries, observer) => {
                    entries.forEach((entry) => {
                        if (!entry.isIntersecting) return;

                        entry.target.classList.add(
                            "tp-visible",
                        );

                        observer.unobserve(entry.target);
                    });
                },
                {
                    threshold: 0.08,
                    rootMargin: "0px 0px -25px 0px",
                },
            );

            section
                .querySelectorAll<HTMLElement>(
                    "[data-tp-reveal]",
                )
                .forEach((element) => {
                    revealObserver?.observe(element);
                });
        }

        return () => {
            window.removeEventListener(
                "scroll",
                requestUpdate,
            );

            window.removeEventListener(
                "resize",
                requestUpdate,
            );

            if (animationFrame !== 0) {
                window.cancelAnimationFrame(
                    animationFrame,
                );
            }

            revealObserver?.disconnect();
        };
    }, []);

    return (
        <section
            id="about"
            ref={sectionRef}
            className="lp-section tp-section"
            aria-labelledby="tp-heading"
        >
            <div className="lp-container">
                {/* SECTION INDEX */}
                <div className="tp-topbar" data-tp-reveal>
                    <div className="tp-topbar__identity">
                        <span className="tp-topbar__index">
                            01
                        </span>

                        <span className="tp-topbar__rule" />

                        <span>TENTANG SAYA</span>
                    </div>

                    <span className="tp-topbar__meta">
                        BEHIND THE WORK / PROFILE
                    </span>
                </div>

                {/* MAIN HEADING */}
                <header className="tp-heading" data-tp-reveal>
                    <span className="tp-heading__eyebrow">
                        THE THINKING PROCESS
                    </span>

                    <h2 id="tp-heading">
                        Berawal dari
                        <span className="tp-heading__accent">
                            rasa ingin tahu
                            <span className="tp-heading__dot">
                                .
                            </span>
                        </span>
                    </h2>

                    <p>
                        Mengenal perjalanan, pemikiran, dan proses
                        yang membentuk setiap karya saya.
                    </p>
                </header>

                {/* BIOGRAPHY + PROCESS */}
                <div className="tp-grid">
                    {/* LEFT — DATABASE CONTENT */}
                    <div
                        className="tp-biography"
                        data-tp-reveal
                    >
                        <div className="tp-biography__heading">
                            <span className="tp-biography__number">
                                / 01
                            </span>

                            <span>CERITA DI BALIK KARYA</span>
                        </div>

                        <div className="tp-biography__content">
                            {paragraphs.map((paragraph, index) => (
                                <p key={index}>
                                    {paragraph}
                                </p>
                            ))}
                        </div>

                        <a
                            href="#experience"
                            className="tp-biography__link"
                        >
                            <span>
                                Lihat perjalanan saya
                            </span>

                            <ArrowUpRight
                                size={18}
                                strokeWidth={1.8}
                                aria-hidden="true"
                            />
                        </a>
                    </div>

                    {/* RIGHT — INTERACTIVE THINKING PROCESS */}
                    <div
                        className="tp-process"
                        data-tp-reveal
                    >
                        <div className="tp-process__header">
                            <div>
                                <span className="tp-process__eyebrow">
                                    MY THINKING PROCESS
                                </span>

                                <h3>
                                    Explore. Build. Improve.
                                </h3>
                            </div>

                            <span className="tp-process__serial">
                                01—03
                            </span>
                        </div>

                        <div
                            ref={diagramRef}
                            className="tp-process__diagram"
                            aria-hidden="true"
                        >
                            <svg
                                className="tp-process__svg"
                                viewBox="0 0 460 255"
                                preserveAspectRatio="xMidYMid meet"
                                focusable="false"
                            >
                                {/* STATIC TRACK */}
                                <path
                                    ref={pathRef}
                                    d={FLOW_PATH}
                                    className="tp-process__track"
                                />

                                {/* SCROLL-DRIVEN ORANGE TRACK */}
                                <path
                                    ref={progressPathRef}
                                    d={FLOW_PATH}
                                    className="tp-process__progress"
                                />

                                {/* THREE MILESTONES */}
                                {flowPoints.map((point, index) => (
                                    <g
                                        key={index}
                                        data-tp-point
                                        className={
                                            "tp-point" +
                                            (index === 0
                                                ? " tp-point--active tp-point--reached"
                                                : "")
                                        }
                                    >
                                        <circle
                                            cx={point.x}
                                            cy={point.y}
                                            r="25"
                                            className="tp-point__outer"
                                        />

                                        <circle
                                            cx={point.x}
                                            cy={point.y}
                                            r="20"
                                            className="tp-point__inner"
                                        />

                                        <text
                                            x={point.x}
                                            y={point.y + 4}
                                            className="tp-point__number"
                                            textAnchor="middle"
                                        >
                                            {String(index + 1).padStart(2, "0")}
                                        </text>
                                    </g>
                                ))}

                                {/* MOVING DOT */}
                                <circle
                                    ref={markerRef}
                                    className="tp-process__marker"
                                    cx="62"
                                    cy="188"
                                    r="6"
                                />
                            </svg>
                        </div>

                        <div className="tp-process__footer">
                            <span className="tp-process__status">
                                <span className="tp-process__status-dot" />
                                A JOURNEY OF CONTINUOUS LEARNING
                            </span>

                            <span className="tp-process__hint">
                                SCROLL TO EXPLORE
                            </span>
                        </div>
                    </div>
                </div>

                {/* THREE-STEP INDEX */}
                <div className="tp-steps" data-tp-reveal>
                    {steps.map((step, index) => {
                        const Icon = step.icon;

                        return (
                            <div
                                key={step.number}
                                data-tp-step
                                className={
                                    "tp-step" +
                                    (index === 0
                                        ? " tp-step--active tp-step--reached"
                                        : "")
                                }
                            >
                                <div className="tp-step__header">
                                    <span>{step.number}</span>

                                    <Icon
                                        size={18}
                                        strokeWidth={1.6}
                                        aria-hidden="true"
                                    />
                                </div>

                                <strong>{step.title}</strong>

                                <p>{step.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
