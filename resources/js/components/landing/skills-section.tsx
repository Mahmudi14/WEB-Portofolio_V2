import { Layers3 } from "lucide-react";
import { Section, SectionHeading } from "./landing-section";
import type { Skill } from "./landing-types";

export default function SkillsSection({ skills }: { skills: Skill[] }) {
    if (skills.length === 0) return null;

    return (
        <Section id="skills" alternate>
            <SectionHeading
                index="02"
                eyebrow="KEAHLIAN"
                title="Keahlian & minat."
                description="Teknologi dan bidang yang saya pelajari serta kembangkan."
            />
            <div className="lp-skills-grid">
                {skills.map((category) => (
                    <article key={category.id} className="lp-skill-card">
                        <div className="lp-skill-card__icon">
                            <Layers3 size={21} />
                        </div>
                        <h3>{category.name}</h3>
                        {category.description && <p>{category.description}</p>}
                        <div className="lp-tags">
                            {category.items.map((item) => (
                                <span key={item.id}>{item.name}</span>
                            ))}
                        </div>
                    </article>
                ))}
            </div>
        </Section>
    );
}
