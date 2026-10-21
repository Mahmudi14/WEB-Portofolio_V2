import { Head, Link, usePage } from "@inertiajs/react";

import { ArrowLeft, ExternalLink, Pencil } from "lucide-react";

import AdminLayout from "@/layouts/admin-layout";

import { SocialFlash, SocialIdentity } from "./Shared";

import type { SocialLink } from "./types";

import { validSocialUrl } from "./types";

import "../../../../css/social-links-redesign.css";

type Props = {
    link: SocialLink;
};

export default function Show({ link }: Props) {
    const { flash } = usePage().props as {
        flash?: {
            success?: string | null;
        };
    };

    return (
        <AdminLayout
            title="Detail Media Sosial"
            description="Informasi lengkap tautan media sosial."
            actions={
                <div className="pa-soc2-page-actions">
                    <Link href="/admin/social-links" className="pa-soc2-btn">
                        <ArrowLeft size={16} />
                        Kembali
                    </Link>

                    <Link
                        href={`/admin/social-links/${link.id}/edit`}
                        className="pa-soc2-btn"
                    >
                        <Pencil size={16} />
                        Edit Media Sosial
                    </Link>
                </div>
            }
        >
            <Head title={`${link.platform} · Media Sosial`} />

            <SocialFlash message={flash?.success} />

            <section className="pa-soc2-card">
                <div className="pa-soc2-detail-header">
                    <span className="pa-editor-kicker">
                        DETAIL MEDIA SOSIAL
                    </span>

                    <SocialIdentity link={link} />
                </div>

                <div className="pa-soc2-detail-content">
                    <div className="pa-soc2-info-grid">
                        <div>
                            <span>Platform</span>
                            <strong>{link.platform}</strong>
                        </div>

                        <div>
                            <span>Nama / Label</span>
                            <strong>{link.name}</strong>
                        </div>

                        <div>
                            <span>Urutan Tampil</span>
                            <strong>{link.sort_order}</strong>
                        </div>
                    </div>

                    <div className="pa-soc2-detail-link">
                        <h3>Alamat Media Sosial</h3>

                        <p>{link.url}</p>

                        {validSocialUrl(link.url) && (
                            <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="pa-soc2-btn pa-soc2-btn--primary"
                            >
                                <ExternalLink size={15} />
                                Kunjungi Media Sosial
                            </a>
                        )}
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
