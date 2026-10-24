import { ArrowDown, ArrowUpRight, BookOpenText, ChevronDown, Hash } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import "../../../css/research-archive.css";

/** Cocok dengan data `researches` dari LandingPageController. */
export type ResearchRecord = {
    id: number;
    title: string;
    summary: string;
    year: number;
};

type Props = {
    researches: ResearchRecord[];
};

const numberLabel = (value: number) => String(value).padStart(2, "0");

/**
 * RESEARCH ARCHIVE — editorial bibliography untuk Portofolio V2.
 *
 * Semua informasi berasal dari props Laravel (tanpa DOI, tautan,
 * institusi, atau metadata publikasi yang tidak tersedia di database).
 *
 * - Filter tahun otomatis berdasarkan data.
 * - Baris ringkas yang membuka abstrak secara inline.
 * - Maksimal satu abstrak terbuka.
 * - Scroll arsip mempunyai indikator progres.
 * - Scroll reveal pada entri, mematuhi prefers-reduced-motion.
 */
export default function ResearchArchive({ researches }: Props) {
    const [year, setYear] = useState<number | "all">("all");
    const [openId, setOpenId] = useState<number | null>(null);
    const shellRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);

    const years = useMemo(
        () => [...new Set(researches.map((item) => item.year))].sort((a, b) => b - a),
        [researches],
    );

    // Urutan dari admin dipertahankan, termasuk sort_order bila tersedia.
    const items = useMemo(
        () => (year === "all" ? researches : researches.filter((item) => item.year === year)),
        [researches, year],
    );

    const changeYear = (nextYear: number | "all") => {
        setYear(nextYear);
        setOpenId(null);
        if (viewportRef.current) viewportRef.current.scrollTop = 0;
    };

    // Reveal sekali ketika komponen masuk layar; tidak menghalangi konten
    // apabila IntersectionObserver tidak tersedia atau motion dimatikan.
    useEffect(() => {
        const element = shellRef.current;
        if (!element) return;

        if (
            typeof IntersectionObserver === "undefined" ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    element.classList.add("ra-shell--entered");
                    observer.disconnect();
                }
            },
            { threshold: 0.08 },
        );

        element.classList.add("ra-shell--observed");
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    // Kemunculan entri disinkronkan dengan area scroll internal.
    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        const rows = Array.from(viewport.querySelectorAll<HTMLElement>(".ra-entry"));
        if (
            typeof IntersectionObserver === "undefined" ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
            rows.forEach((row) => row.classList.add("ra-entry--seen"));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("ra-entry--seen");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { root: viewport, threshold: 0.08 },
        );

        viewport.classList.add("ra-viewport--observed");
        rows.forEach((row) => observer.observe(row));

        return () => {
            observer.disconnect();
            viewport.classList.remove("ra-viewport--observed");
        };
    }, [items]);

    // Progres scroll pada jalur vertikal oranye; tanpa setState per frame.
    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        let frame = 0;
        const measure = () => {
            frame = 0;
            const max = viewport.scrollHeight - viewport.clientHeight;
            const progress = max > 1 ? Math.min(1, Math.max(0, viewport.scrollTop / max)) : 1;
            viewport.parentElement?.style.setProperty("--ra-progress", `${(progress * 100).toFixed(2)}%`);
        };
        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(measure);
        };

        schedule();
        const resizeObserver = new ResizeObserver(schedule);
        resizeObserver.observe(viewport);
        // Children can change height when an abstract opens.
        const list = viewport.querySelector(".ra-list");
        if (list) resizeObserver.observe(list);
        viewport.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);

        return () => {
            if (frame) cancelAnimationFrame(frame);
            resizeObserver.disconnect();
            viewport.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", schedule);
        };
    }, [items, openId]);

    return (
        <div className="ra-shell" ref={shellRef}>
            <div className="ra-masthead">
                <div className="ra-masthead__identity">
                    <span className="ra-masthead__symbol" aria-hidden="true">
                        <BookOpenText size={20} strokeWidth={1.55} />
                    </span>
                    <div className="ra-masthead__copy">
                        <span className="ra-eyebrow">ARCHIVE / 07</span>
                        <p>Arsip penelitian</p>
                    </div>
                </div>
                <div className="ra-masthead__total" aria-label={`${researches.length} penelitian tersedia`}>
                    <strong>{numberLabel(researches.length)}</strong>
                    <span>CATATAN<br />PENELITIAN</span>
                </div>
            </div>

            {researches.length > 0 ? (
                <>
                    <div className="ra-filters">
                        <div className="ra-filters__label">
                            <Hash size={13} strokeWidth={1.7} aria-hidden="true" />
                            <span>FILTER TAHUN</span>
                        </div>
                        <div className="ra-filters__scroll" role="group" aria-label="Filter penelitian berdasarkan tahun">
                            <button
                                type="button"
                                className={`ra-filter${year === "all" ? " ra-filter--active" : ""}`}
                                aria-pressed={year === "all"}
                                onClick={() => changeYear("all")}
                            >
                                Semua <span>{numberLabel(researches.length)}</span>
                            </button>
                            {years.map((itemYear) => (
                                <button
                                    type="button"
                                    key={itemYear}
                                    className={`ra-filter${year === itemYear ? " ra-filter--active" : ""}`}
                                    aria-pressed={year === itemYear}
                                    onClick={() => changeYear(itemYear)}
                                >
                                    {itemYear}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="ra-headline" aria-hidden="true">
                        <span>NO.</span>
                        <span>JUDUL PENELITIAN</span>
                        <span>TAHUN</span>
                        <span />
                    </div>

                    <div className="ra-index">
                        <div className="ra-index__track" aria-hidden="true">
                            <span className="ra-index__progress" />
                        </div>
                        <div
                            ref={viewportRef}
                            className="ra-viewport"
                            role="region"
                            aria-label="Daftar penelitian, dapat digulir"
                            tabIndex={0}
                        >
                            <div className="ra-list">
                                {items.map((item, index) => {
                                    const expanded = openId === item.id;
                                    const detailId = `ra-abstract-${item.id}`;
                                    const summary = item.summary?.trim() || "Ringkasan penelitian belum tersedia.";
                                    return (
                                        <article
                                            className={`ra-entry${expanded ? " ra-entry--expanded" : ""}`}
                                            key={item.id}
                                        >
                                            <button
                                                type="button"
                                                className="ra-entry__trigger"
                                                aria-expanded={expanded}
                                                aria-controls={detailId}
                                                onClick={() => setOpenId(expanded ? null : item.id)}
                                            >
                                                <span className="ra-entry__number">{numberLabel(index + 1)}</span>
                                                <span className="ra-entry__main">
                                                    <span className="ra-entry__title">{item.title}</span>
                                                    <span className="ra-entry__teaser">{summary}</span>
                                                </span>
                                                <span className="ra-entry__year">{item.year}</span>
                                                <span className="ra-entry__toggle" aria-hidden="true">
                                                    <ChevronDown size={17} strokeWidth={1.8} />
                                                </span>
                                            </button>
                                            <div className="ra-entry__reveal" id={detailId} aria-hidden={!expanded}>
                                                <div className="ra-entry__reveal-clip">
                                                    <div className="ra-entry__abstract">
                                                        <div className="ra-entry__abstract-head">
                                                            <span>RINGKASAN PENELITIAN</span>
                                                            <span>{item.year} / {numberLabel(index + 1)}</span>
                                                        </div>
                                                        <p>{summary}</p>
                                                        <span className="ra-entry__endmark" aria-hidden="true" />
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="ra-footer">
                        <span className="ra-footer__count">
                            <span className="ra-footer__live-dot" aria-hidden="true" />
                            {items.length} dari {researches.length} penelitian
                        </span>
                        <span className="ra-footer__hint">
                            <ArrowDown size={13} strokeWidth={1.6} aria-hidden="true" />
                            Gulir daftar dan pilih judul untuk membaca ringkasan
                        </span>
                        <span className="ra-footer__mark" aria-hidden="true">
                            <ArrowUpRight size={16} strokeWidth={1.7} />
                        </span>
                    </div>
                </>
            ) : (
                <div className="ra-empty">
                    <BookOpenText size={25} strokeWidth={1.4} aria-hidden="true" />
                    <p>Penelitian belum ditambahkan.</p>
                </div>
            )}
        </div>
    );
}
