import RecognitionGallery from "./recognition-gallery";
import { Section, SectionHeading } from "./landing-section";
import type { Achievement } from "./landing-types";

export default function AchievementsSection({ achievements }: { achievements: Achievement[] }) {
    if (achievements.length === 0) return null;

    return (
        <Section id="achievements">
            <SectionHeading
                index="05"
                eyebrow="PENCAPAIAN"
                title="Pencapaian & apresiasi."
                description="Pengakuan, penghargaan, dan jejak kontribusi dalam perjalanan saya."
            />
            <RecognitionGallery achievements={achievements} />
        </Section>
    );
}
