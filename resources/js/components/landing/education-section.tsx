import AcademicTimeline from "./academic-timeline";
import { Section, SectionHeading } from "./landing-section";
import type { Education } from "./landing-types";

export default function EducationSection({ educations }: { educations: Education[] }) {
    if (educations.length === 0) return null;

    return (
        <Section id="education" alternate>
            <SectionHeading index="04" eyebrow="PENDIDIKAN" title="Perjalanan akademik." />
            <AcademicTimeline educations={educations} />
        </Section>
    );
}
