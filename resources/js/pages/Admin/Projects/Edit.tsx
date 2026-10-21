import { Head, Link, useForm, usePage } from "@inertiajs/react";

import { ArrowLeft, Save } from "lucide-react";

import type { FormEvent } from "react";

import AdminLayout from "@/layouts/admin-layout";

import { ProjectFields, ProjectFlash } from "./Shared";

import { projectToForm } from "./types";

import type { Project, ProjectCategory, ProjectForm } from "./types";

import "../../../../css/projects-redesign.css";

type Props = {
    project: Project;
    categories: ProjectCategory[];
};

export default function Edit({ project, categories }: Props) {
    const form = useForm<ProjectForm>(projectToForm(project));

    const { flash } = usePage().props as {
        flash?: {
            success?: string | null;
            error?: string | null;
        };
    };

    const imageCount =
        form.data.images.length + form.data.existing_image_ids.length;

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (imageCount < 1 || imageCount > 5) {
            form.setError("images", "Proyek wajib memiliki 1–5 gambar.");
            return;
        }

        // Siapkan method PUT melalui form POST
        form.transform((data) => ({
            ...data,
            _method: "put",
        }));

        // Kirim data proyek beserta galeri
        form.post(`/admin/projects/${project.id}`, {
            forceFormData: true,
            preserveScroll: true,
        });
    }

    return (
        <AdminLayout
            title="Edit Proyek"
            description={`Perbarui informasi ${project.title}.`}
            actions={
                <Link
                    href={`/admin/projects/${project.id}`}
                    className="pa-prj2-btn"
                >
                    <ArrowLeft size={16} />
                    Kembali ke Detail
                </Link>
            }
        >
            <Head title={`Edit ${project.title} · Portfolio Admin`} />

            <ProjectFlash success={flash?.success} error={flash?.error} />

            <section className="pa-prj2-card pa-prj2-edit-card">
                <div className="pa-prj2-card-header">
                    <div>
                        <h2>Informasi Proyek</h2>

                        <p>
                            Edit deskripsi, teknologi, kategori, serta gambar
                            proyek.
                        </p>
                    </div>
                </div>

                <form
                    className="pa-prj2-form pa-prj2-edit-form"
                    onSubmit={submit}
                >
                    <ProjectFields
                        prefix="edit-project"
                        categories={categories}
                        data={form.data}
                        errors={form.errors}
                        existingImages={project.images}
                        onChange={(patch) =>
                            form.setData({
                                ...form.data,
                                ...patch,
                            })
                        }
                    />

                    <div className="pa-prj2-form-actions">
                        <Link
                            href={`/admin/projects/${project.id}`}
                            className="pa-prj2-btn"
                        >
                            Batal
                        </Link>

                        <button
                            type="submit"
                            className="pa-prj2-btn pa-prj2-btn--primary"
                            disabled={
                                form.processing ||
                                !form.isDirty ||
                                imageCount < 1 ||
                                imageCount > 5
                            }
                        >
                            <Save size={16} />

                            {form.processing
                                ? "Menyimpan..."
                                : "Simpan Perubahan"}
                        </button>
                    </div>
                </form>
            </section>
        </AdminLayout>
    );
}
