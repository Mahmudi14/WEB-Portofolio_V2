
import {
    Head,
    Link,
    router,
    useForm,
    usePage,
} from '@inertiajs/react';

import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

import {
    CalendarDays,
    CheckCircle2,
    GraduationCap,
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

type Education = {
    id: number;
    personal_information_id: number;
    level: string;
    institution_name: string;
    major: string | null;
    start_year: number;
    end_year: number | null;
    is_current: boolean;
};

type EducationFormData = {
    level: string;
    institution_name: string;
    major: string;
    start_year: number | '';
    end_year: number | '';
    is_current: boolean;
};

type Props = {
    educations: Education[];
    profileExists: boolean;
};

type FormErrors = Partial<
    Record<keyof EducationFormData, string>
>;

const levels = [
    'SD',
    'SMP',
    'SMA',
    'D3',
    'D4',
    'S1',
    'S2',
    'S3',
] as const;

const currentYear = new Date().getFullYear();

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
                className="pa-editor-label"
                htmlFor={id}
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

function EducationFields({
    prefix,
    data,
    errors,
    onChange,
}: {
    prefix: string;
    data: EducationFormData;
    errors: FormErrors;
    onChange: (
        values: Partial<EducationFormData>
    ) => void;
}) {
    return (
        <div className="pa-edu-fields">
            <Field
                id={`${prefix}-level`}
                label="Jenjang Pendidikan"
                error={errors.level}
            >
                <select
                    id={`${prefix}-level`}
                    className="pa-editor-input"
                    required
                    value={data.level}
                    aria-invalid={Boolean(errors.level)}
                    onChange={(event) =>
                        onChange({
                            level: event.target.value,
                        })
                    }
                >
                    <option value="">
                        Pilih jenjang pendidikan
                    </option>

                    {levels.map((level) => (
                        <option
                            key={level}
                            value={level}
                        >
                            {level}
                        </option>
                    ))}
                </select>
            </Field>

            <Field
                id={`${prefix}-institution`}
                label="Nama Institusi"
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
                    onChange={(event) =>
                        onChange({
                            institution_name:
                                event.target.value,
                        })
                    }
                    placeholder="Nama sekolah atau perguruan tinggi"
                />
            </Field>

            <Field
                id={`${prefix}-major`}
                label="Jurusan / Program Studi"
                hint="Opsional. Kosongkan jika tidak diperlukan."
                error={errors.major}
            >
                <input
                    id={`${prefix}-major`}
                    className="pa-editor-input"
                    maxLength={150}
                    value={data.major}
                    aria-invalid={Boolean(errors.major)}
                    onChange={(event) =>
                        onChange({
                            major: event.target.value,
                        })
                    }
                    placeholder="Contoh: Teknik Informatika"
                />
            </Field>

            <div className="pa-edu-year-grid">
                <Field
                    id={`${prefix}-start`}
                    label="Tahun Mulai"
                    error={errors.start_year}
                >
                    <input
                        id={`${prefix}-start`}
                        type="number"
                        inputMode="numeric"
                        className="pa-editor-input"
                        required
                        min={1900}
                        max={currentYear}
                        step={1}
                        value={data.start_year}
                        aria-invalid={Boolean(
                            errors.start_year
                        )}
                        onChange={(event) =>
                            onChange({
                                start_year:
                                    event.target.value === ''
                                        ? ''
                                        : Number(event.target.value),
                            })
                        }
                        placeholder="2022"
                    />
                </Field>

                <Field
                    id={`${prefix}-end`}
                    label="Tahun Selesai"
                    error={errors.end_year}
                    hint={
                        data.is_current
                            ? 'Otomatis menjadi Sekarang.'
                            : 'Opsional.'
                    }
                >
                    <input
                        id={`${prefix}-end`}
                        type="number"
                        inputMode="numeric"
                        className="pa-editor-input"
                        min={1900}
                        max={currentYear}
                        step={1}
                        disabled={data.is_current}
                        value={
                            data.is_current
                                ? ''
                                : data.end_year
                        }
                        aria-invalid={Boolean(
                            errors.end_year
                        )}
                        onChange={(event) =>
                            onChange({
                                end_year:
                                    event.target.value === ''
                                        ? ''
                                        : Number(event.target.value),
                            })
                        }
                        placeholder={
                            data.is_current
                                ? 'Sekarang'
                                : '2026'
                        }
                    />
                </Field>
            </div>

            <label className="pa-edu-checkbox">
                <input
                    type="checkbox"
                    checked={data.is_current}
                    onChange={(event) =>
                        onChange({
                            is_current:
                                event.target.checked,
                            end_year:
                                event.target.checked
                                    ? ''
                                    : data.end_year,
                        })
                    }
                />

                <span>
                    <strong>
                        Masih menempuh pendidikan
                    </strong>

                    <small>
                        Tahun selesai dikosongkan dan
                        ditampilkan sebagai Sekarang.
                    </small>
                </span>
            </label>

            {errors.is_current && (
                <p
                    className="pa-editor-error"
                    role="alert"
                >
                    {errors.is_current}
                </p>
            )}
        </div>
    );
}

// ==========================================
// CREATE EDUCATION
// ==========================================

function CreateEducation({
    profileExists,
}: {
    profileExists: boolean;
}) {
    const form = useForm<EducationFormData>({
        level: '',
        institution_name: '',
        major: '',
        start_year: '',
        end_year: '',
        is_current: false,
    });

    function update(
        values: Partial<EducationFormData>
    ) {
        form.setData({
            ...form.data,
            ...values,
        });
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.post('/admin/educations', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                form.clearErrors();
            },
        });
    }

    return (
        <section className="pa-edu-panel pa-edu-create">
            <header className="pa-edu-panel__header">
                <span className="pa-editor-kicker">
                    <Plus size={15} aria-hidden="true" />
                    RIWAYAT BARU
                </span>

                <h2>Tambah Pendidikan</h2>

                <p>
                    Tambahkan riwayat sekolah atau
                    perguruan tinggi yang pernah ditempuh.
                </p>
            </header>

            {!profileExists ? (
                <div className="pa-edu-profile-notice">
                    <strong>
                        Lengkapi informasi pribadi dahulu.
                    </strong>

                    <p>
                        Pendidikan terhubung dengan
                        data Informasi Pribadi.
                    </p>

                    <Link
                        href="/admin/profile"
                        className="pa-button pa-button--primary"
                    >
                        Buka Informasi Pribadi
                    </Link>
                </div>
            ) : (
                <form onSubmit={submit}>
                    <div className="pa-edu-form">
                        <EducationFields
                            prefix="create"
                            data={form.data}
                            errors={form.errors}
                            onChange={update}
                        />
                    </div>

                    <div className="pa-edu-form__actions">
                        <button
                            type="submit"
                            className="pa-button pa-button--primary"
                            disabled={form.processing}
                        >
                            <Plus
                                size={17}
                                aria-hidden="true"
                            />

                            {form.processing
                                ? 'Menambahkan...'
                                : 'Tambah Pendidikan'}
                        </button>
                    </div>
                </form>
            )}
        </section>
    );
}

