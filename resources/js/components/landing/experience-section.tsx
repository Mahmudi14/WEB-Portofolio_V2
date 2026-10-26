import { BriefcaseBusiness, ChevronDown, UsersRound } from "lucide-react";

import { useEffect, useRef, useState } from "react";

import { period } from "./landing-helpers";
import type { Experience } from "./landing-types";

import "../../../css/experience-ledger.css";

type Props = {
    experiences: Experience[];
};

type Category = "pekerjaan" | "organisasi";

const categories = [
    {
        id: "pekerjaan",
        label: "Pekerjaan",
        icon: BriefcaseBusiness,
    },
    {
        id: "organisasi",
        label: "Organisasi",
        icon: UsersRound,
    },
] as const;

function isWork(item: Experience) {
    return item.category.trim().toLowerCase() === "pekerjaan";
}

function sortExperiences(items: Experience[]) {
    return [...items].sort(
        (a, b) =>
            Number(b.is_current) - Number(a.is_current) ||
            b.start_year - a.start_year ||
            (b.end_year ?? 0) - (a.end_year ?? 0) ||
            b.id - a.id,
    );
}

function clamp(value: number) {
    return Math.max(0, Math.min(1, value));
}

export default function ExperienceSection({ experiences }: Props) {
    const sectionRef = useRef<HTMLElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const [activeCategory, setActiveCategory] = useState<Category>(() =>
        experiences.some(isWork) ? "pekerjaan" : "organisasi",
    );

    const [expandedId, setExpandedId] = useState<number | null>(null);

    const pekerjaan = experiences.filter(isWork);
    const organisasi = experiences.filter((item) => !isWork(item));

    const activeItems = sortExperiences(
        activeCategory === "pekerjaan" ? pekerjaan : organisasi,
    );

    function changeCategory(category: Category) {
        if (category === activeCategory) return;

        setActiveCategory(category);
        setExpandedId(null);
    }

    // ========================================
    // HEADER REVEAL — RUN ONCE
    // ========================================

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;

        if (reducedMotion || !("IntersectionObserver" in window)) {
            return;
        }

        section.classList.add("ex-motion");

        const observer = new IntersectionObserver(
            (entries, currentObserver) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    entry.target.classList.add("ex-visible");
                    currentObserver.unobserve(entry.target);
                });
            },
            {
                threshold: 0.08,
                rootMargin: "0px 0px -30px 0px",
            },
        );

        section
            .querySelectorAll<HTMLElement>("[data-ex-reveal]")
            .forEach((element) => {
                observer.observe(element);
            });

        return () => observer.disconnect();
    }, []);

    // ========================================
    // SCROLL-DRIVEN TIMELINE PROGRESS
    // ========================================

    useEffect(() => {
        const list = listRef.current;
        if (!list) return;

        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;

        if (reducedMotion) {
            list.style.setProperty("--ex-progress", "1");
            return;
        }

        let frame = 0;

        const update = () => {
            frame = 0;

            const rect = list.getBoundingClientRect();

            const viewportTarget = window.innerHeight * 0.58;

            const progress = clamp(
                (viewportTarget - rect.top) / Math.max(1, rect.height),
            );

            list.style.setProperty("--ex-progress", progress.toFixed(4));
        };

        const requestUpdate = () => {
            if (frame !== 0) return;

            frame = window.requestAnimationFrame(update);
        };

        update();

        window.addEventListener("scroll", requestUpdate, { passive: true });

        window.addEventListener("resize", requestUpdate);

        const resizeObserver =
            typeof ResizeObserver !== "undefined"
                ? new ResizeObserver(requestUpdate)
                : null;

        resizeObserver?.observe(list);

        return () => {
            window.removeEventListener("scroll", requestUpdate);

            window.removeEventListener("resize", requestUpdate);

            resizeObserver?.disconnect();

            if (frame !== 0) {
                window.cancelAnimationFrame(frame);
            }
        };
    }, [activeCategory, expandedId, experiences.length]);

    if (experiences.length === 0) return null;

    return (
        <section
            id="experience"
            ref={sectionRef}
            className="lp-section ex-section"
            aria-labelledby="ex-heading"
        >
            <div className="lp-container">
                {/* SECTION IDENTITY */}
                <div className="ex-topbar" data-ex-reveal>
                    <div className="ex-topbar__identity">
                        <span className="ex-topbar__number">03</span>

                        <span className="ex-topbar__rule" />

                        <span>PERJALANAN</span>
                    </div>

                    <span className="ex-topbar__meta">
                        CAREER & CONTRIBUTION
                    </span>
                </div>

                {/* HEADING */}
                <div className="ex-heading" data-ex-reveal>
                    <div className="ex-heading__text">
                        <span className="ex-heading__eyebrow">
                            THE EXPERIENCE JOURNAL
                        </span>

                        <h2 id="ex-heading">
                            Pengalaman
                            <span> saya.</span>
                        </h2>

                        <p>
                            Perjalanan profesional, organisasi, dan kontribusi
                            yang membentuk pengalaman saya.
                        </p>
                    </div>

                    <div className="ex-heading__stat">
                        <strong>
                            {String(experiences.length).padStart(2, "0")}
                        </strong>

                        <span>TOTAL PENGALAMAN</span>
                    </div>
                </div>

                {/* CATEGORY FILTER */}
                <div className="ex-controls" data-ex-reveal>
                    <div
                        className="ex-tabs"
                        role="group"
                        aria-label="Filter kategori pengalaman"
                    >
                        {categories.map((category) => {
                            const selected = activeCategory === category.id;

                            const Icon = category.icon;

                            const count =
                                category.id === "pekerjaan"
                                    ? pekerjaan.length
                                    : organisasi.length;

                            return (
                                <button
                                    key={category.id}
                                    type="button"
                                    className={
                                        "ex-tab" +
                                        (selected ? " ex-tab--active" : "")
                                    }
                                    aria-pressed={selected}
                                    onClick={() => changeCategory(category.id)}
                                >
                                    <Icon
                                        size={16}
                                        strokeWidth={1.8}
                                        aria-hidden="true"
                                    />

                                    <span>{category.label}</span>

                                    <span className="ex-tab__count">
                                        {String(count).padStart(2, "0")}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <span className="ex-controls__hint">KLIK UNTUK DETAIL</span>
                </div>

                {/* EXPERIENCE TIMELINE */}
                <div
                    ref={listRef}
                    className="ex-list"
                    aria-label={`Daftar pengalaman ${activeCategory}`}
                >
                    {activeItems.length === 0 ? (
                        <div className="ex-empty">
                            <p>
                                Belum ada pengalaman {activeCategory} yang
                                ditambahkan.
                            </p>
                        </div>
                    ) : (
                        activeItems.map((item, index) => {
                            const isOpen = expandedId === item.id;

                            const detailId = `ex-detail-${item.id}`;

                            const Icon =
                                activeCategory === "pekerjaan"
                                    ? BriefcaseBusiness
                                    : UsersRound;

                            return (
                                <article
                                    key={item.id}
                                    className={
                                        "ex-entry" +
                                        (isOpen ? " ex-entry--open" : "")
                                    }
                                >
                                    {/* YEAR RAIL */}
                                    <div className="ex-entry__rail">
                                        <span className="ex-entry__period">
                                            {period(
                                                item.start_year,
                                                item.end_year,
                                                item.is_current,
                                            )}
                                        </span>
                                    </div>

                                    {/* ROLE & DETAILS */}
                                    <div className="ex-entry__main">
                                        <button
                                            type="button"
                                            className="ex-entry__trigger"
                                            aria-expanded={isOpen}
                                            aria-controls={detailId}
                                            onClick={() =>
                                                setExpandedId((current) =>
                                                    current === item.id
                                                        ? null
                                                        : item.id,
                                                )
                                            }
                                        >
                                            <span className="ex-entry__logo">
                                                <Icon
                                                    size={20}
                                                    strokeWidth={1.6}
                                                    aria-hidden="true"
                                                />

                                                {item.logo_url && (
                                                    <img
                                                        src={item.logo_url}
                                                        alt=""
                                                        loading="lazy"
                                                        onError={(event) => {
                                                            event.currentTarget.style.display =
                                                                "none";
                                                        }}
                                                    />
                                                )}
                                            </span>

                                            <span className="ex-entry__info">
                                                <span className="ex-entry__role">
                                                    {item.position}
                                                </span>

                                                <span className="ex-entry__institution">
                                                    {item.institution_name}
                                                </span>

                                                {item.is_current && (
                                                    <span className="ex-entry__current">
                                                        <span aria-hidden="true" />
                                                        Sedang berlangsung
                                                    </span>
                                                )}
                                            </span>

                                            <span className="ex-entry__toggle">
                                                <ChevronDown
                                                    size={19}
                                                    strokeWidth={1.7}
                                                    aria-hidden="true"
                                                />
                                            </span>
                                        </button>

                                        {/* EXPANDABLE DESCRIPTION */}
                                        <div
                                            id={detailId}
                                            className="ex-entry__details"
                                            aria-hidden={!isOpen}
                                        >
                                            <div className="ex-entry__details-inner">
                                                <div className="ex-entry__description">
                                                    <span className="ex-entry__detail-label">
                                                        TENTANG PENGALAMAN INI
                                                    </span>

                                                    <p>
                                                        {item.description?.trim() ||
                                                            "Deskripsi pengalaman belum tersedia."}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })
                    )}
                </div>

                {/* FOOTER */}
                <div className="ex-footer">
                    <span className="ex-footer__status">
                        <span className="ex-footer__dot" aria-hidden="true" />
                        {activeItems.length} pengalaman {activeCategory}
                    </span>

                    <span className="ex-footer__note">
                        {activeItems.length > 0
                            ? "01 — " +
                              String(activeItems.length).padStart(2, "0")
                            : "00 / 00"}
                    </span>
                </div>
            </div>
        </section>
    );
}
