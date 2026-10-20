
import {
    Head,
    router,
    useForm,
    usePage,
} from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import type {
    FormEvent,
    ReactNode,
    RefObject,
} from 'react';

import {
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    CheckCircle2,
    ImageIcon,
    Pencil,
    Plus,
    Save,
    Trash2,
    UsersRound,
    X,
} from 'lucide-react';

import AdminLayout from '@/layouts/admin-layout';

// ==========================================
// TYPES
// ==========================================

type Category = 'pekerjaan' | 'organisasi';

type Experience = {
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

type ExperienceForm = {
    category: Category | '';
    position: string;
    institution_name: string;
    description: string;
    start_year: number | '';
    end_year: number | '';
    is_current: boolean;
    sort_order: number;
    logo: File | null;
    remove_logo: boolean;
};

type Props = {
    experiences: Experience[];
};

type Errors = Partial<
    Record<keyof ExperienceForm, string>
>;

const currentYear = new Date().getFullYear();

const categoryNames: Record<Category, string> = {
    pekerjaan: 'Pekerjaan',
    organisasi: 'Organisasi',
};

// ==========================================
// SHARED COMPONENTS
// ==========================================

function Field({
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
                <p
                    className="pa-editor-error"
                    role="alert"
                    id={`${id}-error`}
                >
                    {error}
                </p>
            )}
        </div>
    );
}

function useLogoPreview(file: File | null) {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            setUrl(null);
            return;
        }

        const next = URL.createObjectURL(file);
        setUrl(next);

        return () => URL.revokeObjectURL(next);
    }, [file]);

    return url;
}

