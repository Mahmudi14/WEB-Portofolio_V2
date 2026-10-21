import { Head } from '@inertiajs/react';

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
} from 'lucide-react';

import { useState } from 'react';

import type { ReactNode } from 'react';

import '../../css/landing.css';

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
    { label: 'Tentang', href: '#about' },
    { label: 'Keahlian', href: '#skills' },
    { label: 'Pengalaman', href: '#experience' },
    { label: 'Proyek', href: '#projects' },
    { label: 'Penelitian', href: '#research' },
];

function period(
    start: number,
    end: number | null,
    current: boolean
) {
    if (current) return `${start} — Sekarang`;
    return end ? `${start} — ${end}` : String(start);
}

function safeUrl(url: string): string | null {
    try {
        const parsed = new URL(url);

        return ['https:', 'http:'].includes(parsed.protocol)
            ? parsed.href
            : null;
    } catch {
        return null;
    }
}

function getInitials(name: string) {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0] ?? '')
        .join('')
        .toUpperCase();
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
                <span>{index} / {eyebrow}</span>
                <span className="lp-section-heading__line" />
            </div>

            <h2>{title}</h2>

            {description && <p>{description}</p>}
        </div>
    );
}

function EmptyAvatar({
    name,
}: {
    name: string;
}) {
    return (
        <span className="lp-avatar-fallback">
            {getInitials(name) || 'P'}
        </span>
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
                'lp-section' +
                (alternate ? ' lp-section--alternate' : '')
            }
        >
            <div className="lp-container">
                {children}
            </div>
        </section>
    );
}

// ==========================================
// NAVBAR
// ==========================================

function Navbar({
    name,
    logoUrl,
}: {
    name: string;
    logoUrl: string | null;
}) {
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
                            <img
                                src={logoUrl}
                                alt=""
                            />
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
                        'lp-navigation' +
                        (menuOpen
                            ? ' lp-navigation--open'
                            : '')
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
                    aria-label={
                        menuOpen
                            ? 'Tutup menu'
                            : 'Buka menu'
                    }
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? (
                        <X size={22} />
                    ) : (
                        <Menu size={22} />
                    )}
                </button>
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
    const name =
        profile.display_name ||
        profile.full_name ||
        'Portofolio';

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
                            'Membangun karya melalui ide dan teknologi.'}
                    </h1>

                    <p className="lp-hero__description">
                        {hero.description ||
                            'Selamat datang di portofolio saya. Jelajahi proyek, pengalaman, dan karya yang telah saya kerjakan.'}
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
                    <div className="lp-hero__orbit lp-hero__orbit--one" />
                    <div className="lp-hero__orbit lp-hero__orbit--two" />

                    <div className="lp-hero__portrait">
                        {profile.photo_url ? (
                            <img
                                src={profile.photo_url}
                                alt={`Foto profil ${name}`}
                            />
                        ) : (
                            <EmptyAvatar name={name} />
                        )}

                        <span className="lp-hero__portrait-label">
                            CREATIVE PORTFOLIO
                        </span>
                    </div>

                    <div className="lp-hero__floating">
                        <span className="lp-hero__floating-dot" />
                        Explore. Create. Evolve.
                    </div>
                </div>
            </div>

            <a
                className="lp-scroll-hint"
                href="#about"
            >
                <ArrowDown size={15} />
                Scroll untuk menjelajah
            </a>
        </section>
    );
}

