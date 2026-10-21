import {
    Head,
    Link,
    router,
    useForm,
    usePage,
} from '@inertiajs/react';

import {
    BriefcaseBusiness,
    Eye,
    Pencil,
    Plus,
    Trash2,
    UsersRound,
} from 'lucide-react';

import { useState } from 'react';
import type { FormEvent } from 'react';

import { toast } from 'sonner';

import AdminLayout from '@/layouts/admin-layout';

import {
    categories,
    emptyExperience,
    ExperienceFields,
    ExperienceFlash,
    ExperienceModal,
    period,
} from './Shared';

import type {
    Experience,
    ExperienceFormData,
} from './Shared';

import '../../../../css/experiences-redesign.css';

type Props = {
    experiences: Experience[];
};

type Category = 'pekerjaan' | 'organisasi';

// ==========================================
// URUTAN OTOMATIS BERDASARKAN TAHUN
// ==========================================

function orderedData(
    data: Experience[]
): Experience[] {
    const categoryOrder: Record<Category, number> = {
        pekerjaan: 1,
        organisasi: 2,
    };

    return [...data].sort((a, b) => {
        // Kelompokkan kategori.
        const categoryDiff =
            categoryOrder[a.category] -
            categoryOrder[b.category];

        if (categoryDiff !== 0) {
            return categoryDiff;
        }

        // Tahun mulai paling lama di atas.
        if (a.start_year !== b.start_year) {
            return a.start_year - b.start_year;
        }

        // Jika mulai pada tahun sama:
        // yang selesai lebih dulu di atas.
        const aEnd =
            a.is_current || a.end_year === null
                ? Number.MAX_SAFE_INTEGER
                : a.end_year;

        const bEnd =
            b.is_current || b.end_year === null
                ? Number.MAX_SAFE_INTEGER
                : b.end_year;

        if (aEnd !== bEnd) {
            return aEnd - bEnd;
        }

        // Penentu terakhir agar konsisten.
        return a.id - b.id;
    });
}

// ==========================================
// MODAL TAMBAH PENGALAMAN
// ==========================================

