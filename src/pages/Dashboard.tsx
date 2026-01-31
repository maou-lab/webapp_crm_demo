import { useMemo } from 'react';
import { Prospect, Status, STATUS_LABELS, STATUS_COLORS } from '../types';
import './Dashboard.css';

interface DashboardProps {
  prospects: Prospect[];
}

export default function Dashboard({ prospects }: DashboardProps) {
  const stats = useMemo(() => {
    const byStatus: Record<Status, number> = {
      'nouveaux-lead': 0,
      'relance-1': 0,
      'relance-3': 0,
      'rappel-prevoir': 0,
      'rdv-planifie': 0,
      'vendu': 0,
      'pas-interesse': 0,
      'demande-cloture': 0,
    };
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    let nouveauxCeMois = 0;
    let vendusCeMois = 0;

    prospects.forEach(p => {
      byStatus[p.status]++;
      if (p.dateEntree >= firstDayOfMonth) nouveauxCeMois++;
      if (p.status === 'vendu' && p.dateEntree) {
        const entryDate = p.dateEntree;
        if (entryDate >= firstDayOfMonth) vendusCeMois++;
      }
    });

    return { byStatus, nouveauxCeMois, vendusCeMois };
  }, [prospects]);

  const rdvPlanifies = prospects.filter(p => p.status === 'rdv-planifie').length;
  const rappelsAPrevoir = prospects.filter(p => p.status === 'rappel-prevoir').length;

  const rappelsAvenir = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return prospects
      .filter(p => p.dateRappel && p.dateRappel >= today)
      .sort((a, b) => (a.dateRappel || '').localeCompare(b.dateRappel || ''));
  }, [prospects]);

  const rdvQualifies = useMemo(() => {
    return prospects
      .filter(p => p.status === 'rdv-planifie' && p.dateRdv)
      .sort((a, b) => (a.dateRdv || '').localeCompare(b.dateRdv || ''));
  }, [prospects]);

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (time: string | null) => {
    if (!time) return '';
    const [h, m] = time.split(':');
    return `${h}h${m || '00'}`;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">Vue d'ensemble de votre activité commerciale</p>
      </div>

      <div className="dashboard-cards">
        <div className="stat-card stat-card-primary">
          <div className="stat-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="stat-card-content">
            <span className="stat-card-value">{prospects.length}</span>
            <span className="stat-card-label">Prospects au total</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon stat-card-icon-green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0-7.75" />
            </svg>
          </div>
          <div className="stat-card-content">
            <span className="stat-card-value">{stats.nouveauxCeMois}</span>
            <span className="stat-card-label">Nouveaux ce mois</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon stat-card-icon-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="stat-card-content">
            <span className="stat-card-value">{stats.byStatus['vendu']}</span>
            <span className="stat-card-label">Vendus</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon stat-card-icon-purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="stat-card-content">
            <span className="stat-card-value">{rdvPlanifies}</span>
            <span className="stat-card-label">RDV planifiés</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon stat-card-icon-orange">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="stat-card-content">
            <span className="stat-card-value">{rappelsAPrevoir}</span>
            <span className="stat-card-label">Rappels à prévoir</span>
          </div>
        </div>
      </div>

      <div className="dashboard-section-row">
        <div className="dashboard-section dashboard-section-half">
          <h2>Rappels à venir</h2>
          <div className="dashboard-list">
            {rappelsAvenir.length === 0 ? (
              <p className="dashboard-list-empty">Aucun rappel à venir</p>
            ) : (
              rappelsAvenir.map(p => (
                <div key={p.id} className="dashboard-list-item">
                  <div className="dashboard-list-item-main">
                    <span className="dashboard-list-item-name">{p.nomPrenom}</span>
                    <span className="dashboard-list-item-date">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {formatDate(p.dateRappel)}
                    </span>
                  </div>
                  <span className="dashboard-list-item-detail">{p.telephone}</span>
                  <span className="dashboard-list-item-badge">{p.typeProjet}</span>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="dashboard-section dashboard-section-half">
          <h2>RDV qualifiés</h2>
          <div className="dashboard-list">
            {rdvQualifies.length === 0 ? (
              <p className="dashboard-list-empty">Aucun RDV qualifié</p>
            ) : (
              rdvQualifies.map(p => (
                <div key={p.id} className="dashboard-list-item">
                  <div className="dashboard-list-item-main">
                    <span className="dashboard-list-item-name">{p.nomPrenom}</span>
                    <span className="dashboard-list-item-date">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {formatDate(p.dateRdv)}
                      {p.heureRdv ? ` à ${formatTime(p.heureRdv)}` : ''}
                    </span>
                  </div>
                  <span className="dashboard-list-item-detail">{p.ville}</span>
                  <span className="dashboard-list-item-badge">{p.typeProjet}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Prospects par statut</h2>
        <div className="dashboard-status-grid">
          {(Object.entries(STATUS_LABELS) as [Status, string][]).map(([status, label]) => (
            <div key={status} className="status-card" style={{ borderLeftColor: STATUS_COLORS[status] }}>
              <span className="status-card-dot" style={{ backgroundColor: STATUS_COLORS[status] }} />
              <div className="status-card-content">
                <span className="status-card-value">{stats.byStatus[status]}</span>
                <span className="status-card-label">{label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Répartition par type de projet</h2>
        <div className="dashboard-type-grid">
          {(['pergolas', 'menuiserie', 'veranda'] as const).map(type => {
            const count = prospects.filter(p => p.typeProjet === type).length;
            const pct = prospects.length ? Math.round((count / prospects.length) * 100) : 0;
            const label = type.charAt(0).toUpperCase() + type.slice(1);
            return (
              <div key={type} className="type-card">
                <span className="type-card-label">{label}</span>
                <span className="type-card-value">{count}</span>
                <div className="type-card-bar">
                  <div className="type-card-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="type-card-pct">{pct} %</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
