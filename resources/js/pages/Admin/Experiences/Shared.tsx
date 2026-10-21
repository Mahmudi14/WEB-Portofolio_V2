import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";

import {
    BriefcaseBusiness,
    Check,
    ChevronDown,
    ImagePlus,
    RotateCcw,
    Trash2,
    Upload,
    UsersRound,
    X,
} from "lucide-react";

import { useEffect, useId, useRef, useState } from "react";

import type { ReactNode } from "react";

// ==========================================
// TYPES
// ==========================================

export type Category = "pekerjaan" | "organisasi";

export type Experience = {
    id: number;
    category: Category;
    position: string;
    institution_name: string;
    description: string;
    start_year: number;
    end_year: number | null;
    is_current: boolean;
    sort_order: number;
    logo_url: string | null;
};

export type ExperienceFormData = {
    category: Category | "";
    position: string;
    institution_name: string;
    description: string;
    start_year: number | "";
    end_year: number | "";
    is_current: boolean;
    sort_order: number;
    logo: File | null;
    remove_logo: boolean;
};

export type ExperienceErrors = Partial<
    Record<keyof ExperienceFormData, string>
>;

export const categories: Record<Category, string> = {
    pekerjaan: "Pekerjaan",
    organisasi: "Organisasi",
};

export function emptyExperience(): ExperienceFormData {
    return {
        category: "",
        position: "",
        institution_name: "",
        description: "",
        start_year: "",
        end_year: "",
        is_current: false,
        sort_order: 0,
        logo: null,
        remove_logo: false,
    };
}

export function period(experience: Experience): string {
    if (experience.is_current) {
        return `${experience.start_year} – Sekarang`;
    }

    return experience.end_year
        ? `${experience.start_year} – ${experience.end_year}`
        : String(experience.start_year);
}

// ==========================================
// FIELD
// ==========================================

