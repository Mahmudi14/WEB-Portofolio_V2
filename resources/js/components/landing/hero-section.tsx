import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import HeroIdCard from "./hero-id-card";
import type { Hero, Profile } from "./landing-types";

export default function HeroSection({
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
        </section>
    );
}
