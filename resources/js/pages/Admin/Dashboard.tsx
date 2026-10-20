import { Head, Link } from '@inertiajs/react';
import {
  ArrowRight,
  ArrowUpRight,
  CircleDot,
  FileText,
  Layers3,
  PanelTop,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import AdminLayout from '../../layouts/admin-layout';

const shortcuts = [
  {
    title: 'Informasi Pribadi',
    description: 'Perbarui nama, email, WhatsApp, dan foto profil.',
    href: '/admin/profile',
    icon: UserRound,
    label: 'Kelola profil',
  },
  {
    title: 'Hero Section',
    description: 'Atur headline dan pengantar halaman utama.',
    href: '/admin/hero',
    icon: PanelTop,
    label: 'Edit Hero',
  },
  {
    title: 'Tentang Saya',
    description: 'Tulis cerita dan profil yang tampil di website.',
    href: '/admin/about',
    icon: FileText,
    label: 'Edit About',
  },
];

export default function Dashboard() {
  return (
    <AdminLayout
      title="Dashboard"
      description="Ruang kerja untuk mengelola portofolio dengan rapi dan nyaman."
    >
      <Head title="Dashboard · Portofolio Admin" />

      <section className="pa-dashboard-hero" aria-labelledby="dashboard-hero-heading">
        <div className="pa-dashboard-hero__content">
          <span className="pa-dashboard-hero__kicker"><Sparkles size={15} /> YOUR CREATIVE WORKSPACE</span>
          <h2 id="dashboard-hero-heading">Karya terbaik dimulai dari <em>ruang kerja</em> yang teratur.</h2>
          <p>Kelola cerita, identitas, dan karya yang ingin kamu tampilkan. Fokus pada konten, biarkan pengalaman visual bekerja untukmu.</p>
          <div className="pa-dashboard-hero__actions">
            <Link href="/admin/profile" className="pa-button pa-button--primary">
              Mulai kelola konten <ArrowRight size={18} />
            </Link>
            <a href="/" target="_blank" rel="noopener noreferrer" className="pa-button pa-button--outline">
              Preview website <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
        <div className="pa-dashboard-hero__art" aria-hidden="true">
          <div className="pa-art__orbit pa-art__orbit--one" />
          <div className="pa-art__orbit pa-art__orbit--two" />
          <div className="pa-art__center">P<span>.</span></div>
          <div className="pa-art__floating pa-art__floating--top">CRAFTED WITH CARE</div>
          <div className="pa-art__floating pa-art__floating--bottom">EST. PORTOFOLIO V2</div>
        </div>
      </section>

      <div className="pa-section-heading">
        <div>
          <span className="pa-section-heading__eyebrow">QUICK ACCESS</span>
          <h2>Kelola konten utama</h2>
          <p>Mulai dari tiga modul dasar yang sudah kita siapkan.</p>
        </div>
      </div>

      <section className="pa-shortcuts" aria-label="Akses cepat admin">
        {shortcuts.map(({ title, description, href, icon: Icon, label }) => (
          <Link className="pa-shortcut" href={href} key={href}>
            <span className="pa-shortcut__icon"><Icon size={23} strokeWidth={1.7} /></span>
            <span className="pa-shortcut__body">
              <strong>{title}</strong>
              <span>{description}</span>
            </span>
            <span className="pa-shortcut__footer">
              {label} <ArrowUpRight size={17} />
            </span>
          </Link>
        ))}
      </section>

      <div className="pa-dashboard-bottom">
        <section className="pa-panel">
          <div className="pa-panel__header">
            <div>
              <span className="pa-section-heading__eyebrow">WORKSPACE NOTES</span>
              <h2>Alur pengembangan</h2>
            </div>
            <Layers3 size={20} aria-hidden="true" />
          </div>
          <div className="pa-steps">
            <div className="pa-step">
              <span className="pa-step__number">01</span>
              <div><strong>Fondasi admin</strong><p>Layout, navigasi, dan pengalaman mengelola konten.</p></div>
              <CircleDot size={17} className="pa-step__status" aria-hidden="true" />
            </div>
            <div className="pa-step">
              <span className="pa-step__number">02</span>
              <div><strong>Manajemen konten</strong><p>Lengkapi CRUD, upload, dan relasi antar data.</p></div>
              <CircleDot size={17} className="pa-step__status" aria-hidden="true" />
            </div>
            <div className="pa-step">
              <span className="pa-step__number">03</span>
              <div><strong>Pengalaman publik</strong><p>Tampilkan data pada portofolio dengan animasi premium.</p></div>
              <CircleDot size={17} className="pa-step__status" aria-hidden="true" />
            </div>
          </div>
          <p className="pa-panel__footnote">Ini merupakan urutan pengerjaan, bukan indikator bahwa fitur sudah selesai.</p>
        </section>

        <section className="pa-panel pa-panel--note">
          <span className="pa-note__icon"><ShieldCheck size={24} /></span>
          <span className="pa-section-heading__eyebrow">CONTENT CONTROL</span>
          <h2>Satu tempat untuk seluruh karya.</h2>
          <p>Panel ini dirancang khusus untuk satu administrator. Seluruh konten yang valid akan langsung tersedia di website setelah disimpan.</p>
          <div className="pa-note__divider" />
          <div className="pa-note__detail">
            <span><span className="pa-note__dot" /> Tanpa registrasi publik</span>
            <span><span className="pa-note__dot" /> Konten dikelola lewat Laravel</span>
            <span><span className="pa-note__dot" /> Desain responsif</span>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
