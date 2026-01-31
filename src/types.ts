export type Status = 
  | 'nouveaux-lead'
  | 'relance-1'
  | 'relance-3'
  | 'rappel-prevoir'
  | 'rdv-planifie'
  | 'vendu'
  | 'pas-interesse'
  | 'demande-cloture';

export type TypeProjet = 'pergolas' | 'menuiserie' | 'veranda';

export interface Prospect {
  id: string;
  nomPrenom: string;
  telephone: string;
  email: string;
  ville: string;
  typeProjet: TypeProjet;
  dateEntree: string;
  dateRappel: string | null;
  dateRdv: string | null;
  heureRdv: string | null;
  status: Status;
  notes?: string | null;
}

export const STATUS_LABELS: Record<Status, string> = {
  'nouveaux-lead': 'Nouveaux leads',
  'relance-1': 'Relance +1',
  'relance-3': 'Relance +3',
  'rappel-prevoir': 'Rappel à prévoir',
  'rdv-planifie': 'RDV planifié',
  'vendu': 'Vendu',
  'pas-interesse': 'Pas intéressé',
  'demande-cloture': 'Demande clôturé',
};

export const STATUS_COLORS: Record<Status, string> = {
  'nouveaux-lead': '#3b82f6',
  'relance-1': '#f97316',
  'relance-3': '#a855f7',
  'rappel-prevoir': '#eab308',
  'rdv-planifie': '#06b6d4',
  'vendu': '#22c55e',
  'pas-interesse': '#ef4444',
  'demande-cloture': '#64748b',
};

export const STATUS_ORDER: Status[] = [
  'nouveaux-lead',
  'relance-1',
  'relance-3',
  'rappel-prevoir',
  'rdv-planifie',
  'vendu',
  'pas-interesse',
  'demande-cloture',
];
