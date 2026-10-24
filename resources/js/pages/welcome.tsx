import { Head } from "@inertiajs/react";

import {
    ArrowDown,
    ArrowRight,
    ArrowUpRight,
    Award,
    BookOpen,
    BriefcaseBusiness,
    ExternalLink,
    Github,
    GraduationCap,
    Layers3,
    Mail,
    Menu,
    Microscope,
    X,
    ChevronDown,
    UsersRound,
} from "lucide-react";

import { useState } from "react";

import type { KeyboardEvent, ReactNode } from "react";
import HeroIdCard from "@/components/landing/hero-id-card";
import AcademicTimeline from "@/components/landing/academic-timeline";
import "../../css/landing.css";
import RecognitionGallery from "@/components/landing/recognition-gallery";
import ProjectShowcase from "@/components/landing/project-showcase";
import ResearchArchive from "@/components/landing/research-archive";

// ==========================================
// TYPES
// ==========================================

type Profile = {
    full_name: string | null;
    display_name: string | null;
    email: string | null;
    whatsapp: string | null;
    photo_url: string | null;
    logo_url: string | null;
};

type Hero = {
    headline: string | null;
    description: string | null;
};

type Social = {
    id: number;
    platform: string;
    name: string;
    url: string;
};

type Skill = {
    id: number;
    name: string;
    description: string | null;
    items: {
        id: number;
        name: string;
    }[];
};

type Education = {
    id: number;
    level: string;
    institution_name: string;
    major: string | null;
    start_year: number;
    end_year: number | null;
    is_current: boolean;
};

type Experience = {
    id: number;
    category: string;
    position: string;
    institution_name: string;
    description: string;
    start_year: number;
    end_year: number | null;
    is_current: boolean;
    logo_url: string | null;
};

type Achievement = {
    id: number;
    category: string;
    title: string;
    description: string | null;
    year: number;
    institution_name: string | null;
};

type Project = {
    id: number;
    title: string;
    description: string;
    technologies: string | null;
    category: string;
    images: {
        id: number;
        url: string;
    }[];
};

type Research = {
    id: number;
    title: string;
    summary: string;
    year: number;
};

type Props = {
    profile: Profile;
    hero: Hero;
    about: {
        description: string | null;
    };
    socials: Social[];
    skills: Skill[];
    educations: Education[];
    experiences: Experience[];
    achievements: Achievement[];
    projects: Project[];
    researches: Research[];
};

// ==========================================
// HELPERS
// ==========================================

const navigation = [
    { label: "Tentang", href: "#about" },
    { label: "Keahlian", href: "#skills" },
    { label: "Pengalaman", href: "#experience" },
    { label: "Proyek", href: "#projects" },
    { label: "Penelitian", href: "#research" },
];

function period(start: number, end: number | null, current: boolean) {
    if (current) return `${start} — Sekarang`;
    return end ? `${start} — ${end}` : String(start);
}

function safeUrl(url: string): string | null {
    try {
        const parsed = new URL(url);

        return ["https:", "http:"].includes(parsed.protocol)
            ? parsed.href
            : null;
    } catch {
        return null;
    }
}

function SectionHeading({
    index,
    eyebrow,
    title,
    description,
}: {
    index: string;
    eyebrow: string;
    title: string;
    description?: string;
}) {
    return (
        <div className="lp-section-heading">
            <div className="lp-section-heading__top">
                <span>
                    {index} / {eyebrow}
                </span>
                <span className="lp-section-heading__line" />
            </div>

            <h2>{title}</h2>

            {description && <p>{description}</p>}
        </div>
    );
}

function Section({
    id,
    children,
    alternate = false,
}: {
    id: string;
    children: ReactNode;
    alternate?: boolean;
}) {
    return (
        <section
            id={id}
            className={
                "lp-section" + (alternate ? " lp-section--alternate" : "")
            }
        >
            <div className="lp-container">{children}</div>
        </section>
    );
}

// ==========================================
// NAVBAR
// ==========================================

