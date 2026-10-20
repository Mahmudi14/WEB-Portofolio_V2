import { Link, usePage } from '@inertiajs/react';
import {
  Award,
  BookOpenText,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  FileText,
  FlaskConical,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  Layers3,
  PanelTop,
  Share2,
  UserRound,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';

type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  enabled: boolean;
};

type NavigationGroup = {
  title: string;
  items: NavigationItem[];
};

// Aktifkan enabled setelah route dan halaman benar-benar tersedia.
const navigation: NavigationGroup[] = [
  {
    title: 'Utama',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, enabled: true },
    ],
  },
  {
    title: 'Konten Website',
    items: [
      { label: 'Informasi Pribadi', href: '/admin/profile', icon: UserRound, enabled: true },
      { label: 'Hero Section', href: '/admin/hero', icon: PanelTop, enabled: true },
      { label: 'Tentang Saya', href: '/admin/about', icon: FileText, enabled: true },
      { label: 'Media Sosial', href: '/admin/social-links', icon: Share2, enabled: false },
    ],
  },
  {
    title: 'Portofolio',
    items: [
      { label: 'Keahlian & Minat', href: '/admin/skills', icon: Layers3, enabled: false },
      { label: 'Pendidikan', href: '/admin/educations', icon: GraduationCap, enabled: false },
      { label: 'Pengalaman', href: '/admin/experiences', icon: BriefcaseBusiness, enabled: false },
      { label: 'Pencapaian', href: '/admin/achievements', icon: Award, enabled: false },
      { label: 'Proyek', href: '/admin/projects', icon: FolderKanban, enabled: false },
      { label: 'Penelitian', href: '/admin/researches', icon: FlaskConical, enabled: false },
    ],
  },
];

export type AdminSidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
};

export function AdminSidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: AdminSidebarProps) {
  const path = usePage().url.split('?')[0].replace(/\/$/, '') || '/';
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sidebarRef.current?.querySelector<HTMLElement>('button, a')?.focus();

    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseMobile();
        return;
      }

      if (event.key !== 'Tab') return;
      const focusables = sidebarRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeydown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeydown);
    };
  }, [mobileOpen, onCloseMobile]);

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="pa-sidebar-backdrop"
          aria-label="Tutup menu navigasi"
          onClick={onCloseMobile}
        />
      )}
      <aside
        ref={sidebarRef}
        id="porto-admin-sidebar"
        className={`pa-sidebar${collapsed ? ' pa-sidebar--collapsed' : ''}${mobileOpen ? ' pa-sidebar--mobile-open' : ''}`}
        aria-label="Navigasi admin"
      >
        <div className="pa-sidebar__brand">
          <Link href="/admin" className="pa-brand" onClick={onCloseMobile} aria-label="Portofolio Admin, kembali ke Dashboard">
            <span className="pa-brand__mark" aria-hidden="true">P<span>.</span></span>
            <span className="pa-brand__name">
              <strong>PORTOFOLIO</strong>
              <small>CONTENT STUDIO</small>
            </span>
          </Link>
          <button type="button" className="pa-icon-button pa-sidebar__mobile-close" onClick={onCloseMobile} aria-label="Tutup menu">
            <X size={19} />
          </button>
        </div>

        <div className="pa-sidebar__scroll">
          {navigation.map((group) => (
            <section className="pa-sidebar__group" key={group.title} aria-label={group.title}>
              <div className="pa-sidebar__section-label">{group.title}</div>
              <div className="pa-sidebar__items">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = item.href === '/admin'
                    ? path === '/admin'
                    : path === item.href || path.startsWith(`${item.href}/`);

                  if (!item.enabled) {
                    return (
                      <div key={item.href} className="pa-sidebar__link pa-sidebar__link--disabled" title={`${item.label} — belum diaktifkan`} aria-disabled="true">
                        <Icon size={19} aria-hidden="true" />
                        <span className="pa-sidebar__link-text">{item.label}</span>
                        <span className="pa-sidebar__soon">Nanti</span>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={`pa-sidebar__link${active ? ' pa-sidebar__link--active' : ''}`}
                      aria-current={active ? 'page' : undefined}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon size={19} aria-hidden="true" />
                      <span className="pa-sidebar__link-text">{item.label}</span>
                      {active && <span className="pa-sidebar__active-dot" aria-hidden="true" />}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="pa-sidebar__bottom">
          <div className="pa-sidebar__hint">
            <BookOpenText size={17} aria-hidden="true" />
            <span>Kelola konten dengan nyaman.</span>
          </div>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="pa-sidebar__collapse"
            aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
            aria-expanded={!collapsed}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            <span>Ciutkan sidebar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
