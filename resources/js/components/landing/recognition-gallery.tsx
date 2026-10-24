import {
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    Award,
    Building2,
    CalendarDays,
    ChevronRight,
    Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";

import "../../../css/recognition-gallery.css";

/** Sesuai props `achievements` dari LandingPageController. */
export type Recognition = {
    id: number;
    category: string;
    title: string;
    description: string | null;
    year: number;
    institution_name: string | null;
};

type Props = {
    achievements: Recognition[];
};

function HonorEmblem() {
    return (
        <svg
            className="rg-emblem"
            viewBox="0 0 210 210"
            aria-hidden="true"
            focusable="false"
        >
            <defs>
                <linearGradient id="rg-metal-gradient" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0" stopColor="#ffebc0" />
                    <stop offset=".22" stopColor="#c99859" />
                    <stop offset=".55" stopColor="#f4d6a0" />
                    <stop offset=".8" stopColor="#977045" />
                    <stop offset="1" stopColor="#e4ba7a" />
                </linearGradient>
                <linearGradient id="rg-ribbon-gradient" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0" stopColor="#9c6c43" />
                    <stop offset=".55" stopColor="#44352e" />
                    <stop offset="1" stopColor="#c39159" />
                </linearGradient>
                <radialGradient id="rg-medal-face" cx=".36" cy=".28" r=".8">
                    <stop offset="0" stopColor="#47382a" />
                    <stop offset=".78" stopColor="#252321" />
                    <stop offset="1" stopColor="#15171a" />
                </radialGradient>
            </defs>

            {/* Dua pita jatuh dari bagian bawah medali. */}
            <path
                d="M72 132 L64 198 L83 185 L101 200 L107 145 Z"
                fill="url(#rg-ribbon-gradient)"
                stroke="#b68d5c"
                strokeWidth="1.2"
            />
            <path
                d="M105 145 L118 199 L133 184 L155 193 L138 131 Z"
                fill="url(#rg-ribbon-gradient)"
                stroke="#b68d5c"
                strokeWidth="1.2"
            />

            <circle cx="105" cy="93" r="79" fill="#17191c" stroke="#7e633f" strokeWidth="1" />
            <circle cx="105" cy="93" r="72" fill="url(#rg-metal-gradient)" />
            <circle cx="105" cy="93" r="63.5" fill="url(#rg-medal-face)" stroke="#573e2b" strokeWidth="1.5" />
            <circle cx="105" cy="93" r="55.5" fill="none" stroke="#d3aa73" strokeWidth=".9" opacity=".75" strokeDasharray="2.1 4.5" />
            <circle cx="105" cy="93" r="47" fill="none" stroke="#92714b" strokeWidth=".8" opacity=".55" />

            {/* Daun laurel di sisi kiri dan kanan. */}
            <g stroke="#d1a66b" fill="none" strokeWidth="2.4" strokeLinecap="round">
                <path d="M72 120 C52 107 52 78 70 63" />
                <path d="M138 120 C158 107 158 78 140 63" />
            </g>
            <g fill="#cba06d" opacity=".92">
                <ellipse cx="61" cy="111" rx="4" ry="8" transform="rotate(-43 61 111)" />
                <ellipse cx="56" cy="96" rx="4" ry="8" transform="rotate(-22 56 96)" />
                <ellipse cx="58" cy="81" rx="4" ry="8" transform="rotate(11 58 81)" />
                <ellipse cx="67" cy="69" rx="4" ry="8" transform="rotate(38 67 69)" />
                <ellipse cx="149" cy="111" rx="4" ry="8" transform="rotate(43 149 111)" />
                <ellipse cx="154" cy="96" rx="4" ry="8" transform="rotate(22 154 96)" />
                <ellipse cx="152" cy="81" rx="4" ry="8" transform="rotate(-11 152 81)" />
                <ellipse cx="143" cy="69" rx="4" ry="8" transform="rotate(-38 143 69)" />
            </g>

            {/* Starburst berlapis emboss. */}
            <path
                d="M105 53 L114 77 L139 78 L119 94 L126 118 L105 104 L84 118 L91 94 L71 78 L96 77 Z"
                fill="url(#rg-metal-gradient)"
                stroke="#ffdfaa"
                strokeWidth=".8"
                strokeLinejoin="round"
            />
            <path
                d="M105 68 L110 82 L125 83 L113 92 L117 107 L105 99 L93 107 L97 92 L85 83 L100 82 Z"
                fill="#332a25"
                opacity=".92"
            />
            <circle cx="105" cy="91" r="5.3" fill="#e1b579" />
            <path d="M92 128 L118 128" stroke="#ac8454" strokeWidth="1" strokeLinecap="round" />
        </svg>
    );
}

/**
 * Galeri penghargaan: pilihan arsip di kanan, pencapaian terpilih di panggung.
 * - Tanpa dependency animasi baru.
 * - Scroll daftar secara vertikal, tinggi tetap meskipun datanya banyak.
 * - Detail tidak dipotong; semua konten terpilih bisa dibaca.
 * - Reduced-motion dan keyboard navigation didukung.
 */
export default function RecognitionGallery({ achievements }: Props) {
    const [selectedId, setSelectedId] = useState<number | null>(
        achievements[0]?.id ?? null,
    );
    const shellRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const buttonsRef = useRef<Array<HTMLButtonElement | null>>([]);

    const selectedIndex = Math.max(
        0,
        achievements.findIndex((achievement) => achievement.id === selectedId),
    );
    const selected = achievements[selectedIndex];
    const count = achievements.length;

    // Masuk viewport: reveal sekali saja. CSS tetap terbaca bila observer tidak tersedia.
    useEffect(() => {
        const shell = shellRef.current;
        if (!shell || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return;
        }
        if (!("IntersectionObserver" in window)) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) {
                    shell.classList.add("rg-shell--visible");
                    observer.disconnect();
                }
            },
            { threshold: 0.1, rootMargin: "0px 0px -4% 0px" },
        );
        shell.classList.add("rg-shell--enhanced");
        observer.observe(shell);
        return () => observer.disconnect();
    }, []);

    // Indikator kecil di sisi daftar bergerak mengikuti scroll daftar.
    useEffect(() => {
        const list = listRef.current;
        if (!list) return;
        let frame = 0;

        const update = () => {
            frame = 0;
            const max = Math.max(0, list.scrollHeight - list.clientHeight);
            const progress = max > 0 ? list.scrollTop / max : 0;
            list.parentElement?.style.setProperty("--rg-list-scroll", `${(progress * 100).toFixed(2)}%`);
        };

        const scheduleUpdate = () => {
            if (!frame) frame = window.requestAnimationFrame(update);
        };

        const resizeObserver = new ResizeObserver(scheduleUpdate);
        resizeObserver.observe(list);
        list.addEventListener("scroll", scheduleUpdate, { passive: true });
        window.addEventListener("resize", scheduleUpdate);
        update();

        return () => {
            if (frame) window.cancelAnimationFrame(frame);
            resizeObserver.disconnect();
            list.removeEventListener("scroll", scheduleUpdate);
            window.removeEventListener("resize", scheduleUpdate);
        };
    }, [count]);

    if (!selected) return null;

    const select = (index: number, focus = false) => {
        const safeIndex = Math.max(0, Math.min(index, achievements.length - 1));
        const item = achievements[safeIndex];
        if (!item) return;
        setSelectedId(item.id);

        const list = listRef.current;
        const button = buttonsRef.current[safeIndex];
        if (list && button) {
            // Scroll hanya area arsip, tidak menggeser seluruh halaman.
            const listBounds = list.getBoundingClientRect();
            const itemBounds = button.getBoundingClientRect();
            const padding = 12;
            const topOverflow = itemBounds.top - listBounds.top - padding;
            const bottomOverflow = itemBounds.bottom - listBounds.bottom + padding;
            const nextTop =
                topOverflow < 0
                    ? list.scrollTop + topOverflow
                    : bottomOverflow > 0
                      ? list.scrollTop + bottomOverflow
                      : list.scrollTop;
            if (nextTop !== list.scrollTop) {
                list.scrollTo({
                    top: nextTop,
                    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                        ? "auto"
                        : "smooth",
                });
            }
            if (focus) button.focus({ preventScroll: true });
        }
    };

    const moveSelection = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
        let next: number;
        switch (event.key) {
            case "ArrowDown":
                next = Math.min(count - 1, index + 1);
                break;
            case "ArrowUp":
                next = Math.max(0, index - 1);
                break;
            case "Home":
                next = 0;
                break;
            case "End":
                next = count - 1;
                break;
            default:
                return;
        }
        event.preventDefault();
        select(next, true);
    };

    const updateSpotlight = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (event.pointerType === "touch") return;
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width) * 100;
        const y = ((event.clientY - bounds.top) / bounds.height) * 100;
        event.currentTarget.style.setProperty("--rg-pointer-x", `${x.toFixed(1)}%`);
        event.currentTarget.style.setProperty("--rg-pointer-y", `${y.toFixed(1)}%`);
    };

    return (
        <div className="rg-shell" ref={shellRef}>
            {/* Spotlight: isi berganti ketika penghargaan dipilih. */}
            <div className="rg-feature" onPointerMove={updateSpotlight}>
                <div className="rg-feature__top">
                    <div className="rg-feature__brand">
                        <span className="rg-feature__brand-mark"><Sparkles size={15} aria-hidden="true" /></span>
                        <span>THE RECOGNITION EDITION</span>
                    </div>
                    <span className="rg-feature__serial">NO. {String(selectedIndex + 1).padStart(2, "0")}</span>
                </div>

                <div className="rg-feature__art" aria-hidden="true">
                    <span className="rg-feature__orbit rg-feature__orbit--outer" />
                    <span className="rg-feature__orbit rg-feature__orbit--inner" />
                    <span className="rg-feature__art-ray" />
                    <HonorEmblem />
                    <span className="rg-feature__art-caption">MERIT · ACHIEVEMENT · IMPACT</span>
                </div>

                <div className="rg-feature__copy" key={selected.id} aria-live="polite" aria-atomic="true">
                    <div className="rg-feature__eyebrow">
                        <span className="rg-feature__category">{selected.category || "Pencapaian"}</span>
                        <span className="rg-feature__year"><CalendarDays size={13} aria-hidden="true" />{selected.year}</span>
                    </div>
                    <h3>{selected.title}</h3>
                    {selected.institution_name && (
                        <p className="rg-feature__issuer">
                            <Building2 size={15} aria-hidden="true" />
                            <span>{selected.institution_name}</span>
                        </p>
                    )}
                    {selected.description?.trim() && (
                        <p className="rg-feature__description">{selected.description}</p>
                    )}
                </div>

                <div className="rg-feature__bottom">
                    <div className="rg-feature__pagination" aria-label={`Pencapaian ${selectedIndex + 1} dari ${count}`}>
                        <span>{String(selectedIndex + 1).padStart(2, "0")}</span>
                        <span className="rg-feature__pagination-line" />
                        <span>{String(count).padStart(2, "0")}</span>
                    </div>
                    <span className="rg-feature__bottom-text">A STORY OF PROGRESS</span>
                </div>
            </div>

            {/* Archive: tombol-tombol ringkas, daftar scroll di dalam panel. */}
            <div className="rg-archive">
                <div className="rg-archive__head">
                    <div>
                        <span className="rg-overline">EXPLORE THE ARCHIVE</span>
                        <h3>Jejak pencapaian<span>.</span></h3>
                    </div>
                    <span className="rg-archive__count">{String(count).padStart(2, "0")}</span>
                </div>

                <div className="rg-archive__hint"><ArrowDown size={14} aria-hidden="true" /> Pilih atau scroll daftar pencapaian</div>

                <div className="rg-archive__body">
                    <span className="rg-archive__track" aria-hidden="true"><span /></span>
                    <div className="rg-archive__viewport" ref={listRef} role="region" aria-label="Daftar pencapaian dan apresiasi" tabIndex={0}>
                        <ol className="rg-archive__items">
                            {achievements.map((item, index) => {
                                const active = index === selectedIndex;
                                return (
                                    <li key={item.id} className="rg-archive__list-item">
                                        <button
                                            ref={(node) => { buttonsRef.current[index] = node; }}
                                            type="button"
                                            className={`rg-archive__item${active ? " rg-archive__item--active" : ""}`}
                                            aria-pressed={active}
                                            aria-label={`Pilih ${item.title}, ${item.year}`}
                                            onClick={() => select(index)}
                                            onKeyDown={(event) => moveSelection(event, index)}
                                        >
                                            <span className="rg-archive__item-index">{String(index + 1).padStart(2, "0")}</span>
                                            <span className="rg-archive__item-copy">
                                                <span className="rg-archive__item-category">{item.category || "Pencapaian"} <span>·</span> {item.year}</span>
                                                <strong>{item.title}</strong>
                                                {item.institution_name && <small>{item.institution_name}</small>}
                                            </span>
                                            <span className="rg-archive__item-arrow"><ChevronRight size={17} aria-hidden="true" /></span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ol>
                    </div>
                </div>

                <div className="rg-archive__footer">
                    <span><Award size={14} aria-hidden="true" /> {count} pencapaian tercatat</span>
                    <div className="rg-archive__controls" aria-label="Navigasi pencapaian">
                        <button type="button" onClick={() => select(selectedIndex - 1, true)} disabled={selectedIndex === 0} aria-label="Pencapaian sebelumnya">
                            <ArrowLeft size={16} aria-hidden="true" />
                        </button>
                        <button type="button" onClick={() => select(selectedIndex + 1, true)} disabled={selectedIndex === count - 1} aria-label="Pencapaian berikutnya">
                            <ArrowRight size={16} aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