function Navbar({ name, logoUrl }: { name: string; logoUrl: string | null }) {
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

// ==========================================
// HERO
// ==========================================

function HeroSection({
    profile,
    hero,
    projectCount,
    researchCount,
}: {
    profile: Profile;
    hero: Hero;
    projectCount: number;
    researchCount: number;
}) {
    const name = profile.display_name || profile.full_name || "Portofolio";

    return (
        <section id="home" className="lp-hero">
            <div className="lp-container lp-hero__grid">
                <div className="lp-hero__content">
                    <span className="lp-eyebrow">
                        <span className="lp-pulse" />
                        PERSONAL PORTFOLIO
                    </span>

                    <p className="lp-hero__intro">
                        Halo, saya {name}
                        <span className="lp-accent">.</span>
                    </p>

                    <h1>
                        {hero.headline ||
                            "Membangun karya melalui ide dan teknologi."}
                    </h1>

                    <p className="lp-hero__description">
                        {hero.description ||
                            "Selamat datang di portofolio saya. Jelajahi proyek, pengalaman, dan karya yang telah saya kerjakan."}
                    </p>

                    <div className="lp-hero__actions">
                        <a
                            href="#projects"
                            className="lp-button lp-button--primary"
                        >
                            Jelajahi Proyek
                            <ArrowUpRight size={18} />
                        </a>

                        <a
                            href="#contact"
                            className="lp-button lp-button--outline"
                        >
                            Hubungi Saya
                            <ArrowRight size={17} />
                        </a>
                    </div>

                    <div className="lp-hero__stats">
                        <div>
                            <strong>{projectCount}</strong>
                            <span>Proyek</span>
                        </div>

                        <div>
                            <strong>{researchCount}</strong>
                            <span>Penelitian</span>
                        </div>

                        <div>
                            <strong>∞</strong>
                            <span>Ruang Berkarya</span>
                        </div>
                    </div>
                </div>

                <div className="lp-hero__visual">
                    <HeroIdCard
                        name={name}
                        photoUrl={profile.photo_url}
                        logoUrl={profile.logo_url}
                    />
                </div>
            </div>

            <a className="lp-scroll-hint" href="#about">
                <ArrowDown size={15} />
                Scroll untuk menjelajah
            </a>
        </section>
    );
}

// ==========================================
// LANDING PAGE
// ==========================================

type ExperienceCategory = "pekerjaan" | "organisasi";

function ExperienceSection({ experiences }: { experiences: Experience[] }) {
    // Pekerjaan aktif ketika landing page pertama dibuka.
    const [activeTab, setActiveTab] = useState<ExperienceCategory>("pekerjaan");

    // Semua detail tertutup secara default.
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const pekerjaan = experiences.filter(
        (item) => item.category === "pekerjaan",
    );

    const organisasi = experiences.filter(
        (item) => item.category === "organisasi",
    );

    const activeItems = (
        activeTab === "pekerjaan" ? pekerjaan : organisasi
    ).sort((a, b) => {
        // Tahun mulai paling awal terlebih dahulu.
        if (a.start_year !== b.start_year) {
            return a.start_year - b.start_year;
        }

        // Jika tahun mulai sama, yang selesai
        // lebih awal ditampilkan terlebih dahulu.
        const endA =
            a.is_current || a.end_year === null
                ? Number.MAX_SAFE_INTEGER
                : a.end_year;

        const endB =
            b.is_current || b.end_year === null
                ? Number.MAX_SAFE_INTEGER
                : b.end_year;

        if (endA !== endB) {
            return endA - endB;
        }

        return a.id - b.id;
    });

    function changeTab(category: ExperienceCategory) {
        setActiveTab(category);
        setExpandedId(null);
    }

    function handleTabKeyDown(
        event: KeyboardEvent<HTMLButtonElement>,
        category: ExperienceCategory,
    ) {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
            return;
        }

        event.preventDefault();

        let next: ExperienceCategory;

        if (event.key === "Home") {
            next = "pekerjaan";
        } else if (event.key === "End") {
            next = "organisasi";
        } else {
            next = category === "pekerjaan" ? "organisasi" : "pekerjaan";
        }

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
                    <strong>
                        {String(experiences.length).padStart(2, "0")}
                    </strong>
                    <span>Total Pengalaman</span>
                </div>
            </div>

            <div className="lp-experience">
                {/* HEADER + TABS */}

                <div className="lp-experience__toolbar">
                    <div
                        className="lp-experience__tabs"
                        role="tablist"
                        aria-label="Kategori pengalaman"
                    >
                        <button
                            id="lp-exp-tab-pekerjaan"
                            type="button"
                            role="tab"
                            aria-selected={activeTab === "pekerjaan"}
                            aria-controls="lp-exp-panel"
                            tabIndex={activeTab === "pekerjaan" ? 0 : -1}
                            className={
                                "lp-experience__tab" +
                                (activeTab === "pekerjaan"
                                    ? " lp-experience__tab--active"
                                    : "")
                            }
                            onClick={() => changeTab("pekerjaan")}
                            onKeyDown={(event) =>
                                handleTabKeyDown(event, "pekerjaan")
                            }
                        >
                            <BriefcaseBusiness size={17} />
                            <span>Pekerjaan</span>
                            <span className="lp-experience__tab-count">
                                {pekerjaan.length}
                            </span>
                        </button>

                        <button
                            id="lp-exp-tab-organisasi"
                            type="button"
                            role="tab"
                            aria-selected={activeTab === "organisasi"}
                            aria-controls="lp-exp-panel"
                            tabIndex={activeTab === "organisasi" ? 0 : -1}
                            className={
                                "lp-experience__tab" +
                                (activeTab === "organisasi"
                                    ? " lp-experience__tab--active"
                                    : "")
                            }
                            onClick={() => changeTab("organisasi")}
                            onKeyDown={(event) =>
                                handleTabKeyDown(event, "organisasi")
                            }
                        >
                            <UsersRound size={17} />
                            <span>Organisasi</span>
                            <span className="lp-experience__tab-count">
                                {organisasi.length}
                            </span>
                        </button>
                    </div>

                    <span className="lp-experience__scroll-hint">
                        <ArrowDown size={15} />
                        Scroll untuk menjelajah
                    </span>
                </div>

                {/* AREA DAFTAR SCROLL VERTIKAL */}

                <div
                    id="lp-exp-panel"
                    role="tabpanel"
                    aria-labelledby={`lp-exp-tab-${activeTab}`}
                    tabIndex={0}
                    className="lp-experience__panel"
                >
                    <div
                        key={activeTab}
                        className="lp-experience__viewport"
                        role="region"
                        aria-label={`Daftar pengalaman ${activeTab}`}
                        tabIndex={0}
                    >
                        {activeItems.length === 0 ? (
                            <div className="lp-experience__empty">
                                {activeTab === "pekerjaan" ? (
                                    <BriefcaseBusiness size={30} />
                                ) : (
                                    <UsersRound size={30} />
                                )}
                                <h3>Belum ada pengalaman {activeTab}</h3>
                                <p>
                                    Pengalaman akan tampil setelah ditambahkan.
                                </p>
                            </div>
                        ) : (
                            <div className="lp-experience__list">
                                {activeItems.map((experience, index) => {
                                    const isOpen = expandedId === experience.id;

                                    const detailId = `lp-exp-detail-${experience.id}`;

                                    return (
                                        <article
                                            key={experience.id}
                                            className={
                                                "lp-experience__item" +
                                                (isOpen
                                                    ? " lp-experience__item--open"
                                                    : "")
                                            }
                                        >
                                            <button
                                                type="button"
                                                className="lp-experience__item-button"
                                                aria-expanded={isOpen}
                                                aria-controls={detailId}
                                                onClick={() =>
                                                    setExpandedId(
                                                        isOpen
                                                            ? null
                                                            : experience.id,
                                                    )
                                                }
                                            >
                                                {/* NOMOR */}

                                                <span className="lp-experience__number">
                                                    {String(index + 1).padStart(
                                                        2,
                                                        "0",
                                                    )}
                                                </span>

                                                {/* LOGO / ICON */}

                                                <span className="lp-experience__logo">
                                                    {activeTab ===
                                                    "pekerjaan" ? (
                                                        <BriefcaseBusiness
                                                            size={22}
                                                        />
                                                    ) : (
                                                        <UsersRound size={22} />
                                                    )}

                                                    {experience.logo_url && (
                                                        <img
                                                            src={
                                                                experience.logo_url
                                                            }
                                                            alt=""
                                                            loading="lazy"
                                                            onError={(
                                                                event,
                                                            ) => {
                                                                event.currentTarget.style.display =
                                                                    "none";
                                                            }}
                                                        />
                                                    )}
                                                </span>

                                                {/* INFORMASI UTAMA */}

                                                <span className="lp-experience__item-info">
                                                    <span className="lp-experience__item-position">
                                                        {experience.position}
                                                    </span>

                                                    <span className="lp-experience__item-institution">
                                                        {
                                                            experience.institution_name
                                                        }
                                                    </span>
                                                </span>

                                                {/* TAHUN & PANAH */}

                                                <span className="lp-experience__item-end">
                                                    <span className="lp-experience__period">
                                                        {period(
                                                            experience.start_year,
                                                            experience.end_year,
                                                            experience.is_current,
                                                        )}
                                                    </span>

                                                    <span className="lp-experience__chevron">
                                                        <ChevronDown
                                                            size={19}
                                                        />
                                                    </span>
                                                </span>
                                            </button>

                                            {/* DETAIL ACCORDION */}

                                            <div
                                                id={detailId}
                                                className="lp-experience__details"
                                                aria-hidden={!isOpen}
                                            >
                                                <div className="lp-experience__details-inner">
                                                    <div className="lp-experience__details-content">
                                                        <span className="lp-experience__detail-label">
                                                            TENTANG PENGALAMAN
                                                            INI
                                                        </span>

                                                        <p>
                                                            {experience.description?.trim() ||
                                                                "Deskripsi pengalaman belum tersedia."}
                                                        </p>

                                                        <div className="lp-experience__detail-meta">
                                                            <span>
                                                                <span className="lp-experience__meta-dot" />
                                                                {experience.is_current
                                                                    ? "Sedang berlangsung"
                                                                    : "Riwayat pengalaman"}
                                                            </span>

                                                            <span>
                                                                {period(
                                                                    experience.start_year,
                                                                    experience.end_year,
                                                                    experience.is_current,
                                                                )}
                                                            </span>
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

                {/* FOOTER */}

                <div className="lp-experience__footer">
                    <div className="lp-experience__footer-left">
                        <span className="lp-experience__footer-dot" />
                        <span>
                            {activeItems.length} pengalaman {activeTab}
                        </span>
                    </div>

                    <span className="lp-experience__footer-note">
                        Klik untuk membuka detail
                    </span>
                </div>
            </div>
        </Section>
    );
}

export default function Welcome({
    profile,
    hero,
    about,
    socials,
    skills,
    educations,
    experiences,
    achievements,
    projects,
    researches,
}: Props) {
    const name = profile.display_name || profile.full_name || "Portofolio";

    const whatsAppNumber = profile.whatsapp?.replace(/\D/g, "") ?? "";

    return (
        <div className="lp">
            <Head title={`Portofolio ${name}`}>
                <meta
                    name="description"
                    content={
                        hero.description?.slice(0, 155) ||
                        `Portofolio ${name}: proyek, keahlian, pengalaman, dan penelitian.`
                    }
                />
            </Head>

            <Navbar name={name} logoUrl={profile.logo_url} />

            <main>
                <HeroSection
                    profile={profile}
                    hero={hero}
                    projectCount={projects.length}
                    researchCount={researches.length}
                />

                {/* TENTANG SAYA */}

                <Section id="about">
                    <div className="lp-about-grid">
                        <SectionHeading
                            index="01"
                            eyebrow="TENTANG SAYA"
                            title="Lebih dekat dengan saya."
                            description="Sedikit cerita di balik perjalanan, ketertarikan, dan karya saya."
                        />

                        <div className="lp-about-content">
                            <p>
                                {about.description ||
                                    "Cerita dan latar belakang akan tampil setelah ditambahkan melalui admin."}
                            </p>

                            <a href="#experience" className="lp-text-link">
                                Lihat perjalanan saya
                                <ArrowUpRight size={18} />
                            </a>
                        </div>
                    </div>
                </Section>

                {/* KEAHLIAN */}

                {skills.length > 0 && (
                    <Section id="skills" alternate>
                        <SectionHeading
                            index="02"
                            eyebrow="KEAHLIAN"
                            title="Keahlian & minat."
                            description="Teknologi dan bidang yang saya pelajari serta kembangkan."
                        />

                        <div className="lp-skills-grid">
                            {skills.map((category) => (
                                <article
                                    key={category.id}
                                    className="lp-skill-card"
                                >
                                    <div className="lp-skill-card__icon">
                                        <Layers3 size={21} />
                                    </div>

                                    <h3>{category.name}</h3>

                                    {category.description && (
                                        <p>{category.description}</p>
                                    )}

                                    <div className="lp-tags">
                                        {category.items.map((item) => (
                                            <span key={item.id}>
                                                {item.name}
                                            </span>
                                        ))}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </Section>
                )}

                {/* PENGALAMAN */}

                {experiences.length > 0 && (
                    <ExperienceSection experiences={experiences} />
                )}

                {/* PENDIDIKAN */}

                {educations.length > 0 && (
                    <Section id="education" alternate>
                        <SectionHeading
                            index="04"
                            eyebrow="PENDIDIKAN"
                            title="Perjalanan akademik."
                        />

                        <AcademicTimeline educations={educations} />
                    </Section>
                )}

                {/* PENCAPAIAN */}

                {achievements.length > 0 && (
                    <Section id="achievements">
                        <SectionHeading
                            index="05"
                            eyebrow="PENCAPAIAN"
                            title="Pencapaian & apresiasi."
                            description="Pengakuan, penghargaan, dan jejak kontribusi dalam perjalanan saya."
                        />

                        <RecognitionGallery achievements={achievements} />
                    </Section>
                )}

                {/* PROYEK */}

                <Section id="projects" alternate>
                    <SectionHeading
                        index="06"
                        eyebrow="KARYA PILIHAN"
                        title="Proyek yang saya kerjakan."
                        description="Eksplorasi ide, pengembangan produk digital, dan solusi yang saya bangun."
                    />

                    <ProjectShowcase projects={projects} />
                </Section>

                {/* PENELITIAN */}

                {researches.length > 0 && (
                    <Section id="research">
                        <SectionHeading
                            index="07"
                            eyebrow="PENELITIAN"
                            title="Penelitian."
                            description="Dokumentasi topik, proses, dan hasil penelitian saya."
                        />

                        <ResearchArchive researches={researches} />
                    </Section>
                )}

                {/* KONTAK */}

                <Section id="contact" alternate>
                    <div className="lp-contact">
                        <span className="lp-eyebrow">
                            <span className="lp-pulse" />
                            MARI TERHUBUNG
                        </span>

                        <h2>
                            Punya ide menarik?
                            <br />
                            <em>Mari berkolaborasi.</em>
                        </h2>

                        <p>
                            Terbuka untuk diskusi, kolaborasi, serta kesempatan
                            untuk membangun sesuatu yang bermanfaat bersama.
                        </p>

                        <div className="lp-contact__buttons">
                            {profile.email && (
                                <a
                                    href={`mailto:${profile.email}`}
                                    className="lp-button lp-button--primary"
                                >
                                    <Mail size={18} />
                                    Kirim Email
                                </a>
                            )}

                            {whatsAppNumber && (
                                <a
                                    href={`https://wa.me/${whatsAppNumber}`}
                                    className="lp-button lp-button--outline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Hubungi via WhatsApp
                                    <ArrowUpRight size={17} />
                                </a>
                            )}
                        </div>

                        {socials.length > 0 && (
                            <div className="lp-social-links">
                                {socials.map((social) => {
                                    const href = safeUrl(social.url);

                                    if (!href) return null;

                                    return (
                                        <a
                                            key={social.id}
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {social.platform.toLowerCase() ===
                                            "github" ? (
                                                <Github size={16} />
                                            ) : (
                                                <ExternalLink size={15} />
                                            )}

                                            {social.name}
                                            <ArrowUpRight size={14} />
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </Section>
            </main>

            {/* FOOTER */}

            <footer className="lp-footer">
                <div className="lp-container lp-footer__inner">
                    <a href="#home" className="lp-footer__brand">
                        {name}
                        <span>.</span>
                    </a>

                    <p>
                        © {new Date().getFullYear()} {name}. Dibangun dengan
                        dedikasi dan kreativitas.
                    </p>

                    <a href="#home">
                        Kembali ke atas
                        <ArrowUpRight size={15} />
                    </a>
                </div>
            </footer>
        </div>
    );
}
