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
    GripVertical,
    Pencil,
    Plus,
    Trash2,
    Trophy,
} from 'lucide-react';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import { toast } from 'sonner';

import AdminLayout from '@/layouts/admin-layout';

import {
    AchievementFields,
    AchievementFlash,
    AchievementModal,
    categoryNames,
    emptyAchievement,
    sortAchievements,
} from './Shared';

import type {
    Achievement,
    AchievementCategory,
    AchievementForm,
} from './Shared';

import '../../../../css/achievements-redesign.css';

type Props = {
    achievements: Achievement[];
};

type Filter = 'semua' | AchievementCategory;

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

// ==========================================
// TAMBAH PENCAPAIAN
// ==========================================

function CreateAchievement({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const form = useForm<AchievementForm>(
        emptyAchievement()
    );

    function close() {
        form.reset();
        form.clearErrors();
        onClose();
    }

    function submit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        form.post('/admin/achievements', {
            preserveScroll: true,

            onSuccess: () => {
                close();
            },
        });
    }

    return (
        <AchievementModal
            open={open}
            onOpenChange={(next) => {
                if (!next) close();
            }}
            busy={form.processing}
            title="Tambah Pencapaian"
            description="Tambahkan prestasi, penghargaan, atau sertifikasi baru."
        >
            <form
                className="pa-ach2-form"
                onSubmit={submit}
            >
                <AchievementFields
                    prefix="create-achievement"
                    data={form.data}
                    errors={form.errors}
                    onChange={(patch) =>
                        form.setData({
                            ...form.data,
                            ...patch,
                        })
                    }
                />

                <div className="pa-ach2-form-actions">
                    <button
                        type="button"
                        className="pa-ach2-btn"
                        disabled={form.processing}
                        onClick={close}
                    >
                        Batal
                    </button>

                    <button
                        type="submit"
                        className="pa-ach2-btn pa-ach2-btn--primary"
                        disabled={form.processing}
                    >
                        {form.processing
                            ? 'Menyimpan...'
                            : 'Simpan Pencapaian'}
                    </button>
                </div>
            </form>
        </AchievementModal>
    );
}

// ==========================================
// BARIS DATA
// ==========================================

