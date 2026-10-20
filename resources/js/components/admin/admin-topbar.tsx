import { Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, LogOut, Menu } from 'lucide-react';

type AuthUser = { name?: string; email?: string };
type AdminSharedProps = { auth?: { user?: AuthUser | null } };

export type AdminTopbarProps = {
  title: string;
  onOpenMobileMenu: () => void;
};

export function AdminTopbar({ title, onOpenMobileMenu }: AdminTopbarProps) {
  const { auth } = usePage().props as AdminSharedProps;
  const name = auth?.user?.name || 'Administrator';
  const initial = name.trim().charAt(0).toUpperCase() || 'A';

  return (
    <header className="pa-topbar">
      <div className="pa-topbar__left">
        <button
          type="button"
          className="pa-icon-button pa-topbar__menu"
          aria-label="Buka menu navigasi"
          aria-controls="porto-admin-sidebar"
          onClick={onOpenMobileMenu}
        >
          <Menu size={21} />
        </button>
        <div className="pa-topbar__breadcrumb" aria-label="Breadcrumb">
          <span>Workspace</span>
          <span className="pa-topbar__slash" aria-hidden="true">/</span>
          <strong aria-current="page">{title}</strong>
        </div>
      </div>
      <div className="pa-topbar__right">
        <a className="pa-topbar__preview" href="/" target="_blank" rel="noopener noreferrer">
          Lihat website <ArrowUpRight size={16} aria-hidden="true" />
        </a>
        <span className="pa-topbar__separator" aria-hidden="true" />
        <div className="pa-topbar__account" title={auth?.user?.email ?? 'Akun administrator'}>
          <span className="pa-topbar__avatar" aria-hidden="true">{initial}</span>
          <span className="pa-topbar__account-name">{name}</span>
        </div>
        <Link
          as="button"
          method="post"
          href="/logout"
          className="pa-icon-button pa-topbar__logout"
          title="Keluar"
          aria-label="Logout dari admin"
        >
          <LogOut size={18} />
        </Link>
      </div>
    </header>
  );
}
