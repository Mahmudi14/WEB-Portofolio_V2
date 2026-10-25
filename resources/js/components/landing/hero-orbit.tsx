
import {
    BrainCircuit,
    Code2,
    Cpu,
    Database,
    FlaskConical,
} from "lucide-react";

import { useRef } from "react";
import type { PointerEvent } from "react";

import "../../../css/hero-orbit.css";
import "../../../css/hero-orbit-mobile.css";

type Props = {
    name: string;
    photoUrl: string | null;
};

const disciplines = [
    {
        label: "Software Development",
        icon: Code2,
        className: "po-node--development",
    },
    {
        label: "Research",
        icon: FlaskConical,
        className: "po-node--research",
    },
    {
        label: "Artificial Intelligence",
        icon: BrainCircuit,
        className: "po-node--ai",
    },
    {
        label: "Data Mining",
        icon: Database,
        className: "po-node--data",
    },
    {
        label: "IoT Systems",
        icon: Cpu,
        className: "po-node--iot",
    },
];

export default function HeroOrbit({ name, photoUrl }: Props) {
    const stageRef = useRef<HTMLDivElement>(null);

    const initials = name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join("")
        .toUpperCase();

    const wordmark =
        name.trim().split(/\s+/)[0]?.toUpperCase() ||
        "PORTFOLIO";

    const handlePointerMove = (
        event: PointerEvent<HTMLDivElement>,
    ) => {
        if (event.pointerType !== "mouse") return;

        const stage = stageRef.current;
        if (!stage) return;

        const rect = stage.getBoundingClientRect();

        if (!rect.width || !rect.height) return;

        const x =
            (event.clientX - rect.left) / rect.width - 0.5;

        const y =
            (event.clientY - rect.top) / rect.height - 0.5;

        stage.style.setProperty(
            "--po-shift-x",
            `${(x * 12).toFixed(2)}px`,
        );

        stage.style.setProperty(
            "--po-shift-y",
            `${(y * 10).toFixed(2)}px`,
        );
    };

    const handlePointerLeave = () => {
        const stage = stageRef.current;
        if (!stage) return;

        stage.style.setProperty("--po-shift-x", "0px");
        stage.style.setProperty("--po-shift-y", "0px");
    };

    return (
        <div className="po-visual">
            <div
                ref={stageRef}
                className="po-stage"
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
                role="group"
                aria-label={`Foto ${name} dan bidang keahlian`}
            >
                {/* ORBIT RINGS */}
                <div
                    className="po-ring po-ring--outer"
                    aria-hidden="true"
                />

                <div
                    className="po-ring po-ring--inner"
                    aria-hidden="true"
                />

                <div
                    className="po-ring po-ring--detail"
                    aria-hidden="true"
                />

                {/* NAME BEHIND THE PORTRAIT */}
                <div
                    className="po-wordmark"
                    aria-hidden="true"
                >
                    <span className="po-wordmark__primary">
                        {wordmark}
                    </span>

                    <span className="po-wordmark__secondary">
                        SOFTWARE · AI · RESEARCH
                    </span>
                </div>

                {/* DESKTOP — FULL ORBIT LABELS */}
                <div
                    className="po-disciplines"
                    role="list"
                    aria-label="Bidang keahlian"
                >
                    {disciplines.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={item.label}
                                className={`po-node ${item.className}`}
                                role="listitem"
                            >
                                <div className="po-node__track">
                                    <div className="po-node__face">
                                        <div className="po-node__chip">
                                            <span className="po-node__icon">
                                                <Icon
                                                    size={16}
                                                    strokeWidth={1.75}
                                                    aria-hidden="true"
                                                />
                                            </span>

                                            <span className="po-node__label">
                                                {item.label}
                                            </span>

                                            <span className="po-node__number">
                                                {String(index + 1).padStart(2, "0")}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* MOBILE — SMALL FLOATING ICONS */}
                <div
                    className="po-mobile-satellites"
                    aria-hidden="true"
                >
                    {disciplines.map((item) => {
                        const Icon = item.icon;

                        return (
                            <span
                                key={item.label}
                                className={[
                                    "po-mobile-satellite",
                                    `po-mobile-satellite--${item.className.replace("po-node--", "")}`,
                                ].join(" ")}
                            >
                                <Icon
                                    size={20}
                                    strokeWidth={1.7}
                                />
                            </span>
                        );
                    })}
                </div>

                {/* CENTER PHOTO */}
                <div className="po-portrait">
                    <div className="po-portrait__frame">
                        <div className="po-portrait__image">
                            {photoUrl ? (
                                <img
                                    src={photoUrl}
                                    alt={`Foto ${name}`}
                                    loading="eager"
                                    decoding="async"
                                    draggable={false}
                                />
                            ) : (
                                <span className="po-portrait__fallback">
                                    {initials || "M"}
                                </span>
                            )}
                        </div>

                        <span
                            className="po-portrait__shade"
                            aria-hidden="true"
                        />

                        <span
                            className="po-portrait__accent"
                            aria-hidden="true"
                        />
                    </div>
                </div>

                {/* DESKTOP DETAILS */}
                <span
                    className="po-stage__coordinate po-stage__coordinate--bottom"
                    aria-hidden="true"
                >
                    ALWAYS LEARNING
                </span>
            </div>

            {/* MOBILE — CLEAN SKILL DIRECTORY */}
            <div className="po-mobile-expertise">
                <div className="po-mobile-expertise__heading">
                    <span className="po-mobile-expertise__line" />
                    <span>BIDANG YANG SAYA TEKUNI</span>
                </div>

                <ul className="po-mobile-expertise__grid">
                    {disciplines.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <li
                                key={item.label}
                                className="po-mobile-expertise__item"
                            >
                                <span className="po-mobile-expertise__icon">
                                    <Icon
                                        size={17}
                                        strokeWidth={1.7}
                                        aria-hidden="true"
                                    />
                                </span>

                                <span className="po-mobile-expertise__label">
                                    {item.label}
                                </span>

                                <span className="po-mobile-expertise__number">
                                    {String(index + 1).padStart(2, "0")}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* DESKTOP FOOTER */}
            <div className="po-visual__bottom">
                <span>05 / CORE DISCIPLINES</span>
                <span>DESIGN · BUILD · EXPLORE</span>
            </div>
        </div>
    );
}
