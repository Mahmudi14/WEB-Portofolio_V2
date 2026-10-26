import AcademicTimeline from "./academic-timeline";
import type { Education } from "./landing-types";

type Props = {
    educations: Education[];
};

export default function EducationSection({ educations }: Props) {
    if (educations.length === 0) return null;

    return (
        <section
            id="education"
            className="lp-section ed-section"
            aria-labelledby="ed-heading"
        >
            <div className="lp-container">
                <div className="ed-topbar">
                    <div className="ed-topbar__identity">
                        <span>04</span>
                        <i aria-hidden="true" />
                        <span>PENDIDIKAN</span>
                    </div>

                    <span className="ed-topbar__meta">ACADEMIC JOURNEY</span>
                </div>

                <div className="ed-heading">
                    <div>
                        <span className="ed-heading__eyebrow">
                            LEARNING & GROWTH
                        </span>

                        <h2 id="ed-heading">
                            Jejak <span>pendidikan.</span>
                        </h2>

                        <p>
                            Setiap jenjang adalah bagian dari perjalanan belajar
                            dan berkembang.
                        </p>
                    </div>

                    <div className="ed-heading__count">
                        <strong>
                            {String(educations.length).padStart(2, "0")}
                        </strong>
                        <span>JENJANG</span>
                    </div>
                </div>

                <AcademicTimeline educations={educations} />
            </div>
        </section>
    );
}
