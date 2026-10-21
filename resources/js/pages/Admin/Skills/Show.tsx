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

import { ArrowLeft, Layers3, Pencil, Plus, Trash2, X } from "lucide-react";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";

import AdminLayout from "@/layouts/admin-layout";

import type { ItemForm, SkillCategory, SkillItem } from "./types";

import { byPosition } from "./types";

import { Field, Flash, SkillModal, SortableRow } from "./Shared";

import "../../../../css/skills-redesign.css";

type Props = {
    category: SkillCategory;
};

export default function Show({ category }: Props) {
    const [ordered, setOrdered] = useState(() => byPosition(category.items));

    const [savingOrder, setSavingOrder] = useState(false);

    const [adding, setAdding] = useState(false);

    const [names, setNames] = useState([""]);

    const [addErrors, setAddErrors] = useState<Record<string, string>>({});

    const [addingBusy, setAddingBusy] = useState(false);

    const [editing, setEditing] = useState<SkillItem | null>(null);

    const [deleting, setDeleting] = useState<SkillItem | null>(null);

    const [deletingBusy, setDeletingBusy] = useState(false);

    const editForm = useForm<ItemForm>({
        name: "",
        sort_order: 0,
    });

    const { flash } = usePage().props as {
        flash?: {
            success?: string | null;
        };
    };

    const baseUrl = `/admin/skills/${category.id}`;

    useEffect(() => {
        setOrdered(byPosition(category.items));
    }, [category.items]);

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

    // =====================================
    // DRAG AND DROP SUB-KEAHLIAN
    // =====================================

    function onDragEnd({ active, over }: DragEndEvent) {
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
            `${baseUrl}/items/reorder`,
            {
                ids: updated.map((item) => item.id),
            },
            {
                preserveScroll: true,

                onError: () => {
                    setOrdered(previous);

                    toast.error(
                        "Urutan tidak tersimpan. Muat ulang lalu coba kembali.",
                    );
                },

                onFinish: () => setSavingOrder(false),
            },
        );
    }

    // =====================================
    // TAMBAH BANYAK SUB-KEAHLIAN
    // =====================================

    function submitMany(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (addingBusy) return;

        setAddErrors({});
        setAddingBusy(true);

        router.post(
            `${baseUrl}/items/bulk`,
            {
                items: names.map((name) => ({
                    name: name.trim(),
                })),
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    setAdding(false);
                    setNames([""]);
                    setAddErrors({});
                },

                onError: (errors) => {
                    setAddErrors(errors);
                },

                onFinish: () => {
                    setAddingBusy(false);
                },
            },
        );
    }

    // =====================================
    // EDIT SUB-KEAHLIAN
    // =====================================

    function beginEdit(item: SkillItem) {
        editForm.clearErrors();

        editForm.setData({
            name: item.name,
            sort_order: item.sort_order,
        });

        setEditing(item);
    }

    function submitEdit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!editing) return;

        editForm.put(`${baseUrl}/items/${editing.id}`, {
            preserveScroll: true,

            onSuccess: () => {
                setEditing(null);
            },
        });
    }

    // =====================================
    // HAPUS SUB-KEAHLIAN
    // =====================================

    function deleteItem() {
        if (!deleting || deletingBusy) {
            return;
        }

        setDeletingBusy(true);

        router.delete(`${baseUrl}/items/${deleting.id}`, {
            preserveScroll: true,

            onSuccess: () => {
                setDeleting(null);
            },

            onError: () => {
                toast.error("Sub-keahlian tidak dapat dihapus.");
            },

            onFinish: () => {
                setDeletingBusy(false);
            },
        });
    }

    return (
        <AdminLayout
            title={category.name}
            description="Detail kategori dan pengelolaan sub-keahlian."
            actions={
                <div className="pa-sk-page-actions">
                    <Link className="pa-skill-action" href="/admin/skills">
                        <ArrowLeft size={16} />
                        Kembali
                    </Link>

                    <Link className="pa-skill-action" href={`${baseUrl}/edit`}>
                        <Pencil size={16} />
                        Edit Kategori
                    </Link>
                    <button
                        type="button"
                        className="pa-skill-action pa-skill-action--primary"
                        onClick={() => setAdding(true)}
                    >
                        <Plus size={16} />
                        Tambah Sub-Keahlian
                    </button>
                </div>
            }
        >
            <Head title={`${category.name} · Keahlian & Minat`} />

            <Flash message={flash?.success} />

            {/* DETAIL KATEGORI */}

            <div className="pa-sk-card pa-sk-summary">
                <span className="pa-editor-kicker">DETAIL KATEGORI</span>

                <h2>{category.name}</h2>

                <p>{category.description}</p>

                <span className="pa-sk-count">
                    {ordered.length} sub-keahlian
                </span>
            </div>

            {/* DAFTAR SUB-KEAHLIAN */}

            <section className="pa-sk-card" aria-label="Daftar sub-keahlian">
                <div className="pa-sk-card__header">
                    <div>
                        <h2>Daftar Sub-Keahlian</h2>

                        <p>
                            Seret ikon di kiri untuk mengatur urutan yang muncul
                            di website.
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

                        <h3>Belum ada sub-keahlian</h3>

                        <p>Tambahkan beberapa sub-keahlian sekaligus.</p>

                        <button
                            type="button"
                            className="pa-skill-action pa-skill-action--primary"
                            onClick={() => setAdding(true)}
                        >
                            <Plus size={16} />
                            Tambah Sub-Keahlian
                        </button>
                    </div>
                ) : (
                    <div className="pa-sk-table pa-sk-table--items">
                        <div
                            className="pa-sk-row pa-sk-row--header"
                            aria-hidden="true"
                        >
                            <span />
                            <span>No.</span>
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
                                {ordered.map((item, index) => (
                                    <SortableRow
                                        key={item.id}
                                        id={item.id}
                                        label={item.name}
                                    >
                                        <span className="pa-sk-order">
                                            {index + 1}
                                        </span>

                                        <strong className="pa-sk-item-name">
                                            {item.name}
                                        </strong>

                                        <div className="pa-sk-actions">
                                            <button
                                                type="button"
                                                className="pa-skill-action"
                                                onClick={() => beginEdit(item)}
                                            >
                                                <Pencil size={15} />
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="pa-skill-action pa-skill-action--danger"
                                                onClick={() =>
                                                    setDeleting(item)
                                                }
                                            >
                                                <Trash2 size={15} />
                                                Hapus
                                            </button>
                                        </div>
                                    </SortableRow>
                                ))}
                            </SortableContext>
                        </DndContext>
                    </div>
                )}
            </section>

            {/* MODAL TAMBAH BANYAK SUB-KEAHLIAN */}

            <SkillModal
                open={adding}
                onOpenChange={setAdding}
                busy={addingBusy}
                title="Tambah Banyak Sub-Keahlian"
                description="Masukkan sub-keahlian satu per baris. Maksimal 50 dalam satu penyimpanan."
            >
                <form className="pa-sk-form" onSubmit={submitMany}>
                    {names.map((name, index) => (
                        <div className="pa-sk-bulk-row" key={index}>
                            <div className="pa-sk-bulk-input">
                                <Field
                                    id={`new-skill-${index}`}
                                    label={`Sub-keahlian ${index + 1}`}
                                    error={addErrors[`items.${index}.name`]}
                                >
                                    <input
                                        id={`new-skill-${index}`}
                                        className="pa-editor-input"
                                        required
                                        maxLength={120}
                                        placeholder="Contoh: Laravel"
                                        value={name}
                                        onChange={(e) =>
                                            setNames((before) =>
                                                before.map((old, i) =>
                                                    i === index
                                                        ? e.target.value
                                                        : old,
                                                ),
                                            )
                                        }
                                    />
                                </Field>
                            </div>

                            {names.length > 1 && (
                                <button
                                    type="button"
                                    className="pa-sk-icon-button"
                                    aria-label={`Hapus baris ${index + 1}`}
                                    disabled={addingBusy}
                                    onClick={() =>
                                        setNames((before) =>
                                            before.filter(
                                                (_, i) => i !== index,
                                            ),
                                        )
                                    }
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    ))}

                    {addErrors.items && (
                        <p className="pa-editor-error" role="alert">
                            {addErrors.items}
                        </p>
                    )}

                    {Object.entries(addErrors)
                        .filter(
                            ([key]) =>
                                key !== "items" &&
                                !key.match(/^items\.\d+\.name$/),
                        )
                        .map(([key, message]) => (
                            <p
                                key={key}
                                role="alert"
                                className="pa-editor-error"
                            >
                                {message}
                            </p>
                        ))}

                    <button
                        type="button"
                        className="pa-skill-add-item"
                        disabled={addingBusy || names.length >= 50}
                        onClick={() => setNames((before) => [...before, ""])}
                    >
                        <Plus size={15} />
                        Tambah Baris
                    </button>

                    <div className="pa-sk-form__actions">
                        <button
                            type="button"
                            className="pa-skill-action"
                            disabled={addingBusy}
                            onClick={() => setAdding(false)}
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            className="pa-button pa-button--primary"
                            disabled={addingBusy}
                        >
                            {addingBusy
                                ? "Menyimpan..."
                                : `Simpan ${names.length} Sub-Keahlian`}
                        </button>
                    </div>
                </form>
            </SkillModal>

            {/* MODAL EDIT SUB-KEAHLIAN */}

            <SkillModal
                open={!!editing}
                onOpenChange={(next) => {
                    if (!next) {
                        editForm.clearErrors();
                        setEditing(null);
                    }
                }}
                busy={editForm.processing}
                title="Edit Sub-Keahlian"
            >
                <form className="pa-sk-form" onSubmit={submitEdit}>
                    <Field
                        id="edit-skill-name"
                        label="Nama sub-keahlian"
                        error={editForm.errors.name}
                    >
                        <input
                            id="edit-skill-name"
                            className="pa-editor-input"
                            required
                            maxLength={120}
                            value={editForm.data.name}
                            onChange={(e) =>
                                editForm.setData("name", e.target.value)
                            }
                        />
                    </Field>

                    <div className="pa-sk-form__actions">
                        <button
                            type="button"
                            className="pa-skill-action"
                            disabled={editForm.processing}
                            onClick={() => setEditing(null)}
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            className="pa-button pa-button--primary"
                            disabled={editForm.processing}
                        >
                            {editForm.processing
                                ? "Menyimpan..."
                                : "Simpan Perubahan"}
                        </button>
                    </div>
                </form>
            </SkillModal>

            {/* MODAL HAPUS SUB-KEAHLIAN */}

            <SkillModal
                open={!!deleting}
                onOpenChange={(next) => {
                    if (!next) {
                        setDeleting(null);
                    }
                }}
                title="Hapus Sub-Keahlian?"
                busy={deletingBusy}
                description="Tindakan ini tidak dapat dibatalkan."
            >
                <p className="pa-sk-muted">
                    Yakin ingin menghapus <strong>{deleting?.name}</strong>?
                </p>

                <div className="pa-sk-form__actions">
                    <button
                        type="button"
                        className="pa-skill-action"
                        disabled={deletingBusy}
                        onClick={() => setDeleting(null)}
                    >
                        Batal
                    </button>

                    <button
                        type="button"
                        className="pa-sk-danger-button"
                        disabled={deletingBusy}
                        onClick={deleteItem}
                    >
                        {deletingBusy ? "Menghapus..." : "Ya, Hapus"}
                    </button>
                </div>
            </SkillModal>
        </AdminLayout>
    );
}