export function Field({
    id,
    label,
    error,
    children,
}: {
    id: string;
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div className="pa-exp2-field">
            <label htmlFor={id}>{label}</label>

            {children}

            {error && (
                <p className="pa-exp2-error" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

// ==========================================
// CUSTOM CATEGORY SELECT
// ==========================================

function ExperienceCategorySelect({
    id,
    value,
    onChange,
}: {
    id: string;
    value: Category | "";
    onChange: (value: Category) => void;
}) {
    return (
        <Select.Root
            value={value}
            onValueChange={(next) => onChange(next as Category)}
            required
        >
            <Select.Trigger id={id} className="pa-exp2-select-trigger">
                <span className="pa-exp2-select-selected">
                    {value === "pekerjaan" && <BriefcaseBusiness size={16} />}

                    {value === "organisasi" && <UsersRound size={16} />}

                    <Select.Value placeholder="Pilih kategori pengalaman" />
                </span>

                <Select.Icon className="pa-exp2-select-arrow">
                    <ChevronDown size={16} />
                </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
                <Select.Content
                    className="pa-exp2-select-content"
                    position="popper"
                    sideOffset={7}
                    collisionPadding={8}
                >
                    <Select.Viewport className="pa-exp2-select-viewport">
                        <Select.Item
                            value="pekerjaan"
                            className="pa-exp2-select-option"
                        >
                            <BriefcaseBusiness
                                size={17}
                                className="pa-exp2-option-icon"
                            />

                            <Select.ItemText>Pekerjaan</Select.ItemText>

                            <Select.ItemIndicator className="pa-exp2-option-check">
                                <Check size={16} />
                            </Select.ItemIndicator>
                        </Select.Item>

                        <Select.Item
                            value="organisasi"
                            className="pa-exp2-select-option"
                        >
                            <UsersRound
                                size={17}
                                className="pa-exp2-option-icon"
                            />

                            <Select.ItemText>Organisasi</Select.ItemText>

                            <Select.ItemIndicator className="pa-exp2-option-check">
                                <Check size={16} />
                            </Select.ItemIndicator>
                        </Select.Item>
                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    );
}

// ==========================================
// FOTO PREVIEW & UPLOAD
// ==========================================

function ExperiencePhotoUpload({
    id,
    file,
    existingLogo,
    removeLogo,
    error,
    onChange,
}: {
    id: string;
    file: File | null;
    existingLogo?: string | null;
    removeLogo: boolean;
    error?: string;
    onChange: (patch: Partial<ExperienceFormData>) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [localError, setLocalError] = useState<string | null>(null);

    // Membuat preview dan membersihkan object URL
    useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            return;
        }

        const url = URL.createObjectURL(file);

        setPreviewUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [file]);

    const displayedPhoto =
        previewUrl ?? (removeLogo ? null : (existingLogo ?? null));

    function selectPhoto(event: React.ChangeEvent<HTMLInputElement>) {
        const selected = event.target.files?.[0];

        if (!selected) return;

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        if (!allowedTypes.includes(selected.type)) {
            setLocalError("Format harus JPG, PNG, atau WebP.");

            event.target.value = "";
            return;
        }

        if (selected.size > 2 * 1024 * 1024) {
            setLocalError("Ukuran foto maksimal 2 MB.");

            event.target.value = "";
            return;
        }

        setLocalError(null);

        onChange({
            logo: selected,
            remove_logo: false,
        });
    }

    // Menghapus foto yang baru dipilih.
    function clearSelectedPhoto() {
        if (inputRef.current) {
            inputRef.current.value = "";
        }

        setLocalError(null);

        onChange({
            logo: null,
            remove_logo: false,
        });
    }

    // Menandai logo tersimpan untuk dihapus.
    function removeExistingPhoto() {
        if (inputRef.current) {
            inputRef.current.value = "";
        }

        onChange({
            logo: null,
            remove_logo: true,
        });
    }

    function restoreExistingPhoto() {
        onChange({
            remove_logo: false,
        });
    }

    return (
        <div className="pa-exp2-photo-field">
            <label className="pa-exp2-photo-label">
                Logo Perusahaan / Organisasi
                <span> (Opsional)</span>
            </label>

            <div className="pa-exp2-photo-box">
                <div className="pa-exp2-photo-preview">
                    {displayedPhoto ? (
                        <img
                            src={displayedPhoto}
                            alt="Preview logo pengalaman"
                        />
                    ) : (
                        <div className="pa-exp2-photo-placeholder">
                            <ImagePlus size={29} />
                            <span>Belum ada foto</span>
                        </div>
                    )}
                </div>

                <div className="pa-exp2-photo-info">
                    <strong>
                        {file
                            ? "Foto baru dipilih"
                            : displayedPhoto
                              ? "Logo pengalaman"
                              : "Upload logo"}
                    </strong>

                    {file ? (
                        <p className="pa-exp2-photo-filename">{file.name}</p>
                    ) : (
                        <p>
                            Pilih gambar untuk ditampilkan bersama pengalaman.
                        </p>
                    )}

                    <small>JPG, PNG atau WebP · Maks. 2 MB</small>

                    <div className="pa-exp2-photo-actions">
                        <input
                            ref={inputRef}
                            id={id}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="pa-exp2-file-input"
                            onChange={selectPhoto}
                        />

                        <label htmlFor={id} className="pa-exp2-upload-button">
                            <Upload size={15} />
                            {displayedPhoto ? "Ganti Foto" : "Pilih Foto"}
                        </label>

                        {file && (
                            <button
                                type="button"
                                className="pa-exp2-remove-button"
                                onClick={clearSelectedPhoto}
                            >
                                <Trash2 size={15} />
                                Hapus Foto
                            </button>
                        )}

                        {!file && existingLogo && !removeLogo && (
                            <button
                                type="button"
                                className="pa-exp2-remove-button"
                                onClick={removeExistingPhoto}
                            >
                                <Trash2 size={15} />
                                Hapus Logo
                            </button>
                        )}

                        {removeLogo && !file && existingLogo && (
                            <button
                                type="button"
                                className="pa-exp2-restore-button"
                                onClick={restoreExistingPhoto}
                            >
                                <RotateCcw size={15} />
                                Batalkan Hapus
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {file && (
                <p className="pa-exp2-photo-note">
                    Preview ditampilkan sebelum foto disimpan ke database.
                </p>
            )}

            {removeLogo && !file && (
                <p className="pa-exp2-photo-note">
                    Logo lama akan dihapus setelah perubahan berhasil disimpan.
                </p>
            )}

            {(localError || error) && (
                <p className="pa-exp2-error" role="alert">
                    {localError || error}
                </p>
            )}
        </div>
    );
}

// ==========================================
// EXPERIENCE FORM FIELDS
// ==========================================

export function ExperienceFields({
    prefix,
    data,
    errors,
    onChange,
    existingLogo,
}: {
    prefix: string;
    data: ExperienceFormData;
    errors: ExperienceErrors;
    onChange: (values: Partial<ExperienceFormData>) => void;
    existingLogo?: string | null;
}) {
    const year = new Date().getFullYear();

    return (
        <div className="pa-exp2-fields">
            <Field
                id={`${prefix}-category`}
                label="Kategori Pengalaman"
                error={errors.category}
            >
                <ExperienceCategorySelect
                    id={`${prefix}-category`}
                    value={data.category}
                    onChange={(category) => onChange({ category })}
                />
            </Field>

            <Field
                id={`${prefix}-position`}
                label="Jabatan / Posisi"
                error={errors.position}
            >
                <input
                    id={`${prefix}-position`}
                    required
                    maxLength={150}
                    value={data.position}
                    placeholder="Contoh: Web Developer"
                    onChange={(e) =>
                        onChange({
                            position: e.target.value,
                        })
                    }
                />
            </Field>

            <Field
                id={`${prefix}-institution`}
                label="Perusahaan / Organisasi"
                error={errors.institution_name}
            >
                <input
                    id={`${prefix}-institution`}
                    required
                    maxLength={200}
                    value={data.institution_name}
                    placeholder="Nama perusahaan atau organisasi"
                    onChange={(e) =>
                        onChange({
                            institution_name: e.target.value,
                        })
                    }
                />
            </Field>

            <Field
                id={`${prefix}-description`}
                label="Deskripsi Pengalaman"
                error={errors.description}
            >
                <textarea
                    id={`${prefix}-description`}
                    required
                    rows={5}
                    maxLength={10000}
                    value={data.description}
                    placeholder="Jelaskan tanggung jawab, kontribusi, dan hasil yang dicapai..."
                    onChange={(e) =>
                        onChange({
                            description: e.target.value,
                        })
                    }
                />
            </Field>

            <div className="pa-exp2-years">
                <Field
                    id={`${prefix}-start`}
                    label="Tahun Mulai"
                    error={errors.start_year}
                >
                    <input
                        id={`${prefix}-start`}
                        type="number"
                        min={1900}
                        max={year}
                        required
                        value={data.start_year}
                        onChange={(e) =>
                            onChange({
                                start_year:
                                    e.target.value === ""
                                        ? ""
                                        : Number(e.target.value),
                            })
                        }
                    />
                </Field>

                <Field
                    id={`${prefix}-end`}
                    label="Tahun Selesai"
                    error={errors.end_year}
                >
                    <input
                        id={`${prefix}-end`}
                        type="number"
                        min={1900}
                        max={year}
                        disabled={data.is_current}
                        value={data.is_current ? "" : data.end_year}
                        onChange={(e) =>
                            onChange({
                                end_year:
                                    e.target.value === ""
                                        ? ""
                                        : Number(e.target.value),
                            })
                        }
                    />
                </Field>
            </div>

            <label className="pa-exp2-check">
                <input
                    type="checkbox"
                    checked={data.is_current}
                    onChange={(e) =>
                        onChange({
                            is_current: e.target.checked,
                            end_year: e.target.checked ? "" : data.end_year,
                        })
                    }
                />
                Masih berlangsung hingga sekarang
            </label>

            <ExperiencePhotoUpload
                id={`${prefix}-logo`}
                file={data.logo}
                existingLogo={existingLogo}
                removeLogo={data.remove_logo}
                error={errors.logo}
                onChange={onChange}
            />
        </div>
    );
}

// ==========================================
// MODAL
// ==========================================

export function ExperienceModal({
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
    description?: string;
    busy?: boolean;
    children: ReactNode;
}) {
    const descriptionId = useId();

    return (
        <Dialog.Root
            open={open}
            onOpenChange={(next) => {
                if (!busy) onOpenChange(next);
            }}
        >
            <Dialog.Portal>
                <Dialog.Overlay className="pa-exp2-overlay" />

                <Dialog.Content
                    className="pa-exp2-modal"
                    aria-describedby={description ? descriptionId : undefined}
                >
                    <div className="pa-exp2-modal-header">
                        <div>
                            <Dialog.Title>{title}</Dialog.Title>

                            {description && (
                                <Dialog.Description id={descriptionId}>
                                    {description}
                                </Dialog.Description>
                            )}
                        </div>

                        <Dialog.Close
                            disabled={busy}
                            aria-label="Tutup"
                            className="pa-exp2-close"
                        >
                            <X size={18} />
                        </Dialog.Close>
                    </div>

                    <div className="pa-exp2-modal-body">{children}</div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

// ==========================================
// FLASH MESSAGE
// ==========================================

export function ExperienceFlash({ message }: { message?: string | null }) {
    if (!message) return null;

    return (
        <div className="pa-editor-success" role="status">
            {message}
        </div>
    );
}
