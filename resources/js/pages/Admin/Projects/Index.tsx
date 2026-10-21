import {
    Head,
    Link,
    router,
    useForm,
    usePage,
} from '@inertiajs/react';

import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';

import type { DragEndEvent } from '@dnd-kit/core';

import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';

import {
    Eye,
    FolderKanban,
    GripVertical,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import { toast } from 'sonner';

import AdminLayout from '@/layouts/admin-layout';

import {
    Field,
    ProjectFields,
    ProjectFlash,
    ProjectModal,
} from './Shared';

import {
    emptyProject,
    sortProjects,
} from './types';

import type {
    Project,
    ProjectCategory,
    ProjectForm,
} from './types';

import '../../../../css/projects-redesign.css';

type Props = {
    categories: ProjectCategory[];
    projects: Project[];
};

type CategoryForm = {
    name: string;
    sort_order: number;
};

// ==========================================
// TAMBAH PROYEK
// ==========================================

function CreateProject({
    open,
    onClose,
    categories,
}: {
    open: boolean;
    onClose: () => void;
    categories: ProjectCategory[];
}) {
    const form = useForm<ProjectForm>(
        emptyProject()
    );

    const count =
        form.data.images.length +
        form.data.existing_image_ids.length;

    function close() {
        form.reset();
        form.clearErrors();
        onClose();
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (count < 1 || count > 5) {
            form.setError(
                'images',
                'Unggah minimal 1 dan maksimal 5 gambar.'
            );
            return;
        }

        form.post('/admin/projects', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: close,
        });
    }

    return (
        <ProjectModal
            open={open}
            onOpenChange={(next) => {
                if (!next) close();
            }}
            busy={form.processing}
            title="Tambah Proyek"
            description="Lengkapi informasi dan unggah gambar proyek."
        >
            <form
                className="pa-prj2-form"
                onSubmit={submit}
            >
                <ProjectFields
                    prefix="new-project"
                    data={form.data}
                    errors={form.errors}
                    categories={categories}
                    onChange={(patch) =>
                        form.setData({
                            ...form.data,
                            ...patch,
                        })
                    }
                />

                <div className="pa-prj2-form-actions">
                    <button
                        type="button"
                        className="pa-prj2-btn"
                        disabled={form.processing}
                        onClick={close}
                    >
                        Batal
                    </button>

                    <button
                        type="submit"
                        className="pa-prj2-btn pa-prj2-btn--primary"
                        disabled={
                            form.processing ||
                            categories.length === 0 ||
                            count < 1 ||
                            count > 5
                        }
                    >
                        {form.processing
                            ? 'Menyimpan...'
                            : 'Simpan Proyek'}
                    </button>
                </div>
            </form>
        </ProjectModal>
    );
}

// ==========================================
// MODAL TAMBAH / EDIT KATEGORI
// ==========================================

function CategoryEditor({
    category,
    nextOrder,
    onClose,
}: {
    category?: ProjectCategory;
    nextOrder: number;
    onClose: () => void;
}) {
    const form = useForm<CategoryForm>({
        name: category?.name ?? '',
        sort_order:
            category?.sort_order ?? nextOrder,
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: onClose,
        };

        if (category) {
            form.put(
                `/admin/project-categories/${category.id}`,
                options
            );
        } else {
            form.post(
                '/admin/project-categories',
                options
            );
        }
    }

    return (
        <ProjectModal
            open
            onOpenChange={(next) => {
                if (!next) onClose();
            }}
            busy={form.processing}
            title={
                category
                    ? 'Edit Kategori Proyek'
                    : 'Tambah Kategori Proyek'
            }
            description="Kelola kategori untuk mengelompokkan proyek portofolio."
        >
            <form
                className="pa-prj2-form"
                onSubmit={submit}
            >
                <Field
                    id="project-category-name"
                    label="Nama Kategori"
                    error={form.errors.name}
                >
                    <input
                        id="project-category-name"
                        value={form.data.name}
                        maxLength={120}
                        required
                        placeholder="Contoh: Web Development"
                        onChange={(e) =>
                            form.setData(
                                'name',
                                e.target.value
                            )
                        }
                    />
                </Field>

                <Field
                    id="project-category-order"
                    label="Urutan Kategori"
                    error={form.errors.sort_order}
                >
                    <input
                        id="project-category-order"
                        type="number"
                        min={0}
                        max={4294967295}
                        required
                        value={form.data.sort_order}
                        onChange={(e) =>
                            form.setData(
                                'sort_order',
                                Number(e.target.value || 0)
                            )
                        }
                    />
                </Field>

                <div className="pa-prj2-form-actions">
                    <button
                        type="button"
                        className="pa-prj2-btn"
                        disabled={form.processing}
                        onClick={onClose}
                    >
                        Batal
                    </button>

                    <button
                        type="submit"
                        className="pa-prj2-btn pa-prj2-btn--primary"
                        disabled={form.processing}
                    >
                        {form.processing
                            ? 'Menyimpan...'
                            : 'Simpan Kategori'}
                    </button>
                </div>
            </form>
        </ProjectModal>
    );
}

