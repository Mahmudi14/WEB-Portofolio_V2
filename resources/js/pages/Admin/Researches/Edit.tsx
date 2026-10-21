import {
    Head,
    Link,
    useForm,
    usePage,
} from '@inertiajs/react';

import {
    ArrowLeft,
    Save,
} from 'lucide-react';

import type { FormEvent } from 'react';

import AdminLayout from '@/layouts/admin-layout';

import {
    ResearchFields,
    ResearchFlash,
} from './Shared';

import type {
    Research,
    ResearchForm,
} from './Shared';

import '../../../../css/researches-redesign.css';

type Props = {
    research: Research;
};

export default function Edit({
    research,
}: Props) {
    const form = useForm<ResearchForm>({
        title: research.title,
        summary: research.summary,
        year: research.year,
    });

    const { flash } = usePage().props as {
        flash?: {
            success?: string | null;
        };
    };

    function submit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        form.put(
            `/admin/researches/${research.id}`,
            {
                preserveScroll: true,
            }
        );
    }

    return (
        <AdminLayout
            title="Edit Penelitian"
            description={`Perbarui informasi ${research.title}.`}
            actions={
                <Link
                    href={`/admin/researches/${research.id}`}
                    className="pa-res2-btn"
                >
                    <ArrowLeft size={16} />
                    Kembali ke Detail
                </Link>
            }
        >
            <Head
                title={`Edit ${research.title} · Penelitian`}
            />

            <ResearchFlash
                message={flash?.success}
            />

            <section className="pa-res2-card pa-res2-edit-card">
                <div className="pa-res2-card-header">
                    <div>
                        <h2>
                            Informasi Penelitian
                        </h2>

                        <p>
                            Perbarui judul, ringkasan,
                            dan tahun penelitian.
                        </p>
                    </div>
                </div>

                <form
                    className="pa-res2-form pa-res2-edit-form"
                    onSubmit={submit}
                >
                    <ResearchFields
                        prefix="edit-research"
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
                        <Link
                            href={`/admin/researches/${research.id}`}
                            className="pa-res2-btn"
                        >
                            Batal
                        </Link>

                        <button
                            type="submit"
                            className="pa-res2-btn pa-res2-btn--primary"
                            disabled={
                                form.processing ||
                                !form.isDirty
                            }
                        >
                            <Save size={16} />

                            {form.processing
                                ? 'Menyimpan...'
                                : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </section>
        </AdminLayout>
    );
}