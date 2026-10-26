import { ArrowLeft, ArrowRight, ChevronDown, Plus } from "lucide-react";

import { useEffect, useMemo, useRef, useState } from "react";

import type { Research } from "./landing-types";

import "../../../css/research-archive.css";

type Props = {
    researches: Research[];
};

type YearFilter = number | "all";
type PageItem = number | "dots";

const PAGE_SIZE = 5;

const twoDigits = (value: number) => String(value).padStart(2, "0");

function getSummary(research: Research) {
    return research.summary?.trim() || "Ringkasan penelitian belum tersedia.";
}

/**
 * Pagination ringkas.
 * Contoh: 1 2 ... 8 9 10 ... 20
 */
function getPageItems(totalPages: number, currentPage: number): PageItem[] {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const candidates = new Set([
        1,
        2,
        totalPages - 1,
        totalPages,
        currentPage - 1,
        currentPage,
        currentPage + 1,
    ]);

    const pages = Array.from(candidates)
        .filter((number) => number >= 1 && number <= totalPages)
        .sort((a, b) => a - b);

    const result: PageItem[] = [];

    pages.forEach((number, index) => {
        const previous = pages[index - 1];

        if (previous !== undefined && number - previous > 1) {
            result.push("dots");
        }

        result.push(number);
    });

    return result;
}