// ==========================================
// MANAJEMEN KATEGORI
// ==========================================

function CategoryManager({
    categories,
}: {
    categories: ProjectCategory[];
}) {
    const [creating, setCreating] = useState(false);

    const [editing, setEditing] =
        useState<ProjectCategory | null>(null);

    const [deleting, setDeleting] =
        useState<ProjectCategory | null>(null);

    const [deletingBusy, setDeletingBusy] =
        useState(false);

    const nextOrder =
        Math.max(
            0,
            ...categories.map(
                (category) => category.sort_order
            )
        ) + 1;

    const ordered = [...categories].sort(
        (a, b) =>
            a.sort_order - b.sort_order ||
            a.id - b.id
    );

    function destroy() {
        if (
            !deleting ||
            deletingBusy ||
            deleting.projects_count > 0
        ) {
            return;
        }

        setDeletingBusy(true);

        router.delete(
            `/admin/project-categories/${deleting.id}`,
            {
                preserveScroll: true,
                onSuccess: () => setDeleting(null),
                onError: () => toast.error(
                    'Kategori gagal dihapus.'
                ),
                onFinish: () =>
                    setDeletingBusy(false),
            }
        );
    }

    return (
        <>
            <details className="pa-prj2-category-manager">
                <summary>
                    <span>
                        <strong>Kelola Kategori Proyek</strong>
                        <small>
                            {categories.length} kategori terdaftar
                        </small>
                    </span>

                    <span className="pa-prj2-category-hint">
                        Klik untuk buka / tutup
                    </span>
                </summary>

                <div className="pa-prj2-category-body">
                    <div className="pa-prj2-category-top">
                        <p>
                            Kelola kategori tanpa meninggalkan
                            daftar proyek.
                        </p>

                        <button
                            type="button"
                            className="pa-prj2-btn pa-prj2-btn--primary"
                            onClick={() => setCreating(true)}
                        >
                            <Plus size={15} />
                            Tambah Kategori
                        </button>
                    </div>

                    {ordered.length === 0 ? (
                        <p className="pa-prj2-muted">
                            Belum ada kategori proyek.
                        </p>
                    ) : (
                        <div className="pa-prj2-category-list">
                            {ordered.map((category) => (
                                <div
                                    key={category.id}
                                    className="pa-prj2-category-row"
                                >
                                    <div>
                                        <strong>
                                            {category.name}
                                        </strong>

                                        <span>
                                            {category.projects_count} proyek
                                        </span>
                                    </div>

                                    <div className="pa-prj2-row-actions">
                                        <button
                                            type="button"
                                            className="pa-prj2-btn"
                                            onClick={() =>
                                                setEditing(category)
                                            }
                                        >
                                            <Pencil size={14} />
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            className="pa-prj2-btn pa-prj2-btn--danger"
                                            disabled={
                                                category.projects_count > 0
                                            }
                                            title={
                                                category.projects_count > 0
                                                    ? 'Kategori masih dipakai proyek'
                                                    : 'Hapus kategori'
                                            }
                                            onClick={() =>
                                                setDeleting(category)
                                            }
                                        >
                                            <Trash2 size={14} />
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </details>

            {creating && (
                <CategoryEditor
                    nextOrder={nextOrder}
                    onClose={() => setCreating(false)}
                />
            )}

            {editing && (
                <CategoryEditor
                    key={editing.id}
                    category={editing}
                    nextOrder={nextOrder}
                    onClose={() => setEditing(null)}
                />
            )}

            <ProjectModal
                open={!!deleting}
                onOpenChange={(next) => {
                    if (!next) setDeleting(null);
                }}
                busy={deletingBusy}
                title="Hapus Kategori?"
                description="Kategori hanya bisa dihapus apabila tidak digunakan oleh proyek."
            >
                <p className="pa-prj2-muted">
                    Yakin ingin menghapus kategori
                    {' '}
                    <strong>{deleting?.name}</strong>?
                </p>

                <div className="pa-prj2-form-actions">
                    <button
                        type="button"
                        className="pa-prj2-btn"
                        disabled={deletingBusy}
                        onClick={() => setDeleting(null)}
                    >
                        Batal
                    </button>

                    <button
                        type="button"
                        className="pa-prj2-btn pa-prj2-btn--danger-solid"
                        disabled={deletingBusy}
                        onClick={destroy}
                    >
                        Ya, Hapus
                    </button>
                </div>
            </ProjectModal>
        </>
    );
}

// ==========================================
// SORTABLE PROJECT ROW
// ==========================================

function ProjectRow({
    project,
    number,
    disabled,
    onDelete,
}: {
    project: Project;
    number: number;
    disabled: boolean;
    onDelete: (project: Project) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: project.id,
        disabled,
    });

    return (
        <div
            ref={setNodeRef}
            className={
                'pa-prj2-row' +
                (isDragging
                    ? ' pa-prj2-row--dragging'
                    : '')
            }
            style={{
                transform: CSS.Transform.toString(
                    transform
                ),
                transition,
            }}
        >
            <button
                type="button"
                className="pa-prj2-handle"
                aria-label={`Ubah urutan ${project.title}`}
                title={
                    disabled
                        ? 'Pilih filter Semua untuk mengatur urutan'
                        : 'Geser untuk mengatur urutan'
                }
                disabled={disabled}
                {...attributes}
                {...listeners}
            >
                <GripVertical size={17} />
            </button>

            <span className="pa-prj2-no">
                {number}
            </span>

            {project.images[0] ? (
                <img
                    className="pa-prj2-thumb"
                    src={project.images[0].url}
                    alt={`Cover ${project.title}`}
                />
            ) : (
                <div className="pa-prj2-thumb" />
            )}

            <strong className="pa-prj2-row-title">
                {project.title}
            </strong>

            <span className="pa-prj2-category-badge">
                {project.category.name}
            </span>

            <span className="pa-prj2-image-count">
                {project.images.length} gambar
            </span>

            <div className="pa-prj2-row-actions">
                <Link
                    href={`/admin/projects/${project.id}`}
                    className="pa-prj2-btn"
                >
                    <Eye size={15} />
                    Detail
                </Link>

                <Link
                    href={`/admin/projects/${project.id}/edit`}
                    className="pa-prj2-btn"
                >
                    <Pencil size={15} />
                    Edit
                </Link>

                <button
                    type="button"
                    className="pa-prj2-btn pa-prj2-btn--danger"
                    onClick={() => onDelete(project)}
                >
                    <Trash2 size={15} />
                    Hapus
                </button>
            </div>
        </div>
    );
}

// ==========================================
// MAIN INDEX
// ==========================================

export default function Index({
    categories,
    projects,
}: Props) {
    const [items, setItems] = useState(
        () => sortProjects(projects)
    );

    const [filter, setFilter] =
        useState<number | 'all'>('all');

    const [creating, setCreating] =
        useState(false);

    const [deleting, setDeleting] =
        useState<Project | null>(null);

    const [deletingBusy, setDeletingBusy] =
        useState(false);

    const [savingOrder, setSavingOrder] =
        useState(false);

    const { flash } = usePage().props as {
        flash?: {
            success?: string | null;
            error?: string | null;
        };
    };

    useEffect(() => {
        setItems(sortProjects(projects));
    }, [projects]);

    const filtered = items.filter(
        (project) =>
            filter === 'all' ||
            project.project_category_id === filter
    );

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 6,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter:
                sortableKeyboardCoordinates,
        })
    );

    function onDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (
            filter !== 'all' ||
            savingOrder ||
            !over ||
            active.id === over.id
        ) {
            return;
        }

        const oldIndex = items.findIndex(
            (item) => item.id === active.id
        );

        const newIndex = items.findIndex(
            (item) => item.id === over.id
        );

        if (
            oldIndex < 0 ||
            newIndex < 0
        ) {
            return;
        }

        const previous = items;

        const updated = arrayMove(
            previous,
            oldIndex,
            newIndex
        );

        setItems(updated);
        setSavingOrder(true);

        router.put(
            '/admin/projects/reorder',
            {
                ids: updated.map(
                    (item) => item.id
                ),
            },
            {
                preserveScroll: true,

                onError: () => {
                    setItems(previous);
                    toast.error(
                        'Gagal menyimpan urutan proyek.'
                    );
                },

                onFinish: () =>
                    setSavingOrder(false),
            }
        );
    }

    function destroy() {
        if (!deleting || deletingBusy) return;

        setDeletingBusy(true);

        router.delete(
            `/admin/projects/${deleting.id}`,
            {
                preserveScroll: true,

                onSuccess: () => {
                    setDeleting(null);
                },

                onError: () => {
                    toast.error(
                        'Proyek gagal dihapus.'
                    );
                },

                onFinish: () =>
                    setDeletingBusy(false),
            }
        );
    }

    return (
        <AdminLayout
            title="Proyek"
            description="Kelola kategori, proyek, dan galeri portofolio."
            actions={
                <button
                    type="button"
                    className="pa-prj2-btn pa-prj2-btn--primary"
                    disabled={categories.length === 0}
                    onClick={() => setCreating(true)}
                >
                    <Plus size={16} />
                    Tambah Proyek
                </button>
            }
        >
            <Head
                title="Proyek · Portfolio Admin"
            />

            <ProjectFlash
                success={flash?.success}
                error={flash?.error}
            />

            <CategoryManager categories={categories} />

            {categories.length === 0 && (
                <p
                    className="pa-prj2-info"
                    role="status"
                >
                    Tambahkan kategori proyek terlebih dahulu
                    melalui panel Kelola Kategori Proyek.
                </p>
            )}

            <section className="pa-prj2-card">
                <div className="pa-prj2-card-header">
                    <div>
                        <h2>Daftar Proyek</h2>
                        <p>
                            {items.length} proyek terdaftar.
                            Atur urutan melalui drag-and-drop.
                        </p>
                    </div>

                    {savingOrder && (
                        <span
                            role="status"
                            className="pa-prj2-saving"
                        >
                            Menyimpan urutan...
                        </span>
                    )}
                </div>

                <div
                    className="pa-prj2-filters"
                    role="group"
                    aria-label="Filter kategori proyek"
                >
                    <button
                        type="button"
                        className={
                            'pa-prj2-filter' +
                            (filter === 'all'
                                ? ' pa-prj2-filter--active'
                                : '')
                        }
                        onClick={() => setFilter('all')}
                    >
                        Semua
                    </button>

                    {categories.map((category) => (
                        <button
                            key={category.id}
                            type="button"
                            className={
                                'pa-prj2-filter' +
                                (filter === category.id
                                    ? ' pa-prj2-filter--active'
                                    : '')
                            }
                            onClick={() =>
                                setFilter(category.id)
                            }
                        >
                            {category.name}
                        </button>
                    ))}
                </div>

                {filter !== 'all' && (
                    <p className="pa-prj2-info">
                        Pilih filter Semua untuk
                        mengubah urutan proyek.
                    </p>
                )}

                {filtered.length === 0 ? (
                    <div className="pa-prj2-empty">
                        <FolderKanban size={32} />

                        <h3>Belum ada proyek</h3>

                        <p>
                            Belum ada proyek dalam daftar ini.
                        </p>

                        {categories.length > 0 && (
                            <button
                                type="button"
                                className="pa-prj2-btn pa-prj2-btn--primary"
                                onClick={() =>
                                    setCreating(true)
                                }
                            >
                                <Plus size={16} />
                                Tambah Proyek
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="pa-prj2-table">
                        <div
                            className="pa-prj2-row pa-prj2-table-head"
                            aria-hidden="true"
                        >
                            <span />
                            <span>No.</span>
                            <span>Cover</span>
                            <span>Judul Proyek</span>
                            <span>Kategori</span>
                            <span>Galeri</span>
                            <span className="pa-prj2-right">
                                Aksi
                            </span>
                        </div>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={
                                closestCenter
                            }
                            onDragEnd={onDragEnd}
                        >
                            <SortableContext
                                items={filtered.map(
                                    (item) => item.id
                                )}
                                strategy={
                                    verticalListSortingStrategy
                                }
                            >
                                {filtered.map((project, index) => (
                                    <ProjectRow
                                        key={project.id}
                                        project={project}
                                        number={index + 1}
                                        disabled={
                                            filter !== 'all' ||
                                            savingOrder
                                        }
                                        onDelete={setDeleting}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </div>
                )}
            </section>

            <CreateProject
                open={creating}
                onClose={() => setCreating(false)}
                categories={categories}
            />

            <ProjectModal
                open={!!deleting}
                onOpenChange={(next) => {
                    if (!next) setDeleting(null);
                }}
                busy={deletingBusy}
                title="Hapus Proyek?"
                description="Seluruh gambar dalam galeri proyek juga akan dihapus."
            >
                <p className="pa-prj2-muted">
                    Yakin ingin menghapus
                    {' '}
                    <strong>{deleting?.title}</strong>?
                </p>

                <div className="pa-prj2-form-actions">
                    <button
                        type="button"
                        className="pa-prj2-btn"
                        disabled={deletingBusy}
                        onClick={() =>
                            setDeleting(null)
                        }
                    >
                        Batal
                    </button>

                    <button
                        type="button"
                        className="pa-prj2-btn pa-prj2-btn--danger-solid"
                        disabled={deletingBusy}
                        onClick={destroy}
                    >
                        {deletingBusy
                            ? 'Menghapus...'
                            : 'Ya, Hapus'}
                    </button>
                </div>
            </ProjectModal>
        </AdminLayout>
    );
}