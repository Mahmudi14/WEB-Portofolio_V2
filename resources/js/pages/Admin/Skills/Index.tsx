import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';

type SkillItem = {
    id: number;
    skill_category_id: number;
    name: string;
    sort_order: number;
};

type SkillCategory = {
    id: number;
    name: string;
    description: string;
    sort_order: number;
    items: SkillItem[];
};

type Props = { categories: SkillCategory[] };
type CategoryForm = { name: string; description: string; sort_order: number };
type ItemForm = { name: string; sort_order: number };

const field = 'mt-1 block w-full rounded-lg border border-[#49413a] bg-[#292929] p-2.5 text-[#f6f2ee] focus:border-[#df6a27] focus:outline-none';
const primary = 'rounded-lg bg-[#df6a27] px-4 py-2 font-medium text-[#151515] disabled:opacity-50';
const secondary = 'rounded-lg border border-[#6b5649] px-3 py-2 text-sm';
const danger = 'rounded-lg border border-red-500/60 px-3 py-2 text-sm text-red-300';

function ErrorText({ text }: { text?: string }) {
    return text ? <p className="mt-1 text-sm text-red-400" role="alert">{text}</p> : null;
}

function CreateCategory() {
    const form = useForm<CategoryForm>({ name: '', description: '', sort_order: 0 });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/admin/skills', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    }

    return (
        <form onSubmit={submit} className="space-y-3 rounded-xl border border-[#49413a] bg-[#252525] p-5">
            <h2 className="text-lg font-semibold">Tambah Kategori</h2>
            <label className="block">Nama kategori
                <input className={field} required maxLength={120} value={form.data.name}
                    onChange={e => form.setData('name', e.target.value)} placeholder="Machine Learning" />
                <ErrorText text={form.errors.name} />
            </label>
            <label className="block">Deskripsi kategori
                <textarea className={field} required rows={3} value={form.data.description}
                    onChange={e => form.setData('description', e.target.value)} />
                <ErrorText text={form.errors.description} />
            </label>
            <label className="block">Urutan
                <input className={field} type="number" min={0} value={form.data.sort_order}
                    onChange={e => form.setData('sort_order', Number(e.target.value || 0))} />
                <ErrorText text={form.errors.sort_order} />
            </label>
            <button type="submit" className={primary} disabled={form.processing}>Tambah Kategori</button>
        </form>
    );
}

