import ProjectShowcase from "./project-showcase";
import type { Project } from "./landing-types";

import "../../../css/project-showcase.css";

type Props = {
    projects: Project[];
};

export default function ProjectsSection({ projects }: Props) {
    return (
        <section
            id="projects"
            className="lp-section pg-section"
            aria-labelledby="pg-heading"
        >
            <div className="lp-container">
                <div className="pg-topbar">
                    <div className="pg-topbar__identity">
                        <span>06</span>
                        <i aria-hidden="true" />
                        <span>PROYEK</span>
                    </div>

                    <span className="pg-topbar__meta">PROJECT GALLERY</span>
                </div>

                <header className="pg-heading">
                    <div>
                        <span className="pg-heading__eyebrow">
                            SELECTED WORKS
                        </span>

                        <h2 id="pg-heading">
                            Proyek yang <span>saya kerjakan.</span>
                        </h2>

                        <p>
                            Kumpulan proyek dan solusi digital yang telah saya
                            kembangkan.
                        </p>
                    </div>

                    <div className="pg-heading__count">
                        <strong>
                            {String(projects.length).padStart(2, "0")}
                        </strong>
                        <span>TOTAL PROYEK</span>
                    </div>
                </header>

                <ProjectShowcase projects={projects} />
            </div>
        </section>
    );
}
