import RecognitionGallery from "./recognition-gallery";
import type { Achievement } from "./landing-types";

type Props = {
    achievements: Achievement[];
};

export default function AchievementsSection({ achievements }: Props) {
    if (achievements.length === 0) return null;

    return (
        <section
            id="achievements"
            className="lp-section hr-section"
            aria-labelledby="hr-heading"
        >
            <div className="lp-container">
                <div className="hr-topbar">
                    <div className="hr-topbar__identity">
                        <span>05</span>
                        <i aria-hidden="true" />
                        <span>PENCAPAIAN & APRESIASI</span>
                    </div>

                    <span className="hr-topbar__meta">HONOR REGISTER</span>
                </div>

                <header className="hr-heading">
                    <div className="hr-heading__copy">
                        <span className="hr-heading__eyebrow">
                            A RECORD OF PROGRESS
                        </span>

                        <h2 id="hr-heading">
                            Catatan <span>pencapaian.</span>
                        </h2>

                        <p>
                            Penghargaan, apresiasi, dan kontribusi yang menjadi
                            bagian dari perjalanan saya.
                        </p>
                    </div>

                    <div className="hr-heading__stat">
                        <strong>
                            {String(achievements.length).padStart(2, "0")}
                        </strong>
                        <span>TOTAL CATATAN</span>
                    </div>
                </header>

                <RecognitionGallery achievements={achievements} />
            </div>
        </section>
    );
}
