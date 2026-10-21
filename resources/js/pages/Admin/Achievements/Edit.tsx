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
    AchievementFields,
    AchievementFlash,
} from './Shared';

import type {
    Achievement,
    AchievementForm,
} from './Shared';

import '../../../../css/achievements-redesign.css';

type Props = {
    achievement: Achievement;
};

export default function Edit({
    achievement,
}: Props) {
    const form = useForm<AchievementForm>({
        category: achievement.category,
        title: achievement.title,
        description: achievement.description ?? '',
        year: achievement.year,
        institution_name:
            achievement.institution_name ?? '',
        sort_order: achievement.sort_order,
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
            `/admin/achievements/${achievement.id}`,
            {
                preserveScroll: true,
            }
        );
    }

    return (
        <AdminLayout
            title="Edit Pencapaian"
            description={`Perbarui informasi ${achievement.title}.`}
            actions={
                <Link
                    href={`/admin/achievements/${achievement.id}`}
                    className="pa-ach2-btn"
                >
                    <ArrowLeft size={16} />
                    Kembali ke Detail
                </Link>
            }
        >
            <Head
                title={`Edit ${achievement.title} · Pencapaian`}
            />

            <AchievementFlash
                message={flash?.success}
            />

            <section className="pa-ach2-card pa-ach2-edit-card">
                <div className="pa-ach2-card-header">
                    <div>
                        <h2>
                            Informasi Pencapaian
                        </h2>

                        <p>
                            Perbarui data prestasi,
                            penghargaan, atau sertifikasi.
                        </p>
                    </div>
                </div>

                <form
                    className="pa-ach2-form pa-ach2-edit-form"
                    onSubmit={submit}
                >
                    <AchievementFields
                        prefix="edit-achievement"
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
                        <Link
                            href={`/admin/achievements/${achievement.id}`}
                            className="pa-ach2-btn"
                        >
                            Batal
                        </Link>

                        <button
                            type="submit"
                            className="pa-ach2-btn pa-ach2-btn--primary"
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