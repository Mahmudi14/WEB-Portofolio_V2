import { ArrowLeft, ArrowRight, FolderKanban, ImageOff, X } from "lucide-react";

import { useEffect, useRef, useState } from "react";

import type {
    KeyboardEvent as ReactKeyboardEvent,
    TouchEvent as ReactTouchEvent,
} from "react";

import type { Project } from "./landing-types";

const PAGE_SIZE = 12;

type Props = {
    projects: Project[];
};

type PageSlot = number | "dots";

function getPageSlots(total: number, current: number): PageSlot[] {
    if (total <= 7) {
        return Array.from({ length: total }, (_, index) => index + 1);
    }

    const numbers = new Set([
        1,
        2,
        total - 1,
        total,
        current - 1,
        current,
        current + 1,
    ]);

    const sorted = Array.from(numbers)
        .filter((value) => value >= 1 && value <= total)
        .sort((a, b) => a - b);

    const result: PageSlot[] = [];

    sorted.forEach((value, index) => {
        const previous = sorted[index - 1];

        if (previous !== undefined && value - previous > 1) {
            result.push("dots");
        }

        result.push(value);
    });

    return result;
}

export default function ProjectShowcase({ projects }: Props) {
    const [page, setPage] = useState(1);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [imageIndex, setImageIndex] = useState(0);

    const dialogRef = useRef<HTMLDialogElement>(null);

    const touchStart = useRef<{
        x: number;
        y: number;
    } | null>(null);

    const totalPages = Math.max(1, Math.ceil(projects.length / PAGE_SIZE));

    const currentPage = Math.min(page, totalPages);

    const startIndex = (currentPage - 1) * PAGE_SIZE;

    const visibleProjects = projects.slice(startIndex, startIndex + PAGE_SIZE);

    const selected =
        projects.find((project) => project.id === selectedId) ?? null;

    const images = selected?.images ?? [];

    const currentImageIndex = Math.min(
        imageIndex,
        Math.max(0, images.length - 1),
    );

    const activeImage = images[currentImageIndex];

    const technologies = (selected?.technologies ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

    // ==========================================
    // PAGINATION
    // ==========================================

    function changePage(nextPage: number) {
        if (nextPage < 1 || nextPage > totalPages || nextPage === currentPage) {
            return;
        }

        setPage(nextPage);

        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;

        document.getElementById("projects")?.scrollIntoView({
            behavior: reducedMotion ? "auto" : "smooth",
            block: "start",
        });
    }

    // ==========================================
    // OPEN / CLOSE POPUP
    // ==========================================

    function openProject(projectId: number) {
        setSelectedId(projectId);
        setImageIndex(0);

        const dialog = dialogRef.current;

        if (dialog && !dialog.open) {
            dialog.showModal();
        }
    }

    function closeProject() {
        dialogRef.current?.close();
    }

    // Lock background scroll while popup is active.
    useEffect(() => {
        if (selectedId === null) return;

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [selectedId]);

    // ==========================================
    // GALLERY NAVIGATION
    // ==========================================

    function changeImage(direction: number) {
        if (images.length <= 1) return;

        setImageIndex(
            (current) => (current + direction + images.length) % images.length,
        );
    }

    function handleGalleryKeyboard(
        event: ReactKeyboardEvent<HTMLDialogElement>,
    ) {
        if (images.length <= 1) return;

        if (event.key === "ArrowLeft") {
            event.preventDefault();
            changeImage(-1);
        }

        if (event.key === "ArrowRight") {
            event.preventDefault();
            changeImage(1);
        }
    }

    // ==========================================
    // SWIPE MOBILE
    // ==========================================

    function handleTouchStart(event: ReactTouchEvent<HTMLDivElement>) {
        const touch = event.touches[0];

        if (!touch) return;

        touchStart.current = {
            x: touch.clientX,
            y: touch.clientY,
        };
    }

    function handleTouchEnd(event: ReactTouchEvent<HTMLDivElement>) {
        const start = touchStart.current;
        const touch = event.changedTouches[0];

        touchStart.current = null;

        if (!start || !touch || images.length <= 1) {
            return;
        }

        const deltaX = touch.clientX - start.x;
        const deltaY = touch.clientY - start.y;

        if (
            Math.abs(deltaX) < 45 ||
            Math.abs(deltaX) < Math.abs(deltaY) * 1.2
        ) {
            return;
        }

        changeImage(deltaX < 0 ? 1 : -1);
    }

    // ==========================================
    // EMPTY STATE
    // ==========================================

    return (
        <div className="pg-gallery">
            {projects.length === 0 ? (
                <div className="pg-empty">
                    <FolderKanban
                        size={32}
                        strokeWidth={1.4}
                        aria-hidden="true"
                    />

                    <p>Belum ada proyek yang ditampilkan.</p>
                </div>
            ) : (
                <>
                    {/* PROJECT GRID */}
                    <div className="pg-grid">
                        {visibleProjects.map((project) => {
                            const cover = project.images?.[0];

                            return (
                                <button
                                    key={project.id}
                                    type="button"
                                    className="pg-card"
                                    onClick={() => openProject(project.id)}
                                    aria-label={`Lihat detail proyek ${project.title}`}
                                >
                                    <span className="pg-card__image">
                                        <span className="pg-card__placeholder">
                                            <ImageOff
                                                size={25}
                                                strokeWidth={1.4}
                                                aria-hidden="true"
                                            />
                                        </span>

                                        {cover && (
                                            <img
                                                src={cover.url}
                                                alt=""
                                                loading="lazy"
                                                onError={(event) => {
                                                    event.currentTarget.style.display =
                                                        "none";
                                                }}
                                            />
                                        )}
                                    </span>

                                    <span className="pg-card__body">
                                        <span className="pg-card__title">
                                            {project.title}
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* PAGINATION */}
                    {totalPages > 1 && (
                        <nav
                            className="pg-pagination"
                            aria-label="Navigasi halaman proyek"
                        >
                            <button
                                type="button"
                                className="pg-pagination__arrow"
                                aria-label="Halaman sebelumnya"
                                disabled={currentPage === 1}
                                onClick={() => changePage(currentPage - 1)}
                            >
                                <ArrowLeft size={17} aria-hidden="true" />
                            </button>

                            <div className="pg-pagination__pages">
                                {getPageSlots(totalPages, currentPage).map(
                                    (slot, index) =>
                                        slot === "dots" ? (
                                            <span
                                                key={`dots-${index}`}
                                                className="pg-pagination__dots"
                                                aria-hidden="true"
                                            >
                                                ...
                                            </span>
                                        ) : (
                                            <button
                                                key={slot}
                                                type="button"
                                                className={
                                                    "pg-pagination__page" +
                                                    (slot === currentPage
                                                        ? " pg-pagination__page--active"
                                                        : "")
                                                }
                                                aria-label={`Halaman ${slot}`}
                                                aria-current={
                                                    slot === currentPage
                                                        ? "page"
                                                        : undefined
                                                }
                                                onClick={() => changePage(slot)}
                                            >
                                                {slot}
                                            </button>
                                        ),
                                )}
                            </div>

                            <button
                                type="button"
                                className="pg-pagination__arrow"
                                aria-label="Halaman berikutnya"
                                disabled={currentPage === totalPages}
                                onClick={() => changePage(currentPage + 1)}
                            >
                                <ArrowRight size={17} aria-hidden="true" />
                            </button>
                        </nav>
                    )}

                    <div className="pg-footer">
                        <span>
                            Menampilkan {startIndex + 1}–
                            {Math.min(startIndex + PAGE_SIZE, projects.length)}{" "}
                            dari {projects.length} proyek
                        </span>

                        <span>
                            {String(currentPage).padStart(2, "0")}
                            {" / "}
                            {String(totalPages).padStart(2, "0")}
                        </span>
                    </div>
                </>
            )}

            {/* ======================================
                PROJECT DETAIL MODAL
            ====================================== */}

            <dialog
                ref={dialogRef}
                className="pg-dialog"
                aria-labelledby="pg-dialog-title"
                onClose={() => setSelectedId(null)}
                onKeyDown={handleGalleryKeyboard}
                onClick={(event) => {
                    if (event.target === event.currentTarget) {
                        closeProject();
                    }
                }}
            >
                {selected && (
                    <div className="pg-dialog__content">
                        <button
                            type="button"
                            className="pg-dialog__close"
                            onClick={closeProject}
                            aria-label="Tutup detail proyek"
                        >
                            <X size={20} strokeWidth={1.8} aria-hidden="true" />
                        </button>

                        <div className="pg-dialog__layout">
                            {/* LEFT — IMAGE GALLERY */}
                            <div className="pg-dialog__visual">
                                <div
                                    className="pg-dialog__image-frame"
                                    onTouchStart={handleTouchStart}
                                    onTouchEnd={handleTouchEnd}
                                >
                                    {activeImage ? (
                                        <img
                                            key={activeImage.id}
                                            src={activeImage.url}
                                            alt={`${selected.title}, gambar ${currentImageIndex + 1} dari ${images.length}`}
                                            onError={(event) => {
                                                event.currentTarget.style.display =
                                                    "none";
                                            }}
                                        />
                                    ) : (
                                        <div className="pg-dialog__no-image">
                                            <ImageOff
                                                size={34}
                                                strokeWidth={1.4}
                                                aria-hidden="true"
                                            />

                                            <span>Gambar belum tersedia</span>
                                        </div>
                                    )}
                                </div>

                                <div className="pg-dialog__gallery-controls">
                                    <button
                                        type="button"
                                        aria-label="Gambar sebelumnya"
                                        onClick={() => changeImage(-1)}
                                        disabled={images.length <= 1}
                                    >
                                        <ArrowLeft
                                            size={18}
                                            aria-hidden="true"
                                        />
                                    </button>

                                    <span
                                        className="pg-dialog__counter"
                                        role="status"
                                        aria-live="polite"
                                    >
                                        {images.length > 0
                                            ? currentImageIndex + 1
                                            : 0}
                                        {" / "}
                                        {images.length}
                                    </span>

                                    <button
                                        type="button"
                                        aria-label="Gambar berikutnya"
                                        onClick={() => changeImage(1)}
                                        disabled={images.length <= 1}
                                    >
                                        <ArrowRight
                                            size={18}
                                            aria-hidden="true"
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* RIGHT — PROJECT INFORMATION */}
                            <div className="pg-dialog__info">
                                <span className="pg-dialog__eyebrow">
                                    {selected.category || "PROYEK"}
                                </span>

                                <h3 id="pg-dialog-title">{selected.title}</h3>

                                <div className="pg-dialog__separator" />

                                <div className="pg-dialog__block">
                                    <h4>TEKNOLOGI</h4>

                                    {technologies.length > 0 ? (
                                        <ul className="pg-dialog__technologies">
                                            {technologies.map((tech, index) => (
                                                <li key={`${tech}-${index}`}>
                                                    {tech}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="pg-dialog__muted">
                                            Belum ditambahkan.
                                        </p>
                                    )}
                                </div>

                                <div className="pg-dialog__block">
                                    <h4>DESKRIPSI PROYEK</h4>

                                    <p className="pg-dialog__description">
                                        {selected.description?.trim() ||
                                            "Deskripsi proyek belum tersedia."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </dialog>
        </div>
    );
}
