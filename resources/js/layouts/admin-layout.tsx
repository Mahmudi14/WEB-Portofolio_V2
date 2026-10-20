import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import { AdminSidebar } from '../components/admin/admin-sidebar';
import { AdminTopbar } from '../components/admin/admin-topbar';
import '../../css/admin.css';

type AdminLayoutProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export default function AdminLayout({
  title,
  description,
  actions,
  children,
}: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobileMenu = useCallback(() => setMobileOpen(false), []);

  return (
    <div className={`porto-admin${collapsed ? ' porto-admin--collapsed' : ''}`}>
      <a href="#admin-main-content" className="pa-skip-link">Lewati navigasi</a>
      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed((value) => !value)}
        onCloseMobile={closeMobileMenu}
      />
      <div className="pa-app-body">
        <AdminTopbar title={title} onOpenMobileMenu={() => setMobileOpen(true)} />
        <main id="admin-main-content" className="pa-main" tabIndex={-1}>
          <div className="pa-page-header">
            <div>
              <div className="pa-eyebrow"><span /> ADMIN WORKSPACE</div>
              <h1>{title}</h1>
              {description && <p>{description}</p>}
            </div>
            {actions && <div className="pa-page-header__actions">{actions}</div>}
          </div>
          {children}
          <footer className="pa-footer">
            <span>© Portofolio · Content Studio</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
