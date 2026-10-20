
import {
    Head,
    router,
    useForm,
    usePage,
} from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

import {
    Award,
    CalendarDays,
    CheckCircle2,
    Pencil,
    Plus,
    Save,
    Trash2,
    Trophy,
    X,
} from 'lucide-react';

import AdminLayout from '@/layouts/admin-layout';

// ==========================================
// TYPES
// ==========================================

type AchievementCategory =
    | 'prestasi'
    | 'penghargaan'
    | 'sertifikasi'
    | 'lainnya';

type Achievement = {
    id: number;
    category: AchievementCategory;
    title: string;
    description: string | null;
    year: number;
    institution_name: string | null;
    sort_order: number;
};

type AchievementForm = {
    category: AchievementCategory | '';
    title: string;
    description: string;
    year: number | '';
    institution_name: string;
    sort_order: number;
};

type Props = {
    achievements: Achievement[];
};

type FormErrors = Partial<
    Record<keyof AchievementForm, string>
>;

type Filter = 'semua' | AchievementCategory;

const currentYear = new Date().getFullYear();

const categoryNames: Record<
    AchievementCategory,
    string
> = {
    prestasi: 'Prestasi',
    penghargaan: 'Penghargaan',
    sertifikasi: 'Sertifikasi',
    lainnya: 'Lainnya',
};

const categories = Object.entries(
    categoryNames
) as [AchievementCategory, string][];

// ==========================================
// REUSABLE COMPONENTS
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

function AchievementFields({
    prefix,
    data,
    errors,
    onChange,
}: {
    prefix: string;
    data: AchievementForm;
    errors: FormErrors;
    onChange: (
        patch: Partial<AchievementForm>
    ) => void;
}) {
    return (
        <div className="pa-ach-fields">
            <Field
                id={`${prefix}-category`}
                label="Kategori Pencapaian"
                error={errors.category}
            >
                <select
                    id={`${prefix}-category`}
                    className="pa-editor-input"
                    required
                    value={data.category}
                    aria-invalid={Boolean(
                        errors.category
                    )}
                    onChange={(event) =>
                        onChange({
                            category:
                                event.target.value as
                                    AchievementForm['category'],
                        })
                    }
                >
                    <option value="">
                        Pilih kategori
                    </option>

                    {categories.map(([value, label]) => (
                        <option
                            key={value}
                            value={value}
                        >
                            {label}
                        </option>
                    ))}
                </select>
            </Field>

            <Field
                id={`${prefix}-title`}
                label="Judul Pencapaian"
                error={errors.title}
            >
                <input
                    id={`${prefix}-title`}
                    className="pa-editor-input"
                    required
                    maxLength={200}
                    value={data.title}
                    aria-invalid={Boolean(
                        errors.title
                    )}
                    placeholder="Contoh: Juara 1 Kompetisi Web Design"
                    onChange={(event) =>
                        onChange({
                            title: event.target.value,
                        })
                    }
                />
            </Field>

            <Field
                id={`${prefix}-institution`}
                label="Penyelenggara / Institusi"
                hint="Opsional. Nama lembaga atau penyelenggara pencapaian."
                error={errors.institution_name}
            >
                <input
                    id={`${prefix}-institution`}
                    className="pa-editor-input"
                    maxLength={200}
                    value={data.institution_name}
                    aria-invalid={Boolean(
                        errors.institution_name
                    )}
                    placeholder="Contoh: Universitas atau penyelenggara"
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
                label="Deskripsi Pencapaian"
                hint="Opsional. Ceritakan pencapaian secara singkat."
                error={errors.description}
            >
                <textarea
                    id={`${prefix}-description`}
                    className="pa-editor-textarea"
                    rows={5}
                    maxLength={10000}
                    value={data.description}
                    aria-invalid={Boolean(
                        errors.description
                    )}
                    placeholder="Jelaskan hasil atau pencapaian yang diraih..."
                    onChange={(event) =>
                        onChange({
                            description:
                                event.target.value,
                        })
                    }
                />

                <div className="pa-editor-count">
                    {data.description.length} / 10000
                </div>
            </Field>

            <div className="pa-ach-fields__row">
                <Field
                    id={`${prefix}-year`}
                    label="Tahun Pencapaian"
                    error={errors.year}
                >
                    <input
                        id={`${prefix}-year`}
                        type="number"
                        className="pa-editor-input"
                        required
                        min={1900}
                        max={currentYear}
                        step={1}
                        value={data.year}
                        aria-invalid={Boolean(
                            errors.year
                        )}
                        placeholder="2026"
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
                </Field>

                <Field
                    id={`${prefix}-order`}
                    label="Urutan Tampil"
                    hint="Angka kecil tampil lebih awal."
                    error={errors.sort_order}
                >
                    <input
                        id={`${prefix}-order`}
                        type="number"
                        className="pa-editor-input"
                        required
                        min={0}
                        max={4294967295}
                        step={1}
                        value={data.sort_order}
                        aria-invalid={Boolean(
                            errors.sort_order
                        )}
                        onChange={(event) =>
                            onChange({
                                sort_order: Number(
                                    event.target.value || 0
                                ),
                            })
                        }
                    />
                </Field>
            </div>
        </div>
    );
}

