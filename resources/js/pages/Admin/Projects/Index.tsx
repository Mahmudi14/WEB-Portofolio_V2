
import {
    Head,
    router,
    useForm,
    usePage,
} from '@inertiajs/react';

import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

import {
    ArrowDown,
    ArrowUp,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    FolderKanban,
    ImagePlus,
    Images,
    Layers3,
    Pencil,
    Plus,
    Save,
    Trash2,
    X,
} from 'lucide-react';

import AdminLayout from '@/layouts/admin-layout';

// ==========================================
// TYPES
// ==========================================

type Category = {
    id: number;
    name: string;
    sort_order: number;
    projects_count: number;
};

type ProjectImage = {
    id: number;
    sort_order: number;
    url: string;
};

type Project = {
    id: number;
    project_category_id: number;
    title: string;
    description: string;
    technologies: string | null;
    sort_order: number;
    category: {
        id: number;
        name: string;
    };
    images: ProjectImage[];
};

type Props = {
    categories: Category[];
    projects: Project[];
};

type CategoryData = {
    name: string;
    sort_order: number;
};

type ProjectData = {
    project_category_id: number | '';
    title: string;
    description: string;
    technologies: string;
    sort_order: number;
    images: File[];
    existing_image_ids: number[];
    _method?: 'put';
};

type ProjectErrors = Partial<
    Record<keyof ProjectData, string>
>;

type Patch = Partial<ProjectData>;

// ==========================================
// SHARED FIELD
// ==========================================

