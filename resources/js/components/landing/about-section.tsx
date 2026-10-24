import { ArrowUpRight } from "lucide-react";
import { Section, SectionHeading } from "./landing-section";

export default function AboutSection({ description }: { description: string | null }) {
    return (
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
                        {description ||
                            "Cerita dan latar belakang akan tampil setelah ditambahkan melalui admin."}
                    </p>
                    <a href="#experience" className="lp-text-link">
                        Lihat perjalanan saya
                        <ArrowUpRight size={18} />
                    </a>
                </div>
            </div>
        </Section>
    );
}
