import { Head, Link, useForm, usePage } from "@inertiajs/react";

import { ArrowLeft, Save } from "lucide-react";

import type { FormEvent } from "react";

import AdminLayout from "@/layouts/admin-layout";

import { ExperienceFields, ExperienceFlash } from "./Shared";

import type { Experience, ExperienceFormData } from "./Shared";

import "../../../../css/experiences-redesign.css";

type Props = {
    experience: Experience;
};

export default function Edit({ experience }: Props) {
    const form = useForm<ExperienceFormData>({
        category: experience.category,
        position: experience.position,
        institution_name: experience.institution_name,
        description: experience.description,
        start_year: experience.start_year,
        end_year: experience.end_year ?? "",
        is_current: experience.is_current,
        sort_order: experience.sort_order,
        logo: null,
        remove_logo: false,
    });

    const { flash } = usePage().props as {
        flash?: {
            success?: string | null;
        };
    };

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        // Siapkan method PUT melalui form POST
        form.transform((data) => ({
            ...data,
            _method: "put",
        }));

        // Kirim form termasuk file gambar
        form.post(`/admin/experiences/${experience.id}`, {
            forceFormData: true,
            preserveScroll: true,
        });
    }

    return (
        <AdminLayout
            title="Edit Pengalaman"
            description={`Perbarui informasi ${experience.position}.`}
            actions={
                <Link
                    href={`/admin/experiences/${experience.id}`}
                    className="pa-exp2-action"
                >
                    <ArrowLeft size={16} />
                    Kembali ke Detail
                </Link>
            }
        >
            <Head title={`Edit ${experience.position} · Portfolio Admin`} />

            <ExperienceFlash message={flash?.success} />

            <section className="pa-exp2-card pa-exp2-edit-card">
                <div className="pa-exp2-card-header">
                    <div>
                        <h2>Informasi Pengalaman</h2>
                        <p>Perbarui informasi pekerjaan atau organisasi.</p>
                    </div>
                </div>

                <form
                    className="pa-exp2-form pa-exp2-edit-form"
                    onSubmit={submit}
                >
                    <ExperienceFields
                        prefix="edit-exp"
                        data={form.data}
                        errors={form.errors}
                        existingLogo={experience.logo_url}
                        onChange={(patch) =>
                            form.setData({
                                ...form.data,
                                ...patch,
                            })
                        }
                    />

                    <div className="pa-exp2-form-actions">
                        <Link
                            href={`/admin/experiences/${experience.id}`}
                            className="pa-exp2-action"
                        >
                            Batal
                        </Link>

                        <button
                            type="submit"
                            className="pa-exp2-action pa-exp2-action--add"
                            disabled={form.processing || !form.isDirty}
                        >
                            <Save size={15} />

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
