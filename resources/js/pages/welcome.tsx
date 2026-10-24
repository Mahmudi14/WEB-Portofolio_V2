import { Head } from "@inertiajs/react";
import AboutSection from "@/components/landing/about-section";
import AchievementsSection from "@/components/landing/achievements-section";
import ContactSection from "@/components/landing/contact-section";
import EducationSection from "@/components/landing/education-section";
import ExperienceSection from "@/components/landing/experience-section";
import HeroSection from "@/components/landing/hero-section";
import type { LandingPageProps } from "@/components/landing/landing-types";
import ProjectsSection from "@/components/landing/projects-section";
import ResearchSection from "@/components/landing/research-section";
import SiteFooter from "@/components/landing/site-footer";
import SiteNavbar from "@/components/landing/site-navbar";
import SkillsSection from "@/components/landing/skills-section";

// Keep the existing shared layout and Experience CSS unchanged.
// Advanced sections already import their own CSS in their components.
import "../../css/landing.css";

/** Landing page composer: only layout order and Inertia props. */
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
}: LandingPageProps) {
    const name = profile.display_name || profile.full_name || "Portofolio";

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

            <SiteNavbar name={name} logoUrl={profile.logo_url} />

            <main>
                <HeroSection
                    profile={profile}
                    hero={hero}
                    projectCount={projects.length}
                    researchCount={researches.length}
                />
                <AboutSection description={about.description} />
                <SkillsSection skills={skills} />
                <ExperienceSection experiences={experiences} />
                <EducationSection educations={educations} />
                <AchievementsSection achievements={achievements} />
                <ProjectsSection projects={projects} />
                <ResearchSection researches={researches} />
                <ContactSection profile={profile} socials={socials} />
            </main>

            <SiteFooter name={name} />
        </div>
    );
}
