
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

import {
    CheckCircle2,
    ExternalLink,
    Globe2,
    Link2,
    Pencil,
    Plus,
    Save,
    Share2,
    Trash2,
    X,
} from 'lucide-react';

import AdminLayout from '@/layouts/admin-layout';

// ==========================================
// TYPES
// ==========================================

type SocialLink = {
    id: number;
    platform: string;
    name: string;
    url: string;
    sort_order: number;
};

type LinkFormData = {
    platform: string;
    name: string;
    url: string;
    sort_order: number;
};

type Props = {
    links: SocialLink[];
};

// ==========================================
// REUSABLE FIELD
// ==========================================

function SocialField({
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

// ==========================================
// CREATE SOCIAL LINK
// ==========================================

function CreateLink() {
    const form = useForm<LinkFormData>({
        platform: '',
        name: '',
        url: '',
        sort_order: 0,
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.post('/admin/social-links', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                form.clearErrors();
            },
        });
    }

    return (
        <section className="pa-social-panel pa-social-create">
            <header className="pa-social-panel__header">
                <span className="pa-editor-kicker">
                    <Plus size={15} aria-hidden="true" />
                    TAMBAH TAUTAN
                </span>

                <h2>Media Sosial Baru</h2>

                <p>
                    Tambahkan platform dan tautan yang
                    ingin ditampilkan pada website.
                </p>
            </header>

            <form onSubmit={submit}>
                <div className="pa-social-form">
                    <SocialField
                        id="create-platform"
                        label="Nama Platform"
                        error={form.errors.platform}
                    >
                        <input
                            id="create-platform"
                            type="text"
                            className="pa-editor-input"
                            placeholder="Contoh: GitHub"
                            required
                            maxLength={100}
                            aria-invalid={Boolean(
                                form.errors.platform
                            )}
                            value={form.data.platform}
                            onChange={(event) =>
                                form.setData(
                                    'platform',
                                    event.target.value
                                )
                            }
                        />
                    </SocialField>

                    <SocialField
                        id="create-name"
                        label="Nama / Label"
                        error={form.errors.name}
                    >
                        <input
                            id="create-name"
                            type="text"
                            className="pa-editor-input"
                            placeholder="Contoh: Profil GitHub"
                            required
                            maxLength={100}
                            aria-invalid={Boolean(
                                form.errors.name
                            )}
                            value={form.data.name}
                            onChange={(event) =>
                                form.setData(
                                    'name',
                                    event.target.value
                                )
                            }
                        />
                    </SocialField>

                    <SocialField
                        id="create-url"
                        label="URL Media Sosial"
                        hint="Gunakan alamat lengkap yang diawali https://."
                        error={form.errors.url}
                    >
                        <input
                            id="create-url"
                            type="url"
                            className="pa-editor-input"
                            placeholder="https://github.com/username"
                            required
                            pattern="https://.*"
                            maxLength={2048}
                            aria-invalid={Boolean(
                                form.errors.url
                            )}
                            value={form.data.url}
                            onChange={(event) =>
                                form.setData(
                                    'url',
                                    event.target.value
                                )
                            }
                        />
                    </SocialField>

                    <SocialField
                        id="create-sort"
                        label="Urutan Tampil"
                        hint="Semakin kecil angkanya, semakin awal ditampilkan."
                        error={form.errors.sort_order}
                    >
                        <input
                            id="create-sort"
                            type="number"
                            className="pa-editor-input"
                            required
                            min={0}
                            max={4294967295}
                            step={1}
                            aria-invalid={Boolean(
                                form.errors.sort_order
                            )}
                            value={form.data.sort_order}
                            onChange={(event) =>
                                form.setData(
                                    'sort_order',
                                    Number(event.target.value || 0)
                                )
                            }
                        />
                    </SocialField>
                </div>

                <div className="pa-social-form__actions">
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="pa-button pa-button--primary"
                    >
                        <Plus size={17} aria-hidden="true" />

                        {form.processing
                            ? 'Menambahkan...'
                            : 'Tambah Media Sosial'}
                    </button>
                </div>
            </form>
        </section>
    );
}

// ==========================================
// EXISTING SOCIAL LINK
// ==========================================

function ExistingLink({
    link,
}: {
    link: SocialLink;
}) {
    const [editing, setEditing] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const form = useForm<LinkFormData>({
        platform: link.platform,
        name: link.name,
        url: link.url,
        sort_order: link.sort_order,
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.put(`/admin/social-links/${link.id}`, {
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
            `Yakin ingin menghapus "${link.platform} — ${link.name}"?`
        );

        if (!confirmed) {
            return;
        }

        router.delete(`/admin/social-links/${link.id}`, {
            preserveScroll: true,
            onStart: () => setDeleting(true),
            onFinish: () => setDeleting(false),
        });
    }

    return (
        <article className="pa-social-item">
            {!editing ? (
                <div className="pa-social-item__display">
                    <div className="pa-social-item__icon">
                        <Globe2
                            size={21}
                            strokeWidth={1.7}
                            aria-hidden="true"
                        />
                    </div>

                    <div className="pa-social-item__content">
                        <div className="pa-social-item__meta">
                            <span className="pa-social-item__platform">
                                {link.platform}
                            </span>

                            <span className="pa-social-item__order">
                                Urutan {link.sort_order}
                            </span>
                        </div>

                        <h3>{link.name}</h3>

                        <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pa-social-item__url"
                        >
                            <span>{link.url}</span>

                            <ExternalLink
                                size={14}
                                aria-hidden="true"
                            />
                        </a>
                    </div>

                    <div className="pa-social-item__actions">
                        <button
                            type="button"
                            className="pa-social-action pa-social-action--edit"
                            onClick={() => setEditing(true)}
                            aria-label={`Edit ${link.name}`}
                        >
                            <Pencil
                                size={16}
                                aria-hidden="true"
                            />
                            <span>Edit</span>
                        </button>

                        <button
                            type="button"
                            className="pa-social-action pa-social-action--delete"
                            onClick={destroy}
                            disabled={deleting}
                            aria-label={`Hapus ${link.name}`}
                        >
                            <Trash2
                                size={16}
                                aria-hidden="true"
                            />
                            <span>
                                {deleting
                                    ? 'Menghapus...'
                                    : 'Hapus'}
                            </span>
                        </button>
                    </div>
                </div>
            ) : (
                <form
                    onSubmit={submit}
                    className="pa-social-edit"
                >
                    <div className="pa-social-edit__header">
                        <div>
                            <span className="pa-editor-kicker">
                                <Pencil
                                    size={14}
                                    aria-hidden="true"
                                />
                                EDIT TAUTAN
                            </span>

                            <h3>Edit Media Sosial</h3>
                        </div>

                        <button
                            type="button"
                            onClick={cancel}
                            className="pa-social-close"
                            aria-label="Tutup editor"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="pa-social-form">
                        <SocialField
                            id={`edit-platform-${link.id}`}
                            label="Nama Platform"
                            error={form.errors.platform}
                        >
                            <input
                                id={`edit-platform-${link.id}`}
                                className="pa-editor-input"
                                required
                                maxLength={100}
                                aria-invalid={Boolean(
                                    form.errors.platform
                                )}
                                value={form.data.platform}
                                onChange={(event) =>
                                    form.setData(
                                        'platform',
                                        event.target.value
                                    )
                                }
                            />
                        </SocialField>

                        <SocialField
                            id={`edit-name-${link.id}`}
                            label="Nama / Label"
                            error={form.errors.name}
                        >
                            <input
                                id={`edit-name-${link.id}`}
                                className="pa-editor-input"
                                required
                                maxLength={100}
                                aria-invalid={Boolean(
                                    form.errors.name
                                )}
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData(
                                        'name',
                                        event.target.value
                                    )
                                }
                            />
                        </SocialField>

                        <SocialField
                            id={`edit-url-${link.id}`}
                            label="URL Media Sosial"
                            error={form.errors.url}
                        >
                            <input
                                id={`edit-url-${link.id}`}
                                type="url"
                                className="pa-editor-input"
                                required
                                pattern="https://.*"
                                maxLength={2048}
                                aria-invalid={Boolean(
                                    form.errors.url
                                )}
                                value={form.data.url}
                                onChange={(event) =>
                                    form.setData(
                                        'url',
                                        event.target.value
                                    )
                                }
                            />
                        </SocialField>

                        <SocialField
                            id={`edit-sort-${link.id}`}
                            label="Urutan Tampil"
                            error={form.errors.sort_order}
                        >
                            <input
                                id={`edit-sort-${link.id}`}
                                type="number"
                                className="pa-editor-input"
                                required
                                min={0}
                                max={4294967295}
                                step={1}
                                aria-invalid={Boolean(
                                    form.errors.sort_order
                                )}
                                value={form.data.sort_order}
                                onChange={(event) =>
                                    form.setData(
                                        'sort_order',
                                        Number(
                                            event.target.value || 0
                                        )
                                    )
                                }
                            />
                        </SocialField>
                    </div>

                    <div className="pa-social-edit__actions">
                        <button
                            type="button"
                            className="pa-social-action pa-social-action--cancel"
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
        </article>
    );
}

// ==========================================
// MAIN PAGE
// ==========================================

export default function Index({
    links,
}: Props) {
    const { flash } = usePage().props as {
        flash?: {
            success?: string | null;
        };
    };

    return (
        <AdminLayout
            title="Media Sosial"
            description="Kelola platform dan tautan media sosial yang ditampilkan pada website."
        >
            <Head title="Media Sosial · Portfolio Admin" />

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

            <div className="pa-social-grid">
                <CreateLink />

                <section
                    className="pa-social-panel pa-social-list"
                    aria-label="Daftar media sosial"
                >
                    <header className="pa-social-panel__header">
                        <span className="pa-editor-kicker">
                            <Share2
                                size={15}
                                aria-hidden="true"
                            />
                            TAUTAN TERDAFTAR
                        </span>

                        <div className="pa-social-list__heading">
                            <div>
                                <h2>Daftar Media Sosial</h2>

                                <p>
                                    Kelola tautan yang sudah
                                    ditambahkan.
                                </p>
                            </div>

                            <span className="pa-social-count">
                                {links.length}
                            </span>
                        </div>
                    </header>

                    {links.length === 0 ? (
                        <div className="pa-social-empty">
                            <span className="pa-social-empty__icon">
                                <Link2
                                    size={27}
                                    strokeWidth={1.5}
                                    aria-hidden="true"
                                />
                            </span>

                            <h3>Belum ada media sosial</h3>

                            <p>
                                Tambahkan tautan pertamamu
                                menggunakan formulir di samping.
                            </p>
                        </div>
                    ) : (
                        <div className="pa-social-list__items">
                            {[...links]
                                .sort(
                                    (a, b) =>
                                        a.sort_order - b.sort_order ||
                                        a.id - b.id
                                )
                                .map((link) => (
                                    <ExistingLink
                                        key={link.id}
                                        link={link}
                                    />
                                ))}
                        </div>
                    )}
                </section>
            </div>
        </AdminLayout>
    );
}