function ExperienceFields({
    prefix,
    data,
    errors,
    previewUrl,
    existingLogoUrl,
    logoRef,
    onChange,
}: {
    prefix: string;
    data: ExperienceForm;
    errors: Errors;
    previewUrl: string | null;
    existingLogoUrl?: string | null;
    logoRef: RefObject<HTMLInputElement | null>;
    onChange: (
        patch: Partial<ExperienceForm>
    ) => void;
}) {
    const displayedLogo = data.remove_logo
        ? null
        : previewUrl ?? existingLogoUrl ?? null;

    return (
        <div className="pa-exp-fields">
            <Field
                id={`${prefix}-category`}
                label="Kategori Pengalaman"
                error={errors.category}
            >
                <select
                    id={`${prefix}-category`}
                    className="pa-editor-input"
                    value={data.category}
                    required
                    aria-invalid={Boolean(errors.category)}
                    onChange={(event) =>
                        onChange({
                            category:
                                event.target.value as
                                    ExperienceForm['category'],
                        })
                    }
                >
                    <option value="">
                        Pilih kategori
                    </option>
                    <option value="pekerjaan">
                        Pekerjaan
                    </option>
                    <option value="organisasi">
                        Organisasi
                    </option>
                </select>
            </Field>

            <Field
                id={`${prefix}-position`}
                label="Jabatan / Posisi"
                error={errors.position}
            >
                <input
                    id={`${prefix}-position`}
                    className="pa-editor-input"
                    required
                    maxLength={150}
                    value={data.position}
                    aria-invalid={Boolean(errors.position)}
                    placeholder="Contoh: Web Developer / Ketua Divisi"
                    onChange={(event) =>
                        onChange({
                            position: event.target.value,
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
                    className="pa-editor-input"
                    required
                    maxLength={200}
                    value={data.institution_name}
                    aria-invalid={Boolean(
                        errors.institution_name
                    )}
                    placeholder="Nama perusahaan atau organisasi"
                    onChange={(event) =>
                        onChange({
                            institution_name:
                                event.target.value,
                        })
                    }
                />
            </Field>

            <Field
                id={`${prefix}-description`}
                label="Deskripsi Pengalaman"
                hint="Jelaskan tanggung jawab, kontribusi, atau hasil yang dicapai."
                error={errors.description}
            >
                <textarea
                    id={`${prefix}-description`}
                    className="pa-editor-textarea"
                    rows={5}
                    required
                    maxLength={10000}
                    value={data.description}
                    aria-invalid={Boolean(errors.description)}
                    placeholder="Ceritakan pengalamanmu..."
                    onChange={(event) =>
                        onChange({
                            description: event.target.value,
                        })
                    }
                />

                <div className="pa-editor-count">
                    {data.description.length} / 10000
                </div>
            </Field>

            <div className="pa-exp-year-grid">
                <Field
                    id={`${prefix}-start`}
                    label="Tahun Mulai"
                    error={errors.start_year}
                >
                    <input
                        id={`${prefix}-start`}
                        className="pa-editor-input"
                        type="number"
                        required
                        min={1900}
                        max={currentYear}
                        step={1}
                        value={data.start_year}
                        aria-invalid={Boolean(errors.start_year)}
                        placeholder="2023"
                        onChange={(event) =>
                            onChange({
                                start_year:
                                    event.target.value === ''
                                        ? ''
                                        : Number(event.target.value),
                            })
                        }
                    />
                </Field>

                <Field
                    id={`${prefix}-end`}
                    label="Tahun Selesai"
                    hint={
                        data.is_current
                            ? 'Ditampilkan sebagai Sekarang.'
                            : 'Opsional.'
                    }
                    error={errors.end_year}
                >
                    <input
                        id={`${prefix}-end`}
                        className="pa-editor-input"
                        type="number"
                        min={1900}
                        max={currentYear}
                        step={1}
                        disabled={data.is_current}
                        value={
                            data.is_current
                                ? ''
                                : data.end_year
                        }
                        aria-invalid={Boolean(errors.end_year)}
                        placeholder={
                            data.is_current
                                ? 'Sekarang'
                                : '2026'
                        }
                        onChange={(event) =>
                            onChange({
                                end_year:
                                    event.target.value === ''
                                        ? ''
                                        : Number(event.target.value),
                            })
                        }
                    />
                </Field>
            </div>

            <label className="pa-exp-check">
                <input
                    type="checkbox"
                    checked={data.is_current}
                    onChange={(event) =>
                        onChange({
                            is_current: event.target.checked,
                            end_year: event.target.checked
                                ? ''
                                : data.end_year,
                        })
                    }
                />

                <span>
                    <strong>Masih aktif</strong>
                    <small>
                        Pengalaman masih berlangsung
                        hingga sekarang.
                    </small>
                </span>
            </label>

            <Field
                id={`${prefix}-order`}
                label="Urutan Tampil"
                hint="Angka yang lebih kecil ditampilkan lebih awal."
                error={errors.sort_order}
            >
                <input
                    id={`${prefix}-order`}
                    className="pa-editor-input"
                    type="number"
                    required
                    min={0}
                    max={4294967295}
                    step={1}
                    value={data.sort_order}
                    aria-invalid={Boolean(errors.sort_order)}
                    onChange={(event) =>
                        onChange({
                            sort_order:
                                Number(event.target.value || 0),
                        })
                    }
                />
            </Field>

            <div className="pa-exp-logo-section">
                <span className="pa-editor-kicker">
                    <ImageIcon size={15} />
                    LOGO INSTITUSI
                </span>

                <h3>Logo Perusahaan / Organisasi</h3>
                <p>
                    Opsional. Logo yang digunakan untuk
                    mengenali tempat pengalamanmu.
                </p>

                <div className="pa-exp-logo-preview">
                    {displayedLogo ? (
                        <img
                            src={displayedLogo}
                            alt="Pratinjau logo institusi"
                        />
                    ) : (
                        <div className="pa-exp-logo-empty">
                            <Building2 size={29} />
                            <span>Belum ada logo</span>
                        </div>
                    )}
                </div>

                <Field
                    id={`${prefix}-logo`}
                    label="Unggah Logo"
                    hint="JPG, PNG, atau WebP. Maksimal 2 MB."
                    error={errors.logo}
                >
                    <div className="pa-exp-upload-wrap">
                        <label
                            htmlFor={`${prefix}-logo`}
                            className="pa-exp-upload"
                        >
                            <ImageIcon size={21} />
                            <span>
                                <strong>
                                    {data.logo
                                        ? data.logo.name
                                        : 'Pilih atau ganti logo'}
                                </strong>
                                <small>
                                    Klik untuk memilih gambar
                                </small>
                            </span>
                        </label>

                        <input
                            ref={logoRef}
                            id={`${prefix}-logo`}
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp"
                            className="pa-exp-file-input"
                            onChange={(event) =>
                                onChange({
                                    logo:
                                        event.target.files?.[0] ??
                                        null,
                                    remove_logo: false,
                                })
                            }
                        />
                    </div>
                </Field>

                {existingLogoUrl && !data.logo && (
                    <label className="pa-exp-remove-logo">
                        <input
                            type="checkbox"
                            checked={data.remove_logo}
                            onChange={(event) =>
                                onChange({
                                    remove_logo:
                                        event.target.checked,
                                })
                            }
                        />
                        Hapus logo lama saat menyimpan
                    </label>
                )}
            </div>
        </div>
    );
}

// ==========================================
// CREATE EXPERIENCE
// ==========================================

function CreateExperience() {
    const logoRef = useRef<HTMLInputElement>(null);

    const form = useForm<ExperienceForm>({
        category: '',
        position: '',
        institution_name: '',
        description: '',
        start_year: '',
        end_year: '',
        is_current: false,
        sort_order: 0,
        logo: null,
        remove_logo: false,
    });

    const logoPreview = useLogoPreview(form.data.logo);

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.post('/admin/experiences', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                form.clearErrors();

                if (logoRef.current) {
                    logoRef.current.value = '';
                }
            },
        });
    }

    return (
        <section className="pa-exp-panel pa-exp-create">
            <header className="pa-exp-panel__header">
                <span className="pa-editor-kicker">
                    <Plus size={15} />
                    PENGALAMAN BARU
                </span>

                <h2>Tambah Pengalaman</h2>

                <p>
                    Tambahkan pekerjaan atau pengalaman
                    organisasi yang ingin ditampilkan.
                </p>
            </header>

            <form onSubmit={submit}>
                <div className="pa-exp-form">
                    <ExperienceFields
                        prefix="create"
                        data={form.data}
                        errors={form.errors}
                        previewUrl={logoPreview}
                        logoRef={logoRef}
                        onChange={(patch) =>
                            form.setData({
                                ...form.data,
                                ...patch,
                            })
                        }
                    />
                </div>

                <div className="pa-exp-form__actions">
                    <button
                        type="submit"
                        className="pa-button pa-button--primary"
                        disabled={form.processing}
                    >
                        <Plus size={17} />
                        {form.processing
                            ? 'Menambahkan...'
                            : 'Tambah Pengalaman'}
                    </button>
                </div>
            </form>
        </section>
    );
}