function CreateItem({ categoryId }: { categoryId: number }) {
    const form = useForm<ItemForm>({ name: '', sort_order: 0 });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post(`/admin/skills/${categoryId}/items`, {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    }

    return (
        <form onSubmit={submit} className="flex flex-wrap items-end gap-2 rounded-lg bg-[#292929] p-3">
            <label className="min-w-[180px] flex-1 text-sm">Sub-keahlian baru
                <input className={field} required maxLength={120} value={form.data.name}
                    onChange={e => form.setData('name', e.target.value)} placeholder="Laravel" />
                <ErrorText text={form.errors.name} />
            </label>
            <label className="w-24 text-sm">Urutan
                <input className={field} type="number" min={0} value={form.data.sort_order}
                    onChange={e => form.setData('sort_order', Number(e.target.value || 0))} />
                <ErrorText text={form.errors.sort_order} />
            </label>
            <button type="submit" className={primary} disabled={form.processing}>Tambah</button>
        </form>
    );
}

function ExistingItem({ categoryId, item }: { categoryId: number; item: SkillItem }) {
    const [editing, setEditing] = useState(false);
    const form = useForm<ItemForm>({ name: item.name, sort_order: item.sort_order });
    const itemUrl = `/admin/skills/${categoryId}/items/${item.id}`;

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.put(itemUrl, {
            preserveScroll: true,
            onSuccess: () => { form.defaults(); setEditing(false); },
        });
    }

    function destroy() {
        if (!window.confirm(`Hapus sub-keahlian "${item.name}"?`)) return;
        router.delete(itemUrl, { preserveScroll: true });
    }

    if (!editing) {
        return (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#413a34] p-3">
                <div><span className="font-medium">{item.name}</span>
                    <span className="ml-2 text-xs text-[#bbb4ad]">Urutan {item.sort_order}</span></div>
                <div className="flex gap-2">
                    <button type="button" className={secondary} onClick={() => setEditing(true)}>Edit</button>
                    <button type="button" className={danger} onClick={destroy}>Hapus</button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={submit} className="flex flex-wrap items-end gap-2 rounded-lg border border-[#df6a27] p-3">
            <label className="min-w-[160px] flex-1 text-sm">Nama sub-keahlian
                <input className={field} required maxLength={120} value={form.data.name}
                    onChange={e => form.setData('name', e.target.value)} />
                <ErrorText text={form.errors.name} />
            </label>
            <label className="w-24 text-sm">Urutan
                <input className={field} type="number" min={0} value={form.data.sort_order}
                    onChange={e => form.setData('sort_order', Number(e.target.value || 0))} />
                <ErrorText text={form.errors.sort_order} />
            </label>
            <button type="submit" className={primary} disabled={form.processing}>Simpan</button>
            <button type="button" className={secondary}
                onClick={() => { form.reset(); form.clearErrors(); setEditing(false); }}>Batal</button>
        </form>
    );
}

function CategoryBlock({ category }: { category: SkillCategory }) {
    const [editing, setEditing] = useState(false);
    const form = useForm<CategoryForm>({
        name: category.name,
        description: category.description,
        sort_order: category.sort_order,
    });
    const categoryUrl = `/admin/skills/${category.id}`;

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.put(categoryUrl, {
            preserveScroll: true,
            onSuccess: () => { form.defaults(); setEditing(false); },
        });
    }

    function destroy() {
        const msg = category.items.length > 0
            ? `Hapus kategori "${category.name}" BESERTA ${category.items.length} sub-keahlian di dalamnya?`
            : `Hapus kategori "${category.name}"?`;
        if (!window.confirm(msg)) return;
        router.delete(categoryUrl, { preserveScroll: true });
    }

    return (
        <section className="space-y-4 rounded-xl border border-[#49413a] bg-[#252525] p-5">
            {!editing ? (
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                        <h2 className="text-lg font-semibold">{category.name}</h2>
                        <p className="whitespace-pre-wrap text-sm text-[#bbb4ad]">{category.description}</p>
                        <p className="text-xs text-[#f2a06e]">Urutan {category.sort_order} · {category.items.length} sub-keahlian</p>
                    </div>
                    <div className="flex gap-2">
                        <button type="button" className={secondary} onClick={() => setEditing(true)}>Edit</button>
                        <button type="button" className={danger} onClick={destroy}>Hapus</button>
                    </div>
                </div>
            ) : (
                <form onSubmit={submit} className="space-y-3 rounded-lg border border-[#df6a27] p-3">
                    <h2 className="font-semibold">Edit Kategori</h2>
                    <label className="block">Nama kategori
                        <input className={field} required maxLength={120} value={form.data.name}
                            onChange={e => form.setData('name', e.target.value)} />
                        <ErrorText text={form.errors.name} />
                    </label>
                    <label className="block">Deskripsi
                        <textarea className={field} required rows={3} value={form.data.description}
                            onChange={e => form.setData('description', e.target.value)} />
                        <ErrorText text={form.errors.description} />
                    </label>
                    <label className="block">Urutan
                        <input className={field} type="number" min={0} value={form.data.sort_order}
                            onChange={e => form.setData('sort_order', Number(e.target.value || 0))} />
                        <ErrorText text={form.errors.sort_order} />
                    </label>
                    <div className="flex gap-2">
                        <button type="submit" className={primary} disabled={form.processing}>Simpan</button>
                        <button type="button" className={secondary}
                            onClick={() => { form.reset(); form.clearErrors(); setEditing(false); }}>Batal</button>
                    </div>
                </form>
            )}

            <div className="space-y-2 border-t border-[#49413a] pt-4">
                <h3 className="font-medium">Sub-keahlian</h3>
                {category.items.length === 0
                    ? <p className="text-sm text-[#bbb4ad]">Belum ada sub-keahlian.</p>
                    : category.items.map(item => <ExistingItem key={item.id} categoryId={category.id} item={item} />)}
                <CreateItem categoryId={category.id} />
            </div>
        </section>
    );
}

export default function Index({ categories }: Props) {
    const flash = (usePage().props as unknown as { flash?: { success?: string } }).flash;

    return (
        <main className="min-h-screen bg-[#1d1d1d] p-5 text-[#f6f2ee] md:p-8">
            <Head title="Admin — Keahlian & Minat" />
            <div className="mx-auto max-w-4xl space-y-6">
                <nav className="flex flex-wrap gap-1" aria-label="Menu admin">
                    <Link href="/admin/profile" className={secondary}>Profil</Link>
                    <Link href="/admin/social-links" className={secondary}>Media Sosial</Link>
                    <Link href="/admin/skills" className={secondary}>Keahlian</Link>
                </nav>
                <div>
                    <p className="text-sm font-medium text-[#df6a27]">ADMIN / KONTEN</p>
                    <h1 className="text-2xl font-semibold">Keahlian & Minat</h1>
                    <p className="mt-1 text-sm text-[#bbb4ad]">Kategori memiliki deskripsi; sub-keahlian cukup nama. Tanpa ikon.</p>
                </div>
                {flash?.success && <p className="rounded-lg border border-[#df6a27] p-3" role="status">{flash.success}</p>}
                <CreateCategory />
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Daftar Kategori ({categories.length})</h2>
                    {categories.length === 0
                        ? <p className="text-sm text-[#bbb4ad]">Belum ada kategori.</p>
                        : categories.map(category => <CategoryBlock key={category.id} category={category} />)}
                </div>
            </div>
        </main>
    );
}
