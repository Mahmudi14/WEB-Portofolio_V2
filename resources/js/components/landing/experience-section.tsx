import {
    ArrowDown, BriefcaseBusiness, ChevronDown, UsersRound,
} from "lucide-react";
import { useState } from "react";
import type { KeyboardEvent } from "react";
import { Section, SectionHeading } from "./landing-section";
import { period } from "./landing-helpers";
import type { Experience } from "./landing-types";

type ExperienceCategory = "pekerjaan" | "organisasi";

// Matches the existing compact vertical accordion classes in landing.css.
// The source list is never mutated (sort a filtered copy).
export default function ExperienceSection({ experiences }: { experiences: Experience[] }) {
    const [activeTab, setActiveTab] = useState<ExperienceCategory>("pekerjaan");
    const [expandedId, setExpandedId] = useState<number | null>(null);

    if (experiences.length === 0) return null;

    const pekerjaan = experiences.filter((item) => item.category === "pekerjaan");
    const organisasi = experiences.filter((item) => item.category !== "pekerjaan");
    const activeItems = (activeTab === "pekerjaan" ? pekerjaan : organisasi)
        .sort((a, b) => a.start_year - b.start_year ||
            (a.is_current || a.end_year === null ? Infinity : a.end_year) -
            (b.is_current || b.end_year === null ? Infinity : b.end_year) ||
            a.id - b.id);

    function changeTab(next: ExperienceCategory) {
        setActiveTab(next);
        setExpandedId(null);
    }

    function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, current: ExperienceCategory) {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const next: ExperienceCategory = event.key === "Home"
            ? "pekerjaan" : event.key === "End" ? "organisasi"
            : current === "pekerjaan" ? "organisasi" : "pekerjaan";
        changeTab(next);
        document.getElementById(`lp-exp-tab-${next}`)?.focus();
    }

    return (
        <Section id="experience">
            <div className="lp-experience-heading">
                <SectionHeading
                    index="03"
                    eyebrow="PERJALANAN"
                    title="Pengalaman saya."
                    description="Perjalanan profesional, kepemimpinan, dan kontribusi yang membentuk diri saya."
                />
                <div className="lp-experience-heading__stat">
                    <strong>{String(experiences.length).padStart(2, "0")}</strong>
                    <span>Total Pengalaman</span>
                </div>
            </div>

            <div className="lp-experience">
                <div className="lp-experience__toolbar">
                    <div className="lp-experience__tabs" role="tablist" aria-label="Kategori pengalaman">
                        {(["pekerjaan", "organisasi"] as const).map((category) => {
                            const selected = activeTab === category;
                            return (
                                <button
                                    key={category}
                                    id={`lp-exp-tab-${category}`}
                                    type="button"
                                    role="tab"
                                    aria-selected={selected}
                                    aria-controls="lp-exp-panel"
                                    tabIndex={selected ? 0 : -1}
                                    className={"lp-experience__tab" + (selected ? " lp-experience__tab--active" : "")}
                                    onClick={() => changeTab(category)}
                                    onKeyDown={(event) => onTabKeyDown(event, category)}
                                >
                                    {category === "pekerjaan" ? (
                                        <BriefcaseBusiness size={17} />
                                    ) : <UsersRound size={17} />}
                                    <span>{category === "pekerjaan" ? "Pekerjaan" : "Organisasi"}</span>
                                    <span className="lp-experience__tab-count">
                                        {category === "pekerjaan" ? pekerjaan.length : organisasi.length}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <span className="lp-experience__scroll-hint">
                        <ArrowDown size={15} /> Scroll untuk menjelajah
                    </span>
                </div>

                <div id="lp-exp-panel" role="tabpanel" aria-labelledby={`lp-exp-tab-${activeTab}`}
                    tabIndex={0} className="lp-experience__panel">
                    <div key={activeTab} className="lp-experience__viewport" role="region"
                        aria-label={`Daftar pengalaman ${activeTab}`} tabIndex={0}>
                        {activeItems.length === 0 ? (
                            <div className="lp-experience__empty">
                                {activeTab === "pekerjaan" ? <BriefcaseBusiness size={30} /> : <UsersRound size={30} />}
                                <h3>Belum ada pengalaman {activeTab}</h3>
                                <p>Pengalaman akan tampil setelah ditambahkan.</p>
                            </div>
                        ) : (
                            <div className="lp-experience__list">
                                {activeItems.map((experience, index) => {
                                    const isOpen = expandedId === experience.id;
                                    const detailId = `lp-exp-detail-${experience.id}`;
                                    return (
                                        <article key={experience.id}
                                            className={"lp-experience__item" + (isOpen ? " lp-experience__item--open" : "")}>
                                            <button type="button" className="lp-experience__item-button"
                                                aria-expanded={isOpen} aria-controls={detailId}
                                                onClick={() => setExpandedId(isOpen ? null : experience.id)}>
                                                <span className="lp-experience__number">
                                                    {String(index + 1).padStart(2, "0")}
                                                </span>
                                                <span className="lp-experience__logo">
                                                    {activeTab === "pekerjaan" ? (
                                                        <BriefcaseBusiness size={22} />
                                                    ) : <UsersRound size={22} />}
                                                    {experience.logo_url && (
                                                        <img src={experience.logo_url} alt="" loading="lazy"
                                                            onError={(event) => { event.currentTarget.style.display = "none"; }} />
                                                    )}
                                                </span>
                                                <span className="lp-experience__item-info">
                                                    <span className="lp-experience__item-position">{experience.position}</span>
                                                    <span className="lp-experience__item-institution">{experience.institution_name}</span>
                                                </span>
                                                <span className="lp-experience__item-end">
                                                    <span className="lp-experience__period">
                                                        {period(experience.start_year, experience.end_year, experience.is_current)}
                                                    </span>
                                                    <span className="lp-experience__chevron"><ChevronDown size={19} /></span>
                                                </span>
                                            </button>
                                            <div id={detailId} className="lp-experience__details" aria-hidden={!isOpen}>
                                                <div className="lp-experience__details-inner">
                                                    <div className="lp-experience__details-content">
                                                        <span className="lp-experience__detail-label">TENTANG PENGALAMAN INI</span>
                                                        <p>{experience.description?.trim() || "Deskripsi pengalaman belum tersedia."}</p>
                                                        <div className="lp-experience__detail-meta">
                                                            <span>
                                                                <span className="lp-experience__meta-dot" />
                                                                {experience.is_current ? "Sedang berlangsung" : "Riwayat pengalaman"}
                                                            </span>
                                                            <span>{period(experience.start_year, experience.end_year, experience.is_current)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
                <div className="lp-experience__footer">
                    <div className="lp-experience__footer-left">
                        <span className="lp-experience__footer-dot" />
                        <span>{activeItems.length} pengalaman {activeTab}</span>
                    </div>
                    <span className="lp-experience__footer-note">Klik untuk membuka detail</span>
                </div>
            </div>
        </Section>
    );
}