// ==========================================
// EXPERIENCE CARD
// ==========================================

function ExperienceCard({
    experience,
}: {
    experience: Experience;
}) {
    const [editing, setEditing] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const logoRef = useRef<HTMLInputElement>(null);

    const form = useForm<
        ExperienceForm & { _method: 'put' }
    >({
        category: experience.category,
        position: experience.position,
        institution_name: experience.institution_name,
        description: experience.description,
        start_year: experience.start_year,
        end_year: experience.end_year ?? '',
        is_current: experience.is_current,
        sort_order: experience.sort_order,
        logo: null,
        remove_logo: false,
        _method: 'put',
    });

    const logoPreview = useLogoPreview(form.data.logo);
    const endpoint = `/admin/experiences/${experience.id}`;

    const period = experience.is_current
        ? `${experience.start_year} – Sekarang`
        : experience.end_year
          ? `${experience.start_year} – ${experience.end_year}`
          : String(experience.start_year);

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        // PHP menerima multipart melalui POST + _method.
        form.post(endpoint, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.setDefaults({
                    ...form.data,
                    logo: null,
                    remove_logo: false,
                });

                form.reset('logo', 'remove_logo');

                if (logoRef.current) {
                    logoRef.current.value = '';
                }

                setEditing(false);
            },
        });
    }

    function cancel() {
        form.reset();
        form.clearErrors();

        if (logoRef.current) {
            logoRef.current.value = '';
        }

        setEditing(false);
    }

    function destroy() {
        if (
            !window.confirm(
                `Hapus pengalaman "${experience.position}" di "${experience.institution_name}"?`
            )
        ) {
            return;
        }

        router.delete(endpoint, {
            preserveScroll: true,
            onStart: () => setDeleting(true),
            onFinish: () => setDeleting(false),
        });
    }

    return (
        <article className="pa-exp-item">
            {!editing ? (
                <div className="pa-exp-item__display">
                    <div className="pa-exp-item__logo">
                        {experience.logo_url ? (
                            <img
                                src={experience.logo_url}
                                alt=""
                            />
                        ) : experience.category === 'pekerjaan' ? (
                            <BriefcaseBusiness size={23} />
                        ) : (
                            <UsersRound size={23} />
                        )}
                    </div>

                    <div className="pa-exp-item__content">
                        <div className="pa-exp-item__meta">
                            <span>
                                {categoryNames[
                                    experience.category
                                ]}
                            </span>

                            <span className="pa-exp-item__period">
                                <CalendarDays size={13} />
                                {period}
                            </span>
                        </div>

                        <h3>{experience.position}</h3>

                        <strong className="pa-exp-item__institution">
                            {experience.institution_name}
                        </strong>

                        <p>{experience.description}</p>

                        <span className="pa-exp-item__order">
                            Urutan {experience.sort_order}
                        </span>

                        <div className="pa-exp-item__actions">
                            <button
                                type="button"
                                className="pa-exp-action"
                                onClick={() =>
                                    setEditing(true)
                                }
                            >
                                <Pencil size={15} />
                                Edit
                            </button>

                            <button
                                type="button"
                                className="pa-exp-action pa-exp-action--danger"
                                onClick={destroy}
                                disabled={deleting}
                            >
                                <Trash2 size={15} />
                                {deleting
                                    ? 'Menghapus...'
                                    : 'Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <form onSubmit={submit}>
                    <div className="pa-exp-edit__header">
                        <div>
                            <span className="pa-editor-kicker">
                                <Pencil size={15} />
                                EDIT PENGALAMAN
                            </span>

                            <h3>Perbarui Pengalaman</h3>
                        </div>

                        <button
                            type="button"
                            className="pa-exp-close"
                            onClick={cancel}
                            disabled={form.processing}
                            aria-label="Batal edit pengalaman"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="pa-exp-form">
                        <ExperienceFields
                            prefix={`edit-${experience.id}`}
                            data={form.data}
                            errors={form.errors}
                            previewUrl={logoPreview}
                            existingLogoUrl={
                                experience.logo_url
                            }
                            logoRef={logoRef}
                            onChange={(patch) =>
                                form.setData({
                                    ...form.data,
                                    ...patch,
                                })
                            }
                        />
                    </div>

                    <div className="pa-exp-edit__actions">
                        <button
                            type="button"
                            className="pa-exp-action"
                            onClick={cancel}
                            disabled={form.processing}
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            className="pa-button pa-button--primary"
                            disabled={
                                form.processing ||
                                !form.isDirty
                            }
                        >
                            <Save size={16} />
                            {form.processing
                                ? 'Menyimpan...'
                                : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            )}
        </article>
    );
}

// ==========================================
// MAIN PAGE
// ==========================================

type Filter = 'semua' | Category;

export default function Index({
    experiences,
}: Props) {
    const [filter, setFilter] = useState<Filter>('semua');

    const { flash } = usePage().props as {
        flash?: {
            success?: string | null;
        };
    };

    const filtered = experiences.filter(
        (experience) =>
            filter === 'semua' ||
            experience.category === filter
    );

    const tabs: { value: Filter; label: string }[] = [
        { value: 'semua', label: 'Semua' },
        { value: 'pekerjaan', label: 'Pekerjaan' },
        { value: 'organisasi', label: 'Organisasi' },
    ];

    return (
        <AdminLayout
            title="Pengalaman"
            description="Kelola pengalaman pekerjaan dan organisasi yang ditampilkan pada website."
        >
            <Head title="Pengalaman · Portfolio Admin" />

            {flash?.success && (
                <div
                    className="pa-editor-success"
                    role="status"
                >
                    <CheckCircle2 size={18} />
                    <span>{flash.success}</span>
                </div>
            )}

            <div className="pa-exp-grid">
                <CreateExperience />

                <section
                    className="pa-exp-panel pa-exp-list"
                    aria-label="Daftar pengalaman"
                >
                    <header className="pa-exp-panel__header">
                        <span className="pa-editor-kicker">
                            <BriefcaseBusiness size={15} />
                            RIWAYAT PENGALAMAN
                        </span>

                        <div className="pa-exp-list__heading">
                            <div>
                                <h2>Daftar Pengalaman</h2>
                                <p>
                                    Kelola pengalaman yang
                                    sudah ditambahkan.
                                </p>
                            </div>

                            <span className="pa-exp-count">
                                {experiences.length}
                            </span>
                        </div>
                    </header>

                    <div
                        className="pa-exp-filters"
                        role="group"
                        aria-label="Filter pengalaman"
                    >
                        {tabs.map((tab) => (
                            <button
                                key={tab.value}
                                type="button"
                                className={
                                    'pa-exp-filter' +
                                    (filter === tab.value
                                        ? ' pa-exp-filter--active'
                                        : '')
                                }
                                aria-pressed={
                                    filter === tab.value
                                }
                                onClick={() =>
                                    setFilter(tab.value)
                                }
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {filtered.length === 0 ? (
                        <div className="pa-exp-empty">
                            <BriefcaseBusiness
                                size={29}
                                strokeWidth={1.5}
                            />
                            <h3>
                                Belum ada pengalaman
                            </h3>
                            <p>
                                {filter === 'semua'
                                    ? 'Tambahkan pengalaman pertama melalui formulir di samping.'
                                    : `Belum ada pengalaman ${filter}.`}
                            </p>
                        </div>
                    ) : (
                        <div className="pa-exp-list__body">
                            {filtered.map((experience) => (
                                <ExperienceCard
                                    key={experience.id}
                                    experience={experience}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </AdminLayout>
    );
}