function AchievementRow({
    achievement,
    number,
    disabled,
    onDelete,
}: {
    achievement: Achievement;
    number: number;
    disabled: boolean;
    onDelete: (achievement: Achievement) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: achievement.id,
        disabled,
    });

    return (
        <div
            ref={setNodeRef}
            className={
                'pa-ach2-row' +
                (isDragging
                    ? ' pa-ach2-row--dragging'
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
                className="pa-ach2-handle"
                aria-label={
                    `Ubah urutan ${achievement.title}`
                }
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

            <span className="pa-ach2-no">
                {number}
            </span>

            <strong className="pa-ach2-title">
                {achievement.title}
            </strong>

            <span className="pa-ach2-category">
                {categoryNames[achievement.category]}
            </span>

            <span className="pa-ach2-institution">
                {achievement.institution_name || '—'}
            </span>

            <span className="pa-ach2-year">
                {achievement.year}
            </span>

            <div className="pa-ach2-row-actions">
                <Link
                    href={`/admin/achievements/${achievement.id}`}
                    className="pa-ach2-btn"
                >
                    <Eye size={15} />
                    Detail
                </Link>

                <Link
                    href={`/admin/achievements/${achievement.id}/edit`}
                    className="pa-ach2-btn"
                >
                    <Pencil size={15} />
                    Edit
                </Link>

                <button
                    type="button"
                    className="pa-ach2-btn pa-ach2-btn--danger"
                    onClick={() =>
                        onDelete(achievement)
                    }
                >
                    <Trash2 size={15} />
                    Hapus
                </button>
            </div>
        </div>
    );
}

// ==========================================
// HALAMAN INDEX
// ==========================================

export default function Index({
    achievements,
}: Props) {
    const [items, setItems] = useState(
        () => sortAchievements(achievements)
    );

    const [filter, setFilter] =
        useState<Filter>('semua');

    const [creating, setCreating] =
        useState(false);

    const [deleting, setDeleting] =
        useState<Achievement | null>(null);

    const [deletingBusy, setDeletingBusy] =
        useState(false);

    const [savingOrder, setSavingOrder] =
        useState(false);

    const { flash } = usePage().props as {
        flash?: {
            success?: string | null;
        };
    };

    useEffect(() => {
        setItems(sortAchievements(achievements));
    }, [achievements]);

    const filtered = items.filter(
        (item) =>
            filter === 'semua' ||
            item.category === filter
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

    // ======================================
    // DRAG AND DROP
    // ======================================

    function onDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (
            filter !== 'semua' ||
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
            oldIndex === -1 ||
            newIndex === -1
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
            '/admin/achievements/reorder',
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
                        'Gagal menyimpan urutan pencapaian.'
                    );
                },

                onFinish: () => {
                    setSavingOrder(false);
                },
            }
        );
    }

    // ======================================
    // HAPUS
    // ======================================

    function destroy() {
        if (
            !deleting ||
            deletingBusy
        ) {
            return;
        }

        setDeletingBusy(true);

        router.delete(
            `/admin/achievements/${deleting.id}`,
            {
                preserveScroll: true,

                onSuccess: () => {
                    setDeleting(null);
                },

                onError: () => {
                    toast.error(
                        'Pencapaian gagal dihapus.'
                    );
                },

                onFinish: () => {
                    setDeletingBusy(false);
                },
            }
        );
    }

    return (
        <AdminLayout
            title="Pencapaian"
            description="Kelola prestasi, penghargaan, dan sertifikasi."
            actions={
                <button
                    type="button"
                    className="pa-ach2-btn pa-ach2-btn--primary"
                    onClick={() => setCreating(true)}
                >
                    <Plus size={16} />
                    Tambah Pencapaian
                </button>
            }
        >
            <Head
                title="Pencapaian · Portfolio Admin"
            />

            <AchievementFlash
                message={flash?.success}
            />

            <section className="pa-ach2-card">
                <div className="pa-ach2-card-header">
                    <div>
                        <h2>Daftar Pencapaian</h2>

                        <p>
                            {items.length} pencapaian terdaftar.
                            {' '}
                            Atur urutan melalui drag-and-drop.
                        </p>
                    </div>

                    {savingOrder && (
                        <span
                            role="status"
                            className="pa-ach2-saving"
                        >
                            Menyimpan urutan...
                        </span>
                    )}
                </div>

                {/* FILTER KATEGORI */}

                <div
                    className="pa-ach2-filters"
                    role="group"
                    aria-label="Filter kategori pencapaian"
                >
                    {filters.map((tab) => (
                        <button
                            key={tab.value}
                            type="button"
                            className={
                                'pa-ach2-filter' +
                                (filter === tab.value
                                    ? ' pa-ach2-filter--active'
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

                {filter !== 'semua' && (
                    <p className="pa-ach2-filter-note">
                        Pilih filter Semua untuk
                        mengubah urutan pencapaian.
                    </p>
                )}

                {/* DAFTAR */}

                {filtered.length === 0 ? (
                    <div className="pa-ach2-empty">
                        <Trophy size={32} />

                        <h3>
                            Belum ada pencapaian
                        </h3>

                        <p>
                            {filter === 'semua'
                                ? 'Tambahkan pencapaian pertama.'
                                : 'Belum ada pencapaian pada kategori ini.'}
                        </p>

                        {filter === 'semua' && (
                            <button
                                type="button"
                                className="pa-ach2-btn pa-ach2-btn--primary"
                                onClick={() =>
                                    setCreating(true)
                                }
                            >
                                <Plus size={16} />
                                Tambah Pencapaian
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="pa-ach2-table">
                        <div
                            className="pa-ach2-row pa-ach2-table-head"
                            aria-hidden="true"
                        >
                            <span />
                            <span>No.</span>
                            <span>Judul Pencapaian</span>
                            <span>Kategori</span>
                            <span>Institusi</span>
                            <span>Tahun</span>
                            <span className="pa-ach2-right">
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
                                {filtered.map(
                                    (achievement, index) => (
                                        <AchievementRow
                                            key={achievement.id}
                                            achievement={achievement}
                                            number={index + 1}
                                            disabled={
                                                filter !== 'semua' ||
                                                savingOrder
                                            }
                                            onDelete={setDeleting}
                                        />
                                    )
                                )}
                            </SortableContext>
                        </DndContext>
                    </div>
                )}
            </section>

            {/* MODAL TAMBAH */}

            <CreateAchievement
                open={creating}
                onClose={() =>
                    setCreating(false)
                }
            />

            {/* MODAL HAPUS */}

            <AchievementModal
                open={!!deleting}
                onOpenChange={(next) => {
                    if (!next) {
                        setDeleting(null);
                    }
                }}
                busy={deletingBusy}
                title="Hapus Pencapaian?"
                description="Tindakan ini tidak dapat dibatalkan."
            >
                <p className="pa-ach2-muted">
                    Yakin ingin menghapus
                    {' '}
                    <strong>
                        {deleting?.title}
                    </strong>
                    ?
                </p>

                <div className="pa-ach2-form-actions">
                    <button
                        type="button"
                        className="pa-ach2-btn"
                        disabled={deletingBusy}
                        onClick={() =>
                            setDeleting(null)
                        }
                    >
                        Batal
                    </button>

                    <button
                        type="button"
                        className="pa-ach2-btn pa-ach2-btn--danger-solid"
                        disabled={deletingBusy}
                        onClick={destroy}
                    >
                        {deletingBusy
                            ? 'Menghapus...'
                            : 'Ya, Hapus'}
                    </button>
                </div>
            </AchievementModal>
        </AdminLayout>
    );
}