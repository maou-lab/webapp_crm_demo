import './Layout.css';

export type Page = 'dashboard' | 'crm' | 'assistant';

interface LayoutProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  children: React.ReactNode;
}

export default function Layout({ currentPage, onNavigate, children }: LayoutProps) {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <span className="sidebar-title">CRM Pro</span>
          <span className="sidebar-subtitle">Gestion commerciale</span>
        </div>
        <nav className="sidebar-nav">
          <button
            type="button"
            className={`sidebar-link ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => onNavigate('dashboard')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span>Dashboard</span>
          </button>
          <button
            type="button"
            className={`sidebar-link ${currentPage === 'crm' ? 'active' : ''}`}
            onClick={() => onNavigate('crm')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>CRM</span>
          </button>
          <button
            type="button"
            className={`sidebar-link ${currentPage === 'assistant' ? 'active' : ''}`}
            onClick={() => onNavigate('assistant')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            </svg>
            <span>Assistant</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          © 2025 CRM Pro
        </div>
      </aside>
      <div className="layout-main">
        <header className="top-header">
          <div className="top-header-tabs">
            <button
              type="button"
              className={`tab ${currentPage === 'dashboard' ? 'active' : ''}`}
              onClick={() => onNavigate('dashboard')}
            >
              Dashboard
            </button>
            <button type="button" className="tab">Preview</button>
            <button
              type="button"
              className={`tab tab-dropdown ${currentPage === 'crm' ? 'active' : ''}`}
              onClick={() => onNavigate('crm')}
            >
              CRM
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
          <div className="top-header-actions">
            <button type="button" className="header-icon-btn" title="Annuler">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M3 10h10a8 8 0 0 1 8 8v2M3 10l6 6M3 10l6-6" />
              </svg>
            </button>
            <button type="button" className="header-icon-btn" title="Rétablir">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M21 10h-10a8 8 0 0 0-8 8v2M21 10l-6 6M21 10l-6-6" />
              </svg>
            </button>
            <button type="button" className="header-icon-btn" title="Aperçu">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </button>
            <button type="button" className="header-icon-btn" title="Partager">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
            <button type="button" className="btn-publish">Publish</button>
          </div>
        </header>
        <div className="layout-content">
          {children}
        </div>
      </div>
    </div>
  );
}
