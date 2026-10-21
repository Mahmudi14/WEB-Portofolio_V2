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

import type {
    CategoryForm,
    SkillCategory,
} from './types';

import {
    Field,
    Flash,
} from './Shared';

import '../../../../css/skills-redesign.css';

type Props = {
    category: SkillCategory;
};

export default function Edit({
    category,
}: Props) {
    const form = useForm<CategoryForm>({
        name: category.name,
        description: category.description,
        sort_order: category.sort_order,
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
            `/admin/skills/${category.id}`,
            {
                preserveScroll: true,
            }
        );
    }

    return (
        <AdminLayout
            title="Edit Kategori"
            description={`Perbarui informasi kategori ${category.name}.`}
            actions={
                <Link
                    href={`/admin/skills/${category.id}`}
                    className="pa-skill-action"
                >
                    <ArrowLeft size={16} />
                    Kembali ke Detail
                </Link>
            }
        >
            <Head
                title={`Edit ${category.name} · Keahlian & Minat`}
            />

            <Flash message={flash?.success} />

            <section className="pa-sk-card pa-sk-edit-card">
                <div className="pa-sk-card__header">
                    <div>
                        <h2>
                            Informasi Kategori
                        </h2>

                        <p>
                            Urutan kategori diatur
                            melalui drag-and-drop dari
                            halaman daftar.
                        </p>
                    </div>
                </div>

                <form
                    className="pa-sk-form pa-sk-form--page"
                    onSubmit={submit}
                >
                    <Field
                        id="edit-category-name"
                        label="Nama Kategori"
                        error={form.errors.name}
                    >
                        <input
                            id="edit-category-name"
                            className="pa-editor-input"
                            required
                            maxLength={120}
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData(
                                    'name',
                                    e.target.value
                                )
                            }
                        />
                    </Field>

                    <Field
                        id="edit-category-description"
                        label="Deskripsi Kategori"
                        error={form.errors.description}
                    >
                        <textarea
                            id="edit-category-description"
                            className="pa-editor-textarea"
                            required
                            rows={5}
                            value={form.data.description}
                            onChange={(e) =>
                                form.setData(
                                    'description',
                                    e.target.value
                                )
                            }
                        />
                    </Field>

                    <div className="pa-sk-form__actions">
                        <Link
                            href={`/admin/skills/${category.id}`}
                            className="pa-skill-action"
                        >
                            Batal
                        </Link>

                        <button
                            type="submit"
                            className="pa-button pa-button--primary"
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