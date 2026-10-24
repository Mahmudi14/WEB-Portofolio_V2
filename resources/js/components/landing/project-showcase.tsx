import {
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUpRight,
    ChevronDown,
    Code2,
    Expand,
    FolderKanban,
    Image as ImageIcon,
    Layers3,
    Monitor,
    MousePointer2,
    X,
} from "lucide-react";
import {
    useEffect,
    useRef,
    useState,
} from "react";
import type {
    KeyboardEvent as ReactKeyboardEvent,
    PointerEvent as ReactPointerEvent,
} from "react";
import "../../../css/project-showcase.css";

/** Struktur persis seperti props projects dari LandingPageController. */
export type ShowcaseProject = {
    id: number;
    title: string;
    description: string;
    technologies: string | null;
    category: string;
    images: { id: number; url: string }[];
};

type Props = {
    projects: ShowcaseProject[];
};

const twoDigits = (value: number) => String(value).padStart(2, "0");

function isReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * SELECTED WORK — sebuah galeri proyek bergaya creative studio.
 *
 * - Daftar proyek scroll vertikal dengan tinggi terbatas.
 * - Project yang dipilih tampil sebagai interactive browser showcase.
 * - Filter kategori memanfaatkan field yang sudah ada di database.
 * - Multi-image gallery + lightbox <dialog> native.
 * - Scroll reveal, subtle pointer tilt, pergantian proyek dan image scan.
 * - Tanpa library animasi tambahan atau link demo fiktif.
 */
