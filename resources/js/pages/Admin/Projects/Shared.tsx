import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';

import {
    ArrowLeft,
    ArrowRight,
    Check,
    ChevronDown,
    ImagePlus,
    Trash2,
    Upload,
    X,
} from 'lucide-react';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import type {
    ProjectCategory,
    ProjectErrors,
    ProjectForm,
    ProjectImage,
} from './types';

// ==========================================
// FIELD
// ==========================================

export function Field({
    id,
    label,
    error,
    hint,
    children,
}: {
    id: string;
    label: string;
    error?: string;
    hint?: string;
    children: ReactNode;
}) {
    return (
        <div className="pa-prj2-field">
            <label htmlFor={id}>
                {label}
            </label>

            {children}

            {hint && (
                <small>{hint}</small>
            )}

            {error && (
                <p
                    className="pa-prj2-error"
                    role="alert"
                >
                    {error}
                </p>
            )}
        </div>
    );
}

// ==========================================
// CUSTOM CATEGORY SELECT
// ==========================================

function CategorySelect({
    id,
    value,
    categories,
    onChange,
}: {
    id: string;
    value: number | '';
    categories: ProjectCategory[];
    onChange: (id: number) => void;
}) {
    return (
        <Select.Root
            value={
                value === ''
                    ? ''
                    : String(value)
            }
            onValueChange={(next) =>
                onChange(Number(next))
            }
            required
        >
            <Select.Trigger
                id={id}
                className="pa-prj2-select"
            >
                <Select.Value
                    placeholder="Pilih kategori proyek"
                />

                <Select.Icon
                    className="pa-prj2-select-arrow"
                >
                    <ChevronDown size={16} />
                </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
                <Select.Content
                    className="pa-prj2-select-menu"
                    position="popper"
                    sideOffset={6}
                    collisionPadding={8}
                >
                    <Select.Viewport>
                        {categories.map((category) => (
                            <Select.Item
                                key={category.id}
                                value={String(category.id)}
                                className="pa-prj2-select-option"
                            >
                                <Select.ItemText>
                                    {category.name}
                                </Select.ItemText>

                                <Select.ItemIndicator>
                                    <Check size={15} />
                                </Select.ItemIndicator>
                            </Select.Item>
                        ))}
                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    );
}

// ==========================================
// PREVIEW GAMBAR
// ==========================================

function useImagePreviews(files: File[]) {
    const [previews, setPreviews] = useState<string[]>([]);

    useEffect(() => {
        const urls = files.map((file) =>
            URL.createObjectURL(file)
        );

        setPreviews(urls);

        return () => {
            urls.forEach((url) =>
                URL.revokeObjectURL(url)
            );
        };
    }, [files]);

    return previews;
}

// ==========================================
// GALERI EDITOR
// ==========================================

