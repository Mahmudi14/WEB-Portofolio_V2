import { Head, Link, router, useForm, usePage } from "@inertiajs/react";

import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";

import type { DragEndEvent } from "@dnd-kit/core";

import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { Eye, Layers3, Pencil, Plus, Trash2 } from "lucide-react";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";

import AdminLayout from "@/layouts/admin-layout";

import type { CategoryForm, SkillCategory } from "./types";

import { byPosition } from "./types";

import { Field, Flash, SkillModal, SortableRow } from "./Shared";

import "../../../../css/skills-redesign.css";

type Props = {
    categories: SkillCategory[];
};

// ==========================================
// MODAL TAMBAH KATEGORI
// ==========================================

function AddCategory({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const form = useForm<CategoryForm>({
        name: "",
        description: "",
        sort_order: 0,
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.post("/admin/skills", {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                onClose();
            },
        });
    }

    return (
        <SkillModal
            open={open}
            onOpenChange={(next) => {
                if (!next) onClose();
            }}
            busy={form.processing}
            title="Tambah Kategori"
            description="Buat kategori baru. Urutannya dapat diubah melalui drag-and-drop."
        >
            <form onSubmit={submit} className="pa-sk-form">
                <Field
                    id="new-category-name"
                    label="Nama Kategori"
                    error={form.errors.name}
                >
                    <input
                        id="new-category-name"
                        className="pa-editor-input"
                        required
                        maxLength={120}
                        placeholder="Contoh: Web Development"
                        value={form.data.name}
                        onChange={(e) => form.setData("name", e.target.value)}
                    />
                </Field>

                <Field
                    id="new-category-description"
                    label="Deskripsi Kategori"
                    error={form.errors.description}
                >
                    <textarea
                        id="new-category-description"
                        className="pa-editor-textarea"
                        rows={4}
                        required
                        placeholder="Jelaskan fokus kategori ini..."
                        value={form.data.description}
                        onChange={(e) =>
                            form.setData("description", e.target.value)
                        }
                    />
                </Field>

                <div className="pa-sk-form__actions">
                    <button
                        type="button"
                        className="pa-skill-action"
                        disabled={form.processing}
                        onClick={onClose}
                    >
                        Batal
                    </button>

                    <button
                        type="submit"
                        className="pa-button pa-button--primary"
                        disabled={form.processing}
                    >
                        {form.processing ? "Menyimpan..." : "Simpan Kategori"}
                    </button>
                </div>
            </form>
        </SkillModal>
    );
}

// ==========================================
// INDEX KEAHLIAN & MINAT
// ==========================================

export default function Index({ categories }: Props) {
    const [ordered, setOrdered] = useState(() => byPosition(categories));

    const [creating, setCreating] = useState(false);

    const [deleting, setDeleting] = useState<SkillCategory | null>(null);

    const [busyDelete, setBusyDelete] = useState(false);

    const [savingOrder, setSavingOrder] = useState(false);

    const { flash } = usePage().props as {
        flash?: {
            success?: string | null;
        };
    };

    useEffect(() => {
        setOrdered(byPosition(categories));
    }, [categories]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 6,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    // ======================================
    // DRAG AND DROP
    // ======================================

    function onDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (savingOrder || !over || active.id === over.id) {
            return;
        }

        const oldIndex = ordered.findIndex((item) => item.id === active.id);

        const newIndex = ordered.findIndex((item) => item.id === over.id);

        if (oldIndex < 0 || newIndex < 0) {
            return;
        }

        const previous = ordered;

        const updated = arrayMove(previous, oldIndex, newIndex);

        setOrdered(updated);
        setSavingOrder(true);

        router.put(
            "/admin/skills/reorder",
            {
                ids: updated.map((item) => item.id),
            },
            {
                preserveScroll: true,

                onError: () => {
                    setOrdered(previous);

                    toast.error("Urutan gagal disimpan. Silakan muat ulang.");
                },

                onFinish: () => {
                    setSavingOrder(false);
                },
            },
        );
    }

    // ======================================
    // HAPUS KATEGORI
    // ======================================

    function deleteCategory() {
        if (!deleting || busyDelete) {
            return;
        }

        setBusyDelete(true);

        router.delete(`/admin/skills/${deleting.id}`, {
            preserveScroll: true,

            onSuccess: () => {
                setDeleting(null);
            },

            onError: () => {
                toast.error("Gagal menghapus kategori.");
            },

            onFinish: () => {
                setBusyDelete(false);
            },
        });
    }

    return (
        <AdminLayout
            title="Keahlian & Minat"
            description="Kelola kategori dan atur urutan menggunakan drag-and-drop."
            actions={
                <button
                    type="button"
                    className="pa-skill-action pa-skill-action--primary"
                    onClick={() => setCreating(true)}
                >
                    <Plus size={16} />
                    Tambah Kategori
                </button>
            }
        >
            <Head title="Keahlian & Minat · Portfolio Admin" />

            <Flash message={flash?.success} />

            <section
                className="pa-sk-card"
                aria-label="Daftar kategori keahlian dan minat"
            >
                <div className="pa-sk-card__header">
                    <div>
                        <h2>Kategori Terdaftar</h2>

                        <p>
                            {ordered.length} kategori. Seret ikon di sebelah
                            kiri untuk mengatur urutan.
                        </p>
                    </div>

                    {savingOrder && (
                        <span role="status" className="pa-sk-saving">
                            Menyimpan urutan...
                        </span>
                    )}
                </div>

                {ordered.length === 0 ? (
                    <div className="pa-sk-empty">
                        <Layers3 size={34} />

                        <h3>Belum ada kategori</h3>

                        <p>
                            Tambahkan kategori pertama untuk mulai
                            mengelompokkan keahlian dan minat.
                        </p>

                        <button
                            type="button"
                            className="pa-button pa-button--primary"
                            onClick={() => setCreating(true)}
                        >
                            <Plus size={16} />
                            Tambah Kategori
                        </button>
                    </div>
                ) : (
                    <div className="pa-sk-table pa-sk-table--categories">
                        <div
                            className="pa-sk-row pa-sk-row--header"
                            aria-hidden="true"
                        >
                            <span />
                            <span>No.</span>
                            <span>Kategori</span>
                            <span>Sub-keahlian</span>
                            <span className="pa-sk-align-right">Aksi</span>
                        </div>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={onDragEnd}
                        >
                            <SortableContext
                                items={ordered.map((item) => item.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {ordered.map((category, index) => (
                                    <SortableRow
                                        key={category.id}
                                        id={category.id}
                                        label={category.name}
                                    >
                                        <span className="pa-sk-order">
                                            {index + 1}
                                        </span>

                                        <div className="pa-sk-category-details">
                                            <strong>{category.name}</strong>
                                        </div>

                                        <span className="pa-sk-count">
                                            {category.items.length} item
                                        </span>

                                        <div className="pa-sk-actions">
                                            <Link
                                                className="pa-skill-action"
                                                href={`/admin/skills/${category.id}`}
                                                title="Detail"
                                            >
                                                <Eye size={15} />
                                                <span>Detail</span>
                                            </Link>

                                            <Link
                                                className="pa-skill-action"
                                                href={`/admin/skills/${category.id}/edit`}
                                                title="Edit"
                                            >
                                                <Pencil size={15} />
                                                <span>Edit</span>
                                            </Link>

                                            <button
                                                type="button"
                                                className="pa-skill-action pa-skill-action--danger"
                                                title="Hapus"
                                                onClick={() =>
                                                    setDeleting(category)
                                                }
                                            >
                                                <Trash2 size={15} />
                                                <span>Hapus</span>
                                            </button>
                                        </div>
                                    </SortableRow>
                                ))}
                            </SortableContext>
                        </DndContext>
                    </div>
                )}
            </section>

            <AddCategory open={creating} onClose={() => setCreating(false)} />

            <SkillModal
                open={!!deleting}
                onOpenChange={(next) => {
                    if (!next) setDeleting(null);
                }}
                title="Hapus Kategori?"
                busy={busyDelete}
                description="Semua sub-keahlian dalam kategori juga akan terhapus."
            >
                <p className="pa-sk-muted">
                    Yakin ingin menghapus <strong>{deleting?.name}</strong>?
                </p>

                <div className="pa-sk-form__actions">
                    <button
                        type="button"
                        className="pa-skill-action"
                        disabled={busyDelete}
                        onClick={() => setDeleting(null)}
                    >
                        Batal
                    </button>

                    <button
                        type="button"
                        className="pa-sk-danger-button"
                        disabled={busyDelete}
                        onClick={deleteCategory}
                    >
                        {busyDelete ? "Menghapus..." : "Ya, Hapus"}
                    </button>
                </div>
            </SkillModal>
        </AdminLayout>
    );
}
