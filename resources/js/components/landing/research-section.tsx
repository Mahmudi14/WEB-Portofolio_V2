import ResearchArchive from "./research-archive";
import type { Research } from "./landing-types";

type Props = {
    researches: Research[];
};

export default function ResearchSection({ researches }: Props) {
    if (researches.length === 0) return null;

    return (
        <section
            id="research"
            className="lp-section rj-section"
            aria-labelledby="rj-heading"
        >
            <div className="lp-container">
                <div className="rj-topbar">
                    <div className="rj-topbar__identity">
                        <span className="rj-topbar__number">07</span>
                        <span className="rj-topbar__line" />
                        <span>PENELITIAN</span>
                    </div>

                    <span className="rj-topbar__meta">RESEARCH JOURNAL</span>
                </div>

                <header className="rj-heading">
                    <div className="rj-heading__content">
                        <span className="rj-heading__eyebrow">
                            ACADEMIC RECORDS
                        </span>

                        <h2 id="rj-heading">
                            Penelitian<span>.</span>
                        </h2>

                        <p>
                            Dokumentasi kajian, proses, dan hasil penelitian
                            yang telah saya kerjakan.
                        </p>
                    </div>

                    <div className="rj-heading__count">
                        <strong>
                            {String(researches.length).padStart(2, "0")}
                        </strong>
                        <span>TOTAL PENELITIAN</span>
                    </div>
                </header>

                <ResearchArchive researches={researches} />
            </div>
        </section>
    );
}