export function GalleryEditor({
    data,
    errors,
    existingImages,
    onChange,
}: {
    data: ProjectForm;
    errors: ProjectErrors;
    existingImages: ProjectImage[];
    onChange: (patch: Partial<ProjectForm>) => void;
}) {
    const [localError, setLocalError] =
        useState<string | null>(null);

    const previews = useImagePreviews(data.images);

    const keptImages = data.existing_image_ids
        .map((id) =>
            existingImages.find(
                (image) => image.id === id
            )
        )
        .filter(
            (image): image is ProjectImage =>
                image !== undefined
        );

    const count =
        keptImages.length + data.images.length;

    const serverError =
        errors.images ||
        errors.existing_image_ids ||
        Object.entries(errors).find(
            ([key]) =>
                key.startsWith('images.')
        )?.[1];

    function addImages(files: FileList | null) {
        if (!files) return;

        const selected = Array.from(files);

        if (count + selected.length > 5) {
            setLocalError(
                'Maksimal lima gambar per proyek.'
            );
            return;
        }

        const allowed = [
            'image/jpeg',
            'image/png',
            'image/webp',
        ];

        if (
            selected.some(
                (file) =>
                    !allowed.includes(file.type)
            )
        ) {
            setLocalError(
                'Gunakan JPG, PNG, atau WebP.'
            );
            return;
        }

        if (
            selected.some(
                (file) =>
                    file.size > 3 * 1024 * 1024
            )
        ) {
            setLocalError(
                'Setiap gambar maksimal 3 MB.'
            );
            return;
        }

        setLocalError(null);

        onChange({
            images: [
                ...data.images,
                ...selected,
            ],
        });
    }

    function moveExisting(
        index: number,
        direction: number
    ) {
        const nextIndex = index + direction;
        const ids = [...data.existing_image_ids];

        if (
            nextIndex < 0 ||
            nextIndex >= ids.length
        ) {
            return;
        }

        const current = ids[index];
        const next = ids[nextIndex];

        if (
            current === undefined ||
            next === undefined
        ) {
            return;
        }

        ids[index] = next;
        ids[nextIndex] = current;

        onChange({
            existing_image_ids: ids,
        });
    }

    function moveNew(
        index: number,
        direction: number
    ) {
        const nextIndex = index + direction;
        const files = [...data.images];

        if (
            nextIndex < 0 ||
            nextIndex >= files.length
        ) {
            return;
        }

        const current = files[index];
        const next = files[nextIndex];

        if (
            current === undefined ||
            next === undefined
        ) {
            return;
        }

        files[index] = next;
        files[nextIndex] = current;

        onChange({ images: files });
    }

    return (
        <div className="pa-prj2-gallery">
            <div className="pa-prj2-gallery-heading">
                <div>
                    <h3>Galeri Proyek</h3>

                    <p>
                        Minimal 1, maksimal 5 gambar.
                        Gambar pertama menjadi cover.
                    </p>
                </div>

                <span className="pa-prj2-count">
                    {count}/5 gambar
                </span>
            </div>

            {count > 0 && (
                <div className="pa-prj2-gallery-grid">
                    {keptImages.map((image, index) => (
                        <div
                            key={`old-${image.id}`}
                            className="pa-prj2-image-card"
                        >
                            <img
                                src={image.url}
                                alt={`Gambar proyek ${index + 1}`}
                            />

                            <span className="pa-prj2-image-label">
                                {index === 0
                                    ? 'Cover'
                                    : `Gambar ${index + 1}`}
                            </span>

                            <div className="pa-prj2-image-actions">
                                <button
                                    type="button"
                                    title="Geser ke kiri"
                                    aria-label="Geser gambar ke kiri"
                                    disabled={index === 0}
                                    onClick={() =>
                                        moveExisting(index, -1)
                                    }
                                >
                                    <ArrowLeft size={14} />
                                </button>

                                <button
                                    type="button"
                                    title="Geser ke kanan"
                                    aria-label="Geser gambar ke kanan"
                                    disabled={
                                        index === keptImages.length - 1
                                    }
                                    onClick={() =>
                                        moveExisting(index, 1)
                                    }
                                >
                                    <ArrowRight size={14} />
                                </button>

                                <button
                                    type="button"
                                    title="Hapus gambar"
                                    aria-label="Hapus gambar dari galeri"
                                    onClick={() =>
                                        onChange({
                                            existing_image_ids:
                                                data.existing_image_ids.filter(
                                                    (id) => id !== image.id
                                                ),
                                        })
                                    }
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {data.images.map((file, index) => (
                        <div
                            key={`new-${index}`}
                            className="pa-prj2-image-card"
                        >
                            {previews[index] ? (
                                <img
                                    src={previews[index]}
                                    alt={`Preview ${file.name}`}
                                />
                            ) : (
                                <div className="pa-prj2-image-placeholder">
                                    <ImagePlus size={28} />
                                </div>
                            )}

                            <span className="pa-prj2-image-label">
                                {keptImages.length + index === 0
                                    ? 'Cover baru'
                                    : `Gambar baru ${index + 1}`}
                            </span>

                            <div className="pa-prj2-image-actions">
                                <button
                                    type="button"
                                    aria-label="Geser gambar ke kiri"
                                    disabled={index === 0}
                                    onClick={() =>
                                        moveNew(index, -1)
                                    }
                                >
                                    <ArrowLeft size={14} />
                                </button>

                                <button
                                    type="button"
                                    aria-label="Geser gambar ke kanan"
                                    disabled={
                                        index === data.images.length - 1
                                    }
                                    onClick={() =>
                                        moveNew(index, 1)
                                    }
                                >
                                    <ArrowRight size={14} />
                                </button>

                                <button
                                    type="button"
                                    aria-label={`Hapus ${file.name}`}
                                    onClick={() =>
                                        onChange({
                                            images:
                                                data.images.filter(
                                                    (_, i) => i !== index
                                                ),
                                        })
                                    }
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <label className="pa-prj2-upload">
                <Upload size={23} />

                <strong>Tambah Gambar Proyek</strong>

                <span>
                    JPG, PNG, WebP · maksimal 3 MB/gambar
                </span>

                <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    disabled={count >= 5}
                    onChange={(event) => {
                        addImages(event.target.files);
                        event.target.value = '';
                    }}
                />
            </label>

            <p className="pa-prj2-muted">
                Gambar yang dihapus dari daftar belum
                dihapus dari server sampai kamu menekan
                Simpan Perubahan.
            </p>

            {(localError || serverError) && (
                <p
                    className="pa-prj2-error"
                    role="alert"
                >
                    {localError || serverError}
                </p>
            )}
        </div>
    );
}

// ==========================================
// FORM FIELDS
// ==========================================

export function ProjectFields({
    prefix,
    categories,
    data,
    errors,
    existingImages = [],
    onChange,
}: {
    prefix: string;
    categories: ProjectCategory[];
    data: ProjectForm;
    errors: ProjectErrors;
    existingImages?: ProjectImage[];
    onChange: (patch: Partial<ProjectForm>) => void;
}) {
    return (
        <div className="pa-prj2-fields">
            <Field
                id={`${prefix}-category`}
                label="Kategori Proyek"
                error={errors.project_category_id}
            >
                <CategorySelect
                    id={`${prefix}-category`}
                    value={data.project_category_id}
                    categories={categories}
                    onChange={(id) =>
                        onChange({
                            project_category_id: id,
                        })
                    }
                />
            </Field>

            <Field
                id={`${prefix}-title`}
                label="Judul Proyek"
                error={errors.title}
            >
                <input
                    id={`${prefix}-title`}
                    required
                    maxLength={200}
                    value={data.title}
                    placeholder="Contoh: Sistem Informasi Akademik"
                    onChange={(event) =>
                        onChange({
                            title: event.target.value,
                        })
                    }
                />
            </Field>

            <Field
                id={`${prefix}-description`}
                label="Deskripsi Proyek"
                error={errors.description}
            >
                <textarea
                    id={`${prefix}-description`}
                    required
                    rows={6}
                    maxLength={10000}
                    value={data.description}
                    placeholder="Jelaskan masalah, solusi, fitur, dan hasil proyek..."
                    onChange={(event) =>
                        onChange({
                            description: event.target.value,
                        })
                    }
                />

                <small className="pa-prj2-character-count">
                    {data.description.length} / 10000
                </small>
            </Field>

            <Field
                id={`${prefix}-technologies`}
                label="Teknologi yang Digunakan"
                hint="Opsional. Pisahkan dengan koma."
                error={errors.technologies}
            >
                <input
                    id={`${prefix}-technologies`}
                    maxLength={3000}
                    value={data.technologies}
                    placeholder="Laravel, React, MySQL"
                    onChange={(event) =>
                        onChange({
                            technologies: event.target.value,
                        })
                    }
                />
            </Field>

            <GalleryEditor
                data={data}
                errors={errors}
                existingImages={existingImages}
                onChange={onChange}
            />
        </div>
    );
}

// ==========================================
// MODAL
// ==========================================

export function ProjectModal({
    open,
    onOpenChange,
    title,
    description,
    busy = false,
    children,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    busy?: boolean;
    children: ReactNode;
}) {
    return (
        <Dialog.Root
            open={open}
            onOpenChange={(next) => {
                if (!busy) onOpenChange(next);
            }}
        >
            <Dialog.Portal>
                <Dialog.Overlay
                    className="pa-prj2-overlay"
                />

                <Dialog.Content
                    className="pa-prj2-modal"
                >
                    <div className="pa-prj2-modal-header">
                        <div>
                            <Dialog.Title>{title}</Dialog.Title>
                            <Dialog.Description>
                                {description}
                            </Dialog.Description>
                        </div>

                        <Dialog.Close
                            type="button"
                            className="pa-prj2-modal-close"
                            disabled={busy}
                            aria-label="Tutup"
                        >
                            <X size={18} />
                        </Dialog.Close>
                    </div>

                    <div className="pa-prj2-modal-body">
                        {children}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

export function ProjectFlash({
    success,
    error,
}: {
    success?: string | null;
    error?: string | null;
}) {
    return (
        <>
            {success && (
                <div
                    className="pa-editor-success"
                    role="status"
                >
                    {success}
                </div>
            )}

            {error && (
                <p
                    className="pa-prj2-error"
                    role="alert"
                >
                    {error}
                </p>
            )}
        </>
    );
}