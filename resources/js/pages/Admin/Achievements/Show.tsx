import {
    Head,
    Link,
    usePage,
} from '@inertiajs/react';

import {
    ArrowLeft,
    Pencil,
} from 'lucide-react';

import AdminLayout from '@/layouts/admin-layout';

import {
    AchievementFlash,
    categoryNames,
} from './Shared';

import type { Achievement } from './Shared';

import '../../../../css/achievements-redesign.css';

type Props = {
    achievement: Achievement;
};

export default function Show({
    achievement,
}: Props) {
    const { flash } = usePage().props as {
        flash?: {
            success?: string | null;
        };
    };

    return (
        <AdminLayout
            title="Detail Pencapaian"
            description="Informasi lengkap pencapaian."
            actions={
                <div className="pa-ach2-page-actions">
                    <Link
                        href="/admin/achievements"
                        className="pa-ach2-btn"
                    >
                        <ArrowLeft size={16} />
                        Kembali
                    </Link>

                    <Link
                        href={`/admin/achievements/${achievement.id}/edit`}
                        className="pa-ach2-btn"
                    >
                        <Pencil size={16} />
                        Edit Pencapaian
                    </Link>
                </div>
            }
        >
            <Head
                title={`${achievement.title} · Pencapaian`}
            />

            <AchievementFlash
                message={flash?.success}
            />

            <section className="pa-ach2-card pa-ach2-detail">
                <div className="pa-ach2-detail-top">
                    <span className="pa-ach2-category">
                        {categoryNames[
                            achievement.category
                        ]}
                    </span>

                    <h2>
                        {achievement.title}
                    </h2>

                    <p>
                        {achievement.institution_name ||
                            'Tidak ada informasi penyelenggara'}
                    </p>
                </div>

                <div className="pa-ach2-detail-content">
                    <div className="pa-ach2-info-grid">
                        <div>
                            <span>Kategori</span>

                            <strong>
                                {categoryNames[
                                    achievement.category
                                ]}
                            </strong>
                        </div>

                        <div>
                            <span>Tahun Pencapaian</span>

                            <strong>
                                {achievement.year}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Penyelenggara / Institusi
                            </span>

                            <strong>
                                {achievement.institution_name ||
                                    '—'}
                            </strong>
                        </div>
                    </div>

                    <div className="pa-ach2-description">
                        <h3>
                            Deskripsi Pencapaian
                        </h3>

                        <p>
                            {achievement.description ||
                                'Belum ada deskripsi pencapaian.'}
                        </p>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}