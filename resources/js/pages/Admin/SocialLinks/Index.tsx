import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';

type SocialLink = {
    id: number;
    platform: string;
    name: string;
    url: string;
    sort_order: number;
};

type LinkFormData = {
    platform: string;
    name: string;
    url: string;
    sort_order: number;
};

type Props = { links: SocialLink[] };

const inputStyle = 'w-full rounded-lg border border-[#49413a] bg-[#292929] p-2.5 text-[#f6f2ee] focus:border-[#df6a27] focus:outline-none';
const buttonStyle = 'rounded-lg bg-[#df6a27] px-4 py-2 font-medium text-[#151515] disabled:opacity-50';
const linkClass = 'rounded-lg px-3 py-2 text-sm text-[#f6f2ee] hover:bg-[#353535]';

function ErrorText({ text }: { text?: string }) {
    return text ? <p className="mt-1 text-sm text-red-400" role="alert">{text}</p> : null;
}

function CreateLink() {
    const form = useForm<LinkFormData>({
        platform: '', name: '', url: '', sort_order: 0,
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/admin/social-links', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    }

    return (
        <form onSubmit={submit} className="space-y-3 rounded-xl border border-[#49413a] bg-[#252525] p-5">
            <h2 className="text-lg font-semibold">Tambah Media Sosial</h2>
            <div>
                <label htmlFor="create-platform">Platform</label>
                <input id="create-platform" className={inputStyle} required maxLength={100}
                    value={form.data.platform} onChange={e => form.setData('platform', e.target.value)}
                    placeholder="GitHub" />
                <ErrorText text={form.errors.platform} />
            </div>
            <div>
                <label htmlFor="create-name">Nama / Label</label>
                <input id="create-name" className={inputStyle} required maxLength={100}
                    value={form.data.name} onChange={e => form.setData('name', e.target.value)}
                    placeholder="Profil GitHub" />
                <ErrorText text={form.errors.name} />
            </div>
            <div>
                <label htmlFor="create-url">URL HTTPS</label>
                <input id="create-url" type="url" className={inputStyle} required
                    value={form.data.url} onChange={e => form.setData('url', e.target.value)}
                    placeholder="https://github.com/username" />
                <ErrorText text={form.errors.url} />
            </div>
            <div>
                <label htmlFor="create-sort">Urutan tampil</label>
                <input id="create-sort" type="number" min={0} className={inputStyle}
                    value={form.data.sort_order}
                    onChange={e => form.setData('sort_order', Number(e.target.value || 0))} />
                <ErrorText text={form.errors.sort_order} />
            </div>
            <button className={buttonStyle} type="submit" disabled={form.processing}>
                {form.processing ? 'Menyimpan...' : 'Tambah Tautan'}
            </button>
        </form>
    );
}

function ExistingLink({ link }: { link: SocialLink }) {
    const [editing, setEditing] = useState(false);
    const form = useForm<LinkFormData>({
        platform: link.platform,
        name: link.name,
        url: link.url,
        sort_order: link.sort_order,
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.put(`/admin/social-links/${link.id}`, {
            preserveScroll: true,
            onSuccess: () => { form.defaults(); setEditing(false); },
        });
    }

    function destroy() {
        if (!window.confirm(`Hapus tautan ${link.platform} — ${link.name}?`)) return;
        router.delete(`/admin/social-links/${link.id}`, { preserveScroll: true });
    }

    return (
        <section className="rounded-xl border border-[#49413a] bg-[#252525] p-4">
            {!editing ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                        <div className="font-medium">{link.platform} — {link.name}</div>
                        <a className="block break-all text-sm text-[#f2a06e] hover:underline"
                            href={link.url} target="_blank" rel="noopener noreferrer">
                            {link.url}
                        </a>
                        <div className="text-xs text-[#bbb4ad]">Urutan: {link.sort_order}</div>
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setEditing(true)}
                            className="rounded-lg border border-[#6b5649] px-3 py-2 text-sm">Edit</button>
                        <button type="button" onClick={destroy}
                            className="rounded-lg border border-red-500/60 px-3 py-2 text-sm text-red-300">Hapus</button>
                    </div>
                </div>
            ) : (
                <form onSubmit={submit} className="space-y-3">
                    <h3 className="font-semibold">Edit Media Sosial</h3>
                    <label className="block">Platform
                        <input className={inputStyle} required maxLength={100}
                            value={form.data.platform} onChange={e => form.setData('platform', e.target.value)} />
                        <ErrorText text={form.errors.platform} />
                    </label>
                    <label className="block">Nama / Label
                        <input className={inputStyle} required maxLength={100}
                            value={form.data.name} onChange={e => form.setData('name', e.target.value)} />
                        <ErrorText text={form.errors.name} />
                    </label>
                    <label className="block">URL HTTPS
                        <input className={inputStyle} type="url" required
                            value={form.data.url} onChange={e => form.setData('url', e.target.value)} />
                        <ErrorText text={form.errors.url} />
                    </label>
                    <label className="block">Urutan
                        <input className={inputStyle} type="number" min={0}
                            value={form.data.sort_order}
                            onChange={e => form.setData('sort_order', Number(e.target.value || 0))} />
                        <ErrorText text={form.errors.sort_order} />
                    </label>
                    <div className="flex gap-2">
                        <button className={buttonStyle} type="submit" disabled={form.processing}>Simpan</button>
                        <button className="rounded-lg border border-[#6b5649] px-4 py-2" type="button"
                            onClick={() => { form.reset(); form.clearErrors(); setEditing(false); }}>Batal</button>
                    </div>
                </form>
            )}
        </section>
    );
}

export default function Index({ links }: Props) {
    const flash = (usePage().props as unknown as { flash?: { success?: string } }).flash;

    return (
        <main className="min-h-screen bg-[#1d1d1d] p-5 text-[#f6f2ee] md:p-8">
            <Head title="Admin — Media Sosial" />
            <div className="mx-auto max-w-4xl space-y-6">
                <nav className="flex flex-wrap gap-1" aria-label="Menu admin">
                    <Link href="/admin/profile" className={linkClass}>Profil</Link>
                    <Link href="/admin/social-links" className={linkClass}>Media Sosial</Link>
                    <Link href="/admin/skills" className={linkClass}>Keahlian</Link>
                </nav>
                <div>
                    <p className="text-sm font-medium text-[#df6a27]">ADMIN / KONTAK</p>
                    <h1 className="text-2xl font-semibold">Media Sosial</h1>
                    <p className="mt-1 text-sm text-[#bbb4ad]">Tambahkan platform dan URL yang tampil di website publik.</p>
                </div>
                {flash?.success && <p className="rounded-lg border border-[#df6a27] p-3" role="status">{flash.success}</p>}
                <CreateLink />
                <div className="space-y-3">
                    <h2 className="text-lg font-semibold">Daftar Tautan ({links.length})</h2>
                    {links.length === 0
                        ? <p className="text-sm text-[#bbb4ad]">Belum ada media sosial.</p>
                        : links.map(link => <ExistingLink key={link.id} link={link} />)}
                </div>
            </div>
        </main>
    );
}
