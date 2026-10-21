import { Head, useForm, usePage } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode, RefObject } from "react";
import {
    Camera,
    CheckCircle2,
    FileText,
    ImageIcon,
    Info,
    Save,
    Sparkles,
    UserRound,
    RotateCcw,
    Trash2,
    Upload,
} from "lucide-react";

import AdminLayout from "../../../layouts/admin-layout";

type ProfileValues = {
    full_name: string;
    display_name: string;
    email: string;
    whatsapp: string;
    photo_url: string | null;
    logo_url: string | null;
};

type AboutValues = {
    description: string;
};

type HeroValues = AboutValues & {
    headline: string;
};

type Props =
    | { kind: "profile"; values: ProfileValues }
    | { kind: "hero"; values: HeroValues }
    | { kind: "about"; values: AboutValues };

// ==========================================
// PRATINJAU GAMBAR
// ==========================================

function useImagePreview(file: File | null) {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            setUrl(null);
            return;
        }

        const nextUrl = URL.createObjectURL(file);
        setUrl(nextUrl);

        return () => URL.revokeObjectURL(nextUrl);
    }, [file]);

    return url;
}

// ==========================================
// KOMPONEN FORM
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
            <label className="pa-editor-label" htmlFor={id}>
                {label}
            </label>

            {children}

            {hint && <p className="pa-editor-hint">{hint}</p>}

            {error && (
                <p id={`${id}-error`} className="pa-editor-error" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

function EditorHeading({
    icon,
    eyebrow,
    title,
    description,
}: {
    icon: ReactNode;
    eyebrow: string;
    title: string;
    description: string;
}) {
    return (
        <header className="pa-editor-group__header">
            <span className="pa-editor-kicker">
                {icon}
                {eyebrow}
            </span>

            <h2>{title}</h2>

            <p>{description}</p>
        </header>
    );
}

function SaveBar({
    processing,
    dirty,
}: {
    processing: boolean;
    dirty: boolean;
}) {
    return (
        <div className="pa-editor-actions">
            <span className="pa-editor-save-note" aria-live="polite">
                {processing
                    ? "Sedang menyimpan perubahan..."
                    : dirty
                      ? "Ada perubahan yang belum disimpan."
                      : "Belum ada perubahan."}
            </span>

            <button
                className="pa-button pa-button--primary"
                type="submit"
                disabled={processing || !dirty}
            >
                <Save size={17} aria-hidden="true" />

                {processing ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
        </div>
    );
}

function PreviewCard({ children }: { children: ReactNode }) {
    return (
        <aside className="pa-editor-preview" aria-label="Pratinjau konten">
            <div className="pa-editor-preview__header">
                <span className="pa-editor-kicker">
                    <Sparkles size={15} aria-hidden="true" />
                    PRATINJAU LANGSUNG
                </span>

                <span className="pa-editor-preview__dot" aria-hidden="true" />
            </div>

            {children}

            <div className="pa-editor-preview__footer">
                <Info size={15} aria-hidden="true" />

                <span>
                    Pratinjau mengikuti perubahan. Data tersimpan setelah
                    menekan Simpan.
                </span>
            </div>
        </aside>
    );
}

function ImageUpload({
    id,
    title,
    file,
    existingUrl,
    removeExisting,
    maxMb,
    variant,
    inputRef,
    onChange,
}: {
    id: string;
    title: string;
    file: File | null;
    existingUrl: string | null;
    removeExisting: boolean;
    maxMb: number;
    variant: "photo" | "logo";
    inputRef: RefObject<HTMLInputElement | null>;
    onChange: (file: File | null, removeExisting: boolean) => void;
}) {
    const [localError, setLocalError] = useState<string | null>(null);

    // Hook yang sudah tersedia di file ini.
    // Object URL dibersihkan otomatis.
    const selectedPreview = useImagePreview(file);

    const previewUrl = selectedPreview ?? (removeExisting ? null : existingUrl);

    function selectFile(event: ChangeEvent<HTMLInputElement>) {
        const selected = event.target.files?.[0];

        if (!selected) return;

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        if (!allowedTypes.includes(selected.type)) {
            setLocalError("Gunakan gambar JPG, PNG, atau WebP.");

            event.target.value = "";
            return;
        }

        if (selected.size > maxMb * 1024 * 1024) {
            setLocalError(`Ukuran gambar maksimal ${maxMb} MB.`);

            event.target.value = "";
            return;
        }

        setLocalError(null);

        // Upload baru otomatis membatalkan
        // perintah hapus gambar lama.
        onChange(selected, false);
    }

    function clearSelectedFile() {
        if (inputRef.current) {
            inputRef.current.value = "";
        }

        setLocalError(null);

        // Gambar yang baru dipilih dibatalkan.
        // Jika ada gambar lama, tampilkan kembali.
        onChange(null, false);
    }

    function removeSavedFile() {
        if (inputRef.current) {
            inputRef.current.value = "";
        }

        setLocalError(null);

        // Tandai file lama untuk dihapus saat simpan.
        onChange(null, true);
    }

    function restoreSavedFile() {
        setLocalError(null);
        onChange(null, false);
    }

    return (
        <div className="pa-profile-upload">
            <div className="pa-profile-upload__box">
                <div
                    className={
                        "pa-profile-upload__preview " +
                        `pa-profile-upload__preview--${variant}`
                    }
                >
                    {previewUrl ? (
                        <img src={previewUrl} alt={`Preview ${title}`} />
                    ) : (
                        <div className="pa-profile-upload__empty">
                            {variant === "photo" ? (
                                <UserRound size={29} aria-hidden="true" />
                            ) : (
                                <ImageIcon size={29} aria-hidden="true" />
                            )}

                            <span>Belum ada gambar</span>
                        </div>
                    )}
                </div>

                <div className="pa-profile-upload__details">
                    <strong>{title}</strong>

                    <p>
                        {file
                            ? "Gambar baru siap disimpan."
                            : removeExisting
                              ? "Gambar lama akan dihapus saat disimpan."
                              : previewUrl
                                ? "Gambar tersedia."
                                : "Pilih gambar untuk diunggah."}
                    </p>

                    {file && (
                        <span className="pa-profile-upload__filename">
                            {file.name}
                        </span>
                    )}

                    <small>JPG, PNG, WebP · Maks. {maxMb} MB</small>

                    <div className="pa-profile-upload__actions">
                        <input
                            ref={inputRef}
                            id={id}
                            name={id}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="pa-profile-upload__input"
                            onChange={selectFile}
                        />

                        <label
                            htmlFor={id}
                            className="pa-profile-upload__choose"
                        >
                            <Upload size={15} />

                            {previewUrl ? "Ganti Gambar" : "Pilih Gambar"}
                        </label>

                        {file && (
                            <button
                                type="button"
                                className="pa-profile-upload__remove"
                                onClick={clearSelectedFile}
                            >
                                <Trash2 size={15} />
                                Hapus Foto
                            </button>
                        )}

                        {!file && existingUrl && !removeExisting && (
                            <button
                                type="button"
                                className="pa-profile-upload__remove"
                                onClick={removeSavedFile}
                            >
                                <Trash2 size={15} />

                                {variant === "photo"
                                    ? "Hapus Foto"
                                    : "Hapus Logo"}
                            </button>
                        )}

                        {removeExisting && existingUrl && !file && (
                            <button
                                type="button"
                                className="pa-profile-upload__restore"
                                onClick={restoreSavedFile}
                            >
                                <RotateCcw size={15} />
                                Batalkan Hapus
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {localError && (
                <p className="pa-editor-error" role="alert">
                    {localError}
                </p>
            )}
        </div>
    );
}

// ==========================================
// INFORMASI PRIBADI
// ==========================================

function ProfileEditor({ values }: { values: ProfileValues }) {
    const photoRef = useRef<HTMLInputElement>(null);
    const logoRef = useRef<HTMLInputElement>(null);

    const form = useForm({
        full_name: values.full_name,
        display_name: values.display_name,
        email: values.email,
        whatsapp: values.whatsapp,

        photo: null as File | null,
        logo: null as File | null,

        remove_photo: false,
        remove_logo: false,

        _method: "put" as const,
    });

    const photoUrl =
        useImagePreview(form.data.photo) ??
        (form.data.remove_photo ? null : values.photo_url);

    const logoUrl =
        useImagePreview(form.data.logo) ??
        (form.data.remove_logo ? null : values.logo_url);

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.post("/admin/profile", {
            forceFormData: true,
            preserveScroll: true,

            onSuccess: () => {
                form.setDefaults({
                    ...form.data,
                    photo: null,
                    logo: null,
                    remove_photo: false,
                    remove_logo: false,
                });

                form.reset("photo", "logo", "remove_photo", "remove_logo");

                if (photoRef.current) {
                    photoRef.current.value = "";
                }

                if (logoRef.current) {
                    logoRef.current.value = "";
                }
            },
        });
    }

    return (
        <div className="pa-editor-split pa-profile-editor">
            <form
                className="pa-editor-card"
                onSubmit={submit}
                encType="multipart/form-data"
            >
                {/* IDENTITAS PUBLIK */}

                <section
                    className="pa-editor-group"
                    aria-label="Informasi pribadi"
                >
                    <EditorHeading
                        icon={<UserRound size={15} />}
                        eyebrow="INFORMASI PRIBADI"
                        title="Profil & Kontak"
                        description="Informasi yang digunakan untuk memperkenalkan dirimu dan memudahkan pengunjung menghubungi kamu."
                    />

                    <div className="pa-editor-group__body">
                        <div className="pa-editor-two">
                            <Field
                                id="full_name"
                                label="Nama Lengkap"
                                error={form.errors.full_name}
                            >
                                <input
                                    id="full_name"
                                    className="pa-editor-input"
                                    aria-invalid={Boolean(
                                        form.errors.full_name,
                                    )}
                                    required
                                    maxLength={150}
                                    value={form.data.full_name}
                                    onChange={(event) =>
                                        form.setData(
                                            "full_name",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Masukkan nama lengkap"
                                />
                            </Field>

                            <Field
                                id="display_name"
                                label="Nama Tampilan"
                                error={form.errors.display_name}
                            >
                                <input
                                    id="display_name"
                                    className="pa-editor-input"
                                    aria-invalid={Boolean(
                                        form.errors.display_name,
                                    )}
                                    required
                                    maxLength={100}
                                    value={form.data.display_name}
                                    onChange={(event) =>
                                        form.setData(
                                            "display_name",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Nama yang tampil di website"
                                />
                            </Field>
                        </div>

                        <Field
                            id="email"
                            label="Email Publik"
                            error={form.errors.email}
                        >
                            <input
                                id="email"
                                type="email"
                                className="pa-editor-input"
                                aria-invalid={Boolean(form.errors.email)}
                                required
                                maxLength={255}
                                value={form.data.email}
                                onChange={(event) =>
                                    form.setData("email", event.target.value)
                                }
                                placeholder="nama@domain.com"
                            />
                        </Field>

                        <Field
                            id="whatsapp"
                            label="Nomor WhatsApp"
                            hint="Opsional. Gunakan format internasional, misalnya 6281234567890."
                            error={form.errors.whatsapp}
                        >
                            <input
                                id="whatsapp"
                                type="tel"
                                className="pa-editor-input"
                                aria-invalid={Boolean(form.errors.whatsapp)}
                                value={form.data.whatsapp}
                                onChange={(event) =>
                                    form.setData("whatsapp", event.target.value)
                                }
                                placeholder="6281234567890"
                            />
                        </Field>

                        {/* FOTO PROFIL */}

                        {/* FOTO PROFIL */}

                        <Field
                            id="photo"
                            label="Foto Profil"
                            error={form.errors.photo}
                        >
                            <ImageUpload
                                id="photo"
                                title="Foto Profil"
                                variant="photo"
                                maxMb={3}
                                file={form.data.photo}
                                existingUrl={values.photo_url}
                                removeExisting={form.data.remove_photo}
                                inputRef={photoRef}
                                onChange={(file, removeExisting) =>
                                    form.setData({
                                        ...form.data,
                                        photo: file,
                                        remove_photo: removeExisting,
                                    })
                                }
                            />
                        </Field>
                    </div>
                </section>

                {/* IDENTITAS VISUAL */}

                <section
                    className="pa-editor-group pa-editor-group--branding"
                    aria-label="Identitas visual"
                >
                    <EditorHeading
                        icon={<ImageIcon size={15} />}
                        eyebrow="IDENTITAS VISUAL"
                        title="Logo Website"
                        description="Kelola satu logo utama yang digunakan pada website publik dan panel admin."
                    />

                    <div className="pa-editor-group__body">
                        <Field
                            id="logo"
                            label="Logo Utama"
                            error={form.errors.logo}
                        >
                            <ImageUpload
                                id="logo"
                                title="Logo Website"
                                variant="logo"
                                maxMb={2}
                                file={form.data.logo}
                                existingUrl={values.logo_url}
                                removeExisting={form.data.remove_logo}
                                inputRef={logoRef}
                                onChange={(file, removeExisting) =>
                                    form.setData({
                                        ...form.data,
                                        logo: file,
                                        remove_logo: removeExisting,
                                    })
                                }
                            />
                        </Field>
                    </div>
                </section>

                <SaveBar processing={form.processing} dirty={form.isDirty} />
            </form>

            {/* PRATINJAU PROFIL */}

            <PreviewCard>
                <div className="pa-profile-preview">
                    <div className="pa-profile-avatar">
                        {photoUrl ? (
                            <img src={photoUrl} alt="Foto profil" />
                        ) : (
                            <UserRound size={38} aria-hidden="true" />
                        )}
                    </div>

                    <span className="pa-profile-preview__eyebrow">
                        IDENTITAS PUBLIK
                    </span>

                    <h3>{form.data.display_name || "Nama Tampilan"}</h3>

                    <p>{form.data.full_name || "Nama lengkap"}</p>

                    <div className="pa-profile-preview__details">
                        <div>
                            <span>Email</span>
                            <strong>{form.data.email || "—"}</strong>
                        </div>

                        <div>
                            <span>WhatsApp</span>
                            <strong>{form.data.whatsapp || "—"}</strong>
                        </div>

                        <div>
                            <span>Logo Utama</span>

                            {logoUrl ? (
                                <img
                                    className="pa-profile-logo-preview"
                                    src={logoUrl}
                                    alt="Logo utama"
                                />
                            ) : (
                                <strong>Belum tersedia</strong>
                            )}
                        </div>
                    </div>
                </div>
            </PreviewCard>
        </div>
    );
}

// ==========================================
// HERO SECTION
// ==========================================

function HeroEditor({ values }: { values: HeroValues }) {
    const form = useForm({
        headline: values.headline,
        description: values.description,
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.put("/admin/hero", {
            preserveScroll: true,
            onSuccess: () => form.setDefaults(),
        });
    }

    return (
        <div className="pa-editor-split pa-hero-editor">
            <form className="pa-editor-card" onSubmit={submit}>
                <EditorHeading
                    icon={<Sparkles size={15} />}
                    eyebrow="HALAMAN UTAMA"
                    title="Hero Section"
                    description="Tentukan kalimat pembuka yang pertama kali dilihat pengunjung website."
                />

                <div className="pa-editor-group__body">
                    <Field
                        id="headline"
                        label="Headline"
                        error={form.errors.headline}
                    >
                        <input
                            id="headline"
                            className="pa-editor-input"
                            aria-invalid={Boolean(form.errors.headline)}
                            required
                            maxLength={255}
                            value={form.data.headline}
                            onChange={(event) =>
                                form.setData("headline", event.target.value)
                            }
                            placeholder="Tulis headline yang kuat dan singkat"
                        />
                    </Field>

                    <Field
                        id="hero_description"
                        label="Deskripsi Hero"
                        error={form.errors.description}
                    >
                        <textarea
                            id="hero_description"
                            className="pa-editor-textarea"
                            aria-invalid={Boolean(form.errors.description)}
                            required
                            maxLength={3000}
                            rows={7}
                            value={form.data.description}
                            onChange={(event) =>
                                form.setData("description", event.target.value)
                            }
                            placeholder="Ceritakan secara singkat tentang dirimu..."
                        />

                        <div className="pa-editor-count">
                            {form.data.description.length} / 3000 karakter
                        </div>
                    </Field>
                </div>

                <SaveBar processing={form.processing} dirty={form.isDirty} />
            </form>

            <PreviewCard>
                <div className="pa-hero-preview">
                    <span>SELAMAT DATANG</span>

                    <h3>
                        {form.data.headline ||
                            "Headline utama akan tampil di sini."}
                    </h3>

                    <p>
                        {form.data.description ||
                            "Deskripsi singkat akan tampil di sini."}
                    </p>

                    <div className="pa-hero-preview__buttons">
                        <span>Lihat Proyek</span>
                        <span>Hubungi Saya</span>
                    </div>
                </div>
            </PreviewCard>
        </div>
    );
}

// ==========================================
// TENTANG SAYA
// ==========================================

function AboutEditor({ values }: { values: AboutValues }) {
    const form = useForm({
        description: values.description,
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.put("/admin/about", {
            preserveScroll: true,
            onSuccess: () => form.setDefaults(),
        });
    }

    return (
        <div className="pa-editor-split pa-about-editor">
            <form className="pa-editor-card" onSubmit={submit}>
                <EditorHeading
                    icon={<FileText size={15} />}
                    eyebrow="CERITA PERSONAL"
                    title="Tentang Saya"
                    description="Tuliskan kisah dan latar belakangmu dengan bahasa yang jelas dan personal."
                />

                <div className="pa-editor-group__body">
                    <Field
                        id="about_description"
                        label="Deskripsi Tentang Saya"
                        error={form.errors.description}
                    >
                        <textarea
                            id="about_description"
                            className="pa-editor-textarea pa-editor-textarea--long"
                            aria-invalid={Boolean(form.errors.description)}
                            required
                            rows={12}
                            maxLength={10000}
                            value={form.data.description}
                            onChange={(event) =>
                                form.setData("description", event.target.value)
                            }
                            placeholder="Ceritakan tentang dirimu..."
                        />

                        <div className="pa-editor-count">
                            {form.data.description.length} / 10000 karakter
                        </div>
                    </Field>
                </div>

                <SaveBar processing={form.processing} dirty={form.isDirty} />
            </form>

            <PreviewCard>
                <div className="pa-about-preview">
                    <span>TENTANG SAYA</span>

                    <h3>Lebih dekat dengan saya.</h3>

                    <p>
                        {form.data.description ||
                            "Cerita personal akan tampil di sini."}
                    </p>
                </div>
            </PreviewCard>
        </div>
    );
}

// ==========================================
// HALAMAN UTAMA EDITOR
// ==========================================

const headings = {
    profile: {
        title: "Informasi Pribadi",
        description:
            "Kelola identitas, informasi kontak, foto profil, dan logo website.",
    },
    hero: {
        title: "Hero Section",
        description: "Atur headline dan pengantar halaman utama.",
    },
    about: {
        title: "Tentang Saya",
        description:
            "Kelola narasi personal yang ditampilkan kepada pengunjung.",
    },
} as const;

export default function Edit(props: Props) {
    const { flash } = usePage().props as {
        flash?: {
            success?: string | null;
        };
    };

    const heading = headings[props.kind];

    return (
        <AdminLayout title={heading.title} description={heading.description}>
            <Head title={`${heading.title} · Portfolio Admin`} />

            {flash?.success && (
                <div className="pa-editor-success" role="status">
                    <CheckCircle2 size={18} aria-hidden="true" />

                    <span>{flash.success}</span>
                </div>
            )}

            {props.kind === "profile" && (
                <ProfileEditor values={props.values} />
            )}

            {props.kind === "hero" && <HeroEditor values={props.values} />}

            {props.kind === "about" && <AboutEditor values={props.values} />}
        </AdminLayout>
    );
}
