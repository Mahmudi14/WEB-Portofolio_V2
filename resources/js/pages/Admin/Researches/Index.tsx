
import {
    Head,
    router,
    useForm,
    usePage,
} from '@inertiajs/react';

import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

import {
    CalendarDays,
    CheckCircle2,
    FlaskConical,
    Pencil,
    Plus,
    Save,
    Search,
    Trash2,
    X,
} from 'lucide-react';

import AdminLayout from '@/layouts/admin-layout';

// ==========================================
// TYPES
// ==========================================

type Research = {
    id: number;
    title: string;
    summary: string;
    year: number;
};

type ResearchForm = {
    title: string;
    summary: string;
    year: number | '';
};

type Props = {
    researches: Research[];
};

type ResearchErrors = Partial<
    Record<keyof ResearchForm, string>
>;

const currentYear = new Date().getFullYear();

// ==========================================
// REUSABLE FIELD
// ==========================================

function ResearchField({
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

// ==========================================
// SHARED RESEARCH FORM FIELDS
// ==========================================

function ResearchFields({
    prefix,
    data,
    errors,
    onChange,
}: {
    prefix: string;
    data: ResearchForm;
    errors: ResearchErrors;
    onChange: (
        patch: Partial<ResearchForm>
    ) => void;
}) {
    return (
        <div className="pa-res-fields">
            <ResearchField
                id={`${prefix}-title`}
                label="Judul Penelitian"
                error={errors.title}
            >
                <input
                    id={`${prefix}-title`}
                    type="text"
                    className="pa-editor-input"
                    required
                    maxLength={255}
                    value={data.title}
                    aria-invalid={Boolean(errors.title)}
                    placeholder="Contoh: Analisis Sentimen Menggunakan Deep Learning"
                    onChange={(event) =>
                        onChange({
                            title: event.target.value,
                        })
                    }
                />

                <span className="pa-res-character-count">
                    {data.title.length} / 255
                </span>
            </ResearchField>

            <ResearchField
                id={`${prefix}-summary`}
                label="Ringkasan Penelitian"
                hint="Tuliskan latar belakang, metode, dan hasil penelitian secara ringkas."
                error={errors.summary}
            >
                <textarea
                    id={`${prefix}-summary`}
                    className="pa-editor-textarea"
                    rows={7}
                    required
                    maxLength={15000}
                    value={data.summary}
                    aria-invalid={Boolean(errors.summary)}
                    placeholder="Jelaskan tujuan, metode, dan hasil penelitian..."
                    onChange={(event) =>
                        onChange({
                            summary: event.target.value,
                        })
                    }
                />

                <span className="pa-res-character-count">
                    {data.summary.length} / 15000
                </span>
            </ResearchField>

            <ResearchField
                id={`${prefix}-year`}
                label="Tahun Penelitian"
                hint="Gunakan tahun pelaksanaan penelitian."
                error={errors.year}
            >
                <input
                    id={`${prefix}-year`}
                    className="pa-editor-input"
                    type="number"
                    inputMode="numeric"
                    required
                    min={1900}
                    max={currentYear}
                    step={1}
                    value={data.year}
                    aria-invalid={Boolean(errors.year)}
                    placeholder={String(currentYear)}
                    onChange={(event) =>
                        onChange({
                            year:
                                event.target.value === ''
                                    ? ''
                                    : Number(
                                        event.target.value
                                    ),
                        })
                    }
                />
            </ResearchField>
        </div>
    );
}

// ==========================================
// CREATE RESEARCH
// ==========================================

function CreateResearch() {
    const form = useForm<ResearchForm>({
        title: '',
        summary: '',
        year: '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.post('/admin/researches', {
            preserveScroll: true,

            onSuccess: () => {
                form.reset();
                form.clearErrors();
            },
        });
    }

    return (
        <section className="pa-res-panel pa-res-create">
            <header className="pa-res-panel__header">
                <span className="pa-editor-kicker">
                    <Plus
                        size={15}
                        aria-hidden="true"
                    />
                    PENELITIAN BARU
                </span>

                <h2>Tambah Penelitian</h2>

                <p>
                    Dokumentasikan karya penelitian
                    beserta ringkasan dan tahun
                    pelaksanaannya.
                </p>
            </header>

            <form onSubmit={submit}>
                <div className="pa-res-form">
                    <ResearchFields
                        prefix="create-research"
                        data={form.data}
                        errors={form.errors}
                        onChange={(patch) =>
                            form.setData({
                                ...form.data,
                                ...patch,
                            })
                        }
                    />
                </div>

                <div className="pa-res-form__actions">
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
                            : 'Tambah Penelitian'}
                    </button>
                </div>
            </form>
        </section>
    );
}

// ==========================================
// EDIT RESEARCH
// ==========================================