// ==========================================
// CREATE ACHIEVEMENT
// ==========================================

function CreateAchievement() {
    const form = useForm<AchievementForm>({
        category: '',
        title: '',
        description: '',
        year: '',
        institution_name: '',
        sort_order: 0,
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.post('/admin/achievements', {
            preserveScroll: true,

            onSuccess: () => {
                form.reset();
                form.clearErrors();
            },
        });
    }

    return (
        <section className="pa-ach-panel pa-ach-create">
            <header className="pa-ach-panel__header">
                <span className="pa-editor-kicker">
                    <Plus
                        size={15}
                        aria-hidden="true"
                    />
                    PENCAPAIAN BARU
                </span>

                <h2>Tambah Pencapaian</h2>

                <p>
                    Catat prestasi, penghargaan, dan
                    sertifikasi yang ingin ditampilkan
                    pada website.
                </p>
            </header>

            <form onSubmit={submit}>
                <div className="pa-ach-form">
                    <AchievementFields
                        prefix="create"
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

                <div className="pa-ach-form__actions">
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
                            : 'Tambah Pencapaian'}
                    </button>
                </div>
            </form>
        </section>
    );
}

// ==========================================
// ACHIEVEMENT CARD
// ==========================================

function AchievementCard({
    achievement,
}: {
    achievement: Achievement;
}) {
    const [editing, setEditing] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const form = useForm<AchievementForm>({
        category: achievement.category,
        title: achievement.title,
        description: achievement.description ?? '',
        year: achievement.year,
        institution_name:
            achievement.institution_name ?? '',
        sort_order: achievement.sort_order,
    });

    const endpoint =
        `/admin/achievements/${achievement.id}`;

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
        const confirmed = window.confirm(
            `Hapus pencapaian "${achievement.title}"?`
        );

        if (!confirmed) {
            return;
        }

        router.delete(endpoint, {
            preserveScroll: true,
            onStart: () => setDeleting(true),
            onFinish: () => setDeleting(false),
        });
    }

    return (
        <article className="pa-ach-item">
            {!editing ? (
                <div className="pa-ach-item__display">
                    <div
                        className="pa-ach-item__icon"
                        aria-hidden="true"
                    >
                        <Trophy size={22} />
                    </div>

                    <div className="pa-ach-item__content">
                        <div className="pa-ach-item__meta">
                            <span>
                                {categoryNames[
                                    achievement.category
                                ] ?? achievement.category}
                            </span>

                            <span className="pa-ach-item__year">
                                <CalendarDays
                                    size={13}
                                    aria-hidden="true"
                                />
                                {achievement.year}
                            </span>
                        </div>

                        <h3>{achievement.title}</h3>

                        {achievement.institution_name && (
                            <strong className="pa-ach-item__institution">
                                {achievement.institution_name}
                            </strong>
                        )}

                        {achievement.description && (
                            <p>{achievement.description}</p>
                        )}

                        <span className="pa-ach-item__order">
                            Urutan {achievement.sort_order}
                        </span>

                        <div className="pa-ach-item__actions">
                            <button
                                type="button"
                                className="pa-ach-action"
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
                                className="pa-ach-action pa-ach-action--danger"
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
                    <div className="pa-ach-edit__header">
                        <div>
                            <span className="pa-editor-kicker">
                                <Pencil
                                    size={15}
                                    aria-hidden="true"
                                />
                                EDIT PENCAPAIAN
                            </span>

                            <h3>Perbarui Pencapaian</h3>
                        </div>

                        <button
                            type="button"
                            className="pa-ach-close"
                            onClick={cancel}
                            disabled={form.processing}
                            aria-label="Batal edit pencapaian"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="pa-ach-form">
                        <AchievementFields
                            prefix={`edit-${achievement.id}`}
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

                    <div className="pa-ach-edit__actions">
                        <button
                            type="button"
                            className="pa-ach-action"
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
    achievements,
}: Props) {
    const [filter, setFilter] =
        useState<Filter>('semua');

    const { flash } = usePage().props as {
        flash?: {
            success?: string | null;
        };
    };

    const ordered = [...achievements].sort(
        (a, b) =>
            a.sort_order - b.sort_order ||
            b.year - a.year ||
            b.id - a.id
    );

    const filtered = ordered.filter(
        (item) =>
            filter === 'semua' ||
            item.category === filter
    );

    const filters: {
        value: Filter;
        label: string;
    }[] = [
        { value: 'semua', label: 'Semua' },
        { value: 'prestasi', label: 'Prestasi' },
        { value: 'penghargaan', label: 'Penghargaan' },
        { value: 'sertifikasi', label: 'Sertifikasi' },
        { value: 'lainnya', label: 'Lainnya' },
    ];

    return (
        <AdminLayout
            title="Pencapaian"
            description="Kelola prestasi, penghargaan, dan sertifikasi yang ditampilkan di website."
        >
            <Head
                title="Pencapaian · Portfolio Admin"
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

            <div className="pa-ach-grid">
                <CreateAchievement />

                <section
                    className="pa-ach-panel pa-ach-list"
                    aria-label="Daftar pencapaian"
                >
                    <header className="pa-ach-panel__header">
                        <span className="pa-editor-kicker">
                            <Award
                                size={15}
                                aria-hidden="true"
                            />
                            PENCAPAIAN TERDAFTAR
                        </span>

                        <div className="pa-ach-list__heading">
                            <div>
                                <h2>Daftar Pencapaian</h2>

                                <p>
                                    Kelola pencapaian yang
                                    sudah ditambahkan.
                                </p>
                            </div>

                            <span className="pa-ach-count">
                                {achievements.length}
                            </span>
                        </div>
                    </header>

                    <div
                        className="pa-ach-filters"
                        role="group"
                        aria-label="Filter kategori pencapaian"
                    >
                        {filters.map((tab) => (
                            <button
                                key={tab.value}
                                type="button"
                                className={
                                    'pa-ach-filter' +
                                    (
                                        filter === tab.value
                                            ? ' pa-ach-filter--active'
                                            : ''
                                    )
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
                        <div className="pa-ach-empty">
                            <Trophy
                                size={30}
                                strokeWidth={1.5}
                                aria-hidden="true"
                            />

                            <h3>
                                Belum ada pencapaian
                            </h3>

                            <p>
                                {filter === 'semua'
                                    ? 'Tambahkan pencapaian pertama melalui formulir yang tersedia.'
                                    : `Belum ada pencapaian dalam kategori ${categoryNames[filter]}.`}
                            </p>
                        </div>
                    ) : (
                        <div className="pa-ach-list__body">
                            {filtered.map((achievement) => (
                                <AchievementCard
                                    key={achievement.id}
                                    achievement={achievement}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </AdminLayout>
    );
}
