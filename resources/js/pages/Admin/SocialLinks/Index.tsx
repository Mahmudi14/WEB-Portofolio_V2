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
    Share2,
    Trash2,
} from 'lucide-react';

import {
    useEffect,
    useState,
} from 'react';

import type { FormEvent } from 'react';

import { toast } from 'sonner';

import AdminLayout from '@/layouts/admin-layout';

import {
    SocialFields,
    SocialFlash,
    SocialIdentity,
    SocialModal,
} from './Shared';

import {
    emptySocialLink,
    sortSocialLinks,
} from './types';

import type {
    SocialLink,
    SocialLinkForm,
} from './types';

import '../../../../css/social-links-redesign.css';

type Props = {
    links: SocialLink[];
};

// ==========================================
// MODAL TAMBAH
// ==========================================

function CreateSocialLink({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const form = useForm<SocialLinkForm>(
        emptySocialLink()
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

        form.post('/admin/social-links', {
            preserveScroll: true,

            onSuccess: () => {
                close();
            },
        });
    }

    return (
        <SocialModal
            open={open}
            onOpenChange={(next) => {
                if (!next) close();
            }}
            busy={form.processing}
            title="Tambah Media Sosial"
            description="Tambahkan platform, nama tampilan, dan alamat tautan."
        >
            <form
                className="pa-soc2-form"
                onSubmit={submit}
            >
                <SocialFields
                    prefix="create-social"
                    data={form.data}
                    errors={form.errors}
                    onChange={(patch) =>
                        form.setData({
                            ...form.data,
                            ...patch,
                        })
                    }
                />

                <div className="pa-soc2-form-actions">
                    <button
                        type="button"
                        className="pa-soc2-btn"
                        disabled={form.processing}
                        onClick={close}
                    >
                        Batal
                    </button>

                    <button
                        type="submit"
                        className="pa-soc2-btn pa-soc2-btn--primary"
                        disabled={form.processing}
                    >
                        {form.processing
                            ? 'Menyimpan...'
                            : 'Simpan Media Sosial'}
                    </button>
                </div>
            </form>
        </SocialModal>
    );
}

// ==========================================
// BARIS DRAG AND DROP
// ==========================================

function SocialRow({
    link,
    number,
    disabled,
    onDelete,
}: {
    link: SocialLink;
    number: number;
    disabled: boolean;
    onDelete: (link: SocialLink) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: link.id,
        disabled,
    });

    return (
        <div
            ref={setNodeRef}
            className={
                'pa-soc2-row' +
                (isDragging
                    ? ' pa-soc2-row--dragging'
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
                className="pa-soc2-handle"
                title="Geser untuk mengubah urutan"
                aria-label={`Ubah urutan ${link.platform}`}
                disabled={disabled}
                {...attributes}
                {...listeners}
            >
                <GripVertical size={17} />
            </button>

            <span className="pa-soc2-no">
                {number}
            </span>

            <SocialIdentity link={link} />

            <span
                className="pa-soc2-url"
                title={link.url}
            >
                {link.url}
            </span>

            <div className="pa-soc2-row-actions">
                <Link
                    href={`/admin/social-links/${link.id}`}
                    className="pa-soc2-btn"
                >
                    <Eye size={15} />
                    Detail
                </Link>

                <Link
                    href={`/admin/social-links/${link.id}/edit`}
                    className="pa-soc2-btn"
                >
                    <Pencil size={15} />
                    Edit
                </Link>

                <button
                    type="button"
                    className="pa-soc2-btn pa-soc2-btn--danger"
                    onClick={() => onDelete(link)}
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
    links,
}: Props) {
    const [items, setItems] = useState(
        () => sortSocialLinks(links)
    );

    const [creating, setCreating] =
        useState(false);

    const [deleting, setDeleting] =
        useState<SocialLink | null>(null);

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
        setItems(sortSocialLinks(links));
    }, [links]);

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
            '/admin/social-links/reorder',
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
                        'Urutan media sosial gagal disimpan.'
                    );
                },

                onFinish: () => {
                    setSavingOrder(false);
                },
            }
        );
    }

    // ======================================
    // HAPUS MEDIA SOSIAL
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
            `/admin/social-links/${deleting.id}`,
            {
                preserveScroll: true,

                onSuccess: () => {
                    setDeleting(null);
                },

                onError: () => {
                    toast.error(
                        'Media sosial gagal dihapus.'
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
            title="Media Sosial"
            description="Kelola platform dan tautan yang ditampilkan pada website."
            actions={
                <button
                    type="button"
                    className="pa-soc2-btn pa-soc2-btn--primary"
                    onClick={() => setCreating(true)}
                >
                    <Plus size={16} />
                    Tambah Media Sosial
                </button>
            }
        >
            <Head
                title="Media Sosial · Portfolio Admin"
            />

            <SocialFlash
                message={flash?.success}
            />

            <section
                className="pa-soc2-card"
                aria-label="Daftar media sosial"
            >
                <div className="pa-soc2-card-header">
                    <div>
                        <h2>Daftar Media Sosial</h2>

                        <p>
                            {items.length} tautan terdaftar.
                            Geser ikon di sebelah kiri
                            untuk mengatur urutan.
                        </p>
                    </div>

                    {savingOrder && (
                        <span
                            className="pa-soc2-saving"
                            role="status"
                        >
                            Menyimpan urutan...
                        </span>
                    )}
                </div>

                {items.length === 0 ? (
                    <div className="pa-soc2-empty">
                        <Share2 size={32} />

                        <h3>
                            Belum ada media sosial
                        </h3>

                        <p>
                            Tambahkan platform media sosial
                            untuk ditampilkan di website
                            portofolio.
                        </p>

                        <button
                            type="button"
                            className="pa-soc2-btn pa-soc2-btn--primary"
                            onClick={() =>
                                setCreating(true)
                            }
                        >
                            <Plus size={16} />
                            Tambah Media Sosial
                        </button>
                    </div>
                ) : (
                    <div className="pa-soc2-table">
                        <div
                            className="pa-soc2-row pa-soc2-table-head"
                            aria-hidden="true"
                        >
                            <span />
                            <span>No.</span>
                            <span>Platform / Label</span>
                            <span>URL</span>
                            <span className="pa-soc2-right">
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
                                items={items.map(
                                    (item) => item.id
                                )}
                                strategy={
                                    verticalListSortingStrategy
                                }
                            >
                                {items.map((link, index) => (
                                    <SocialRow
                                        key={link.id}
                                        link={link}
                                        number={index + 1}
                                        disabled={savingOrder}
                                        onDelete={setDeleting}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </div>
                )}
            </section>

            {/* MODAL TAMBAH */}

            <CreateSocialLink
                open={creating}
                onClose={() =>
                    setCreating(false)
                }
            />

            {/* MODAL HAPUS */}

            <SocialModal
                open={!!deleting}
                onOpenChange={(next) => {
                    if (!next) {
                        setDeleting(null);
                    }
                }}
                busy={deletingBusy}
                title="Hapus Media Sosial?"
                description="Tautan yang dihapus tidak akan tampil lagi di website."
            >
                <p className="pa-soc2-muted">
                    Yakin ingin menghapus
                    {' '}
                    <strong>
                        {deleting?.platform}
                    </strong>
                    {' '}
                    — {deleting?.name}?
                </p>

                <div className="pa-soc2-form-actions">
                    <button
                        type="button"
                        className="pa-soc2-btn"
                        disabled={deletingBusy}
                        onClick={() =>
                            setDeleting(null)
                        }
                    >
                        Batal
                    </button>

                    <button
                        type="button"
                        className="pa-soc2-btn pa-soc2-btn--danger-solid"
                        disabled={deletingBusy}
                        onClick={destroy}
                    >
                        {deletingBusy
                            ? 'Menghapus...'
                            : 'Ya, Hapus'}
                    </button>
                </div>
            </SocialModal>
        </AdminLayout>
    );
}