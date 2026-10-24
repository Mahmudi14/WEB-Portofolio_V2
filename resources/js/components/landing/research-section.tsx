import ResearchArchive from "./research-archive";
import { Section, SectionHeading } from "./landing-section";
import type { Research } from "./landing-types";

export default function ResearchSection({ researches }: { researches: Research[] }) {
    if (researches.length === 0) return null;

    return (
        <Section id="research">
            <SectionHeading
                index="07"
                eyebrow="PENELITIAN"
                title="Penelitian."
                description="Dokumentasi topik, proses, dan hasil penelitian saya."
            />
            <ResearchArchive researches={researches} />
        </Section>
    );
}