// ==========================================
// EXISTING EDUCATION
// ==========================================

function EducationCard({
    education,
}: {
    education: Education;
}) {
    const [editing, setEditing] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const form = useForm<EducationFormData>({
        level: education.level,
        institution_name: education.institution_name,
        major: education.major ?? '',
        start_year: education.start_year,
        end_year: education.end_year ?? '',
        is_current: education.is_current,
    });

    const endpoint =
        `/admin/educations/${education.id}`;

    const period = education.is_current
        ? `${education.start_year} – Sekarang`
        : education.end_year
          ? `${education.start_year} – ${education.end_year}`
          : `${education.start_year}`;

    function update(
        values: Partial<EducationFormData>
    ) {
        form.setData({
            ...form.data,
            ...values,
        });
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.put(endpoint, {
            preserveScroll: true,
            onSuccess: () => {
                form.setDefaults();
                setEditing(false);
            },
        });
    }

    function cancel() {
        form.reset();
        form.clearErrors();
        setEditing(false);
    }

    function destroy() {
        if (
            !window.confirm(
                `Hapus riwayat pendidikan di "${education.institution_name}"?`
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
        <article className="pa-edu-item">
            {!editing ? (
                <div className="pa-edu-item__display">
                    <div
                        className="pa-edu-item__icon"
                        aria-hidden="true"
                    >
                        <GraduationCap size={22} />
                    </div>

                    <div className="pa-edu-item__content">
                        <div className="pa-edu-item__topline">
                            <span className="pa-edu-level">
                                {education.level}
                            </span>

                            <span className="pa-edu-period">
                                <CalendarDays
                                    size={13}
                                    aria-hidden="true"
                                />
                                {period}
                            </span>
                        </div>

                        <h3>
                            {education.institution_name}
                        </h3>

                        {education.major && (
                            <p>{education.major}</p>
                        )}

                        <div className="pa-edu-item__actions">
                            <button
                                type="button"
                                className="pa-edu-action"
                                onClick={() =>
                                    setEditing(true)
                                }
                            >
                                <Pencil
                                    size={15}
                                    aria-hidden="true"
                                />
                                Edit
                            </button>

                            <button
                                type="button"
                                className="pa-edu-action pa-edu-action--danger"
                                onClick={destroy}
                                disabled={deleting}
                            >
                                <Trash2
                                    size={15}
                                    aria-hidden="true"
                                />

                                {deleting
                                    ? 'Menghapus...'
                                    : 'Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <form onSubmit={submit}>
                    <div className="pa-edu-edit__header">
                        <div>
                            <span className="pa-editor-kicker">
                                <Pencil
                                    size={14}
                                    aria-hidden="true"
                                />
                                EDIT PENDIDIKAN
                            </span>

                            <h3>
                                Perbarui Pendidikan
                            </h3>
                        </div>

                        <button
                            type="button"
                            className="pa-edu-close"
                            onClick={cancel}
                            disabled={form.processing}
                            aria-label="Batal edit pendidikan"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="pa-edu-form">
                        <EducationFields
                            prefix={`edit-${education.id}`}
                            data={form.data}
                            errors={form.errors}
                            onChange={update}
                        />
                    </div>

                    <div className="pa-edu-edit__actions">
                        <button
                            type="button"
                            className="pa-edu-action"
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
                            <Save
                                size={16}
                                aria-hidden="true"
                            />

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

export default function Index({
    educations,
    profileExists,
}: Props) {
    const { flash } = usePage().props as {
        flash?: {
            success?: string | null;
        };
    };

    const ordered = [...educations].sort(
        (a, b) =>
            b.start_year - a.start_year ||
            b.id - a.id
    );

    return (
        <AdminLayout
            title="Pendidikan"
            description="Kelola riwayat pendidikan yang akan ditampilkan pada website."
        >
            <Head title="Pendidikan · Portfolio Admin" />

            {flash?.success && (
                <div
                    className="pa-editor-success"
                    role="status"
                >
                    <CheckCircle2
                        size={18}
                        aria-hidden="true"
                    />

                    {flash.success}
                </div>
            )}

            <div className="pa-edu-grid">
                <CreateEducation
                    profileExists={profileExists}
                />

                <section
                    className="pa-edu-panel pa-edu-list"
                    aria-label="Daftar riwayat pendidikan"
                >
                    <header className="pa-edu-panel__header">
                        <span className="pa-editor-kicker">
                            <GraduationCap
                                size={15}
                                aria-hidden="true"
                            />
                            RIWAYAT PENDIDIKAN
                        </span>

                        <div className="pa-edu-list__heading">
                            <div>
                                <h2>Daftar Pendidikan</h2>

                                <p>
                                    Riwayat pendidikan diurutkan
                                    dari tahun mulai terbaru.
                                </p>
                            </div>

                            <span className="pa-edu-total">
                                {educations.length}
                            </span>
                        </div>
                    </header>

                    {ordered.length === 0 ? (
                        <div className="pa-edu-empty">
                            <GraduationCap
                                size={30}
                                strokeWidth={1.5}
                                aria-hidden="true"
                            />

                            <h3>Belum ada pendidikan</h3>

                            <p>
                                Tambahkan riwayat pendidikan
                                melalui formulir yang tersedia.
                            </p>
                        </div>
                    ) : (
                        <div className="pa-edu-list__body">
                            {ordered.map((education) => (
                                <EducationCard
                                    key={education.id}
                                    education={education}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </AdminLayout>
    );
}
