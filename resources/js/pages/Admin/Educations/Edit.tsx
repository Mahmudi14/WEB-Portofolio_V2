import {
    Head,
    Link,
    useForm,
} from '@inertiajs/react';

import {
    ArrowLeft,
    Save,
} from 'lucide-react';

import type { FormEvent } from 'react';

import AdminLayout from '@/layouts/admin-layout';

import { EducationFields } from './Shared';

import type {
    Education,
    EducationForm,
} from './Shared';

import '../../../../css/educations-redesign.css';

type Props = {
    education: Education;
};

export default function Edit({
    education,
}: Props) {
    const form = useForm<EducationForm>({
        level: education.level,
        institution_name: education.institution_name,
        major: education.major ?? '',
        start_year: education.start_year,
        end_year: education.end_year ?? '',
        is_current: education.is_current,
    });

    function submit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        form.put(
            `/admin/educations/${education.id}`,
            {
                preserveScroll: true,
            }
        );
    }

    return (
        <AdminLayout
            title="Edit Pendidikan"
            description={`Perbarui informasi ${education.institution_name}.`}
            actions={
                <Link
                    href={`/admin/educations/${education.id}`}
                    className="pa-edu2-btn"
                >
                    <ArrowLeft size={16} />
                    Kembali ke Detail
                </Link>
            }
        >
            <Head
                title={`Edit ${education.institution_name} · Pendidikan`}
            />

            <section className="pa-edu2-card pa-edu2-edit-card">
                <div className="pa-edu2-card-header">
                    <div>
                        <h2>Informasi Pendidikan</h2>
                        <p>
                            Ubah jenjang, institusi, jurusan,
                            dan periode pendidikan.
                        </p>
                    </div>
                </div>

                <form
                    className="pa-edu2-form pa-edu2-edit-form"
                    onSubmit={submit}
                >
                    <EducationFields
                        prefix="edit-education"
                        data={form.data}
                        errors={form.errors}
                        onChange={(patch) =>
                            form.setData({
                                ...form.data,
                                ...patch,
                            })
                        }
                    />

                    <p className="pa-edu2-hint">
                        Urutan akan disesuaikan otomatis
                        berdasarkan jenjang dan tahun selesai
                        setelah perubahan disimpan.
                    </p>

                    <div className="pa-edu2-form-actions">
                        <Link
                            href={`/admin/educations/${education.id}`}
                            className="pa-edu2-btn"
                        >
                            Batal
                        </Link>

                        <button
                            type="submit"
                            className="pa-edu2-btn pa-edu2-btn--primary"
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