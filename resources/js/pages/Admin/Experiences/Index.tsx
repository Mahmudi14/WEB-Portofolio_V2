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
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import {
    BriefcaseBusiness,
    Eye,
    GripVertical,
    Pencil,
    Plus,
    Trash2,
    UsersRound,
} from "lucide-react";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";

import AdminLayout from "@/layouts/admin-layout";

import {
    categories,
    emptyExperience,
    ExperienceFields,
    ExperienceFlash,
    ExperienceModal,
    period,
} from "./Shared";

import type { Experience, ExperienceFormData } from "./Shared";

import "../../../../css/experiences-redesign.css";

type Props = {
    experiences: Experience[];
};

function orderedData(data: Experience[]) {
    return [...data].sort(
        (a, b) =>
            a.sort_order - b.sort_order ||
            b.start_year - a.start_year ||
            b.id - a.id,
    );
}

// ==========================================
// FORM TAMBAH DALAM MODAL
// ==========================================

function AddExperience({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const form = useForm<ExperienceFormData>(emptyExperience());

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.post("/admin/experiences", {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                form.clearErrors();
                onClose();
            },
        });
    }

    return (
        <ExperienceModal
            open={open}
            onOpenChange={(next) => {
                if (!next) {
                    form.reset();
                    form.clearErrors();
                    onClose();
                }
            }}
            title="Tambah Pengalaman"
            description="Lengkapi informasi pengalaman pekerjaan atau organisasi."
            busy={form.processing}
        >
            <form className="pa-exp2-form" onSubmit={submit}>
                <ExperienceFields
                    prefix="create-exp"
                    data={form.data}
                    errors={form.errors}
                    onChange={(patch) =>
                        form.setData({
                            ...form.data,
                            ...patch,
                        })
                    }
                />

                <div className="pa-exp2-form-actions">
                    <button
                        type="button"
                        className="pa-exp2-action"
                        disabled={form.processing}
                        onClick={onClose}
                    >
                        Batal
                    </button>

                    <button
                        type="submit"
                        className="pa-exp2-action pa-exp2-action--add"
                        disabled={form.processing}
                    >
                        {form.processing ? "Menyimpan..." : "Simpan Pengalaman"}
                    </button>
                </div>
            </form>
        </ExperienceModal>
    );
}

// ==========================================
// BARIS DRAG-AND-DROP
// ==========================================

function ExperienceRow({
    experience,
    number,
    onDelete,
}: {
    experience: Experience;
    number: number;
    onDelete: (item: Experience) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: experience.id,
    });

    return (
        <div
            ref={setNodeRef}
            className={"pa-exp2-row" + (isDragging ? " pa-exp2-dragging" : "")}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
            }}
        >
            <button
                type="button"
                className="pa-exp2-handle"
                aria-label={`Ubah urutan ${experience.position}`}
                {...attributes}
                {...listeners}
            >
                <GripVertical size={17} />
            </button>

            <span className="pa-exp2-no">{number}</span>

            <span className="pa-exp2-category">
                {categories[experience.category]}
            </span>

            <strong className="pa-exp2-cell">{experience.position}</strong>

            <span className="pa-exp2-cell">{experience.institution_name}</span>

            <span className="pa-exp2-period">{period(experience)}</span>

            <div className="pa-exp2-row-actions">
                <Link
                    href={`/admin/experiences/${experience.id}`}
                    className="pa-exp2-action"
                >
                    <Eye size={15} />
                    Detail
                </Link>

                <Link
                    href={`/admin/experiences/${experience.id}/edit`}
                    className="pa-exp2-action"
                >
                    <Pencil size={15} />
                    Edit
                </Link>

                <button
                    type="button"
                    className="pa-exp2-action pa-exp2-action--danger"
                    onClick={() => onDelete(experience)}
                >
                    <Trash2 size={15} />
                    Hapus
                </button>
            </div>
        </div>
    );
}

// ==========================================
// INDEX UTAMA
// ==========================================