export default function ResearchArchive({ researches }: Props) {
    const journalRef = useRef<HTMLDivElement>(null);
    const listStartRef = useRef<HTMLDivElement>(null);

    const [selectedYear, setSelectedYear] = useState<YearFilter>("all");

    const [page, setPage] = useState(1);

    const [openId, setOpenId] = useState<number | null>(null);

    const [featuredExpanded, setFeaturedExpanded] = useState(false);

    // ============================================
    // SORT RESEARCH BY LATEST YEAR
    // ============================================

    const ordered = useMemo(
        () => [...researches].sort((a, b) => b.year - a.year || b.id - a.id),
        [researches],
    );

    // Penelitian pertama menjadi featured.
    // Tidak ditampilkan ulang di arsip.
    const featured = ordered[0];

    const archive = ordered.slice(1);

    // ============================================
    // AUTOMATIC YEAR FILTER
    // ============================================

    const years = useMemo(
        () =>
            Array.from(new Set(archive.map((item) => item.year))).sort(
                (a, b) => b - a,
            ),
        [archive],
    );

    const activeYear: YearFilter =
        selectedYear === "all" || years.includes(selectedYear)
            ? selectedYear
            : "all";

    const filteredRecords =
        activeYear === "all"
            ? archive
            : archive.filter((item) => item.year === activeYear);

    // ============================================
    // PAGINATION
    // ============================================

    const totalPages = Math.max(
        1,
        Math.ceil(filteredRecords.length / PAGE_SIZE),
    );

    const currentPage = Math.min(Math.max(page, 1), totalPages);

    const startIndex = (currentPage - 1) * PAGE_SIZE;

    const visibleRecords = filteredRecords.slice(
        startIndex,
        startIndex + PAGE_SIZE,
    );

    function changeYear(nextYear: YearFilter) {
        if (nextYear === activeYear) return;

        setSelectedYear(nextYear);
        setPage(1);
        setOpenId(null);
    }

    function changePage(nextPage: number) {
        if (nextPage < 1 || nextPage > totalPages || nextPage === currentPage) {
            return;
        }

        setPage(nextPage);
        setOpenId(null);

        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;

        listStartRef.current?.scrollIntoView({
            behavior: reducedMotion ? "auto" : "smooth",
            block: "start",
        });
    }

    function toggleRecord(id: number) {
        setOpenId((current) => (current === id ? null : id));
    }

    // ============================================
    // REVEAL ONCE WHEN ENTERING VIEWPORT
    // ============================================

    useEffect(() => {
        const journal = journalRef.current;

        if (
            !journal ||
            !("IntersectionObserver" in window) ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries, currentObserver) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    journal.classList.add("rj-journal--entered");

                    currentObserver.unobserve(entry.target);
                });
            },
            {
                threshold: 0.06,
                rootMargin: "0px 0px -20px 0px",
            },
        );

        observer.observe(journal);

        return () => observer.disconnect();
    }, []);

    if (!featured) return null;

    const featuredSummary = getSummary(featured);

    return (
        <div ref={journalRef} className="rj-journal">
            {/* ===================================
                FEATURED RESEARCH
            =================================== */}

            <article className="rj-feature">
                <div className="rj-feature__identity">
                    <span className="rj-feature__label">
                        LATEST RESEARCH / 01
                    </span>

                    <strong className="rj-feature__year">
                        {featured.year}
                    </strong>

                    <span className="rj-feature__type">RESEARCH RECORD</span>
                </div>

                <div className="rj-feature__body">
                    <span className="rj-feature__eyebrow">
                        PENELITIAN TERBARU
                    </span>

                    <h3>{featured.title}</h3>

                    <div
                        id={`rj-feature-summary-${featured.id}`}
                        className={
                            "rj-feature__summary" +
                            (featuredExpanded
                                ? " rj-feature__summary--expanded"
                                : "")
                        }
                    >
                        <p>{featuredSummary}</p>
                    </div>

                    {featured.summary?.trim() && (
                        <button
                            type="button"
                            className="rj-feature__read"
                            aria-expanded={featuredExpanded}
                            aria-controls={`rj-feature-summary-${featured.id}`}
                            onClick={() =>
                                setFeaturedExpanded((current) => !current)
                            }
                        >
                            <span>
                                {featuredExpanded
                                    ? "Ringkas kembali"
                                    : "Baca ringkasan lengkap"}
                            </span>

                            <ChevronDown
                                size={16}
                                strokeWidth={1.7}
                                aria-hidden="true"
                            />
                        </button>
                    )}
                </div>

                <span className="rj-feature__corner" aria-hidden="true" />
            </article>

            {/* ===================================
                RESEARCH ARCHIVE
            =================================== */}

            {archive.length > 0 && (
                <div className="rj-records">
                    <div className="rj-records__heading">
                        <div>
                            <span className="rj-records__overline">
                                RESEARCH RECORDS
                            </span>

                            <h3>Arsip penelitian</h3>
                        </div>

                        <span className="rj-records__count">
                            {twoDigits(archive.length)} CATATAN
                        </span>
                    </div>

                    {/* FILTER TAHUN */}
                    <div className="rj-filters">
                        <span className="rj-filters__label">FILTER TAHUN</span>

                        <div
                            className="rj-filters__options"
                            role="group"
                            aria-label="Filter penelitian berdasarkan tahun"
                        >
                            <button
                                type="button"
                                className={
                                    "rj-filter" +
                                    (activeYear === "all"
                                        ? " rj-filter--active"
                                        : "")
                                }
                                aria-pressed={activeYear === "all"}
                                onClick={() => changeYear("all")}
                            >
                                Semua
                                <span>{twoDigits(archive.length)}</span>
                            </button>

                            {years.map((year) => {
                                const active = activeYear === year;

                                const total = archive.filter(
                                    (item) => item.year === year,
                                ).length;

                                return (
                                    <button
                                        key={year}
                                        type="button"
                                        className={
                                            "rj-filter" +
                                            (active ? " rj-filter--active" : "")
                                        }
                                        aria-pressed={active}
                                        onClick={() => changeYear(year)}
                                    >
                                        {year}
                                        <span>{twoDigits(total)}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* TABLE LABELS */}
                    <div className="rj-records__columns" aria-hidden="true">
                        <span>NO.</span>
                        <span>JUDUL PENELITIAN</span>
                        <span>TAHUN</span>
                        <span />
                    </div>

                    {/* PAGINATED LIST */}
                    <div ref={listStartRef}>
                        <div
                            key={`${activeYear}-${currentPage}`}
                            className="rj-list"
                            aria-label="Daftar penelitian"
                        >
                            {visibleRecords.map((item, index) => {
                                const expanded = openId === item.id;

                                const number = twoDigits(
                                    startIndex + index + 1,
                                );

                                const triggerId = `rj-trigger-${item.id}`;

                                const detailId = `rj-detail-${item.id}`;

                                return (
                                    <article
                                        key={item.id}
                                        className={
                                            "rj-record" +
                                            (expanded
                                                ? " rj-record--expanded"
                                                : "")
                                        }
                                    >
                                        <h4 className="rj-record__heading">
                                            <button
                                                id={triggerId}
                                                type="button"
                                                className="rj-record__trigger"
                                                aria-expanded={expanded}
                                                aria-controls={detailId}
                                                onClick={() =>
                                                    toggleRecord(item.id)
                                                }
                                            >
                                                <span className="rj-record__number">
                                                    {number}
                                                </span>

                                                <span className="rj-record__main">
                                                    <span className="rj-record__title">
                                                        {item.title}
                                                    </span>

                                                    <span className="rj-record__teaser">
                                                        {getSummary(item)}
                                                    </span>
                                                </span>

                                                <span className="rj-record__year">
                                                    {item.year}
                                                </span>

                                                <span
                                                    className="rj-record__toggle"
                                                    aria-hidden="true"
                                                >
                                                    <Plus
                                                        size={17}
                                                        strokeWidth={1.7}
                                                    />
                                                </span>
                                            </button>
                                        </h4>

                                        <div
                                            id={detailId}
                                            className="rj-record__collapse"
                                            role="region"
                                            aria-labelledby={triggerId}
                                            aria-hidden={!expanded}
                                        >
                                            <div className="rj-record__collapse-inner">
                                                <div className="rj-record__detail">
                                                    <span className="rj-record__detail-label">
                                                        RINGKASAN PENELITIAN
                                                    </span>

                                                    <p>{getSummary(item)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </div>

                    {/* PAGINATION */}
                    <div className="rj-pagination">
                        <div className="rj-pagination__summary">
                            Menampilkan{" "}
                            <strong>
                                {startIndex + 1}–
                                {Math.min(
                                    startIndex + PAGE_SIZE,
                                    filteredRecords.length,
                                )}
                            </strong>{" "}
                            dari {filteredRecords.length} penelitian
                        </div>

                        {totalPages > 1 && (
                            <nav
                                className="rj-pagination__nav"
                                aria-label="Navigasi halaman penelitian"
                            >
                                <button
                                    type="button"
                                    className="rj-pagination__arrow"
                                    aria-label="Halaman sebelumnya"
                                    disabled={currentPage === 1}
                                    onClick={() => changePage(currentPage - 1)}
                                >
                                    <ArrowLeft size={16} aria-hidden="true" />
                                </button>

                                {getPageItems(totalPages, currentPage).map(
                                    (item, index) =>
                                        item === "dots" ? (
                                            <span
                                                key={`dots-${index}`}
                                                className="rj-pagination__dots"
                                                aria-hidden="true"
                                            >
                                                ...
                                            </span>
                                        ) : (
                                            <button
                                                key={item}
                                                type="button"
                                                className={
                                                    "rj-pagination__page" +
                                                    (item === currentPage
                                                        ? " rj-pagination__page--active"
                                                        : "")
                                                }
                                                aria-label={`Halaman ${item}`}
                                                aria-current={
                                                    item === currentPage
                                                        ? "page"
                                                        : undefined
                                                }
                                                onClick={() => changePage(item)}
                                            >
                                                {item}
                                            </button>
                                        ),
                                )}

                                <button
                                    type="button"
                                    className="rj-pagination__arrow"
                                    aria-label="Halaman berikutnya"
                                    disabled={currentPage === totalPages}
                                    onClick={() => changePage(currentPage + 1)}
                                >
                                    <ArrowRight size={16} aria-hidden="true" />
                                </button>
                            </nav>
                        )}
                    </div>
                </div>
            )}

            {/* FOOTER */}
            <div className="rj-archive__footer">
                <span>{twoDigits(ordered.length)} penelitian tercatat</span>

                <span>DIURUTKAN BERDASARKAN TAHUN</span>
            </div>
        </div>
    );
}