// ==========================================
// LANDING PAGE
// ==========================================

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
    const name =
        profile.display_name ||
        profile.full_name ||
        'Portofolio';

    const whatsAppNumber =
        profile.whatsapp?.replace(/\D/g, '') ?? '';

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

            <Navbar
                name={name}
                logoUrl={profile.logo_url}
            />

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
                                    'Cerita dan latar belakang akan tampil setelah ditambahkan melalui admin.'}
                            </p>

                            <a
                                href="#experience"
                                className="lp-text-link"
                            >
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
                                        <p>
                                            {category.description}
                                        </p>
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
                    <Section id="experience">
                        <SectionHeading
                            index="03"
                            eyebrow="PERJALANAN"
                            title="Pengalaman saya."
                            description="Peran, organisasi, dan pengalaman yang membentuk perjalanan saya."
                        />

                        <div className="lp-timeline">
                            {experiences.map((experience) => (
                                <article
                                    key={experience.id}
                                    className="lp-timeline-item"
                                >
                                    <div className="lp-timeline-item__marker">
                                        <BriefcaseBusiness size={19} />
                                    </div>

                                    <div className="lp-timeline-item__main">
                                        <span className="lp-overline">
                                            {experience.category ===
                                            'pekerjaan'
                                                ? 'PEKERJAAN'
                                                : 'ORGANISASI'}
                                        </span>

                                        <h3>{experience.position}</h3>

                                        <strong>
                                            {experience.institution_name}
                                        </strong>

                                        <p>{experience.description}</p>
                                    </div>

                                    <time className="lp-timeline-item__date">
                                        {period(
                                            experience.start_year,
                                            experience.end_year,
                                            experience.is_current
                                        )}
                                    </time>
                                </article>
                            ))}
                        </div>
                    </Section>
                )}

                {/* PENDIDIKAN */}

                {educations.length > 0 && (
                    <Section id="education" alternate>
                        <SectionHeading
                            index="04"
                            eyebrow="PENDIDIKAN"
                            title="Perjalanan akademik."
                        />

                        <div className="lp-education-grid">
                            {educations.map((education) => (
                                <article
                                    key={education.id}
                                    className="lp-education-card"
                                >
                                    <div className="lp-education-card__icon">
                                        <GraduationCap size={23} />
                                    </div>

                                    <span className="lp-overline">
                                        {education.level}
                                    </span>

                                    <h3>
                                        {education.institution_name}
                                    </h3>

                                    {education.major && (
                                        <p>{education.major}</p>
                                    )}

                                    <span className="lp-education-card__year">
                                        {period(
                                            education.start_year,
                                            education.end_year,
                                            education.is_current
                                        )}
                                    </span>
                                </article>
                            ))}
                        </div>
                    </Section>
                )}

                {/* PENCAPAIAN */}

                {achievements.length > 0 && (
                    <Section id="achievements">
                        <SectionHeading
                            index="05"
                            eyebrow="PENCAPAIAN"
                            title="Pencapaian & apresiasi."
                        />

                        <div className="lp-achievements">
                            {achievements.map((achievement) => (
                                <article
                                    key={achievement.id}
                                    className="lp-achievement-item"
                                >
                                    <div className="lp-achievement-item__icon">
                                        <Award size={20} />
                                    </div>

                                    <div>
                                        <span className="lp-overline">
                                            {achievement.category}
                                        </span>

                                        <h3>{achievement.title}</h3>

                                        {achievement.institution_name && (
                                            <p>
                                                {achievement.institution_name}
                                            </p>
                                        )}

                                        {achievement.description && (
                                            <p>
                                                {achievement.description}
                                            </p>
                                        )}
                                    </div>

                                    <span className="lp-achievement-item__year">
                                        {achievement.year}
                                    </span>
                                </article>
                            ))}
                        </div>
                    </Section>
                )}

                {/* PROYEK */}

                <Section id="projects" alternate>
                    <SectionHeading
                        index="06"
                        eyebrow="KARYA PILIHAN"
                        title="Proyek yang saya kerjakan."
                        description="Dokumentasi karya dan solusi digital yang telah dikembangkan."
                    />

                    {projects.length > 0 ? (
                        <div className="lp-project-grid">
                            {projects.map((project, index) => (
                                <article
                                    key={project.id}
                                    className="lp-project-card"
                                >
                                    <div className="lp-project-card__image">
                                        {project.images[0] ? (
                                            <img
                                                src={project.images[0].url}
                                                alt={`Cover proyek ${project.title}`}
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="lp-project-card__placeholder">
                                                <Layers3 size={45} />
                                            </div>
                                        )}

                                        <span className="lp-project-card__number">
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                    </div>

                                    <div className="lp-project-card__body">
                                        <span className="lp-overline">
                                            {project.category}
                                        </span>

                                        <h3>{project.title}</h3>

                                        <p>{project.description}</p>

                                        <div className="lp-tags">
                                            {(project.technologies ?? '')
                                                .split(',')
                                                .map((tech) => tech.trim())
                                                .filter(Boolean)
                                                .slice(0, 7)
                                                .map((tech, i) => (
                                                    <span key={`${tech}-${i}`}>
                                                        {tech}
                                                    </span>
                                                ))}
                                        </div>

                                        <details className="lp-project-details">
                                            <summary>
                                                Detail proyek
                                                <ArrowUpRight size={16} />
                                            </summary>

                                            <p>{project.description}</p>

                                            {project.images.length > 1 && (
                                                <div className="lp-project-gallery">
                                                    {project.images.map(
                                                        (image, imageIndex) => (
                                                            <a
                                                                key={image.id}
                                                                href={image.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                aria-label={`Buka gambar ${imageIndex + 1} dari proyek ${project.title}`}
                                                            >
                                                                <img
                                                                    src={image.url}
                                                                    alt={`Galeri ${project.title} ${imageIndex + 1}`}
                                                                    loading="lazy"
                                                                />
                                                            </a>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                        </details>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="lp-empty">
                            <BookOpen size={24} />
                            <p>Proyek akan tampil di sini setelah ditambahkan melalui admin.</p>
                        </div>
                    )}
                </Section>

                {/* PENELITIAN */}

                {researches.length > 0 && (
                    <Section id="research">
                        <SectionHeading
                            index="07"
                            eyebrow="RISET"
                            title="Penelitian & eksplorasi."
                            description="Topik dan gagasan yang saya teliti lebih dalam."
                        />

                        <div className="lp-research-list">
                            {researches.map((research, index) => (
                                <article
                                    key={research.id}
                                    className="lp-research-item"
                                >
                                    <div className="lp-research-item__number">
                                        {String(index + 1).padStart(2, '0')}
                                    </div>

                                    <div className="lp-research-item__content">
                                        <span className="lp-overline">
                                            PENELITIAN · {research.year}
                                        </span>

                                        <h3>{research.title}</h3>

                                        <p>{research.summary}</p>
                                    </div>

                                    <div className="lp-research-item__icon">
                                        <Microscope size={21} />
                                    </div>
                                </article>
                            ))}
                        </div>
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
                            Terbuka untuk diskusi, kolaborasi,
                            serta kesempatan untuk membangun
                            sesuatu yang bermanfaat bersama.
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
                                            'github' ? (
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
                    <a
                        href="#home"
                        className="lp-footer__brand"
                    >
                        {name}<span>.</span>
                    </a>

                    <p>
                        © {new Date().getFullYear()} {name}.
                        Dibangun dengan dedikasi dan kreativitas.
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