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
    FlaskConical,
    GripVertical,
    Pencil,
    Plus,
    Search,
    Trash2,
    X,
} from 'lucide-react';

import {
    useEffect,
    useState,
} from 'react';

import type { FormEvent } from 'react';

import { toast } from 'sonner';

import AdminLayout from '@/layouts/admin-layout';

import {
    ResearchFields,
    ResearchFlash,
    ResearchModal,
    emptyResearch,
    sortResearches,
} from './Shared';

import type {
    Research,
    ResearchForm,
} from './Shared';

import '../../../../css/researches-redesign.css';

type Props = {
    researches: Research[];
};

// ==========================================
// MODAL TAMBAH PENELITIAN
// ==========================================

function CreateResearch({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const form = useForm<ResearchForm>(
        emptyResearch()
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

        form.post('/admin/researches', {
            preserveScroll: true,

            onSuccess: () => {
                close();
            },
        });
    }

    return (
        <ResearchModal
            open={open}
            onOpenChange={(next) => {
                if (!next) close();
            }}
            busy={form.processing}
            title="Tambah Penelitian"
            description="Dokumentasikan karya penelitian beserta ringkasan dan tahun pelaksanaannya."
        >
            <form
                className="pa-res2-form"
                onSubmit={submit}
            >
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

                <div className="pa-res2-form-actions">
                    <button
                        type="button"
                        className="pa-res2-btn"
                        disabled={form.processing}
                        onClick={close}
                    >
                        Batal
                    </button>

                    <button
                        type="submit"
                        className="pa-res2-btn pa-res2-btn--primary"
                        disabled={form.processing}
                    >
                        {form.processing
                            ? 'Menyimpan...'
                            : 'Simpan Penelitian'}
                    </button>
                </div>
            </form>
        </ResearchModal>
    );
}

// ==========================================
// SORTABLE TABLE ROW
// ==========================================

function ResearchRow({
    research,
    number,
    disabled,
    onDelete,
}: {
    research: Research;
    number: number;
    disabled: boolean;
    onDelete: (research: Research) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: research.id,
        disabled,
    });

    return (
        <div
            ref={setNodeRef}
            className={
                'pa-res2-row' +
                (isDragging
                    ? ' pa-res2-row--dragging'
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
                className="pa-res2-handle"
                disabled={disabled}
                title={
                    disabled
                        ? 'Kosongkan pencarian untuk mengubah urutan'
                        : 'Geser untuk mengubah urutan'
                }
                aria-label={
                    `Ubah urutan ${research.title}`
                }
                {...attributes}
                {...listeners}
            >
                <GripVertical size={17} />
            </button>

            <span className="pa-res2-no">
                {number}
            </span>

            <strong className="pa-res2-title">
                {research.title}
            </strong>

            <span className="pa-res2-year">
                {research.year}
            </span>

            <div className="pa-res2-row-actions">
                <Link
                    href={`/admin/researches/${research.id}`}
                    className="pa-res2-btn"
                >
                    <Eye size={15} />
                    Detail
                </Link>

                <Link
                    href={`/admin/researches/${research.id}/edit`}
                    className="pa-res2-btn"
                >
                    <Pencil size={15} />
                    Edit
                </Link>

                <button
                    type="button"
                    className="pa-res2-btn pa-res2-btn--danger"
                    onClick={() =>
                        onDelete(research)
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
// MAIN INDEX
// ==========================================

export default function Index({
    researches,
}: Props) {
    const [items, setItems] = useState(
        () => sortResearches(researches)
    );

    const [search, setSearch] =
        useState('');

    const [creating, setCreating] =
        useState(false);

    const [deleting, setDeleting] =
        useState<Research | null>(null);

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
        setItems(sortResearches(researches));
    }, [researches]);

    const query = search.trim().toLowerCase();

    const filtered = items.filter(
        (research) =>
            !query ||
            research.title
                .toLowerCase()
                .includes(query) ||
            String(research.year).includes(query)
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
    // SIMPAN DRAG AND DROP
    // ======================================

    function onDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (
            query ||
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
            '/admin/researches/reorder',
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
                        'Gagal menyimpan urutan penelitian.'
                    );
                },

                onFinish: () => {
                    setSavingOrder(false);
                },
            }
        );
    }

    // ======================================
    // HAPUS PENELITIAN
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
            `/admin/researches/${deleting.id}`,
            {
                preserveScroll: true,

                onSuccess: () => {
                    setDeleting(null);
                },

                onError: () => {
                    toast.error(
                        'Penelitian gagal dihapus.'
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
            title="Penelitian"
            description="Kelola karya dan dokumentasi penelitian."
            actions={
                <button
                    type="button"
                    className="pa-res2-btn pa-res2-btn--primary"
                    onClick={() => setCreating(true)}
                >
                    <Plus size={16} />
                    Tambah Penelitian
                </button>
            }
        >
            <Head
                title="Penelitian · Portfolio Admin"
            />

            <ResearchFlash
                message={flash?.success}
            />

            <section className="pa-res2-card">
                <div className="pa-res2-card-header">
                    <div>
                        <h2>Daftar Penelitian</h2>

                        <p>
                            {items.length} penelitian terdaftar.
                            Geser ikon di kiri untuk mengatur urutan.
                        </p>
                    </div>

                    {savingOrder && (
                        <span
                            className="pa-res2-saving"
                            role="status"
                        >
                            Menyimpan urutan...
                        </span>
                    )}
                </div>

                {/* PENCARIAN */}

                <div className="pa-res2-search-area">
                    <div className="pa-res2-search">
                        <Search
                            size={17}
                            aria-hidden="true"
                        />

                        <input
                            type="search"
                            value={search}
                            aria-label="Cari penelitian"
                            placeholder="Cari judul atau tahun penelitian..."
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                        />

                        {search && (
                            <button
                                type="button"
                                aria-label="Hapus pencarian"
                                onClick={() =>
                                    setSearch('')
                                }
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <span className="pa-res2-result-count">
                        {filtered.length} dari {items.length} data
                    </span>
                </div>

                {query && (
                    <p className="pa-res2-info">
                        Kosongkan pencarian untuk
                        mengubah urutan penelitian.
                    </p>
                )}

                {/* DATA PENELITIAN */}

                {filtered.length === 0 ? (
                    <div className="pa-res2-empty">
                        {query ? (
                            <Search size={31} />
                        ) : (
                            <FlaskConical size={31} />
                        )}

                        <h3>
                            {query
                                ? 'Penelitian tidak ditemukan'
                                : 'Belum ada penelitian'}
                        </h3>

                        <p>
                            {query
                                ? 'Coba kata kunci lain.'
                                : 'Tambahkan penelitian pertama untuk mulai mendokumentasikan karya penelitian.'}
                        </p>

                        {!query && (
                            <button
                                type="button"
                                className="pa-res2-btn pa-res2-btn--primary"
                                onClick={() =>
                                    setCreating(true)
                                }
                            >
                                <Plus size={16} />
                                Tambah Penelitian
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="pa-res2-table">
                        <div
                            className="pa-res2-row pa-res2-table-head"
                            aria-hidden="true"
                        >
                            <span />
                            <span>No.</span>
                            <span>Judul Penelitian</span>
                            <span>Tahun</span>
                            <span className="pa-res2-right">
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
                                    (research, index) => (
                                        <ResearchRow
                                            key={research.id}
                                            research={research}
                                            number={index + 1}
                                            disabled={
                                                Boolean(query) ||
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

            <CreateResearch
                open={creating}
                onClose={() =>
                    setCreating(false)
                }
            />

            {/* MODAL HAPUS */}

            <ResearchModal
                open={!!deleting}
                onOpenChange={(next) => {
                    if (!next) setDeleting(null);
                }}
                busy={deletingBusy}
                title="Hapus Penelitian?"
                description="Tindakan ini tidak dapat dibatalkan."
            >
                <p className="pa-res2-muted">
                    Yakin ingin menghapus penelitian
                    {' '}
                    <strong>
                        {deleting?.title}
                    </strong>
                    ?
                </p>

                <div className="pa-res2-form-actions">
                    <button
                        type="button"
                        className="pa-res2-btn"
                        disabled={deletingBusy}
                        onClick={() =>
                            setDeleting(null)
                        }
                    >
                        Batal
                    </button>

                    <button
                        type="button"
                        className="pa-res2-btn pa-res2-btn--danger-solid"
                        disabled={deletingBusy}
                        onClick={destroy}
                    >
                        {deletingBusy
                            ? 'Menghapus...'
                            : 'Ya, Hapus'}
                    </button>
                </div>
            </ResearchModal>
        </AdminLayout>
    );
}