function EditResearch({
    research,
    onClose,
}: {
    research: Research;
    onClose: () => void;
}) {
    const form = useForm<ResearchForm>({
        title: research.title,
        summary: research.summary,
        year: research.year,
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.put(
            `/admin/researches/${research.id}`,
            {
                preserveScroll: true,
                onSuccess: onClose,
            }
        );
    }

    return (
        <form onSubmit={submit}>
            <div className="pa-res-edit__header">
                <div>
                    <span className="pa-editor-kicker">
                        <Pencil
                            size={15}
                            aria-hidden="true"
                        />
                        EDIT PENELITIAN
                    </span>

                    <h3>Perbarui Penelitian</h3>
                </div>

                <button
                    type="button"
                    className="pa-res-close"
                    aria-label="Batalkan edit penelitian"
                    disabled={form.processing}
                    onClick={onClose}
                >
                    <X size={18} />
                </button>
            </div>

            <div className="pa-res-form">
                <ResearchFields
                    prefix={`edit-research-${research.id}`}
                    data={form.data}
                    errors={form.errors}
                    onChange={(patch) =>
                        form.setData({
                            ...form.data,
                            ...patch,
                        })
                    }
                />
            </div>

            <div className="pa-res-edit__actions">
                <button
                    type="button"
                    className="pa-res-action"
                    onClick={onClose}
                    disabled={form.processing}
                >
                    <X size={15} />
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
    );
}

// ==========================================
// RESEARCH CARD
// ==========================================

function ResearchCard({
    research,
}: {
    research: Research;
}) {
    const [editing, setEditing] =
        useState(false);

    const [deleting, setDeleting] =
        useState(false);

    function destroy() {
        const confirmed = window.confirm(
            `Hapus penelitian "${research.title}"?`
        );

        if (!confirmed) {
            return;
        }

        router.delete(
            `/admin/researches/${research.id}`,
            {
                preserveScroll: true,
                onStart: () => setDeleting(true),
                onFinish: () => setDeleting(false),
            }
        );
    }

    return (
        <article className="pa-res-item">
            {editing ? (
                <EditResearch
                    research={research}
                    onClose={() => setEditing(false)}
                />
            ) : (
                <div className="pa-res-item__display">
                    <div
                        className="pa-res-item__icon"
                        aria-hidden="true"
                    >
                        <FlaskConical size={23} />
                    </div>

                    <div className="pa-res-item__content">
                        <div className="pa-res-item__meta">
                            <span className="pa-res-item__eyebrow">
                                PENELITIAN
                            </span>

                            <span className="pa-res-item__year">
                                <CalendarDays
                                    size={13}
                                    aria-hidden="true"
                                />
                                {research.year}
                            </span>
                        </div>

                        <h3>{research.title}</h3>

                        <p className="pa-res-item__summary">
                            {research.summary}
                        </p>

                        <div className="pa-res-item__actions">
                            <button
                                type="button"
                                className="pa-res-action"
                                onClick={() =>
                                    setEditing(true)
                                }
                            >
                                <Pencil size={15} />
                                Edit
                            </button>

                            <button
                                type="button"
                                className="pa-res-action pa-res-action--danger"
                                disabled={deleting}
                                onClick={destroy}
                            >
                                <Trash2 size={15} />

                                {deleting
                                    ? 'Menghapus...'
                                    : 'Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </article>
    );
}

// ==========================================
// MAIN PAGE
// ==========================================

export default function Index({
    researches,
}: Props) {
    const [search, setSearch] = useState('');

    const flash = (
        usePage().props as unknown as {
            flash?: {
                success?: string | null;
            };
        }
    ).flash;

    const ordered = [...researches].sort(
        (a, b) =>
            b.year - a.year ||
            b.id - a.id
    );

    const query = search.trim().toLowerCase();

    const filtered = ordered.filter(
        (research) => {
            if (!query) {
                return true;
            }

            return [
                research.title,
                research.summary,
                String(research.year),
            ].some((value) =>
                value.toLowerCase().includes(query)
            );
        }
    );

    return (
        <AdminLayout
            title="Penelitian"
            description="Kelola karya penelitian dan ringkasan yang ditampilkan pada website."
        >
            <Head
                title="Penelitian · Portfolio Admin"
            />

            {flash?.success && (
                <div
                    className="pa-editor-success"
                    role="status"
                >
                    <CheckCircle2
                        size={18}
                        aria-hidden="true"
                    />

                    <span>{flash.success}</span>
                </div>
            )}

            <div className="pa-res-grid">
                <CreateResearch />

                <section
                    className="pa-res-panel pa-res-list"
                    aria-label="Daftar penelitian"
                >
                    <header className="pa-res-panel__header">
                        <span className="pa-editor-kicker">
                            <FlaskConical
                                size={15}
                                aria-hidden="true"
                            />
                            ARSIP PENELITIAN
                        </span>

                        <div className="pa-res-list__heading">
                            <div>
                                <h2>Daftar Penelitian</h2>

                                <p>
                                    Penelitian diurutkan
                                    berdasarkan tahun terbaru.
                                </p>
                            </div>

                            <span className="pa-res-total">
                                {researches.length}
                            </span>
                        </div>
                    </header>

                    <div className="pa-res-search">
                        <Search
                            size={17}
                            aria-hidden="true"
                        />

                        <input
                            type="search"
                            value={search}
                            aria-label="Cari penelitian"
                            placeholder="Cari judul, ringkasan, atau tahun..."
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                aria-label="Hapus pencarian"
                            >
                                <X size={17} />
                            </button>
                        )}
                    </div>

                    <div
                        className="pa-res-list__count"
                        aria-live="polite"
                    >
                        Menampilkan {filtered.length} dari{' '}
                        {researches.length} penelitian
                    </div>

                    {filtered.length === 0 ? (
                        <div className="pa-res-empty">
                            {query ? (
                                <Search
                                    size={30}
                                    strokeWidth={1.5}
                                    aria-hidden="true"
                                />
                            ) : (
                                <FlaskConical
                                    size={30}
                                    strokeWidth={1.5}
                                    aria-hidden="true"
                                />
                            )}

                            <h3>
                                {query
                                    ? 'Penelitian tidak ditemukan'
                                    : 'Belum ada penelitian'}
                            </h3>

                            <p>
                                {query
                                    ? 'Coba gunakan kata kunci lain.'
                                    : 'Tambahkan penelitian pertama melalui formulir yang tersedia.'}
                            </p>
                        </div>
                    ) : (
                        <div className="pa-res-list__body">
                            {filtered.map((research) => (
                                <ResearchCard
                                    key={research.id}
                                    research={research}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </AdminLayout>
    );
}
