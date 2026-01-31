import { useState, useEffect, useMemo, useCallback } from 'react';
import { Prospect, Status } from './types';
import Layout, { Page } from './components/Layout';
import KanbanBoard from './components/KanbanBoard';
import ProspectForm from './components/ProspectForm';
import Dashboard from './pages/Dashboard';
import Assistant from './pages/Assistant';
import {
  isAirtableConfigured,
  fetchProspectsFromAirtable,
  createProspectInAirtable,
  updateProspectInAirtable,
  deleteProspectInAirtable,
} from './lib/airtable';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const useAirtable = isAirtableConfigured();

  const refetchProspects = useCallback(() => {
    if (!useAirtable) return;
    setRefreshing(true);
    setError(null);
    fetchProspectsFromAirtable()
      .then(data => {
        setProspects(data.map(p => ({ ...p, heureRdv: p.heureRdv ?? null })));
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Erreur Airtable');
      })
      .finally(() => {
        setRefreshing(false);
      });
  }, [useAirtable]);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setLoading(true);

    if (useAirtable) {
      fetchProspectsFromAirtable()
        .then(data => {
          if (!cancelled) {
            setProspects(data.map(p => ({ ...p, heureRdv: p.heureRdv ?? null })));
          }
        })
        .catch(err => {
          if (!cancelled) setError(err instanceof Error ? err.message : 'Erreur Airtable');
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else {
      const saved = localStorage.getItem('crm-prospects');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setProspects(parsed.map((p: Prospect) => ({ ...p, heureRdv: p.heureRdv ?? null })));
        } catch {
          setProspects([]);
        }
      }
      setLoading(false);
    }

    return () => { cancelled = true; };
  }, [useAirtable]);

  // Rafraîchissement automatique (Airtable) : toutes les 25 s quand l'onglet est visible
  useEffect(() => {
    if (!useAirtable) return;
    const intervalMs = 25 * 1000;
    const tick = () => {
      if (document.visibilityState === 'visible') refetchProspects();
    };
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [useAirtable, refetchProspects]);

  // Rafraîchir au retour sur l'onglet (Airtable)
  useEffect(() => {
    if (!useAirtable) return;
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refetchProspects();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [useAirtable, refetchProspects]);

  useEffect(() => {
    if (!useAirtable && !loading) {
      localStorage.setItem('crm-prospects', JSON.stringify(prospects));
    }
  }, [prospects, useAirtable, loading]);

  const addProspect = useCallback(
    async (prospect: Omit<Prospect, 'id'>) => {
      setError(null);
      if (useAirtable) {
        try {
          const created = await createProspectInAirtable(prospect);
          setProspects(prev => [...prev, { ...created, heureRdv: created.heureRdv ?? null }]);
          setShowForm(false);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Erreur création');
        }
      } else {
        const newProspect: Prospect = { ...prospect, id: Date.now().toString() };
        setProspects(prev => [...prev, newProspect]);
        setShowForm(false);
      }
    },
    [useAirtable]
  );

  const updateProspectStatus = useCallback(
    (id: string, newStatus: Status) => {
      setError(null);
      if (useAirtable) {
        updateProspectInAirtable(id, { status: newStatus })
          .then(() => {
            setProspects(prev =>
              prev.map(p => (p.id === id ? { ...p, status: newStatus } : p))
            );
          })
          .catch(err => setError(err instanceof Error ? err.message : 'Erreur mise à jour'));
      } else {
        setProspects(prev =>
          prev.map(p => (p.id === id ? { ...p, status: newStatus } : p))
        );
      }
    },
    [useAirtable]
  );

  const updateProspect = useCallback(
    (id: string, updates: Partial<Prospect>) => {
      setError(null);
      if (useAirtable) {
        updateProspectInAirtable(id, updates)
          .then(() => {
            setProspects(prev =>
              prev.map(p => (p.id === id ? { ...p, ...updates } : p))
            );
          })
          .catch(err => setError(err instanceof Error ? err.message : 'Erreur mise à jour'));
      } else {
        setProspects(prev =>
          prev.map(p => (p.id === id ? { ...p, ...updates } : p))
        );
      }
    },
    [useAirtable]
  );

  const deleteProspect = useCallback(
    (id: string) => {
      setError(null);
      if (useAirtable) {
        deleteProspectInAirtable(id)
          .then(() => setProspects(prev => prev.filter(p => p.id !== id)))
          .catch(err => setError(err instanceof Error ? err.message : 'Erreur suppression'));
      } else {
        setProspects(prev => prev.filter(p => p.id !== id));
      }
    },
    [useAirtable]
  );

  const filteredProspects = useMemo(() => {
    if (!search.trim()) return prospects;
    const q = search.toLowerCase().trim();
    return prospects.filter(
      p =>
        p.nomPrenom.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.telephone.includes(q) ||
        p.ville.toLowerCase().includes(q) ||
        p.typeProjet.toLowerCase().includes(q)
    );
  }, [prospects, search]);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner" />
        <p>Chargement des prospects…</p>
      </div>
    );
  }

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {error && (
        <div className="app-error" role="alert">
          {error}
          <button type="button" onClick={() => setError(null)} aria-label="Fermer">
            ×
          </button>
        </div>
      )}

      {currentPage === 'dashboard' && <Dashboard prospects={prospects} />}

      {currentPage === 'crm' && (
        <div className="crm-page">
          <header className="app-header">
            <div className="app-header-left">
              <div className="app-header-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <h1>CRM Prospects</h1>
                <p className="app-header-subtitle">{prospects.length} prospect{prospects.length !== 1 ? 's' : ''} au total</p>
              </div>
            </div>
            <div className="app-header-right">
              <div className="search-box">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {useAirtable && (
                <button
                  type="button"
                  className="btn-refresh"
                  onClick={refetchProspects}
                  disabled={refreshing}
                  title="Rafraîchir la liste"
                >
                  <svg className={refreshing ? 'spin' : ''} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                  <span>{refreshing ? 'Actualisation…' : 'Rafraîchir'}</span>
                </button>
              )}
              <button
                className="btn-add"
                onClick={() => setShowForm(!showForm)}
              >
                <span className="btn-add-icon">+</span>
                Nouveau prospect
              </button>
            </div>
          </header>

          {showForm && (
            <ProspectForm
              onSubmit={addProspect}
              onCancel={() => setShowForm(false)}
            />
          )}

          <KanbanBoard
            prospects={filteredProspects}
            onStatusChange={updateProspectStatus}
            onUpdate={updateProspect}
            onDelete={deleteProspect}
          />
        </div>
      )}

      {currentPage === 'assistant' && <Assistant />}
    </Layout>
  );
}

export default App;
