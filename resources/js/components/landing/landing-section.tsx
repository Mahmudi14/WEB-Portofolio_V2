import type { ReactNode } from "react";

export function SectionHeading({
    index,
    eyebrow,
    title,
    description,
}: {
    index: string;
    eyebrow: string;
    title: string;
    description?: string;
}) {
    return (
        <div className="lp-section-heading">
            <div className="lp-section-heading__top">
                <span>
                    {index} / {eyebrow}
                </span>
                <span className="lp-section-heading__line" />
            </div>

            <h2>{title}</h2>

            {description && <p>{description}</p>}
        </div>
    );
}

export function Section({
    id,
    children,
    alternate = false,
}: {
    id: string;
    children: ReactNode;
    alternate?: boolean;
}) {
    return (
        <section
            id={id}
            className={
                "lp-section" + (alternate ? " lp-section--alternate" : "")
            }
        >
            <div className="lp-container">{children}</div>
        </section>
    );
}
