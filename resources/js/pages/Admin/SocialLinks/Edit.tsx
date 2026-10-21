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

import {
    SocialFields,
    SocialFlash,
} from './Shared';

import type {
    SocialLink,
    SocialLinkForm,
} from './types';

import '../../../../css/social-links-redesign.css';

type Props = {
    link: SocialLink;
};

export default function Edit({
    link,
}: Props) {
    const form = useForm<SocialLinkForm>({
        platform: link.platform,
        name: link.name,
        url: link.url,
        sort_order: link.sort_order,
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
            `/admin/social-links/${link.id}`,
            {
                preserveScroll: true,
            }
        );
    }

    return (
        <AdminLayout
            title="Edit Media Sosial"
            description={`Perbarui informasi ${link.platform}.`}
            actions={
                <Link
                    href={`/admin/social-links/${link.id}`}
                    className="pa-soc2-btn"
                >
                    <ArrowLeft size={16} />
                    Kembali ke Detail
                </Link>
            }
        >
            <Head
                title={`Edit ${link.platform} · Media Sosial`}
            />

            <SocialFlash
                message={flash?.success}
            />

            <section className="pa-soc2-card pa-soc2-edit-card">
                <div className="pa-soc2-card-header">
                    <div>
                        <h2>
                            Informasi Media Sosial
                        </h2>

                        <p>
                            Perbarui platform, nama tampilan,
                            atau alamat media sosial.
                        </p>
                    </div>
                </div>

                <form
                    className="pa-soc2-form pa-soc2-edit-form"
                    onSubmit={submit}
                >
                    <SocialFields
                        prefix="edit-social"
                        data={form.data}
                        errors={form.errors}
                        onChange={(patch) =>
                            form.setData({
                                ...form.data,
                                ...patch,
                            })
                        }
                    />

                    <div className="pa-soc2-form-actions">
                        <Link
                            href={`/admin/social-links/${link.id}`}
                            className="pa-soc2-btn"
                        >
                            Batal
                        </Link>

                        <button
                            type="submit"
                            className="pa-soc2-btn pa-soc2-btn--primary"
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