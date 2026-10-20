
import { Head, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
    Camera,
    CheckCircle2,
    FileText,
    ImageIcon,
    Info,
    Save,
    Sparkles,
    UserRound,
} from 'lucide-react';

import AdminLayout from '../../../layouts/admin-layout';

// ========================================
// TYPES
// ========================================

type ProfileValues = {
    full_name: string;
    display_name: string;
    email: string;
    whatsapp: string;
    photo_url: string | null;
    logo_url: string | null;
};

type HeroValues = {
    headline: string;
    description: string;
};

type AboutValues = {
    description: string;
};

type Props =
    | { kind: 'profile'; values: ProfileValues }
    | { kind: 'hero'; values: HeroValues }
    | { kind: 'about'; values: AboutValues };

// ========================================
// IMAGE PREVIEW HOOK
// ========================================

function useFilePreview(file: File | null): string | null {
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            setPreview(null);
            return;
        }

        const url = URL.createObjectURL(file);
        setPreview(url);

        return () => URL.revokeObjectURL(url);
    }, [file]);

    return preview;
}

// ========================================
// REUSABLE COMPONENTS
// ========================================

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
                <p className="pa-editor-hint">
                    {hint}
                </p>
            )}

            {error && (
                <p
                    id={`${id}-error`}
                    className="pa-editor-error"
                    role="alert"
                >
                    {error}
                </p>
            )}
        </div>
    );
}

function SaveButton({
    processing,
    dirty,
}: {
    processing: boolean;
    dirty: boolean;
}) {
    return (
        <div className="pa-editor-actions">
            <span className="pa-editor-save-note">
                {dirty
                    ? 'Ada perubahan yang belum disimpan'
                    : 'Tidak ada perubahan'}
            </span>

            <button
                type="submit"
                disabled={processing || !dirty}
                className="pa-button pa-button--primary"
            >
                <Save size={17} />

                {processing
                    ? 'Menyimpan...'
                    : 'Simpan Perubahan'}
            </button>
        </div>
    );
}

function PreviewCard({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <aside className="pa-editor-preview">
            <div className="pa-editor-preview__header">
                <span className="pa-editor-kicker">
                    <Sparkles size={15} />
                    LIVE PREVIEW
                </span>

                <span className="pa-editor-preview__dot" />
            </div>

            {children}

            <div className="pa-editor-preview__footer">
                <Info size={15} />
                Preview mengikuti input yang sedang diedit.
            </div>
        </aside>
    );
}

function ImageUpload({
    id,
    title,
    accept,
    inputRef,
    file,
    onChange,
}: {
    id: string;
    title: string;
    accept: string;
    inputRef: React.RefObject<HTMLInputElement | null>;
    file: File | null;
    onChange: (file: File | null) => void;
}) {
    return (
        <>
            <label
                htmlFor={id}
                className="pa-editor-upload"
            >
                <span className="pa-editor-upload__icon">
                    <Camera size={23} />
                </span>

                <span>
                    <strong>
                        {file ? file.name : title}
                    </strong>

                    <small>
                        Klik untuk memilih gambar
                    </small>
                </span>
            </label>

            <input
                ref={inputRef}
                id={id}
                type="file"
                className="pa-editor-file-input"
                accept={accept}
                onChange={(event) => {
                    onChange(
                        event.target.files?.[0] ?? null
                    );
                }}
            />
        </>
    );
}

// ========================================
// PERSONAL INFORMATION
// ========================================

