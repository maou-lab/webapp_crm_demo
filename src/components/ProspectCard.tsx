import { useState } from 'react';
import { Prospect, Status, STATUS_LABELS, TypeProjet } from '../types';
import './ProspectCard.css';

const RDV_WEBHOOK_URL =
  import.meta.env.VITE_RDV_WEBHOOK_URL ||
  'https://n8n.srv1081533.hstgr.cloud/webhook/4eda6a0d-3e2c-4d5d-938a-a24fc7d35052';

async function callRdvWebhook(prospect: Prospect, dateRdv: string, heureRdv: string | null) {
  const payload = {
    prospectId: prospect.id,
    nomPrenom: prospect.nomPrenom,
    telephone: prospect.telephone,
    email: prospect.email,
    ville: prospect.ville,
    typeProjet: prospect.typeProjet,
    dateRdv,
    heureRdv: heureRdv || null,
  };
  await fetch(RDV_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

interface ProspectCardProps {
  prospect: Prospect;
  onStatusChange: (id: string, newStatus: Status) => void;
  onUpdate: (id: string, updates: Partial<Prospect>) => void;
  onDelete: (id: string) => void;
}

const TYPE_PROJET_STYLES: Record<TypeProjet, string> = {
  pergolas: 'pill pergolas',
  menuiserie: 'pill menuiserie',
  veranda: 'pill veranda',
};

function formatTime(time: string | null) {
  if (!time) return '';
  const [h, m] = time.split(':');
  return `${h}h${m}`;
}

export default function ProspectCard({
  prospect,
  onStatusChange,
  onUpdate,
  onDelete,
}: ProspectCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showRdvPopup, setShowRdvPopup] = useState(false);
  const [rdvDate, setRdvDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [rdvTime, setRdvTime] = useState('10:00');
  const [rdvSending, setRdvSending] = useState(false);

  const formatDate = (date: string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleAction = (action: Status | 'pas-repondu' | 'rappel' | 'rdv-planifie' | 'vendu' | 'pas-interesse') => {
    const today = new Date().toISOString().split('T')[0];
    switch (action) {
      case 'pas-repondu': {
        const nextStatus: Status =
          prospect.status === 'relance-1'
            ? 'relance-3'
            : prospect.status === 'relance-3'
              ? 'demande-cloture'
              : 'relance-1';
        onStatusChange(prospect.id, nextStatus);
        break;
      }
      case 'rappel':
        onUpdate(prospect.id, { dateRappel: today, status: 'rappel-prevoir' });
        break;
      case 'rdv-planifie':
        setRdvDate(new Date().toISOString().split('T')[0]);
        setRdvTime('10:00');
        setShowRdvPopup(true);
        break;
      case 'vendu':
        onStatusChange(prospect.id, 'vendu');
        break;
      case 'pas-interesse':
        onStatusChange(prospect.id, 'pas-interesse');
        break;
      default:
        if (action in STATUS_LABELS) onStatusChange(prospect.id, action as Status);
    }
  };

  const handleFieldChange = (field: 'dateRappel' | 'dateRdv' | 'heureRdv', value: string) => {
    onUpdate(prospect.id, { [field]: value || null });
  };

  const confirmRdv = async () => {
    if (!rdvDate) return;
    setRdvSending(true);
    try {
      onUpdate(prospect.id, {
        dateRdv: rdvDate,
        heureRdv: rdvTime || null,
        status: 'rdv-planifie',
      });
      await callRdvWebhook(prospect, rdvDate, rdvTime || null);
      setShowRdvPopup(false);
    } catch {
      // webhook error: prospect is still updated locally
      setShowRdvPopup(false);
    } finally {
      setRdvSending(false);
    }
  };

  const heureRdv = prospect.heureRdv ?? null;
  const dateRdvStr = prospect.dateRdv ? formatDate(prospect.dateRdv) : '';
  const rdvDisplay = dateRdvStr && (heureRdv ? `${dateRdvStr} à ${formatTime(heureRdv)}` : dateRdvStr);

  return (
    <>
    <div className="prospect-card">
      <div className="card-header">
        <h3>{prospect.nomPrenom}</h3>
        <div className="card-header-actions">
          <button type="button" className="btn-icon" onClick={() => setIsEditing(!isEditing)} title="Modifier">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button type="button" className="btn-icon btn-icon-danger" onClick={() => onDelete(prospect.id)} title="Supprimer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </div>
      </div>

      <div className="card-tag">
        <span className={TYPE_PROJET_STYLES[prospect.typeProjet]}>{prospect.typeProjet}</span>
      </div>

      <div className="card-content">
        <div className="info-row">
          <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <span>{prospect.telephone}</span>
        </div>
        <div className="info-row">
          <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <span>{prospect.email}</span>
        </div>
        <div className="info-row">
          <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>{prospect.ville}</span>
        </div>
        <div className="info-row">
          <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>Entrée : {formatDate(prospect.dateEntree)}</span>
        </div>
        {isEditing ? (
          <>
            <div className="info-row">
              <svg className="info-icon info-icon-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <input
                type="date"
                value={prospect.dateRappel || ''}
                onChange={(e) => handleFieldChange('dateRappel', e.target.value)}
                className="date-input"
              />
            </div>
            <div className="info-row">
              <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <div className="date-time-inputs">
                <input
                  type="date"
                  value={prospect.dateRdv || ''}
                  onChange={(e) => handleFieldChange('dateRdv', e.target.value)}
                  className="date-input"
                />
                <input
                  type="time"
                  value={heureRdv || ''}
                  onChange={(e) => handleFieldChange('heureRdv', e.target.value)}
                  className="time-input"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            {prospect.dateRappel && (
              <div className="info-row info-row-rappel">
                <svg className="info-icon info-icon-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="rappel-text">Rappel : {formatDate(prospect.dateRappel)}</span>
              </div>
            )}
            {prospect.dateRdv && (
              <div className="info-row">
                <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>RDV : {rdvDisplay}</span>
              </div>
            )}
          </>
        )}
      </div>

      <div className="card-footer-actions">
        <button type="button" className="btn-card btn-pas-repondu" onClick={() => handleAction('pas-repondu')} title="Pas répondu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <line x1="8" y1="11" x2="16" y2="11" strokeDasharray="2 2" />
          </svg>
          <span>Pas répondu</span>
        </button>
        <button type="button" className="btn-card btn-rappel" onClick={() => handleAction('rappel')} title="Rappel">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>Rappel</span>
        </button>
        <button type="button" className="btn-card btn-rdv" onClick={() => handleAction('rdv-planifie')} title="RDV planifié">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>RDV</span>
        </button>
        <button type="button" className="btn-card btn-vendu" onClick={() => handleAction('vendu')} title="Vendu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Vendu</span>
        </button>
        <button type="button" className="btn-card btn-pas-interesse" onClick={() => handleAction('pas-interesse')} title="Pas intéressé">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span>Pas intéressé</span>
        </button>
      </div>
    </div>

    {showRdvPopup && (
      <div className="rdv-popup-overlay" onClick={() => !rdvSending && setShowRdvPopup(false)}>
        <div className="rdv-popup" onClick={e => e.stopPropagation()}>
          <h3 className="rdv-popup-title">Date du RDV</h3>
          <p className="rdv-popup-subtitle">{prospect.nomPrenom}</p>
          <div className="rdv-popup-fields">
            <div className="rdv-popup-group">
              <label>Date</label>
              <input
                type="date"
                value={rdvDate}
                onChange={e => setRdvDate(e.target.value)}
                className="rdv-popup-input"
              />
            </div>
            <div className="rdv-popup-group">
              <label>Heure</label>
              <input
                type="time"
                value={rdvTime}
                onChange={e => setRdvTime(e.target.value)}
                className="rdv-popup-input"
              />
            </div>
          </div>
          <div className="rdv-popup-actions">
            <button
              type="button"
              className="rdv-popup-btn rdv-popup-cancel"
              onClick={() => !rdvSending && setShowRdvPopup(false)}
              disabled={rdvSending}
            >
              Annuler
            </button>
            <button
              type="button"
              className="rdv-popup-btn rdv-popup-confirm"
              onClick={confirmRdv}
              disabled={rdvSending || !rdvDate}
            >
              {rdvSending ? 'Envoi…' : 'Confirmer'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
