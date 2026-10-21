import {
    Head,
    Link,
    usePage,
} from '@inertiajs/react';

import {
    ArrowLeft,
    CalendarDays,
    Pencil,
} from 'lucide-react';

import AdminLayout from '@/layouts/admin-layout';

import {
    ResearchFlash,
} from './Shared';

import type {
    Research,
} from './Shared';

import '../../../../css/researches-redesign.css';

type Props = {
    research: Research;
};

export default function Show({
    research,
}: Props) {
    const { flash } = usePage().props as {
        flash?: {
            success?: string | null;
        };
    };

    return (
        <AdminLayout
            title="Detail Penelitian"
            description="Informasi lengkap karya penelitian."
            actions={
                <div className="pa-res2-page-actions">
                    <Link
                        href="/admin/researches"
                        className="pa-res2-btn"
                    >
                        <ArrowLeft size={16} />
                        Kembali
                    </Link>

                    <Link
                        href={`/admin/researches/${research.id}/edit`}
                        className="pa-res2-btn"
                    >
                        <Pencil size={16} />
                        Edit Penelitian
                    </Link>
                </div>
            }
        >
            <Head
                title={`${research.title} · Penelitian`}
            />

            <ResearchFlash
                message={flash?.success}
            />

            <section className="pa-res2-card">
                <div className="pa-res2-detail-header">
                    <span className="pa-editor-kicker">
                        DETAIL PENELITIAN
                    </span>

                    <h2>{research.title}</h2>

                    <span className="pa-res2-year-badge">
                        <CalendarDays size={15} />
                        {research.year}
                    </span>
                </div>

                <div className="pa-res2-detail-content">
                    <div className="pa-res2-detail-info">
                        <div>
                            <span>Judul Penelitian</span>
                            <strong>
                                {research.title}
                            </strong>
                        </div>

                        <div>
                            <span>Tahun Penelitian</span>
                            <strong>
                                {research.year}
                            </strong>
                        </div>
                    </div>

                    <div className="pa-res2-detail-summary">
                        <h3>
                            Ringkasan Penelitian
                        </h3>

                        <p>
                            {research.summary}
                        </p>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}