export default function Index({ experiences }: Props) {
    const [items, setItems] = useState(() => orderedData(experiences));

    const [activeTab, setActiveTab] = useState<"pekerjaan" | "organisasi">(
        "pekerjaan",
    );

    const pekerjaanCount = items.filter(
        (item) => item.category === "pekerjaan",
    ).length;

    const organisasiCount = items.filter(
        (item) => item.category === "organisasi",
    ).length;

    const filteredItems = items.filter((item) => item.category === activeTab);

    const [adding, setAdding] = useState(false);

    const [deleting, setDeleting] = useState<Experience | null>(null);

    const [deletingBusy, setDeletingBusy] = useState(false);

    const [savingOrder, setSavingOrder] = useState(false);

    const { flash } = usePage().props as {
        flash?: {
            success?: string | null;
        };
    };

    useEffect(() => {
        setItems(orderedData(experiences));
    }, [experiences]);

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

    function onDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (savingOrder || !over || active.id === over.id) {
            return;
        }

        // Data pada tab yang sedang aktif
        const currentCategoryItems = items.filter(
            (item) => item.category === activeTab,
        );

        const oldIndex = currentCategoryItems.findIndex(
            (item) => item.id === active.id,
        );

        const newIndex = currentCategoryItems.findIndex(
            (item) => item.id === over.id,
        );

        if (oldIndex === -1 || newIndex === -1) {
            return;
        }

        // Ubah urutan dalam kategori aktif
        const reorderedCategory = arrayMove(
            currentCategoryItems,
            oldIndex,
            newIndex,
        );

        // Gabungkan kembali dengan kategori lain
        // tanpa mengubah urutan relatif kategori lain.
        let categoryIndex = 0;

        const previous = items;

        const updated = items.map((item) => {
            if (item.category !== activeTab) {
                return item;
            }

            return reorderedCategory[categoryIndex++];
        });

        setItems(updated);
        setSavingOrder(true);

        // Backend tetap menerima semua ID pengalaman
        router.put(
            "/admin/experiences/reorder",
            {
                ids: updated.map((item) => item.id),
            },
            {
                preserveScroll: true,

                onError: () => {
                    setItems(previous);

                    toast.error("Gagal menyimpan urutan pengalaman.");
                },

                onFinish: () => {
                    setSavingOrder(false);
                },
            },
        );
    }

    function destroy() {
        if (!deleting || deletingBusy) return;

        setDeletingBusy(true);

        router.delete(`/admin/experiences/${deleting.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleting(null);
            },
            onError: () => {
                toast.error("Gagal menghapus pengalaman.");
            },
            onFinish: () => {
                setDeletingBusy(false);
            },
        });
    }

    return (
        <AdminLayout
            title="Pengalaman"
            description="Kelola riwayat pekerjaan dan organisasi."
            actions={
                <button
                    type="button"
                    className="pa-skill-action pa-skill-action--primary"
                    onClick={() => setAdding(true)}
                >
                    <Plus size={16} />
                    Tambah Pengalaman
                </button>
            }
        >
            <Head title="Pengalaman · Portfolio Admin" />

            <ExperienceFlash message={flash?.success} />

            <section className="pa-exp2-card">
                <div
                    className="pa-exp2-tabs"
                    role="tablist"
                    aria-label="Kategori pengalaman"
                >
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === "pekerjaan"}
                        className={
                            "pa-exp2-tab" +
                            (activeTab === "pekerjaan"
                                ? " pa-exp2-tab--active"
                                : "")
                        }
                        onClick={() => setActiveTab("pekerjaan")}
                    >
                        <BriefcaseBusiness size={17} />

                        <span>Pekerjaan</span>

                        <span className="pa-exp2-tab-count">
                            {pekerjaanCount}
                        </span>
                    </button>

                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === "organisasi"}
                        className={
                            "pa-exp2-tab" +
                            (activeTab === "organisasi"
                                ? " pa-exp2-tab--active"
                                : "")
                        }
                        onClick={() => setActiveTab("organisasi")}
                    >
                        <UsersRound size={17} />

                        <span>Organisasi</span>

                        <span className="pa-exp2-tab-count">
                            {organisasiCount}
                        </span>
                    </button>
                </div>
                <div className="pa-exp2-card-header">
                    <div>
                        <h2>Daftar Pengalaman</h2>
                        <p>
                            {items.length} pengalaman terdaftar. Geser ikon di
                            kiri untuk mengubah urutan.
                        </p>
                    </div>

                    {savingOrder && (
                        <span className="pa-exp2-saving" role="status">
                            Menyimpan urutan...
                        </span>
                    )}
                </div>

                {filteredItems.length === 0 ? (
                    <div className="pa-exp2-empty">
                        <BriefcaseBusiness size={32} />
                        <h3>Belum ada pengalaman</h3>
                        <p>
                            Tambahkan pengalaman pekerjaan atau organisasi
                            pertama.
                        </p>
                        <button
                            className="pa-skill-action pa-skill-action--primary"
                            type="button"
                            onClick={() => setAdding(true)}
                        >
                            <Plus size={16} />
                            Tambah Pengalaman
                        </button>
                    </div>
                ) : (
                    <div className="pa-exp2-table">
                        <div className="pa-exp2-row pa-exp2-table-head">
                            <span />
                            <span>No.</span>
                            <span>Kategori</span>
                            <span>Jabatan</span>
                            <span>Instansi</span>
                            <span>Periode</span>
                            <span className="pa-exp2-right">Aksi</span>
                        </div>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={onDragEnd}
                        >
                            <SortableContext
                                items={filteredItems.map((item) => item.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {filteredItems.map((experience, index) => (
                                    <ExperienceRow
                                        key={experience.id}
                                        experience={experience}
                                        number={index + 1}
                                        onDelete={setDeleting}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </div>
                )}
            </section>

            <AddExperience open={adding} onClose={() => setAdding(false)} />

            <ExperienceModal
                open={!!deleting}
                onOpenChange={(next) => {
                    if (!next) setDeleting(null);
                }}
                busy={deletingBusy}
                title="Hapus Pengalaman?"
                description="Tindakan ini tidak dapat dibatalkan."
            >
                <p className="pa-exp2-muted">
                    Hapus pengalaman <strong>{deleting?.position}</strong> di{" "}
                    {deleting?.institution_name}?
                </p>

                <div className="pa-exp2-form-actions">
                    <button
                        className="pa-exp2-action"
                        type="button"
                        disabled={deletingBusy}
                        onClick={() => setDeleting(null)}
                    >
                        Batal
                    </button>

                    <button
                        className="pa-exp2-action pa-exp2-action--danger-solid"
                        type="button"
                        disabled={deletingBusy}
                        onClick={destroy}
                    >
                        {deletingBusy ? "Menghapus..." : "Ya, Hapus"}
                    </button>
                </div>
            </ExperienceModal>
        </AdminLayout>
    );
}
