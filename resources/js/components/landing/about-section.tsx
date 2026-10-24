
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useRef } from "react";

import "../../../css/about-editorial.css";

type Props = {
    description: string | null;
};

const keywords = [
    "RESEARCH",
    "ENGINEERING",
    "CREATIVE THINKING",
    "TECHNOLOGY",
    "EXPERIMENTATION",
];

const fallbackDescription =
    "Cerita tentang latar belakang, perjalanan, dan ketertarikan saya akan ditampilkan di sini.";

export default function AboutSection({ description }: Props) {
    const sectionRef = useRef<HTMLElement>(null);

    const paragraphs = (description?.trim() || fallbackDescription)
        .split(/\n\s*\n/)
        .map((item) => item.trim())
        .filter(Boolean);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;

        let observer: IntersectionObserver | null = null;

        // Reveal once when content enters viewport.
        if (!reduceMotion && "IntersectionObserver" in window) {
            section.classList.add("ae-motion");

            observer = new IntersectionObserver(
                (entries, currentObserver) => {
                    entries.forEach((entry) => {
                        if (!entry.isIntersecting) return;

                        entry.target.classList.add("ae-visible");
                        currentObserver.unobserve(entry.target);
                    });
                },
                {
                    threshold: 0.08,
                    rootMargin: "0px 0px -35px 0px",
                },
            );

            section
                .querySelectorAll<HTMLElement>("[data-ae-reveal]")
                .forEach((element) => observer?.observe(element));
        }

        let frame = 0;

        // Measure scroll progress without changing React state.
        const update = () => {
            frame = 0;

            if (reduceMotion) {
                section.style.setProperty("--ae-progress", "1");
                return;
            }

            const rect = section.getBoundingClientRect();
            const viewport = window.innerHeight;

            const start = viewport * 0.85;
            const end = viewport * 0.15 - rect.height;

            const progress = Math.max(
                0,
                Math.min(
                    1,
                    (start - rect.top) / Math.max(1, start - end),
                ),
            );

            section.style.setProperty(
                "--ae-progress",
                progress.toFixed(4),
            );
        };

        const requestUpdate = () => {
            if (frame !== 0) return;
            frame = window.requestAnimationFrame(update);
        };

        update();

        if (!reduceMotion) {
            window.addEventListener("scroll", requestUpdate, {
                passive: true,
            });
            window.addEventListener("resize", requestUpdate);
        }

        return () => {
            observer?.disconnect();

            window.removeEventListener("scroll", requestUpdate);
            window.removeEventListener("resize", requestUpdate);

            if (frame !== 0) {
                window.cancelAnimationFrame(frame);
            }
        };
    }, []);

    return (
        <section
            id="about"
            ref={sectionRef}
            className="lp-section ae-section"
            aria-labelledby="ae-heading"
        >
            <div className="lp-container">
                {/* Section identity */}
                <div className="ae-topline" data-ae-reveal>
                    <div className="ae-topline__label">
                        <span className="ae-topline__number">01</span>
                        <span className="ae-topline__rule" />
                        <span>TENTANG SAYA</span>
                    </div>

                    <span className="ae-topline__aside">
                        PERSONAL / PROFILE
                    </span>
                </div>

                <div className="ae-grid">
                    {/* Left editorial heading */}
                    <div className="ae-intro" data-ae-reveal>
                        <span className="ae-intro__overline">
                            THE PERSON BEHIND THE WORK
                        </span>

                        <h2 id="ae-heading" className="ae-intro__title">
                            Lebih dekat
                            <span>
                                dengan saya
                                <span className="ae-dot">.</span>
                            </span>
                        </h2>

                        <p className="ae-intro__description">
                            Sebuah ruang untuk mengenal cerita,
                            ketertarikan, dan proses di balik
                            karya yang saya bangun.
                        </p>

                        <div className="ae-intro__signature">
                            <span className="ae-intro__signature-line" />
                            <span>BEYOND THE WORK</span>
                        </div>
                    </div>

                    {/* Right biography */}
                    <article className="ae-profile" data-ae-reveal>
                        <span
                            className="ae-profile__traveler"
                            aria-hidden="true"
                        />

                        <div className="ae-profile__head">
                            <div className="ae-profile__identity">
                                <span className="ae-profile__indicator" />
                                <span>PERSONAL NOTES</span>
                            </div>
                            <span className="ae-profile__folio">
                                FILE / 001
                            </span>
                        </div>

                        <div className="ae-profile__body">
                            {paragraphs.map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>

                        <div className="ae-profile__bottom">
                            <span>THE JOURNEY CONTINUES</span>

                            <a
                                className="ae-profile__link"
                                href="#experience"
                            >
                                Lihat perjalanan saya
                                <ArrowUpRight size={17} />
                            </a>
                        </div>
                    </article>
                </div>

                {/* Continuous kinetic typography */}
                <div
                    className="ae-marquee"
                    aria-hidden="true"
                    data-ae-reveal
                >
                    <div className="ae-marquee__topline">
                        <span>AREAS OF EXPLORATION</span>
                        <span>IN CONTINUOUS MOTION —</span>
                    </div>

                    <div className="ae-marquee__viewport">
                        <div className="ae-marquee__track">
                            {[0, 1].map((copy) => (
                                <div
                                    key={copy}
                                    className="ae-marquee__group"
                                >
                                    {keywords.map((keyword) => (
                                        <span
                                            className="ae-marquee__item"
                                            key={`${copy}-${keyword}`}
                                        >
                                            <span className="ae-marquee__square" />
                                            {keyword}
                                        </span>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* End of section navigation */}
                <div className="ae-bottom" data-ae-reveal>
                    <div className="ae-bottom__label">
                        <span className="ae-bottom__indicator" />
                        EKSPLORASI LEBIH LANJUT
                    </div>

                    <nav
                        className="ae-bottom__links"
                        aria-label="Jelajahi bagian portofolio"
                    >
                        {[
                            { label: "Keahlian", href: "#skills" },
                            { label: "Pengalaman", href: "#experience" },
                            { label: "Penelitian", href: "#research" },
                        ].map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="ae-bottom__link"
                            >
                                {link.label}
                                <ArrowRight size={15} />
                            </a>
                        ))}
                    </nav>
                </div>
            </div>
        </section>
    );
}
