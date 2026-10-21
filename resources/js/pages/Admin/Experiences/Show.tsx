import { Head, Link, usePage } from '@inertiajs/react';

import {
    ArrowLeft,
    Pencil,
} from 'lucide-react';

import AdminLayout from '@/layouts/admin-layout';

import {
    categories,
    ExperienceFlash,
    period,
} from './Shared';

import type { Experience } from './Shared';

import '../../../../css/experiences-redesign.css';

type Props = {
    experience: Experience;
};

export default function Show({
    experience,
}: Props) {
    const { flash } = usePage().props as {
        flash?: {
            success?: string | null;
        };
    };

    return (
        <AdminLayout
            title="Detail Pengalaman"
            description="Informasi lengkap pengalaman pekerjaan atau organisasi."
            actions={
                <div className="pa-exp2-page-actions">
                    <Link
                        href="/admin/experiences"
                        className="pa-exp2-action"
                    >
                        <ArrowLeft size={16} />
                        Kembali
                    </Link>

                    <Link
                        href={`/admin/experiences/${experience.id}/edit`}
                        className="pa-exp2-action"
                    >
                        <Pencil size={16} />
                        Edit Pengalaman
                    </Link>
                </div>
            }
        >
            <Head
                title={`Detail ${experience.position} · Portfolio Admin`}
            />

            <ExperienceFlash message={flash?.success} />

            <section className="pa-exp2-card pa-exp2-detail">
                <div className="pa-exp2-detail-top">
                    <div className="pa-exp2-detail-identity">
                        <span className="pa-exp2-category">
                            {categories[experience.category]}
                        </span>

                        <h2>{experience.position}</h2>

                        <p>{experience.institution_name}</p>
                    </div>

                    {experience.logo_url && (
                        <img
                            className="pa-exp2-detail-logo"
                            src={experience.logo_url}
                            alt={`Logo ${experience.institution_name}`}
                        />
                    )}
                </div>

                <div className="pa-exp2-detail-content">
                    <div className="pa-exp2-info-grid">
                        <div>
                            <span>Kategori</span>
                            <strong>
                                {categories[experience.category]}
                            </strong>
                        </div>

                        <div>
                            <span>Perusahaan / Organisasi</span>
                            <strong>
                                {experience.institution_name}
                            </strong>
                        </div>

                        <div>
                            <span>Periode</span>
                            <strong>
                                {period(experience)}
                            </strong>
                        </div>

                        <div>
                            <span>Status</span>
                            <strong>
                                {experience.is_current
                                    ? 'Masih berlangsung'
                                    : 'Selesai'}
                            </strong>
                        </div>
                    </div>

                    <div className="pa-exp2-description">
                        <h3>Deskripsi Pengalaman</h3>

                        <p>{experience.description}</p>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}