function AddExperience({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const form = useForm<ExperienceFormData>(
        emptyExperience()
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

        form.post('/admin/experiences', {
            forceFormData: true,
            preserveScroll: true,

            onSuccess: () => {
                close();
            },
        });
    }

    return (
        <ExperienceModal
            open={open}
            onOpenChange={(next) => {
                if (!next) close();
            }}
            title="Tambah Pengalaman"
            description="Lengkapi informasi pengalaman. Urutan ditentukan otomatis berdasarkan tahun."
            busy={form.processing}
        >
            <form
                className="pa-exp2-form"
                onSubmit={submit}
            >
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
                        onClick={close}
                    >
                        Batal
                    </button>

                    <button
                        type="submit"
                        className="pa-exp2-action pa-exp2-action--add"
                        disabled={form.processing}
                    >
                        {form.processing
                            ? 'Menyimpan...'
                            : 'Simpan Pengalaman'}
                    </button>
                </div>
            </form>
        </ExperienceModal>
    );
}

// ==========================================
// BARIS PENGALAMAN
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
    return (
        <div className="pa-exp2-row">
            <span className="pa-exp2-no">
                {number}
            </span>

            <span className="pa-exp2-category">
                {categories[experience.category]}
            </span>

            <strong className="pa-exp2-cell">
                {experience.position}
            </strong>

            <span className="pa-exp2-cell">
                {experience.institution_name}
            </span>

            <span className="pa-exp2-period">
                {period(experience)}
            </span>

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
                    onClick={() =>
                        onDelete(experience)
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
    experiences,
}: Props) {
    const [activeTab, setActiveTab] = useState<
        Category
    >('pekerjaan');

    const [adding, setAdding] = useState(false);

    const [deleting, setDeleting] =
        useState<Experience | null>(null);

    const [deletingBusy, setDeletingBusy] =
        useState(false);

    const { flash } = usePage().props as {
        flash?: {
            success?: string | null;
        };
    };

    // Data selalu disortir ulang dari props terbaru.
    // Tidak menggunakan sort_order manual.
    const items = orderedData(experiences);

    const pekerjaanCount = items.filter(
        (item) => item.category === 'pekerjaan'
    ).length;

    const organisasiCount = items.filter(
        (item) => item.category === 'organisasi'
    ).length;

    const filteredItems = items.filter(
        (item) => item.category === activeTab
    );

    function destroy() {
        if (!deleting || deletingBusy) return;

        setDeletingBusy(true);

        router.delete(
            `/admin/experiences/${deleting.id}`,
            {
                preserveScroll: true,

                onSuccess: () => {
                    setDeleting(null);
                },

                onError: () => {
                    toast.error(
                        'Gagal menghapus pengalaman.'
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
            title="Pengalaman"
            description="Kelola riwayat pekerjaan dan organisasi berdasarkan tahun."
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
            <Head
                title="Pengalaman · Portfolio Admin"
            />

            <ExperienceFlash
                message={flash?.success}
            />

            <section className="pa-exp2-card">
                {/* TABS */}

                <div
                    className="pa-exp2-tabs"
                    role="tablist"
                    aria-label="Kategori pengalaman"
                >
                    <button
                        type="button"
                        role="tab"
                        aria-selected={
                            activeTab === 'pekerjaan'
                        }
                        className={
                            'pa-exp2-tab' +
                            (activeTab === 'pekerjaan'
                                ? ' pa-exp2-tab--active'
                                : '')
                        }
                        onClick={() =>
                            setActiveTab('pekerjaan')
                        }
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
                        aria-selected={
                            activeTab === 'organisasi'
                        }
                        className={
                            'pa-exp2-tab' +
                            (activeTab === 'organisasi'
                                ? ' pa-exp2-tab--active'
                                : '')
                        }
                        onClick={() =>
                            setActiveTab('organisasi')
                        }
                    >
                        <UsersRound size={17} />

                        <span>Organisasi</span>

                        <span className="pa-exp2-tab-count">
                            {organisasiCount}
                        </span>
                    </button>
                </div>

                {/* HEADER */}

                <div className="pa-exp2-card-header">
                    <div>
                        <h2>Daftar Pengalaman</h2>

                        <p>
                            {filteredItems.length} pengalaman
                            {' '}
                            {activeTab} terdaftar.
                            Diurutkan otomatis dari tahun
                            paling awal ke terbaru.
                        </p>
                    </div>
                </div>

                {/* DAFTAR */}

                {filteredItems.length === 0 ? (
                    <div className="pa-exp2-empty">
                        {activeTab === 'pekerjaan' ? (
                            <BriefcaseBusiness size={32} />
                        ) : (
                            <UsersRound size={32} />
                        )}

                        <h3>
                            Belum ada pengalaman
                        </h3>

                        <p>
                            Belum ada pengalaman
                            {' '}
                            {activeTab} yang ditambahkan.
                        </p>

                        <button
                            type="button"
                            className="pa-skill-action pa-skill-action--primary"
                            onClick={() =>
                                setAdding(true)
                            }
                        >
                            <Plus size={16} />
                            Tambah Pengalaman
                        </button>
                    </div>
                ) : (
                    <div className="pa-exp2-table">
                        <div className="pa-exp2-row pa-exp2-table-head">
                            <span>No.</span>
                            <span>Kategori</span>
                            <span>Jabatan</span>
                            <span>Instansi</span>
                            <span>Periode</span>

                            <span className="pa-exp2-right">
                                Aksi
                            </span>
                        </div>

                        {filteredItems.map(
                            (experience, index) => (
                                <ExperienceRow
                                    key={experience.id}
                                    experience={experience}
                                    number={index + 1}
                                    onDelete={setDeleting}
                                />
                            )
                        )}
                    </div>
                )}
            </section>

            {/* MODAL TAMBAH */}

            <AddExperience
                open={adding}
                onClose={() => setAdding(false)}
            />

            {/* MODAL HAPUS */}

            <ExperienceModal
                open={!!deleting}
                onOpenChange={(next) => {
                    if (!next) {
                        setDeleting(null);
                    }
                }}
                busy={deletingBusy}
                title="Hapus Pengalaman?"
                description="Tindakan ini tidak dapat dibatalkan."
            >
                <p className="pa-exp2-muted">
                    Hapus pengalaman
                    {' '}
                    <strong>
                        {deleting?.position}
                    </strong>
                    {' '}di{' '}
                    {deleting?.institution_name}?
                </p>

                <div className="pa-exp2-form-actions">
                    <button
                        type="button"
                        className="pa-exp2-action"
                        disabled={deletingBusy}
                        onClick={() =>
                            setDeleting(null)
                        }
                    >
                        Batal
                    </button>

                    <button
                        type="button"
                        className="pa-exp2-action pa-exp2-action--danger-solid"
                        disabled={deletingBusy}
                        onClick={destroy}
                    >
                        {deletingBusy
                            ? 'Menghapus...'
                            : 'Ya, Hapus'}
                    </button>
                </div>
            </ExperienceModal>
        </AdminLayout>
    );
}