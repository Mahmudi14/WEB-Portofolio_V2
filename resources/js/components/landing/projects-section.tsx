import ProjectShowcase from "./project-showcase";
import { Section, SectionHeading } from "./landing-section";
import type { Project } from "./landing-types";

export default function ProjectsSection({ projects }: { projects: Project[] }) {
    return (
        <Section id="projects" alternate>
            <SectionHeading
                index="06"
                eyebrow="KARYA PILIHAN"
                title="Proyek yang saya kerjakan."
                description="Eksplorasi ide, pengembangan produk digital, dan solusi yang saya bangun."
            />
            <ProjectShowcase projects={projects} />
        </Section>
    );
}
