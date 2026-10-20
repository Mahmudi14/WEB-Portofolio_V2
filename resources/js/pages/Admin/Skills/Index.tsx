
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

import {
    CheckCircle2,
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

type SkillItem = {
    id: number;
    skill_category_id: number;
    name: string;
    sort_order: number;
};

type SkillCategory = {
    id: number;
    name: string;
    description: string;
    sort_order: number;
    items: SkillItem[];
};

type Props = {
    categories: SkillCategory[];
};

type CategoryForm = {
    name: string;
    description: string;
    sort_order: number;
};

type ItemForm = {
    name: string;
    sort_order: number;
};

// ==========================================
// REUSABLE FIELD
// ==========================================

function SkillField({
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
                    id={`${id}-error`}
                    role="alert"
                    className="pa-editor-error"
                >
                    {error}
                </p>
            )}
        </div>
    );
}

// ==========================================
// CREATE CATEGORY
// ==========================================

function CreateCategory() {
    const form = useForm<CategoryForm>({
        name: '',
        description: '',
        sort_order: 0,
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.post('/admin/skills', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    }

    return (
        <section
            className="pa-skill-panel pa-skill-create"
            aria-label="Tambah kategori"
        >
            <header className="pa-skill-panel__header">
                <span className="pa-editor-kicker">
                    <Plus size={15} aria-hidden="true" />
                    KATEGORI BARU
                </span>

                <h2>Tambah Kategori</h2>

                <p>
                    Kelompokkan keahlian dan minat agar
                    mudah dipahami pengunjung.
                </p>
            </header>

            <form onSubmit={submit}>
                <div className="pa-skill-form">
                    <SkillField
                        id="category-name"
                        label="Nama Kategori"
                        error={form.errors.name}
                    >
                        <input
                            id="category-name"
                            className="pa-editor-input"
                            required
                            maxLength={120}
                            placeholder="Contoh: Web Development"
                            value={form.data.name}
                            aria-invalid={Boolean(
                                form.errors.name
                            )}
                            onChange={(event) =>
                                form.setData(
                                    'name',
                                    event.target.value
                                )
                            }
                        />
                    </SkillField>

                    <SkillField
                        id="category-description"
                        label="Deskripsi Kategori"
                        error={form.errors.description}
                        hint="Jelaskan fokus kategori ini. Deskripsi wajib diisi."
                    >
                        <textarea
                            id="category-description"
                            className="pa-editor-textarea"
                            rows={4}
                            required
                            value={form.data.description}
                            aria-invalid={Boolean(
                                form.errors.description
                            )}
                            onChange={(event) =>
                                form.setData(
                                    'description',
                                    event.target.value
                                )
                            }
                            placeholder="Deskripsikan kemampuan dalam kategori ini..."
                        />
                    </SkillField>

                    <SkillField
                        id="category-order"
                        label="Urutan Tampil"
                        error={form.errors.sort_order}
                        hint="Angka lebih kecil ditampilkan lebih awal."
                    >
                        <input
                            id="category-order"
                            className="pa-editor-input"
                            type="number"
                            required
                            min={0}
                            max={4294967295}
                            step={1}
                            value={form.data.sort_order}
                            aria-invalid={Boolean(
                                form.errors.sort_order
                            )}
                            onChange={(event) =>
                                form.setData(
                                    'sort_order',
                                    Number(
                                        event.target.value || 0
                                    )
                                )
                            }
                        />
                    </SkillField>
                </div>

                <div className="pa-skill-form__actions">
                    <button
                        type="submit"
                        className="pa-button pa-button--primary"
                        disabled={form.processing}
                    >
                        <Plus size={17} aria-hidden="true" />

                        {form.processing
                            ? 'Menambahkan...'
                            : 'Tambah Kategori'}
                    </button>
                </div>
            </form>
        </section>
    );
}

// ==========================================
// CREATE SKILL ITEM
// ==========================================

function CreateItem({
    categoryId,
}: {
    categoryId: number;
}) {
    const form = useForm<ItemForm>({
        name: '',
        sort_order: 0,
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.post(
            `/admin/skills/${categoryId}/items`,
            {
                preserveScroll: true,
                onSuccess: () => form.reset(),
            }
        );
    }

    return (
        <form
            className="pa-skill-item-create"
            onSubmit={submit}
        >
            <div className="pa-skill-item-create__fields">
                <SkillField
                    id={`create-item-name-${categoryId}`}
                    label="Nama Keahlian"
                    error={form.errors.name}
                >
                    <input
                        id={`create-item-name-${categoryId}`}
                        className="pa-editor-input"
                        required
                        maxLength={120}
                        placeholder="Contoh: Laravel"
                        value={form.data.name}
                        aria-invalid={Boolean(
                            form.errors.name
                        )}
                        onChange={(event) =>
                            form.setData(
                                'name',
                                event.target.value
                            )
                        }
                    />
                </SkillField>

                <SkillField
                    id={`create-item-order-${categoryId}`}
                    label="Urutan"
                    error={form.errors.sort_order}
                >
                    <input
                        id={`create-item-order-${categoryId}`}
                        className="pa-editor-input"
                        type="number"
                        required
                        min={0}
                        max={4294967295}
                        step={1}
                        value={form.data.sort_order}
                        aria-invalid={Boolean(
                            form.errors.sort_order
                        )}
                        onChange={(event) =>
                            form.setData(
                                'sort_order',
                                Number(
                                    event.target.value || 0
                                )
                            )
                        }
                    />
                </SkillField>
            </div>

            <button
                type="submit"
                className="pa-skill-add-item"
                disabled={form.processing}
            >
                <Plus size={16} aria-hidden="true" />

                {form.processing
                    ? 'Menambahkan...'
                    : 'Tambah Keahlian'}
            </button>
        </form>
    );
}

// ==========================================
// EXISTING SKILL ITEM
// ==========================================

function ExistingItem({
    categoryId,
    item,
}: {
    categoryId: number;
    item: SkillItem;
}) {
    const [editing, setEditing] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const form = useForm<ItemForm>({
        name: item.name,
        sort_order: item.sort_order,
    });

    const itemUrl =
        `/admin/skills/${categoryId}/items/${item.id}`;

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.put(itemUrl, {
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
                `Hapus keahlian "${item.name}"?`
            )
        ) {
            return;
        }

        router.delete(itemUrl, {
            preserveScroll: true,
            onStart: () => setDeleting(true),
            onFinish: () => setDeleting(false),
        });
    }

    if (editing) {
        return (
            <form
                className="pa-skill-item-edit"
                onSubmit={submit}
            >
                <div className="pa-skill-item-edit__fields">
                    <SkillField
                        id={`edit-item-name-${item.id}`}
                        label="Nama Keahlian"
                        error={form.errors.name}
                    >
                        <input
                            id={`edit-item-name-${item.id}`}
                            className="pa-editor-input"
                            required
                            maxLength={120}
                            value={form.data.name}
                            aria-invalid={Boolean(
                                form.errors.name
                            )}
                            onChange={(event) =>
                                form.setData(
                                    'name',
                                    event.target.value
                                )
                            }
                        />
                    </SkillField>

                    <SkillField
                        id={`edit-item-order-${item.id}`}
                        label="Urutan"
                        error={form.errors.sort_order}
                    >
                        <input
                            id={`edit-item-order-${item.id}`}
                            className="pa-editor-input"
                            type="number"
                            required
                            min={0}
                            max={4294967295}
                            step={1}
                            value={form.data.sort_order}
                            aria-invalid={Boolean(
                                form.errors.sort_order
                            )}
                            onChange={(event) =>
                                form.setData(
                                    'sort_order',
                                    Number(
                                        event.target.value || 0
                                    )
                                )
                            }
                        />
                    </SkillField>
                </div>

                <div className="pa-skill-inline-actions">
                    <button
                        type="button"
                        className="pa-skill-action"
                        onClick={cancel}
                        disabled={form.processing}
                    >
                        <X size={15} aria-hidden="true" />
                        Batal
                    </button>

                    <button
                        type="submit"
                        className="pa-button pa-button--primary"
                        disabled={
                            form.processing || !form.isDirty
                        }
                    >
                        <Save size={15} aria-hidden="true" />

                        {form.processing
                            ? 'Menyimpan...'
                            : 'Simpan'}
                    </button>
                </div>
            </form>
        );
    }

    return (
        <div className="pa-skill-item">
            <div className="pa-skill-item__info">
                <strong>{item.name}</strong>
                <span>Urutan {item.sort_order}</span>
            </div>

            <div className="pa-skill-inline-actions">
                <button
                    type="button"
                    className="pa-skill-action"
                    onClick={() => setEditing(true)}
                >
                    <Pencil size={15} aria-hidden="true" />
                    Edit
                </button>

                <button
                    type="button"
                    className="pa-skill-action pa-skill-action--danger"
                    onClick={destroy}
                    disabled={deleting}
                >
                    <Trash2 size={15} aria-hidden="true" />

                    {deleting
                        ? 'Menghapus...'
                        : 'Hapus'}
                </button>
            </div>
        </div>
    );
}

// ==========================================
// CATEGORY BLOCK
// ==========================================

function CategoryBlock({
    category,
}: {
    category: SkillCategory;
}) {
    const [editing, setEditing] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const form = useForm<CategoryForm>({
        name: category.name,
        description: category.description,
        sort_order: category.sort_order,
    });

    const categoryUrl =
        `/admin/skills/${category.id}`;

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.put(categoryUrl, {
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
        const message =
            category.items.length > 0
                ? `Hapus kategori "${category.name}" beserta ${category.items.length} keahlian di dalamnya?`
                : `Hapus kategori "${category.name}"?`;

        if (!window.confirm(message)) {
            return;
        }

        router.delete(categoryUrl, {
            preserveScroll: true,
            onStart: () => setDeleting(true),
            onFinish: () => setDeleting(false),
        });
    }

    const items = [...category.items].sort(
        (a, b) =>
            a.sort_order - b.sort_order ||
            a.id - b.id
    );

    return (
        <article className="pa-skill-category">
            {!editing ? (
                <div className="pa-skill-category__head">
                    <div className="pa-skill-category__main">
                        <span className="pa-skill-category__eyebrow">
                            KATEGORI · URUTAN {category.sort_order}
                        </span>

                        <h3>{category.name}</h3>

                        <p>{category.description}</p>

                        <span className="pa-skill-category__count">
                            {category.items.length} keahlian
                        </span>
                    </div>

                    <div className="pa-skill-category__actions">
                        <button
                            type="button"
                            className="pa-skill-action"
                            onClick={() => setEditing(true)}
                        >
                            <Pencil
                                size={15}
                                aria-hidden="true"
                            />
                            Edit
                        </button>

                        <button
                            type="button"
                            className="pa-skill-action pa-skill-action--danger"
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
            ) : (
                <form
                    className="pa-skill-category__edit"
                    onSubmit={submit}
                >
                    <div className="pa-skill-category__edit-head">
                        <div>
                            <span className="pa-editor-kicker">
                                <Pencil
                                    size={14}
                                    aria-hidden="true"
                                />
                                EDIT KATEGORI
                            </span>

                            <h3>Perbarui Kategori</h3>
                        </div>

                        <button
                            type="button"
                            className="pa-skill-close"
                            onClick={cancel}
                            disabled={form.processing}
                            aria-label="Tutup edit kategori"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="pa-skill-form">
                        <SkillField
                            id={`edit-category-name-${category.id}`}
                            label="Nama Kategori"
                            error={form.errors.name}
                        >
                            <input
                                id={`edit-category-name-${category.id}`}
                                className="pa-editor-input"
                                required
                                maxLength={120}
                                value={form.data.name}
                                aria-invalid={Boolean(
                                    form.errors.name
                                )}
                                onChange={(event) =>
                                    form.setData(
                                        'name',
                                        event.target.value
                                    )
                                }
                            />
                        </SkillField>

                        <SkillField
                            id={`edit-category-description-${category.id}`}
                            label="Deskripsi Kategori"
                            error={form.errors.description}
                        >
                            <textarea
                                id={`edit-category-description-${category.id}`}
                                className="pa-editor-textarea"
                                rows={4}
                                required
                                value={form.data.description}
                                aria-invalid={Boolean(
                                    form.errors.description
                                )}
                                onChange={(event) =>
                                    form.setData(
                                        'description',
                                        event.target.value
                                    )
                                }
                            />
                        </SkillField>

                        <SkillField
                            id={`edit-category-order-${category.id}`}
                            label="Urutan Tampil"
                            error={form.errors.sort_order}
                        >
                            <input
                                id={`edit-category-order-${category.id}`}
                                className="pa-editor-input"
                                type="number"
                                required
                                min={0}
                                max={4294967295}
                                step={1}
                                value={form.data.sort_order}
                                aria-invalid={Boolean(
                                    form.errors.sort_order
                                )}
                                onChange={(event) =>
                                    form.setData(
                                        'sort_order',
                                        Number(
                                            event.target.value || 0
                                        )
                                    )
                                }
                            />
                        </SkillField>
                    </div>

                    <div className="pa-skill-category__edit-actions">
                        <button
                            type="button"
                            className="pa-skill-action"
                            onClick={cancel}
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

            {/* SUB-KEAHLIAN */}

            <div className="pa-skill-category__items">
                <div className="pa-skill-category__items-title">
                    <h4>Daftar Keahlian</h4>

                    <span>
                        {category.items.length} item
                    </span>
                </div>

                {items.length === 0 ? (
                    <p className="pa-skill-items-empty">
                        Belum ada keahlian di kategori ini.
                    </p>
                ) : (
                    <div className="pa-skill-items-list">
                        {items.map((item) => (
                            <ExistingItem
                                key={item.id}
                                categoryId={category.id}
                                item={item}
                            />
                        ))}
                    </div>
                )}

                <CreateItem categoryId={category.id} />
            </div>
        </article>
    );
}

// ==========================================
// MAIN PAGE
// ==========================================

export default function Index({
    categories,
}: Props) {
    const { flash } = usePage().props as {
        flash?: {
            success?: string | null;
        };
    };

    const ordered = [...categories].sort(
        (a, b) =>
            a.sort_order - b.sort_order ||
            a.id - b.id
    );

    return (
        <AdminLayout
            title="Keahlian & Minat"
            description="Kelola kategori dan keahlian yang ditampilkan pada website."
        >
            <Head title="Keahlian & Minat · Portfolio Admin" />

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

            <div className="pa-skill-grid">
                <CreateCategory />

                <section
                    className="pa-skill-panel pa-skill-list"
                    aria-label="Daftar kategori keahlian"
                >
                    <header className="pa-skill-panel__header">
                        <span className="pa-editor-kicker">
                            <Layers3
                                size={15}
                                aria-hidden="true"
                            />
                            KATEGORI TERDAFTAR
                        </span>

                        <div className="pa-skill-list__heading">
                            <div>
                                <h2>Daftar Kategori</h2>

                                <p>
                                    Kategori dan seluruh keahlian
                                    yang sudah ditambahkan.
                                </p>
                            </div>

                            <span className="pa-skill-total">
                                {categories.length}
                            </span>
                        </div>
                    </header>

                    {ordered.length === 0 ? (
                        <div className="pa-skill-empty">
                            <Layers3
                                size={29}
                                strokeWidth={1.5}
                                aria-hidden="true"
                            />

                            <h3>Belum ada kategori</h3>

                            <p>
                                Mulai dengan menambahkan kategori
                                pertama melalui formulir di samping.
                            </p>
                        </div>
                    ) : (
                        <div className="pa-skill-list__body">
                            {ordered.map((category) => (
                                <CategoryBlock
                                    key={category.id}
                                    category={category}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </AdminLayout>
    );
}
