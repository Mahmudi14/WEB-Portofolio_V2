import { Plus } from "lucide-react";

import { useEffect, useMemo, useRef, useState } from "react";

import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import type { Achievement } from "./landing-types";

import "../../../css/recognition-gallery.css";

type Props = {
    achievements: Achievement[];
};

type AchievementGroup = {
    key: string;
    label: string;
    items: Achievement[];
};

function getCategoryLabel(category: string | null | undefined) {
    return (category || "").trim().replace(/\s+/g, " ") || "Lainnya";
}

function getCategoryKey(category: string | null | undefined) {
    return getCategoryLabel(category).toLocaleLowerCase("id-ID");
}

function groupAchievements(achievements: Achievement[]): AchievementGroup[] {
    const groups = new Map<string, AchievementGroup>();

    achievements.forEach((achievement) => {
        const label = getCategoryLabel(achievement.category);
        const key = getCategoryKey(achievement.category);

        if (!groups.has(key)) {
            groups.set(key, {
                key,
                label,
                items: [],
            });
        }

        groups.get(key)?.items.push(achievement);
    });

    return Array.from(groups.values()).map((group) => ({
        ...group,
        items: [...group.items].sort((a, b) => b.year - a.year || b.id - a.id),
    }));
}

export default function RecognitionGallery({ achievements }: Props) {
    const registerRef = useRef<HTMLDivElement>(null);
    const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

    const groups = useMemo(
        () => groupAchievements(achievements),
        [achievements],
    );

    const [selectedKey, setSelectedKey] = useState<string>(() =>
        getCategoryKey(achievements[0]?.category),
    );

    const [expandedId, setExpandedId] = useState<number | null>(null);

    const activeGroup =
        groups.find((group) => group.key === selectedKey) ?? groups[0];

    const activeIndex = groups.findIndex(
        (group) => group.key === activeGroup?.key,
    );

    // ========================================
    // CHANGE CATEGORY
    // ========================================

    function selectCategory(key: string) {
        if (key === activeGroup?.key) return;

        setSelectedKey(key);
        setExpandedId(null);
    }

    // ========================================
    // KEYBOARD NAVIGATION
    // ========================================

    function handleTabKeyDown(
        event: ReactKeyboardEvent<HTMLButtonElement>,
        index: number,
    ) {
        let nextIndex = index;

        switch (event.key) {
            case "ArrowRight":
                nextIndex = (index + 1) % groups.length;
                break;

            case "ArrowLeft":
                nextIndex = (index - 1 + groups.length) % groups.length;
                break;

            case "Home":
                nextIndex = 0;
                break;

            case "End":
                nextIndex = groups.length - 1;
                break;

            default:
                return;
        }

        event.preventDefault();

        const nextGroup = groups[nextIndex];
        if (!nextGroup) return;

        selectCategory(nextGroup.key);

        tabRefs.current[nextIndex]?.focus();
    }

    // ========================================
    // SUBTLE REVEAL — ONCE
    // ========================================

    useEffect(() => {
        const element = registerRef.current;

        if (
            !element ||
            !("IntersectionObserver" in window) ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries, currentObserver) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    element.classList.add("hr-register--visible");

                    currentObserver.unobserve(entry.target);
                });
            },
            {
                threshold: 0.08,
                rootMargin: "0px 0px -20px 0px",
            },
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    if (!activeGroup) return null;

    return (
        <div ref={registerRef} className="hr-register">
            {/* CATEGORY NAVIGATION */}
            <div className="hr-navigation">
                <div
                    className="hr-tabs"
                    role="tablist"
                    aria-label="Kategori pencapaian"
                >
                    {groups.map((group, index) => {
                        const isSelected = group.key === activeGroup.key;

                        return (
                            <button
                                key={group.key}
                                ref={(element) => {
                                    tabRefs.current[index] = element;
                                }}
                                id={`hr-tab-${index}`}
                                type="button"
                                role="tab"
                                aria-selected={isSelected}
                                aria-controls="hr-category-panel"
                                tabIndex={isSelected ? 0 : -1}
                                className={
                                    "hr-tab" +
                                    (isSelected ? " hr-tab--active" : "")
                                }
                                onClick={() => selectCategory(group.key)}
                                onKeyDown={(event) =>
                                    handleTabKeyDown(event, index)
                                }
                            >
                                <span className="hr-tab__label">
                                    {group.label}
                                </span>

                                <span className="hr-tab__count">
                                    {String(group.items.length).padStart(
                                        2,
                                        "0",
                                    )}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ACTIVE CATEGORY */}
            <div
                id="hr-category-panel"
                className="hr-panel"
                role="tabpanel"
                aria-labelledby={`hr-tab-${activeIndex}`}
                tabIndex={0}
            >
                <div className="hr-panel__heading">
                    <div className="hr-panel__identity">
                        <span className="hr-panel__index">
                            {String(activeIndex + 1).padStart(2, "0")}
                            {" / "}
                            {String(groups.length).padStart(2, "0")}
                        </span>

                        <h3>{activeGroup.label}</h3>
                    </div>

                    <span className="hr-panel__total">
                        {String(activeGroup.items.length).padStart(2, "0")}{" "}
                        CATATAN
                    </span>
                </div>

                {/* ACHIEVEMENT LIST */}
                <ol key={activeGroup.key} className="hr-list">
                    {activeGroup.items.map((achievement, index) => {
                        const isOpen = expandedId === achievement.id;

                        const triggerId = `hr-trigger-${achievement.id}`;

                        const detailId = `hr-detail-${achievement.id}`;

                        return (
                            <li
                                key={achievement.id}
                                className={
                                    "hr-item" + (isOpen ? " hr-item--open" : "")
                                }
                            >
                                <article className="hr-entry">
                                    <h4 className="hr-entry__heading">
                                        <button
                                            id={triggerId}
                                            type="button"
                                            className="hr-entry__trigger"
                                            aria-expanded={isOpen}
                                            aria-controls={detailId}
                                            onClick={() =>
                                                setExpandedId((current) =>
                                                    current === achievement.id
                                                        ? null
                                                        : achievement.id,
                                                )
                                            }
                                        >
                                            <span className="hr-entry__year">
                                                {achievement.year}
                                            </span>

                                            <span className="hr-entry__copy">
                                                <strong className="hr-entry__title">
                                                    {achievement.title}
                                                </strong>

                                                {achievement.institution_name && (
                                                    <span className="hr-entry__institution">
                                                        {
                                                            achievement.institution_name
                                                        }
                                                    </span>
                                                )}
                                            </span>

                                            <span
                                                className="hr-entry__toggle"
                                                aria-hidden="true"
                                            >
                                                <Plus
                                                    size={18}
                                                    strokeWidth={1.6}
                                                />
                                            </span>
                                        </button>
                                    </h4>

                                    {/* EXPANDABLE DESCRIPTION */}
                                    <div
                                        id={detailId}
                                        className="hr-entry__collapse"
                                        role="region"
                                        aria-labelledby={triggerId}
                                        aria-hidden={!isOpen}
                                    >
                                        <div className="hr-entry__collapse-inner">
                                            <div className="hr-entry__detail">
                                                <span className="hr-entry__detail-label">
                                                    TENTANG PENCAPAIAN
                                                </span>

                                                <p>
                                                    {achievement.description?.trim() ||
                                                        "Deskripsi pencapaian belum tersedia."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            </li>
                        );
                    })}
                </ol>

                {/* ARCHIVE FOOTER */}
                <div className="hr-footer">
                    <span>
                        {activeGroup.items.length} pencapaian dalam kategori ini
                    </span>

                    <span className="hr-footer__note">
                        DIURUTKAN BERDASARKAN TAHUN
                    </span>
                </div>
            </div>
        </div>
    );
}
