import { ArrowUpRight, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { Skill } from "./landing-types";
import "../../../css/skills-index.css";

type Props = {
    skills: Skill[];
};

export default function SkillsSection({ skills }: Props) {
    const sectionRef = useRef<HTMLElement>(null);

    const [openId, setOpenId] = useState<number | null>(skills[0]?.id ?? null);

    const totalItems = skills.reduce(
        (total, category) => total + category.items.length,
        0,
    );

    useEffect(() => {
        const section = sectionRef.current;

        if (!section) return;

        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;

        if (reducedMotion || !("IntersectionObserver" in window)) {
            return;
        }

        section.classList.add("sx-enhanced");

        const observer = new IntersectionObserver(
            (entries, currentObserver) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    entry.target.classList.add("sx-visible");
                    currentObserver.unobserve(entry.target);
                });
            },
            {
                threshold: 0.08,
                rootMargin: "0px 0px -25px 0px",
            },
        );

        section
            .querySelectorAll<HTMLElement>("[data-sx-reveal]")
            .forEach((element) => observer.observe(element));

        return () => observer.disconnect();
    }, [skills.length]);

    if (skills.length === 0) return null;

    return (
        <section
            id="skills"
            ref={sectionRef}
            className="lp-section lp-section--alternate sx-section"
            aria-labelledby="sx-heading"
        >
            <div className="lp-container">
                {/* SECTION TOPBAR */}
                <div className="sx-topbar" data-sx-reveal>
                    <div className="sx-topbar__identity">
                        <span className="sx-topbar__number">02</span>

                        <span className="sx-topbar__line" />

                        <span>KEAHLIAN & MINAT</span>
                    </div>

                    <span className="sx-topbar__meta">
                        PERSONAL CAPABILITIES
                    </span>
                </div>

                <div className="sx-layout">
                    {/* LEFT — INTRODUCTION */}
                    <header className="sx-intro" data-sx-reveal>
                        <span className="sx-intro__eyebrow">
                            WHAT I WORK WITH
                        </span>

                        <h2 id="sx-heading">
                            Keahlian
                            <span className="sx-intro__second">
                                &amp; minat
                                <span className="sx-intro__dot">.</span>
                            </span>
                        </h2>

                        <p className="sx-intro__description">
                            Teknologi yang saya gunakan dan bidang yang terus
                            saya pelajari serta kembangkan.
                        </p>

                        <div className="sx-summary">
                            <div className="sx-summary__item">
                                <strong>
                                    {String(skills.length).padStart(2, "0")}
                                </strong>

                                <span>Kategori</span>
                            </div>

                            <span
                                className="sx-summary__separator"
                                aria-hidden="true"
                            />

                            <div className="sx-summary__item">
                                <strong>
                                    {String(totalItems).padStart(2, "0")}
                                </strong>

                                <span>Keahlian</span>
                            </div>
                        </div>
                    </header>

                    {/* RIGHT — CAPABILITIES INDEX */}
                    <div className="sx-directory">
                        <div className="sx-directory__header" data-sx-reveal>
                            <span>EXPERTISE INDEX</span>

                            <span>PILIH KATEGORI</span>
                        </div>

                        <div className="sx-list">
                            {skills.map((category, index) => {
                                const isOpen = openId === category.id;

                                const number = String(index + 1).padStart(
                                    2,
                                    "0",
                                );

                                return (
                                    <article
                                        key={category.id}
                                        className={
                                            "sx-item" +
                                            (isOpen ? " sx-item--open" : "")
                                        }
                                    >
                                        <h3 className="sx-item__heading">
                                            <button
                                                type="button"
                                                id={`sx-trigger-${category.id}`}
                                                className="sx-item__trigger"
                                                aria-expanded={isOpen}
                                                aria-controls={`sx-panel-${category.id}`}
                                                onClick={() => {
                                                    setOpenId((currentId) =>
                                                        currentId ===
                                                        category.id
                                                            ? null
                                                            : category.id,
                                                    );
                                                }}
                                            >
                                                <span className="sx-item__number">
                                                    {number}
                                                </span>

                                                <span className="sx-item__name">
                                                    {category.name}
                                                </span>

                                                <span className="sx-item__count">
                                                    {String(
                                                        category.items.length,
                                                    ).padStart(2, "0")}{" "}
                                                    ITEMS
                                                </span>

                                                <span
                                                    className="sx-item__toggle"
                                                    aria-hidden="true"
                                                >
                                                    <Plus
                                                        size={17}
                                                        strokeWidth={1.7}
                                                    />
                                                </span>
                                            </button>
                                        </h3>

                                        {/* EXPANDABLE CONTENT */}
                                        <div
                                            id={`sx-panel-${category.id}`}
                                            className="sx-item__reveal"
                                            role="region"
                                            aria-labelledby={`sx-trigger-${category.id}`}
                                            aria-hidden={!isOpen}
                                        >
                                            <div className="sx-item__reveal-inner">
                                                <div className="sx-item__detail">
                                                    {category.description && (
                                                        <p className="sx-item__description">
                                                            {
                                                                category.description
                                                            }
                                                        </p>
                                                    )}

                                                    {category.items.length >
                                                    0 ? (
                                                        <ul className="sx-tags">
                                                            {category.items.map(
                                                                (item) => (
                                                                    <li
                                                                        key={
                                                                            item.id
                                                                        }
                                                                    >
                                                                        {
                                                                            item.name
                                                                        }
                                                                    </li>
                                                                ),
                                                            )}
                                                        </ul>
                                                    ) : (
                                                        <p className="sx-item__empty">
                                                            Rincian keahlian
                                                            belum ditambahkan.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        <a
                            href="#projects"
                            className="sx-footer-link"
                            data-sx-reveal
                        >
                            <span>Lihat penerapannya dalam proyek</span>

                            <ArrowUpRight
                                size={17}
                                strokeWidth={1.7}
                                aria-hidden="true"
                            />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
