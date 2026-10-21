import { Head, Link, usePage } from "@inertiajs/react";

import { ArrowLeft, GraduationCap, Pencil } from "lucide-react";

import AdminLayout from "@/layouts/admin-layout";

import { educationPeriod } from "./Shared";

import type { Education } from "./Shared";

import "../../../../css/educations-redesign.css";

type Props = {
    education: Education;
};

export default function Show({ education }: Props) {
    const { flash } = usePage().props as {
        flash?: {
            success?: string | null;
        };
    };

    return (
        <AdminLayout
            title="Detail Pendidikan"
            description="Informasi lengkap riwayat pendidikan."
            actions={
                <div className="pa-edu2-page-actions">
                    <Link href="/admin/educations" className="pa-edu2-btn">
                        <ArrowLeft size={16} />
                        Kembali
                    </Link>

                    <Link
                        href={`/admin/educations/${education.id}/edit`}
                        className="pa-edu2-btn"
                    >
                        <Pencil size={16} />
                        Edit Pendidikan
                    </Link>
                </div>
            }
        >
            <Head title={`${education.institution_name} · Pendidikan`} />

            {flash?.success && (
                <div className="pa-editor-success">{flash.success}</div>
            )}

            <section className="pa-edu2-card">
                <div className="pa-edu2-detail-header">
                    <div className="pa-edu2-detail-icon">
                        <GraduationCap size={25} />
                    </div>

                    <span className="pa-edu2-level">{education.level}</span>

                    <h2>{education.institution_name}</h2>

                    <p>{education.major || "Riwayat pendidikan"}</p>
                </div>

                <div className="pa-edu2-detail-content">
                    <div className="pa-edu2-info-grid">
                        <div>
                            <span>Jenjang Pendidikan</span>
                            <strong>{education.level}</strong>
                        </div>

                        <div>
                            <span>Institusi</span>
                            <strong>{education.institution_name}</strong>
                        </div>

                        <div>
                            <span>Jurusan / Program Studi</span>
                            <strong>{education.major || "—"}</strong>
                        </div>

                        <div>
                            <span>Tahun Mulai</span>
                            <strong>{education.start_year}</strong>
                        </div>

                        <div>
                            <span>Tahun Selesai</span>
                            <strong>
                                {education.is_current
                                    ? "Sekarang"
                                    : (education.end_year ?? "—")}
                            </strong>
                        </div>

                        <div>
                            <span>Periode Pendidikan</span>
                            <strong>{educationPeriod(education)}</strong>
                        </div>
                    </div>

                    <div className="pa-edu2-detail-status">
                        <strong>Status Pendidikan</strong>

                        <span>
                            {education.is_current
                                ? "Masih berlangsung"
                                : education.end_year
                                  ? "Selesai"
                                  : "Belum ditentukan"}
                        </span>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
