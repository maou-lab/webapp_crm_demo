import { useState } from 'react';
import { Prospect, TypeProjet, Status, STATUS_LABELS } from '../types';
import './ProspectForm.css';

interface ProspectFormProps {
  onSubmit: (prospect: Omit<Prospect, 'id'>) => void;
  onCancel: () => void;
}

export default function ProspectForm({ onSubmit, onCancel }: ProspectFormProps) {
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    telephone: '',
    email: '',
    ville: '',
    typeProjet: 'pergolas' as TypeProjet,
    status: 'nouveaux-lead' as Status,
    dateEntree: new Date().toISOString().split('T')[0],
    dateRappel: '',
    dateRdv: '',
    heureRdv: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nomPrenom = [formData.prenom, formData.nom].filter(Boolean).join(' ').trim();
    onSubmit({
      nomPrenom: nomPrenom || formData.prenom || formData.nom,
      telephone: formData.telephone,
      email: formData.email,
      ville: formData.ville,
      typeProjet: formData.typeProjet,
      status: formData.status,
      dateEntree: formData.dateEntree,
      dateRappel: formData.dateRappel || null,
      dateRdv: formData.dateRdv || null,
      heureRdv: formData.heureRdv || null,
      notes: formData.notes || null,
    });
    setFormData({
      prenom: '',
      nom: '',
      telephone: '',
      email: '',
      ville: '',
      typeProjet: 'pergolas',
      status: 'nouveaux-lead',
      dateEntree: new Date().toISOString().split('T')[0],
      dateRappel: '',
      dateRdv: '',
      heureRdv: '',
      notes: '',
    });
  };

  return (
    <div className="prospect-form-overlay" onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="prospect-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="prospect-form-header">
          <h2 id="modal-title">Nouveau prospect</h2>
          <button
            type="button"
            className="prospect-form-close"
            onClick={onCancel}
            aria-label="Fermer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form className="prospect-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Prénom *</label>
              <input
                type="text"
                required
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                placeholder="Prénom"
              />
            </div>
            <div className="form-group">
              <label>Nom *</label>
              <input
                type="text"
                required
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Nom"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Téléphone *</label>
              <input
                type="tel"
                required
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                placeholder="06 12 34 56 78"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemple.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ville</label>
              <input
                type="text"
                value={formData.ville}
                onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                placeholder="Paris"
              />
            </div>
            <div className="form-group">
              <label>Type de projet *</label>
              <select
                required
                value={formData.typeProjet}
                onChange={(e) => setFormData({ ...formData, typeProjet: e.target.value as TypeProjet })}
              >
                <option value="pergolas">Pergolas</option>
                <option value="menuiserie">Menuiserie</option>
                <option value="veranda">Véranda</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Statut</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row form-row-3">
            <div className="form-group form-group-date">
              <label>Date d'entrée</label>
              <div className="input-with-icon">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <input
                  type="date"
                  required
                  value={formData.dateEntree}
                  onChange={(e) => setFormData({ ...formData, dateEntree: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group form-group-date">
              <label>Date de rappel</label>
              <div className="input-with-icon">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <input
                  type="date"
                  value={formData.dateRappel}
                  onChange={(e) => setFormData({ ...formData, dateRappel: e.target.value })}
                  placeholder="jj/mm/aaaa"
                />
              </div>
            </div>
            <div className="form-group form-group-date">
              <label>Date de RDV</label>
              <div className="input-with-icon">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <input
                  type="date"
                  value={formData.dateRdv}
                  onChange={(e) => setFormData({ ...formData, dateRdv: e.target.value })}
                />
                <input
                  type="time"
                  className="time-input-inline"
                  value={formData.heureRdv}
                  onChange={(e) => setFormData({ ...formData, heureRdv: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="form-row form-row-full">
            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Informations complémentaires..."
                rows={3}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onCancel}>
              Annuler
            </button>
            <button type="submit" className="btn-submit">
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