function Field({
    id,
    label,
    hint,
    error,
    children,
}: {
    id: string;
    label: string;
    hint?: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div className="pa-editor-field">
            <label
                htmlFor={id}
                className="pa-editor-label"
            >
                {label}
            </label>

            {children}

            {hint && (
                <p className="pa-editor-hint">{hint}</p>
            )}

            {error && (
                <p className="pa-editor-error" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

// ==========================================
// FILE PREVIEW HOOK
// ==========================================

function useFilePreviews(files: File[]) {
    const [urls, setUrls] = useState<string[]>([]);

    useEffect(() => {
        const nextUrls = files.map(
            (file) => URL.createObjectURL(file)
        );

        setUrls(nextUrls);

        return () => {
            nextUrls.forEach((url) => {
                URL.revokeObjectURL(url);
            });
        };
    }, [files]);

    return urls;
}

// ==========================================
// CATEGORY CREATE
// ==========================================

function CreateCategory() {
    const form = useForm<CategoryData>({
        name: '',
        sort_order: 0,
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.post('/admin/project-categories', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    }

    return (
        <form
            onSubmit={submit}
            className="pa-prj-category-create"
        >
            <Field
                id="new-project-category"
                label="Nama Kategori"
                error={form.errors.name}
            >
                <input
                    id="new-project-category"
                    className="pa-editor-input"
                    required
                    maxLength={120}
                    placeholder="Contoh: Web Application"
                    value={form.data.name}
                    onChange={(event) =>
                        form.setData(
                            'name',
                            event.target.value
                        )
                    }
                />
            </Field>

            <Field
                id="new-project-category-order"
                label="Urutan"
                error={form.errors.sort_order}
            >
                <input
                    id="new-project-category-order"
                    type="number"
                    className="pa-editor-input"
                    required
                    min={0}
                    max={4294967295}
                    step={1}
                    value={form.data.sort_order}
                    onChange={(event) =>
                        form.setData(
                            'sort_order',
                            Number(event.target.value || 0)
                        )
                    }
                />
            </Field>

            <button
                type="submit"
                className="pa-button pa-button--primary"
                disabled={form.processing}
            >
                <Plus size={16} />
                {form.processing
                    ? 'Menambahkan...'
                    : 'Tambah Kategori'}
            </button>
        </form>
    );
}

// ==========================================
// CATEGORY EDIT
// ==========================================

function EditCategory({
    category,
    onClose,
}: {
    category: Category;
    onClose: () => void;
}) {
    const form = useForm<CategoryData>({
        name: category.name,
        sort_order: category.sort_order,
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.put(
            `/admin/project-categories/${category.id}`,
            {
                preserveScroll: true,
                onSuccess: onClose,
            }
        );
    }

    return (
        <form
            onSubmit={submit}
            className="pa-prj-category-edit"
        >
            <Field
                id={`category-name-${category.id}`}
                label="Nama Kategori"
                error={form.errors.name}
            >
                <input
                    id={`category-name-${category.id}`}
                    className="pa-editor-input"
                    required
                    maxLength={120}
                    value={form.data.name}
                    onChange={(event) =>
                        form.setData(
                            'name',
                            event.target.value
                        )
                    }
                />
            </Field>

            <Field
                id={`category-order-${category.id}`}
                label="Urutan"
                error={form.errors.sort_order}
            >
                <input
                    id={`category-order-${category.id}`}
                    type="number"
                    className="pa-editor-input"
                    required
                    min={0}
                    max={4294967295}
                    step={1}
                    value={form.data.sort_order}
                    onChange={(event) =>
                        form.setData(
                            'sort_order',
                            Number(event.target.value || 0)
                        )
                    }
                />
            </Field>

            <div className="pa-prj-inline-actions">
                <button
                    type="button"
                    className="pa-prj-action"
                    onClick={onClose}
                    disabled={form.processing}
                >
                    Batal
                </button>

                <button
                    type="submit"
                    className="pa-button pa-button--primary"
                    disabled={
                        form.processing || !form.isDirty
                    }
                >
                    <Save size={15} />
                    Simpan
                </button>
            </div>
        </form>
    );
}

function CategoryRow({
    category,
}: {
    category: Category;
}) {
    const [editing, setEditing] = useState(false);
    const [deleting, setDeleting] = useState(false);

    function destroy() {
        if (category.projects_count > 0) {
            window.alert(
                'Kategori ini masih digunakan oleh proyek. Pindahkan atau hapus proyek terlebih dahulu.'
            );
            return;
        }

        if (
            !window.confirm(
                `Hapus kategori "${category.name}"?`
            )
        ) {
            return;
        }

        router.delete(
            `/admin/project-categories/${category.id}`,
            {
                preserveScroll: true,
                onStart: () => setDeleting(true),
                onFinish: () => setDeleting(false),
            }
        );
    }

    return (
        <div className="pa-prj-category-row">
            {editing ? (
                <EditCategory
                    category={category}
                    onClose={() => setEditing(false)}
                />
            ) : (
                <>
                    <div className="pa-prj-category-row__info">
                        <strong>{category.name}</strong>
                        <span>
                            {category.projects_count} proyek
                            {' · '}
                            Urutan {category.sort_order}
                        </span>
                    </div>

                    <div className="pa-prj-inline-actions">
                        <button
                            type="button"
                            className="pa-prj-action"
                            onClick={() => setEditing(true)}
                        >
                            <Pencil size={15} />
                            Edit
                        </button>

                        <button
                            type="button"
                            className="pa-prj-action pa-prj-action--danger"
                            disabled={deleting}
                            onClick={destroy}
                        >
                            <Trash2 size={15} />
                            Hapus
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

function CategoryManager({
    categories,
}: {
    categories: Category[];
}) {
    return (
        <section className="pa-prj-panel">
            <div className="pa-prj-panel__heading">
                <span className="pa-editor-kicker">
                    <Layers3 size={15} />
                    PENGELOLAAN KATEGORI
                </span>

                <h2>Kategori Proyek</h2>

                <p>
                    Buat kategori untuk mengelompokkan
                    karya dan proyek portofolio.
                </p>
            </div>

            <div className="pa-prj-category-layout">
                <CreateCategory />

                <div className="pa-prj-category-list">
                    {categories.length === 0 ? (
                        <p className="pa-prj-muted">
                            Belum ada kategori proyek.
                        </p>
                    ) : (
                        categories.map((category) => (
                            <CategoryRow
                                key={category.id}
                                category={category}
                            />
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}

// ==========================================
// PROJECT GALLERY FORM
// ==========================================

function GalleryEditor({
    data,
    errors,
    existingImages,
    onChange,
}: {
    data: ProjectData;
    errors: ProjectErrors;
    existingImages: ProjectImage[];
    onChange: (patch: Patch) => void;
}) {
    const [localError, setLocalError] =
        useState<string | null>(null);

    const previewUrls = useFilePreviews(data.images);

    const keptImages = data.existing_image_ids
        .map((id) =>
            existingImages.find((image) => image.id === id)
        )
        .filter(
            (image): image is ProjectImage =>
                image !== undefined
        );

    const total =
        keptImages.length + data.images.length;

    const serverImageError =
        errors.images ||
        Object.entries(errors).find(([key]) =>
            key.startsWith('images.')
        )?.[1] ||
        errors.existing_image_ids;

    function moveImage(index: number, offset: number) {
        const nextIndex = index + offset;
        const ids = [...data.existing_image_ids];

        if (
            nextIndex < 0 ||
            nextIndex >= ids.length
        ) {
            return;
        }

        [ids[index], ids[nextIndex]] = [
            ids[nextIndex],
            ids[index],
        ];

        onChange({
            existing_image_ids: ids,
        });
    }

    function addFiles(files: FileList | null) {
        if (!files) {
            return;
        }

        const selected = Array.from(files);

        if (total + selected.length > 5) {
            setLocalError(
                'Maksimal 5 gambar. Hapus gambar lain terlebih dahulu.'
            );
            return;
        }

        setLocalError(null);

        onChange({
            images: [...data.images, ...selected],
        });
    }

    return (
        <div className="pa-prj-gallery">
            <div className="pa-prj-gallery__heading">
                <span className="pa-editor-kicker">
                    <Images size={15} />
                    GALERI PROYEK
                </span>

                <h3>Gambar Proyek</h3>

                <p>
                    Minimal 1, maksimal 5 gambar.
                    Gambar pertama menjadi cover proyek.
                </p>
            </div>

            <div className="pa-prj-gallery__count">
                {total} / 5 gambar
            </div>

            {total > 0 && (
                <div className="pa-prj-gallery__grid">
                    {keptImages.map((image, index) => (
                        <div
                            className="pa-prj-gallery-thumb"
                            key={image.id}
                        >
                            <img
                                src={image.url}
                                alt={`Gambar proyek ${index + 1}`}
                            />

                            <span>
                                {index === 0
                                    ? 'Cover'
                                    : `Gambar ${index + 1}`}
                            </span>

                            <div className="pa-prj-gallery-thumb__actions">
                                <button
                                    type="button"
                                    aria-label="Geser gambar ke kiri"
                                    disabled={index === 0}
                                    onClick={() =>
                                        moveImage(index, -1)
                                    }
                                >
                                    <ArrowUp size={14} />
                                </button>

                                <button
                                    type="button"
                                    aria-label="Geser gambar ke kanan"
                                    disabled={
                                        index ===
                                        keptImages.length - 1
                                    }
                                    onClick={() =>
                                        moveImage(index, 1)
                                    }
                                >
                                    <ArrowDown size={14} />
                                </button>

                                <button
                                    type="button"
                                    aria-label="Buang gambar dari proyek"
                                    onClick={() =>
                                        onChange({
                                            existing_image_ids:
                                                data.existing_image_ids.filter(
                                                    (id) =>
                                                        id !== image.id
                                                ),
                                        })
                                    }
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {data.images.map((file, index) => (
                        <div
                            className="pa-prj-gallery-thumb"
                            key={`${file.name}-${index}`}
                        >
                            {previewUrls[index] ? (
                                <img
                                    src={previewUrls[index]}
                                    alt={`Gambar baru ${index + 1}`}
                                />
                            ) : (
                                <div className="pa-prj-gallery-thumb__placeholder">
                                    <ImagePlus size={23} />
                                </div>
                            )}

                            <span>
                                {keptImages.length + index === 0
                                    ? 'Cover baru'
                                    : 'Gambar baru'}
                            </span>

                            <button
                                type="button"
                                className="pa-prj-gallery-thumb__remove"
                                aria-label={`Hapus ${file.name}`}
                                onClick={() =>
                                    onChange({
                                        images:
                                            data.images.filter(
                                                (_, i) =>
                                                    i !== index
                                            ),
                                    })
                                }
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <label className="pa-prj-upload">
                <ImagePlus size={23} />

                <span>
                    <strong>
                        Pilih Gambar Proyek
                    </strong>

                    <small>
                        JPG, PNG, atau WebP · Maks. 3 MB/gambar
                    </small>
                </span>

                <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.webp"
                    disabled={total >= 5}
                    onChange={(event) => {
                        addFiles(event.target.files);
                        event.target.value = '';
                    }}
                />
            </label>

            {(localError || serverImageError) && (
                <p className="pa-editor-error" role="alert">
                    {localError || serverImageError}
                </p>
            )}

            {total === 0 && (
                <p className="pa-editor-hint">
                    Unggah minimal satu gambar sebelum menyimpan.
                </p>
            )}
        </div>
    );
}

// ==========================================
// PROJECT CREATE / EDIT
// ==========================================

function ProjectEditor({
    categories,
    project,
    onClose,
}: {
    categories: Category[];
    project?: Project;
    onClose?: () => void;
}) {
    const form = useForm<ProjectData>({
        project_category_id:
            project?.project_category_id ?? '',
        title: project?.title ?? '',
        description: project?.description ?? '',
        technologies: project?.technologies ?? '',
        sort_order: project?.sort_order ?? 0,
        images: [],
        existing_image_ids:
            project?.images.map((image) => image.id) ?? [],
        ...(project ? { _method: 'put' as const } : {}),
    });

    const imageCount =
        form.data.images.length +
        form.data.existing_image_ids.length;

    function update(patch: Patch) {
        form.setData({
            ...form.data,
            ...patch,
        });
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (imageCount < 1 || imageCount > 5) {
            form.setError(
                'images',
                'Proyek wajib memiliki 1–5 gambar.'
            );
            return;
        }

        const options = {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                if (project) {
                    onClose?.();
                } else {
                    form.reset();
                    form.clearErrors();
                }
            },
        };

        if (project) {
            // Upload PHP: POST + _method=put
            form.post(
                `/admin/projects/${project.id}`,
                options
            );
        } else {
            form.post('/admin/projects', options);
        }
    }

    return (
        <form onSubmit={submit}>
            <div className="pa-prj-form">
                <Field
                    id={`project-category-${project?.id ?? 'new'}`}
                    label="Kategori Proyek"
                    error={form.errors.project_category_id}
                >
                    <select
                        id={`project-category-${project?.id ?? 'new'}`}
                        className="pa-editor-input"
                        required
                        value={form.data.project_category_id}
                        onChange={(event) =>
                            update({
                                project_category_id:
                                    event.target.value === ''
                                        ? ''
                                        : Number(
                                            event.target.value
                                        ),
                            })
                        }
                    >
                        <option value="">
                            Pilih kategori proyek
                        </option>

                        {categories.map((category) => (
                            <option
                                key={category.id}
                                value={category.id}
                            >
                                {category.name}
                            </option>
                        ))}
                    </select>
                </Field>

                <Field
                    id={`project-title-${project?.id ?? 'new'}`}
                    label="Judul Proyek"
                    error={form.errors.title}
                >
                    <input
                        id={`project-title-${project?.id ?? 'new'}`}
                        className="pa-editor-input"
                        required
                        maxLength={200}
                        value={form.data.title}
                        placeholder="Contoh: Sistem Informasi Akademik"
                        onChange={(event) =>
                            update({
                                title: event.target.value,
                            })
                        }
                    />
                </Field>

                <Field
                    id={`project-description-${project?.id ?? 'new'}`}
                    label="Deskripsi Proyek"
                    error={form.errors.description}
                >
                    <textarea
                        id={`project-description-${project?.id ?? 'new'}`}
                        className="pa-editor-textarea"
                        rows={6}
                        required
                        maxLength={10000}
                        value={form.data.description}
                        placeholder="Jelaskan fungsi dan hasil proyek..."
                        onChange={(event) =>
                            update({
                                description:
                                    event.target.value,
                            })
                        }
                    />

                    <div className="pa-editor-count">
                        {form.data.description.length} / 10000
                    </div>
                </Field>

                <Field
                    id={`project-technologies-${project?.id ?? 'new'}`}
                    label="Teknologi yang Digunakan"
                    hint="Opsional. Pisahkan teknologi dengan koma."
                    error={form.errors.technologies}
                >
                    <input
                        id={`project-technologies-${project?.id ?? 'new'}`}
                        className="pa-editor-input"
                        maxLength={3000}
                        value={form.data.technologies}
                        placeholder="Laravel, React, TypeScript, MySQL"
                        onChange={(event) =>
                            update({
                                technologies:
                                    event.target.value,
                            })
                        }
                    />
                </Field>

                <Field
                    id={`project-order-${project?.id ?? 'new'}`}
                    label="Urutan Tampil"
                    error={form.errors.sort_order}
                >
                    <input
                        id={`project-order-${project?.id ?? 'new'}`}
                        className="pa-editor-input"
                        type="number"
                        required
                        min={0}
                        max={4294967295}
                        step={1}
                        value={form.data.sort_order}
                        onChange={(event) =>
                            update({
                                sort_order: Number(
                                    event.target.value || 0
                                ),
                            })
                        }
                    />
                </Field>

                <GalleryEditor
                    data={form.data}
                    errors={form.errors}
                    existingImages={project?.images ?? []}
                    onChange={update}
                />
            </div>

            <div className="pa-prj-form__actions">
                {project && (
                    <button
                        type="button"
                        className="pa-prj-action"
                        onClick={onClose}
                        disabled={form.processing}
                    >
                        Batal
                    </button>
                )}

                <button
                    type="submit"
                    className="pa-button pa-button--primary"
                    disabled={
                        form.processing ||
                        categories.length === 0 ||
                        imageCount < 1 ||
                        imageCount > 5 ||
                        (Boolean(project) && !form.isDirty)
                    }
                >
                    {project ? (
                        <Save size={17} />
                    ) : (
                        <Plus size={17} />
                    )}

                    {form.processing
                        ? 'Menyimpan...'
                        : project
                          ? 'Simpan Perubahan'
                          : 'Tambah Proyek'}
                </button>
            </div>
        </form>
    );
}

// ==========================================
// PROJECT CARD
// ==========================================

function ProjectCard({
    project,
    categories,
    onPreview,
}: {
    project: Project;
    categories: Category[];
    onPreview: (project: Project) => void;
}) {
    const [editing, setEditing] = useState(false);
    const [deleting, setDeleting] = useState(false);

    function destroy() {
        if (
            !window.confirm(
                `Hapus proyek "${project.title}" beserta seluruh gambarnya?`
            )
        ) {
            return;
        }

        router.delete(`/admin/projects/${project.id}`, {
            preserveScroll: true,
            onStart: () => setDeleting(true),
            onFinish: () => setDeleting(false),
        });
    }

    return (
        <article className="pa-prj-card">
            {editing ? (
                <>
                    <div className="pa-prj-card__edit-head">
                        <span className="pa-editor-kicker">
                            <Pencil size={15} />
                            EDIT PROYEK
                        </span>

                        <button
                            type="button"
                            className="pa-prj-action"
                            onClick={() => setEditing(false)}
                            aria-label="Tutup editor"
                        >
                            <X size={17} />
                        </button>
                    </div>

                    <ProjectEditor
                        project={project}
                        categories={categories}
                        onClose={() => setEditing(false)}
                    />
                </>
            ) : (
                <>
                    <button
                        type="button"
                        className="pa-prj-cover"
                        onClick={() => onPreview(project)}
                        aria-label={`Buka galeri ${project.title}`}
                    >
                        {project.images[0] ? (
                            <img
                                src={project.images[0].url}
                                alt={`Cover ${project.title}`}
                            />
                        ) : (
                            <ImagePlus size={30} />
                        )}

                        <span className="pa-prj-cover__count">
                            <Images size={14} />
                            {project.images.length} gambar
                        </span>
                    </button>

                    <div className="pa-prj-card__content">
                        <span className="pa-prj-card__category">
                            {project.category.name}
                        </span>

                        <h3>{project.title}</h3>

                        <p>{project.description}</p>

                        {project.technologies && (
                            <div className="pa-prj-technologies">
                                {project.technologies
                                    .split(',')
                                    .map((item) => item.trim())
                                    .filter(Boolean)
                                    .map((item, index) => (
                                        <span key={`${item}-${index}`}>
                                            {item}
                                        </span>
                                    ))}
                            </div>
                        )}

                        <div className="pa-prj-card__footer">
                            <span>
                                Urutan {project.sort_order}
                            </span>

                            <div className="pa-prj-inline-actions">
                                <button
                                    type="button"
                                    className="pa-prj-action"
                                    onClick={() =>
                                        setEditing(true)
                                    }
                                >
                                    <Pencil size={15} />
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    className="pa-prj-action pa-prj-action--danger"
                                    onClick={destroy}
                                    disabled={deleting}
                                >
                                    <Trash2 size={15} />
                                    Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </article>
    );
}

// ==========================================
// MODAL SLIDESHOW
// ==========================================

function ProjectSlideshow({
    project,
    onClose,
}: {
    project: Project | null;
    onClose: () => void;
}) {
    const [index, setIndex] = useState(0);
    const count = project?.images.length ?? 0;

    function changeSlide(offset: number) {
        if (!count) {
            return;
        }

        setIndex((current) =>
            (current + offset + count) % count
        );
    }

    return (
        <Dialog.Root
            open={project !== null}
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                    setIndex(0);
                }
            }}
        >
            <Dialog.Portal>
                <Dialog.Overlay className="pa-prj-modal-backdrop" />

                <Dialog.Content
                    className="pa-prj-modal"
                    aria-describedby={undefined}
                    onKeyDown={(event) => {
                        if (event.key === 'ArrowLeft') {
                            event.preventDefault();
                            changeSlide(-1);
                        }

                        if (event.key === 'ArrowRight') {
                            event.preventDefault();
                            changeSlide(1);
                        }
                    }}
                >
                    <div className="pa-prj-modal__header">
                        <div>
                            <span className="pa-editor-kicker">
                                GALERI PROYEK
                            </span>

                            <Dialog.Title className="pa-prj-modal__title">
                                {project?.title ?? 'Galeri'}
                            </Dialog.Title>
                        </div>

                        <Dialog.Close
                            className="pa-prj-modal__close"
                            aria-label="Tutup galeri"
                        >
                            <X size={21} />
                        </Dialog.Close>
                    </div>

                    {project && count > 0 && (
                        <>
                            <div className="pa-prj-modal__stage">
                                <img
                                    src={
                                        project.images[
                                            index % count
                                        ].url
                                    }
                                    alt={`${project.title} — gambar ${index % count + 1}`}
                                />

                                {count > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            className="pa-prj-modal__prev"
                                            aria-label="Gambar sebelumnya"
                                            onClick={() =>
                                                changeSlide(-1)
                                            }
                                        >
                                            <ChevronLeft size={24} />
                                        </button>

                                        <button
                                            type="button"
                                            className="pa-prj-modal__next"
                                            aria-label="Gambar berikutnya"
                                            onClick={() =>
                                                changeSlide(1)
                                            }
                                        >
                                            <ChevronRight size={24} />
                                        </button>
                                    </>
                                )}
                            </div>

                            <div className="pa-prj-modal__footer">
                                <span>
                                    {index % count + 1} / {count}
                                </span>

                                <div className="pa-prj-modal__dots">
                                    {project.images.map((image, i) => (
                                        <button
                                            key={image.id}
                                            type="button"
                                            className={
                                                'pa-prj-modal__dot' +
                                                (i === index % count
                                                    ? ' pa-prj-modal__dot--active'
                                                    : '')
                                            }
                                            onClick={() => setIndex(i)}
                                            aria-label={`Tampilkan gambar ${i + 1}`}
                                            aria-current={
                                                i === index % count
                                                    ? 'true'
                                                    : undefined
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

// ==========================================
// MAIN PAGE
// ==========================================

export default function Index({
    categories,
    projects,
}: Props) {
    const [filter, setFilter] = useState<number | 'all'>(
        'all'
    );

    const [previewProject, setPreviewProject] =
        useState<Project | null>(null);

    const { flash } = usePage().props as {
        flash?: {
            success?: string | null;
            error?: string | null;
        };
    };

    const filtered = projects.filter((project) =>
        filter === 'all'
            ? true
            : project.project_category_id === filter
    );

    return (
        <AdminLayout
            title="Proyek"
            description="Kelola portofolio proyek, kategori, teknologi, dan galeri gambar."
        >
            <Head title="Proyek · Portfolio Admin" />

            {flash?.success && (
                <div
                    className="pa-editor-success"
                    role="status"
                >
                    <CheckCircle2 size={18} />
                    {flash.success}
                </div>
            )}

            {flash?.error && (
                <p
                    className="pa-prj-message-error"
                    role="alert"
                >
                    {flash.error}
                </p>
            )}

            <CategoryManager categories={categories} />

            <div className="pa-prj-grid">
                <section className="pa-prj-panel pa-prj-create">
                    <div className="pa-prj-panel__heading">
                        <span className="pa-editor-kicker">
                            <Plus size={15} />
                            PROYEK BARU
                        </span>

                        <h2>Tambah Proyek</h2>

                        <p>
                            Lengkapi detail proyek dan
                            unggah galeri berisi 1–5 gambar.
                        </p>
                    </div>

                    {categories.length === 0 && (
                        <p className="pa-prj-notice">
                            Tambahkan kategori proyek
                            terlebih dahulu.
                        </p>
                    )}

                    <ProjectEditor
                        categories={categories}
                    />
                </section>

                <section className="pa-prj-panel pa-prj-list">
                    <div className="pa-prj-panel__heading">
                        <span className="pa-editor-kicker">
                            <FolderKanban size={15} />
                            PORTOFOLIO PROYEK
                        </span>

                        <div className="pa-prj-list__title">
                            <div>
                                <h2>Daftar Proyek</h2>
                                <p>
                                    Klik gambar untuk
                                    melihat slideshow.
                                </p>
                            </div>

                            <span className="pa-prj-count">
                                {projects.length}
                            </span>
                        </div>
                    </div>

                    <div className="pa-prj-filters">
                        <button
                            type="button"
                            className={
                                'pa-prj-filter' +
                                (filter === 'all'
                                    ? ' pa-prj-filter--active'
                                    : '')
                            }
                            onClick={() => setFilter('all')}
                        >
                            Semua
                        </button>

                        {categories.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                className={
                                    'pa-prj-filter' +
                                    (filter === category.id
                                        ? ' pa-prj-filter--active'
                                        : '')
                                }
                                onClick={() =>
                                    setFilter(category.id)
                                }
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>

                    {filtered.length === 0 ? (
                        <div className="pa-prj-empty">
                            <FolderKanban size={29} />

                            <h3>Belum ada proyek</h3>

                            <p>
                                Tambahkan proyek pertama
                                melalui formulir yang tersedia.
                            </p>
                        </div>
                    ) : (
                        <div className="pa-prj-list__body">
                            {filtered.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    categories={categories}
                                    onPreview={setPreviewProject}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>

            <ProjectSlideshow
                project={previewProject}
                onClose={() => setPreviewProject(null)}
            />
        </AdminLayout>
    );
}