export default function ProjectShowcase({ projects }: Props) {
    const [category, setCategory] = useState("all");
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [imageIndex, setImageIndex] = useState(0);
    const shellRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const buttonRefs = useRef<Record<number, HTMLButtonElement | null>>({});

    const categories = Array.from(
        new Set(
            projects.map((project) => project.category?.trim() || "Lainnya"),
        ),
    );

    const visibleProjects =
        category === "all"
            ? projects
            : projects.filter(
                  (project) =>
                      (project.category?.trim() || "Lainnya") === category,
              );

    const selectedIndex = Math.max(
        0,
        visibleProjects.findIndex((project) => project.id === selectedId),
    );
    const selected = visibleProjects[selectedIndex];
    const images = selected?.images ?? [];
    const shownImageIndex = Math.min(imageIndex, Math.max(0, images.length - 1));
    const image = images[shownImageIndex];
    const technologyList = (selected?.technologies || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

    // Reveal sekali saat komponen masuk viewport; konten tetap tampil
    // walaupun IntersectionObserver tidak tersedia.
    useEffect(() => {
        const root = shellRef.current;
        if (!root || isReducedMotion() || !("IntersectionObserver" in window)) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) {
                    root.classList.add("ps-showcase--visible");
                    observer.disconnect();
                }
            },
            { threshold: 0.08, rootMargin: "0px 0px -5% 0px" },
        );

        observer.observe(root);
        return () => observer.disconnect();
    }, []);

    // Update progress scrollbar khusus daftar proyek.
    useEffect(() => {
        const list = listRef.current;
        if (!list) return;

        let frame = 0;
        const update = () => {
            frame = 0;
            const max = Math.max(0, list.scrollHeight - list.clientHeight);
            const percent = max === 0 ? 100 : (list.scrollTop / max) * 100;
            list.parentElement?.style.setProperty("--ps-list-progress", `${percent.toFixed(2)}%`);
        };
        const schedule = () => {
            if (!frame) frame = window.requestAnimationFrame(update);
        };
        const observer = new ResizeObserver(schedule);
        observer.observe(list);
        list.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);
        update();
        return () => {
            if (frame) window.cancelAnimationFrame(frame);
            observer.disconnect();
            list.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", schedule);
        };
    }, [category, projects.length]);

    const choose = (projectId: number) => {
        setSelectedId(projectId);
        setImageIndex(0);
    };

    const changeCategory = (next: string) => {
        setCategory(next);
        setSelectedId(null);
        setImageIndex(0);
        if (listRef.current) listRef.current.scrollTop = 0;
    };

    const changeProject = (nextIndex: number, focus = false) => {
        if (!visibleProjects.length) return;
        const normalized =
            (nextIndex + visibleProjects.length) % visibleProjects.length;
        const target = visibleProjects[normalized];
        if (!target) return;
        choose(target.id);

        // Gulir area daftar saja; jangan menggeser seluruh halaman.
        const list = listRef.current;
        const button = buttonRefs.current[target.id];
        if (list && button) {
            const parentRect = list.getBoundingClientRect();
            const childRect = button.getBoundingClientRect();
            if (childRect.top < parentRect.top + 12) {
                list.scrollBy({
                    top: childRect.top - parentRect.top - 12,
                    behavior: isReducedMotion() ? "auto" : "smooth",
                });
            } else if (childRect.bottom > parentRect.bottom - 12) {
                list.scrollBy({
                    top: childRect.bottom - parentRect.bottom + 12,
                    behavior: isReducedMotion() ? "auto" : "smooth",
                });
            }
            if (focus) button.focus({ preventScroll: true });
        }
    };

    const handleListKey = (
        event: ReactKeyboardEvent<HTMLButtonElement>,
        index: number,
    ) => {
        let next = index;
        switch (event.key) {
            case "ArrowDown":
                next = Math.min(index + 1, visibleProjects.length - 1);
                break;
            case "ArrowUp":
                next = Math.max(index - 1, 0);
                break;
            case "Home":
                next = 0;
                break;
            case "End":
                next = visibleProjects.length - 1;
                break;
            default:
                return;
        }
        event.preventDefault();
        changeProject(next, true);
    };

    const changeImage = (delta: number) => {
        if (images.length < 2) return;
        setImageIndex((current) =>
            (current + delta + images.length) % images.length,
        );
    };

    const openLightbox = () => {
        if (!image || !dialogRef.current || dialogRef.current.open) return;
        dialogRef.current.showModal();
    };

    const closeLightbox = () => {
        dialogRef.current?.close();
    };

    const tiltPreview = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (event.pointerType === "touch" || isReducedMotion()) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        event.currentTarget.style.setProperty("--ps-rot-y", `${(x * 3.5).toFixed(2)}deg`);
        event.currentTarget.style.setProperty("--ps-rot-x", `${(-y * 3).toFixed(2)}deg`);
        event.currentTarget.style.setProperty("--ps-mouse-x", `${((x + 0.5) * 100).toFixed(1)}%`);
        event.currentTarget.style.setProperty("--ps-mouse-y", `${((y + 0.5) * 100).toFixed(1)}%`);
    };

    const resetTilt = () => {
        const node = previewRef.current;
        if (!node) return;
        node.style.setProperty("--ps-rot-x", "0deg");
        node.style.setProperty("--ps-rot-y", "0deg");
    };

    return (
        <div className="ps-showcase" ref={shellRef}>
            <header className="ps-showcase__toolbar">
                <div className="ps-showcase__eyebrow">
                    <span className="ps-showcase__signal" />
                    <span>SELECTED WORK / PROJECT ARCHIVE</span>
                </div>
                <div className="ps-showcase__filters" aria-label="Filter kategori proyek">
                    <button
                        type="button"
                        aria-pressed={category === "all"}
                        className={`ps-showcase__filter${category === "all" ? " ps-showcase__filter--active" : ""}`}
                        onClick={() => changeCategory("all")}
                    >
                        Semua <span>{twoDigits(projects.length)}</span>
                    </button>
                    {categories.map((item) => (
                        <button
                            key={item}
                            type="button"
                            aria-pressed={category === item}
                            className={`ps-showcase__filter${category === item ? " ps-showcase__filter--active" : ""}`}
                            onClick={() => changeCategory(item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </header>

            {selected ? (
                <div className="ps-showcase__layout">
                    <aside className="ps-index">
                        <div className="ps-index__heading">
                            <div>
                                <span className="ps-index__overline">PROJECT INDEX</span>
                                <p>Jelajahi karya saya</p>
                            </div>
                            <ArrowDown size={16} aria-hidden="true" />
                        </div>
                        <div
                            className="ps-index__scroll"
                            ref={listRef}
                            tabIndex={0}
                            role="region"
                            aria-label="Daftar proyek, scroll vertikal"
                        >
                            <div className="ps-index__items">
                                {visibleProjects.map((project, index) => {
                                    const active = selected.id === project.id;
                                    return (
                                        <button
                                            key={project.id}
                                            type="button"
                                            ref={(node) => {
                                                buttonRefs.current[project.id] = node;
                                            }}
                                            className={`ps-index__item${active ? " ps-index__item--active" : ""}`}
                                            aria-pressed={active}
                                            onClick={() => choose(project.id)}
                                            onKeyDown={(event) => handleListKey(event, index)}
                                        >
                                            <span className="ps-index__number">
                                                {twoDigits(index + 1)}
                                            </span>
                                            <span className="ps-index__item-main">
                                                <span className="ps-index__item-title">{project.title}</span>
                                                <span className="ps-index__item-category">
                                                    {project.category || "Proyek"}
                                                </span>
                                            </span>
                                            <ArrowUpRight size={17} aria-hidden="true" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="ps-index__footer">
                            <div className="ps-index__track" aria-hidden="true">
                                <span />
                            </div>
                            <span>{twoDigits(visibleProjects.length)} proyek tersedia</span>
                        </div>
                    </aside>

                    <section className="ps-feature" aria-label={`Tampilan proyek ${selected.title}`}>
                        <div key={selected.id} className="ps-feature__entry">
                            <div className="ps-feature__topline">
                                <span className="ps-feature__label">
                                    <span className="ps-feature__mini-square" />
                                    FEATURED PROJECT
                                </span>
                                <span className="ps-feature__index">
                                    {twoDigits(selectedIndex + 1)} <span>/</span> {twoDigits(visibleProjects.length)}
                                </span>
                            </div>

                            <div className="ps-browser-wrap">
                                <div
                                    className="ps-browser"
                                    ref={previewRef}
                                    onPointerMove={tiltPreview}
                                    onPointerLeave={resetTilt}
                                >
                                    <div className="ps-browser__chrome">
                                        <div className="ps-browser__dots" aria-hidden="true">
                                            <i /><i /><i />
                                        </div>
                                        <span className="ps-browser__file">
                                            <Code2 size={12} aria-hidden="true" />
                                            {selected.title}
                                        </span>
                                        <Monitor size={14} aria-hidden="true" />
                                    </div>
                                    <div className="ps-browser__screen">
                                        <div className="ps-browser__placeholder" aria-hidden="true">
                                            <Layers3 size={58} strokeWidth={1.05} />
                                            <span>PROJECT PREVIEW</span>
                                        </div>
                                        {image && (
                                            <img
                                                key={image.id}
                                                src={image.url}
                                                alt={`Preview ${selected.title}, gambar ${shownImageIndex + 1}`}
                                                loading="lazy"
                                                onError={(event) => {
                                                    event.currentTarget.style.display = "none";
                                                }}
                                            />
                                        )}
                                        {image && (
                                            <button
                                                type="button"
                                                className="ps-browser__expand"
                                                onClick={openLightbox}
                                                aria-label={`Perbesar gambar proyek ${selected.title}`}
                                            >
                                                <Expand size={16} />
                                                <span>Perbesar</span>
                                            </button>
                                        )}
                                        <div className="ps-browser__corner ps-browser__corner--a" />
                                        <div className="ps-browser__corner ps-browser__corner--b" />
                                    </div>
                                </div>
                            </div>

                            <div className="ps-feature__meta-row">
                                <span className="ps-feature__category">
                                    <FolderKanban size={13} aria-hidden="true" />
                                    {selected.category || "Proyek"}
                                </span>
                                <span className="ps-feature__frame-count">
                                    <ImageIcon size={13} aria-hidden="true" />
                                    {images.length} gambar
                                </span>
                            </div>
                            <h3 className="ps-feature__title">{selected.title}</h3>
                            <p className="ps-feature__summary">{selected.description}</p>

                            {selected.description.length > 90 && (
                                <details className="ps-feature__read-more">
                                    <summary>
                                        Baca deskripsi lengkap
                                        <ChevronDown size={15} aria-hidden="true" />
                                    </summary>
                                    <p>{selected.description}</p>
                                </details>
                            )}

                            {technologyList.length > 0 && (
                                <div className="ps-feature__tech" aria-label="Teknologi proyek">
                                    {technologyList.slice(0, 7).map((tech, index) => (
                                        <span key={`${tech}-${index}`}>{tech}</span>
                                    ))}
                                    {technologyList.length > 7 && (
                                        <span>+{technologyList.length - 7}</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {images.length > 1 && (
                            <div className="ps-gallery" aria-label="Galeri gambar proyek">
                                <div className="ps-gallery__head">
                                    <span>PROJECT FRAMES</span>
                                    <span>{twoDigits(shownImageIndex + 1)} / {twoDigits(images.length)}</span>
                                </div>
                                <div className="ps-gallery__row">
                                    <button
                                        type="button"
                                        className="ps-gallery__arrow"
                                        onClick={() => changeImage(-1)}
                                        aria-label="Gambar sebelumnya"
                                    >
                                        <ArrowLeft size={16} />
                                    </button>
                                    <div className="ps-gallery__thumbs">
                                        {images.map((item, index) => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                className={`ps-gallery__thumb${shownImageIndex === index ? " ps-gallery__thumb--active" : ""}`}
                                                aria-label={`Tampilkan gambar ${index + 1} dari ${selected.title}`}
                                                aria-pressed={shownImageIndex === index}
                                                onClick={() => setImageIndex(index)}
                                            >
                                                <img
                                                    src={item.url}
                                                    alt=""
                                                    loading="lazy"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        className="ps-gallery__arrow"
                                        onClick={() => changeImage(1)}
                                        aria-label="Gambar berikutnya"
                                    >
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="ps-feature__controls">
                            <span className="ps-feature__hint">
                                <MousePointer2 size={13} aria-hidden="true" />
                                Pilih proyek untuk melihat detail
                            </span>
                            <div className="ps-feature__nav">
                                <button
                                    type="button"
                                    onClick={() => changeProject(selectedIndex - 1)}
                                    aria-label="Proyek sebelumnya"
                                    disabled={visibleProjects.length < 2}
                                >
                                    <ArrowLeft size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => changeProject(selectedIndex + 1)}
                                    aria-label="Proyek berikutnya"
                                    disabled={visibleProjects.length < 2}
                                >
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            ) : (
                <div className="ps-showcase__empty">
                    <FolderKanban size={28} aria-hidden="true" />
                    <strong>Belum ada proyek</strong>
                    <p>Proyek yang ditambahkan melalui admin akan muncul di sini.</p>
                </div>
            )}

            <div className="ps-showcase__bottom-bar" aria-hidden="true">
                <span>CRAFTED WITH PURPOSE</span>
                <span>DESIGN × DEVELOPMENT × INNOVATION</span>
            </div>

            {/* Dialog HTML native menjaga fokus & tombol Escape. */}
            <dialog
                ref={dialogRef}
                className="ps-lightbox"
                aria-label={`Galeri gambar ${selected?.title ?? "proyek"}`}
                onClick={(event) => {
                    if (event.target === event.currentTarget) closeLightbox();
                }}
            >
                <div className="ps-lightbox__panel">
                    <div className="ps-lightbox__head">
                        <span>{selected?.title ?? "Proyek"}</span>
                        <button type="button" onClick={closeLightbox} aria-label="Tutup galeri">
                            <X size={20} />
                        </button>
                    </div>
                    {image && (
                        <img
                            key={`lightbox-${image.id}`}
                            src={image.url}
                            alt={`${selected?.title ?? "Proyek"} — gambar ${shownImageIndex + 1}`}
                        />
                    )}
                    <div className="ps-lightbox__bottom">
                        <button
                            type="button"
                            onClick={() => changeImage(-1)}
                            disabled={images.length < 2}
                            aria-label="Gambar sebelumnya"
                        >
                            <ArrowLeft size={19} />
                        </button>
                        <span>{twoDigits(shownImageIndex + 1)} / {twoDigits(images.length || 1)}</span>
                        <button
                            type="button"
                            onClick={() => changeImage(1)}
                            disabled={images.length < 2}
                            aria-label="Gambar berikutnya"
                        >
                            <ArrowRight size={19} />
                        </button>
                    </div>
                </div>
            </dialog>
        </div>
    );
}