function ProfileEditor({
    values,
}: {
    values: ProfileValues;
}) {
    const photoInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const form = useForm({
        full_name: values.full_name,
        display_name: values.display_name,
        email: values.email,
        whatsapp: values.whatsapp,

        photo: null as File | null,
        logo: null as File | null,

        _method: 'put' as const,
    });

    const photoPreview = useFilePreview(form.data.photo);
    const logoPreview = useFilePreview(form.data.logo);

    const currentPhoto = photoPreview || values.photo_url;
    const currentLogo = logoPreview || values.logo_url;

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.post('/admin/profile', {
            forceFormData: true,
            preserveScroll: true,

            onSuccess: () => {
                form.defaults({
                    ...form.data,
                    photo: null,
                    logo: null,
                });

                form.reset('photo', 'logo');

                if (photoInputRef.current) {
                    photoInputRef.current.value = '';
                }

                if (logoInputRef.current) {
                    logoInputRef.current.value = '';
                }
            },
        });
    }

    return (
        <div className="pa-editor-split">
            <form
                onSubmit={submit}
                className="pa-editor-card"
                encType="multipart/form-data"
            >
                <div className="pa-editor-card__heading">
                    <span className="pa-editor-kicker">
                        <UserRound size={15} />
                        PERSONAL DETAILS
                    </span>

                    <h2>Identitas & Branding</h2>

                    <p>
                        Kelola informasi pribadi, foto profil,
                        dan logo yang digunakan pada website.
                    </p>
                </div>

                <div className="pa-editor-fields">
                    <div className="pa-editor-two">
                        <Field
                            id="full_name"
                            label="Nama Lengkap"
                            error={form.errors.full_name}
                        >
                            <input
                                id="full_name"
                                required
                                maxLength={150}
                                className="pa-editor-input"
                                value={form.data.full_name}
                                onChange={(event) =>
                                    form.setData(
                                        'full_name',
                                        event.target.value
                                    )
                                }
                                placeholder="Nama lengkap"
                            />
                        </Field>

                        <Field
                            id="display_name"
                            label="Nama Tampilan"
                            error={form.errors.display_name}
                        >
                            <input
                                id="display_name"
                                required
                                maxLength={100}
                                className="pa-editor-input"
                                value={form.data.display_name}
                                onChange={(event) =>
                                    form.setData(
                                        'display_name',
                                        event.target.value
                                    )
                                }
                                placeholder="Nama di website"
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
                            required
                            maxLength={255}
                            className="pa-editor-input"
                            value={form.data.email}
                            onChange={(event) =>
                                form.setData(
                                    'email',
                                    event.target.value
                                )
                            }
                            placeholder="email@domain.com"
                        />
                    </Field>

                    <Field
                        id="whatsapp"
                        label="Nomor WhatsApp"
                        hint="Opsional. Gunakan nomor yang aktif."
                        error={form.errors.whatsapp}
                    >
                        <input
                            id="whatsapp"
                            type="tel"
                            className="pa-editor-input"
                            value={form.data.whatsapp}
                            onChange={(event) =>
                                form.setData(
                                    'whatsapp',
                                    event.target.value
                                )
                            }
                            placeholder="6281234567890"
                        />
                    </Field>

                    {/* FOTO PROFIL */}

                    <Field
                        id="photo"
                        label="Foto Profil"
                        hint="JPG, PNG, atau WebP. Maksimal 3 MB."
                        error={form.errors.photo}
                    >
                        <div className="pa-editor-image-current">
                            {currentPhoto ? (
                                <img
                                    src={currentPhoto}
                                    alt="Preview foto profil"
                                    className="pa-editor-photo-image"
                                />
                            ) : (
                                <UserRound size={32} />
                            )}

                            <span>
                                {form.data.photo
                                    ? 'Foto baru dipilih'
                                    : 'Foto profil saat ini'}
                            </span>
                        </div>

                        <ImageUpload
                            id="photo"
                            title="Pilih foto profil"
                            accept=".jpg,.jpeg,.png,.webp"
                            inputRef={photoInputRef}
                            file={form.data.photo}
                            onChange={(file) =>
                                form.setData('photo', file)
                            }
                        />
                    </Field>

                    {/* LOGO WEBSITE */}

                    <div className="pa-editor-brand-section">
                        <span className="pa-editor-kicker">
                            <ImageIcon size={15} />
                            WEBSITE BRANDING
                        </span>

                        <h3>Logo Website</h3>

                        <p>
                            Logo digunakan pada sidebar admin,
                            halaman login, dan website publik.
                        </p>
                    </div>

                    <Field
                        id="logo"
                        label="Logo Utama"
                        hint="Satu logo untuk seluruh website. JPG, PNG, atau WebP. Maksimal 2 MB."
                        error={form.errors.logo}
                    >
                        <div className="pa-editor-brand-preview">
                            {currentLogo ? (
                                <img
                                    src={currentLogo}
                                    alt="Preview logo website"
                                />
                            ) : (
                                <div className="pa-editor-brand-empty">
                                    <ImageIcon size={30} />
                                    <span>
                                        Belum ada logo
                                    </span>
                                </div>
                            )}
                        </div>

                        <ImageUpload
                            id="logo"
                            title="Pilih atau ganti logo"
                            accept=".jpg,.jpeg,.png,.webp"
                            inputRef={logoInputRef}
                            file={form.data.logo}
                            onChange={(file) =>
                                form.setData('logo', file)
                            }
                        />
                    </Field>
                </div>

                <SaveButton
                    processing={form.processing}
                    dirty={form.isDirty}
                />
            </form>

            {/* LIVE PREVIEW */}

            <PreviewCard>
                <div className="pa-profile-preview">
                    <div className="pa-profile-avatar">
                        {currentPhoto ? (
                            <img
                                src={currentPhoto}
                                alt="Preview profil"
                            />
                        ) : (
                            <UserRound size={38} />
                        )}
                    </div>

                    <span className="pa-profile-preview__eyebrow">
                        PORTFOLIO OWNER
                    </span>

                    <h3>
                        {form.data.display_name ||
                            'Nama Tampilan'}
                    </h3>

                    <p>
                        {form.data.full_name ||
                            'Nama lengkap'}
                    </p>

                    <div className="pa-profile-preview__details">
                        <div>
                            <span>Email</span>
                            <strong>
                                {form.data.email || '—'}
                            </strong>
                        </div>

                        <div>
                            <span>WhatsApp</span>
                            <strong>
                                {form.data.whatsapp || '—'}
                            </strong>
                        </div>

                        <div>
                            <span>Logo Website</span>

                            {currentLogo ? (
                                <img
                                    src={currentLogo}
                                    alt="Logo website"
                                    className="pa-profile-logo-preview"
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

// ========================================
// HERO SECTION
// ========================================

function HeroEditor({
    values,
}: {
    values: HeroValues;
}) {
    const form = useForm({
        headline: values.headline,
        description: values.description,
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.put('/admin/hero', {
            preserveScroll: true,
            onSuccess: () => form.defaults(),
        });
    }

    return (
        <div className="pa-editor-split">
            <form
                onSubmit={submit}
                className="pa-editor-card"
            >
                <div className="pa-editor-card__heading">
                    <span className="pa-editor-kicker">
                        <Sparkles size={15} />
                        HERO CONTENT
                    </span>

                    <h2>Konten Pembuka</h2>

                    <p>
                        Atur headline dan deskripsi yang
                        menyambut pengunjung website.
                    </p>
                </div>

                <div className="pa-editor-fields">
                    <Field
                        id="headline"
                        label="Headline"
                        error={form.errors.headline}
                    >
                        <input
                            id="headline"
                            required
                            maxLength={255}
                            className="pa-editor-input"
                            value={form.data.headline}
                            onChange={(event) =>
                                form.setData(
                                    'headline',
                                    event.target.value
                                )
                            }
                            placeholder="Headline portofolio"
                        />
                    </Field>

                    <Field
                        id="hero_description"
                        label="Deskripsi Hero"
                        error={form.errors.description}
                    >
                        <textarea
                            id="hero_description"
                            required
                            rows={6}
                            maxLength={3000}
                            className="pa-editor-textarea"
                            value={form.data.description}
                            onChange={(event) =>
                                form.setData(
                                    'description',
                                    event.target.value
                                )
                            }
                            placeholder="Ceritakan secara singkat..."
                        />

                        <div className="pa-editor-count">
                            {form.data.description.length} / 3000
                        </div>
                    </Field>
                </div>

                <SaveButton
                    processing={form.processing}
                    dirty={form.isDirty}
                />
            </form>

            <PreviewCard>
                <div className="pa-hero-preview">
                    <span>WELCOME TO MY PORTFOLIO</span>

                    <h3>
                        {form.data.headline ||
                            'Headline portofolio'}
                    </h3>

                    <p>
                        {form.data.description ||
                            'Deskripsi Hero akan muncul di sini.'}
                    </p>

                    <div className="pa-hero-preview__buttons">
                        <span>Lihat Proyek ↗</span>
                        <span>Hubungi Saya</span>
                    </div>
                </div>
            </PreviewCard>
        </div>
    );
}

// ========================================
// ABOUT SECTION
// ========================================

function AboutEditor({
    values,
}: {
    values: AboutValues;
}) {
    const form = useForm({
        description: values.description,
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.put('/admin/about', {
            preserveScroll: true,
            onSuccess: () => form.defaults(),
        });
    }

    return (
        <div className="pa-editor-split">
            <form
                onSubmit={submit}
                className="pa-editor-card"
            >
                <div className="pa-editor-card__heading">
                    <span className="pa-editor-kicker">
                        <FileText size={15} />
                        ABOUT CONTENT
                    </span>

                    <h2>Ceritakan Dirimu</h2>

                    <p>
                        Tulis deskripsi personal yang akan
                        muncul pada bagian Tentang Saya.
                    </p>
                </div>

                <div className="pa-editor-fields">
                    <Field
                        id="about_description"
                        label="Deskripsi Tentang Saya"
                        error={form.errors.description}
                    >
                        <textarea
                            id="about_description"
                            required
                            rows={12}
                            maxLength={10000}
                            className="pa-editor-textarea"
                            value={form.data.description}
                            onChange={(event) =>
                                form.setData(
                                    'description',
                                    event.target.value
                                )
                            }
                            placeholder="Tuliskan tentang dirimu..."
                        />

                        <div className="pa-editor-count">
                            {form.data.description.length} / 10000
                        </div>
                    </Field>
                </div>

                <SaveButton
                    processing={form.processing}
                    dirty={form.isDirty}
                />
            </form>

            <PreviewCard>
                <div className="pa-about-preview">
                    <span>ABOUT ME</span>

                    <h3>Lebih dekat dengan saya.</h3>

                    <p>
                        {form.data.description ||
                            'Deskripsi tentang diri akan muncul di sini.'}
                    </p>
                </div>
            </PreviewCard>
        </div>
    );
}

// ========================================
// MAIN PAGE
// ========================================

export default function Edit(props: Props) {
    const page = usePage();

    const flash = (
        page.props as {
            flash?: {
                success?: string | null;
            };
        }
    ).flash;

    const config = {
        profile: {
            title: 'Informasi Pribadi',
            description:
                'Kelola identitas dan branding website.',
        },
        hero: {
            title: 'Hero Section',
            description:
                'Atur konten pembuka halaman utama.',
        },
        about: {
            title: 'Tentang Saya',
            description:
                'Kelola deskripsi personal pada website.',
        },
    };

    const current = config[props.kind];

    return (
        <AdminLayout
            title={current.title}
            description={current.description}
        >
            <Head title={`${current.title} · Portfolio Admin`} />

            {flash?.success && (
                <div
                    className="pa-editor-success"
                    role="status"
                >
                    <CheckCircle2 size={19} />
                    <span>{flash.success}</span>
                </div>
            )}

            {props.kind === 'profile' && (
                <ProfileEditor values={props.values} />
            )}

            {props.kind === 'hero' && (
                <HeroEditor values={props.values} />
            )}

            {props.kind === 'about' && (
                <AboutEditor values={props.values} />
            )}
        </AdminLayout>
    );
}
