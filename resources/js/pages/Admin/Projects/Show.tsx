import {
    Head,
    Link,
    usePage,
} from '@inertiajs/react';

import {
    ArrowLeft,
    Images,
    Pencil,
} from 'lucide-react';

import { useState } from 'react';

import AdminLayout from '@/layouts/admin-layout';

import { ProjectFlash } from './Shared';

import type { Project } from './types';

import '../../../../css/projects-redesign.css';

type Props = {
    project: Project;
};

export default function Show({
    project,
}: Props) {
    const [selectedImage, setSelectedImage] =
        useState(0);

    const { flash } = usePage().props as {
        flash?: {
            success?: string | null;
            error?: string | null;
        };
    };

    const images = [...project.images].sort(
        (a, b) =>
            a.sort_order - b.sort_order ||
            a.id - b.id
    );

    const currentImage = images[selectedImage];

    const technologies = (
        project.technologies ?? ''
    )
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);

    return (
        <AdminLayout
            title="Detail Proyek"
            description="Informasi lengkap proyek dan galeri."
            actions={
                <div className="pa-prj2-page-actions">
                    <Link
                        href="/admin/projects"
                        className="pa-prj2-btn"
                    >
                        <ArrowLeft size={16} />
                        Kembali
                    </Link>

                    <Link
                        href={`/admin/projects/${project.id}/edit`}
                        className="pa-prj2-btn"
                    >
                        <Pencil size={16} />
                        Edit Proyek
                    </Link>
                </div>
            }
        >
            <Head
                title={`${project.title} · Portfolio Admin`}
            />

            <ProjectFlash
                success={flash?.success}
                error={flash?.error}
            />

            <section className="pa-prj2-card">
                <div className="pa-prj2-detail-header">
                    <span className="pa-prj2-category-badge">
                        {project.category.name}
                    </span>

                    <h2>{project.title}</h2>
                </div>

                <div className="pa-prj2-detail-content">
                    <div className="pa-prj2-section">
                        <h3>Deskripsi Proyek</h3>

                        <p className="pa-prj2-description">
                            {project.description}
                        </p>
                    </div>

                    <div className="pa-prj2-section">
                        <h3>Teknologi yang Digunakan</h3>

                        {technologies.length > 0 ? (
                            <div className="pa-prj2-tech-list">
                                {technologies.map(
                                    (technology, index) => (
                                        <span key={index}>
                                            {technology}
                                        </span>
                                    )
                                )}
                            </div>
                        ) : (
                            <p className="pa-prj2-muted">
                                Belum ada teknologi yang dicantumkan.
                            </p>
                        )}
                    </div>

                    <div className="pa-prj2-section">
                        <div className="pa-prj2-gallery-title">
                            <h3>
                                <Images size={18} />
                                Galeri Proyek
                            </h3>

                            <span className="pa-prj2-count">
                                {images.length} gambar
                            </span>
                        </div>

                        {currentImage && (
                            <div className="pa-prj2-gallery-stage">
                                <img
                                    src={currentImage.url}
                                    alt={`${project.title} - gambar ${selectedImage + 1}`}
                                />
                            </div>
                        )}

                        <div className="pa-prj2-detail-thumbs">
                            {images.map((image, index) => (
                                <button
                                    key={image.id}
                                    type="button"
                                    className={
                                        'pa-prj2-detail-thumb' +
                                        (selectedImage === index
                                            ? ' pa-prj2-detail-thumb--active'
                                            : '')
                                    }
                                    aria-label={`Tampilkan gambar ${index + 1}`}
                                    aria-pressed={
                                        selectedImage === index
                                    }
                                    onClick={() =>
                                        setSelectedImage(index)
                                    }
                                >
                                    <img
                                        src={image.url}
                                        alt={`Thumbnail ${index + 1}`}
                                    />

                                    {index === 0 && (
                                        <span>Cover</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}