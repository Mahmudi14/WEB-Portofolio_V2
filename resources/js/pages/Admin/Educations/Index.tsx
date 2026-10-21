import {
    Head,
    Link,
    router,
    useForm,
    usePage,
} from '@inertiajs/react';

import {
    Eye,
    GraduationCap,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';

import { useState } from 'react';
import type { FormEvent } from 'react';

import { toast } from 'sonner';

import AdminLayout from '@/layouts/admin-layout';

import {
    EducationFields,
    EducationModal,
    educationPeriod,
    emptyEducation,
} from './Shared';

import type {
    Education,
    EducationForm,
} from './Shared';

import '../../../../css/educations-redesign.css';

type Props = {
    educations: Education[];
    profileExists: boolean;
};

// ==========================================
// TAMBAH PENDIDIKAN
// ==========================================

function CreateEducation({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const form = useForm<EducationForm>(
        emptyEducation()
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

        form.post('/admin/educations', {
            preserveScroll: true,
            onSuccess: close,
        });
    }

    return (
        <EducationModal
            open={open}
            onOpenChange={(next) => {
                if (!next) close();
            }}
            busy={form.processing}
            title="Tambah Pendidikan"
            description="Tambahkan riwayat pendidikan. Urutan tampil akan diatur otomatis."
        >
            <form
                className="pa-edu2-form"
                onSubmit={submit}
            >
                <EducationFields
                    prefix="create-education"
                    data={form.data}
                    errors={form.errors}
                    onChange={(patch) =>
                        form.setData({
                            ...form.data,
                            ...patch,
                        })
                    }
                />

                <div className="pa-edu2-form-actions">
                    <button
                        type="button"
                        className="pa-edu2-btn"
                        disabled={form.processing}
                        onClick={close}
                    >
                        Batal
                    </button>

                    <button
                        type="submit"
                        className="pa-edu2-btn pa-edu2-btn--primary"
                        disabled={form.processing}
                    >
                        {form.processing
                            ? 'Menyimpan...'
                            : 'Simpan Pendidikan'}
                    </button>
                </div>
            </form>
        </EducationModal>
    );
}

// ==========================================
// HALAMAN INDEX
// ==========================================

export default function Index({
    educations,
    profileExists,
}: Props) {
    const [creating, setCreating] =
        useState(false);

    const [deleting, setDeleting] =
        useState<Education | null>(null);

    const [deletingBusy, setDeletingBusy] =
        useState(false);

    const { flash } = usePage().props as {
        flash?: {
            success?: string | null;
        };
    };

    function destroy() {
        if (!deleting || deletingBusy) return;

        setDeletingBusy(true);

        router.delete(
            `/admin/educations/${deleting.id}`,
            {
                preserveScroll: true,

                onSuccess: () => {
                    setDeleting(null);
                },

                onError: () => {
                    toast.error(
                        'Pendidikan gagal dihapus.'
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
            title="Pendidikan"
            description="Kelola riwayat pendidikan berdasarkan jenjang dan tahun kelulusan."
            actions={
                <button
                    type="button"
                    className="pa-edu2-btn pa-edu2-btn--primary"
                    disabled={!profileExists}
                    onClick={() => setCreating(true)}
                >
                    <Plus size={16} />
                    Tambah Pendidikan
                </button>
            }
        >
            <Head title="Pendidikan · Portfolio Admin" />

            {flash?.success && (
                <div
                    className="pa-editor-success"
                    role="status"
                >
                    {flash.success}
                </div>
            )}

            {!profileExists && (
                <div className="pa-edu2-notice">
                    Informasi Pribadi belum tersedia.
                    Lengkapi terlebih dahulu melalui
                    {' '}
                    <Link href="/admin/profile">
                        halaman Informasi Pribadi
                    </Link>.
                </div>
            )}

            <section className="pa-edu2-card">
                <div className="pa-edu2-card-header">
                    <div>
                        <h2>Daftar Pendidikan</h2>

                        <p>
                            {educations.length} riwayat pendidikan.
                            Jenjang tertinggi ditampilkan terlebih
                            dahulu, kemudian berdasarkan tahun
                            selesai paling awal.
                        </p>
                    </div>

                    <span className="pa-edu2-count">
                        {educations.length} Data
                    </span>
                </div>

                {educations.length === 0 ? (
                    <div className="pa-edu2-empty">
                        <GraduationCap size={32} />

                        <h3>Belum ada pendidikan</h3>

                        <p>
                            Tambahkan riwayat pendidikan
                            untuk ditampilkan pada portofolio.
                        </p>

                        {profileExists && (
                            <button
                                type="button"
                                className="pa-edu2-btn pa-edu2-btn--primary"
                                onClick={() =>
                                    setCreating(true)
                                }
                            >
                                <Plus size={16} />
                                Tambah Pendidikan
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="pa-edu2-table">
                        <div
                            className="pa-edu2-row pa-edu2-table-head"
                            aria-hidden="true"
                        >
                            <span>No.</span>
                            <span>Jenjang</span>
                            <span>Institusi</span>
                            <span>Jurusan</span>
                            <span>Periode</span>
                            <span className="pa-edu2-right">
                                Aksi
                            </span>
                        </div>

                        {educations.map(
                            (education, index) => (
                                <div
                                    key={education.id}
                                    className="pa-edu2-row"
                                >
                                    <span className="pa-edu2-number">
                                        {index + 1}
                                    </span>

                                    <span className="pa-edu2-level">
                                        {education.level}
                                    </span>

                                    <strong className="pa-edu2-institution">
                                        {education.institution_name}
                                    </strong>

                                    <span className="pa-edu2-major">
                                        {education.major || '—'}
                                    </span>

                                    <span className="pa-edu2-period">
                                        {educationPeriod(education)}
                                    </span>

                                    <div className="pa-edu2-row-actions">
                                        <Link
                                            href={`/admin/educations/${education.id}`}
                                            className="pa-edu2-btn"
                                        >
                                            <Eye size={15} />
                                            Detail
                                        </Link>

                                        <Link
                                            href={`/admin/educations/${education.id}/edit`}
                                            className="pa-edu2-btn"
                                        >
                                            <Pencil size={15} />
                                            Edit
                                        </Link>

                                        <button
                                            type="button"
                                            className="pa-edu2-btn pa-edu2-btn--danger"
                                            onClick={() =>
                                                setDeleting(education)
                                            }
                                        >
                                            <Trash2 size={15} />
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                )}
            </section>

            <CreateEducation
                open={creating}
                onClose={() => setCreating(false)}
            />

            <EducationModal
                open={!!deleting}
                onOpenChange={(next) => {
                    if (!next) setDeleting(null);
                }}
                busy={deletingBusy}
                title="Hapus Pendidikan?"
                description="Riwayat pendidikan yang dihapus tidak dapat dikembalikan."
            >
                <p className="pa-edu2-muted">
                    Yakin ingin menghapus pendidikan
                    {' '}
                    <strong>
                        {deleting?.institution_name}
                    </strong>
                    ?
                </p>

                <div className="pa-edu2-form-actions">
                    <button
                        type="button"
                        className="pa-edu2-btn"
                        disabled={deletingBusy}
                        onClick={() => setDeleting(null)}
                    >
                        Batal
                    </button>

                    <button
                        type="button"
                        className="pa-edu2-btn pa-edu2-btn--danger-solid"
                        disabled={deletingBusy}
                        onClick={destroy}
                    >
                        {deletingBusy
                            ? 'Menghapus...'
                            : 'Ya, Hapus'}
                    </button>
                </div>
            </EducationModal>
        </AdminLayout>
    );
}