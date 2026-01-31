import type { Prospect, Status, TypeProjet } from '../types';

const API_BASE = 'https://api.airtable.com/v0';

/** Noms exacts des champs dans la base Airtable "Prospects" */
const AIRTABLE_FIELDS = {
  NOM_COMPLET: 'Nom complet',
  TELEPHONE: 'Téléphone',
  EMAIL: 'Email',
  VILLE: 'Ville',
  TYPE_PROJET: 'Type de projet',
  DATE_ENTREE: "Date d'entrée",
  DATE_RAPPEL: 'Date de rappel',
  DATE_RDV: 'Date de RDV',
  STATUT: 'Statut du prospect',
} as const;

/** Valeurs Airtable "Statut du prospect" → notre Status */
const AIRTABLE_STATUT_TO_STATUS: Record<string, Status> = {
  'Nouveaux lead': 'nouveaux-lead',
  'Relance +1': 'relance-1',
  'Relance +3': 'relance-3',
  'Rappel à prévoir': 'rappel-prevoir',
  'RDV planifié': 'rdv-planifie',
  Vendu: 'vendu',
  'Pas intérresé': 'pas-interesse',
  'Demande clôturé': 'demande-cloture',
};

/** Notre Status → valeur Airtable "Statut du prospect" */
const STATUS_TO_AIRTABLE_STATUT: Record<Status, string> = {
  'nouveaux-lead': 'Nouveaux lead',
  'relance-1': 'Relance +1',
  'relance-3': 'Relance +3',
  'rappel-prevoir': 'Rappel à prévoir',
  'rdv-planifie': 'RDV planifié',
  vendu: 'Vendu',
  'pas-interesse': 'Pas intérresé',
  'demande-cloture': 'Demande clôturé',
};

/** Type de projet: notre clé → valeur Airtable (Pergolas, Menuiserie, Veranda) */
function typeProjetToAirtable(t: TypeProjet): string {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** Type de projet: valeur Airtable → notre TypeProjet */
function typeProjetFromAirtable(s: string | undefined): TypeProjet {
  if (!s) return 'pergolas';
  const lower = s.toLowerCase();
  if (lower === 'pergolas' || lower === 'menuiserie' || lower === 'veranda') return lower as TypeProjet;
  return 'pergolas';
}

/** ISO date/time → date YYYY-MM-DD */
function isoToDate(iso: string | undefined | null): string | null {
  if (!iso || iso === '') return null;
  try {
    return iso.split('T')[0] ?? null;
  } catch {
    return null;
  }
}

/** ISO date/time → heure HH:mm */
function isoToHeure(iso: string | undefined | null): string | null {
  if (!iso || iso === '') return null;
  try {
    const d = new Date(iso);
    const h = d.getUTCHours().toString().padStart(2, '0');
    const m = d.getUTCMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  } catch {
    return null;
  }
}

/** date YYYY-MM-DD + optionnel heure HH:mm → ISO pour Airtable */
function toAirtableDateTime(date: string | null, heure?: string | null): string | null {
  if (!date) return null;
  if (heure) {
    const [h, m] = heure.split(':');
    return `${date}T${h || '00'}:${m || '00'}:00.000Z`;
  }
  return `${date}T00:00:00.000Z`;
}

function getConfig(): { token: string; baseId: string; tableId: string } | null {
  const token = import.meta.env.VITE_AIRTABLE_TOKEN;
  const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
  const tableId = import.meta.env.VITE_AIRTABLE_TABLE_ID;
  if (!token || !baseId || !tableId) return null;
  return { token, baseId, tableId };
}

function getHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

function emptyToNull(s: string | undefined | null): string | null {
  if (s == null || s === '') return null;
  return s;
}

/** Enregistrement Airtable → Prospect (noms de champs de ta base) */
function recordToProspect(record: { id: string; fields: Record<string, unknown> }): Prospect {
  const f = record.fields as Record<string, string | undefined>;
  const dateEntreeRaw = f[AIRTABLE_FIELDS.DATE_ENTREE];
  const dateEntree = dateEntreeRaw ? isoToDate(dateEntreeRaw) ?? new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  const dateRdvRaw = f[AIRTABLE_FIELDS.DATE_RDV];
  return {
    id: record.id,
    nomPrenom: f[AIRTABLE_FIELDS.NOM_COMPLET] ?? '',
    telephone: f[AIRTABLE_FIELDS.TELEPHONE] ?? '',
    email: f[AIRTABLE_FIELDS.EMAIL] ?? '',
    ville: f[AIRTABLE_FIELDS.VILLE] ?? '',
    typeProjet: typeProjetFromAirtable(f[AIRTABLE_FIELDS.TYPE_PROJET]),
    dateEntree,
    dateRappel: emptyToNull(isoToDate(f[AIRTABLE_FIELDS.DATE_RAPPEL])),
    dateRdv: emptyToNull(isoToDate(dateRdvRaw)),
    heureRdv: emptyToNull(isoToHeure(dateRdvRaw)),
    status: AIRTABLE_STATUT_TO_STATUS[f[AIRTABLE_FIELDS.STATUT] ?? ''] ?? 'nouveaux-lead',
    notes: emptyToNull(f['Notes']),
  };
}

/** Prospect → champs Airtable (noms exacts de ta base) */
function prospectToFields(p: Partial<Prospect>): Record<string, string | null | undefined> {
  const fields: Record<string, string | null | undefined> = {};
  if (p.nomPrenom != null) fields[AIRTABLE_FIELDS.NOM_COMPLET] = p.nomPrenom;
  if (p.telephone != null) fields[AIRTABLE_FIELDS.TELEPHONE] = p.telephone;
  if (p.email != null) fields[AIRTABLE_FIELDS.EMAIL] = p.email;
  if (p.ville != null) fields[AIRTABLE_FIELDS.VILLE] = p.ville;
  if (p.typeProjet != null) fields[AIRTABLE_FIELDS.TYPE_PROJET] = typeProjetToAirtable(p.typeProjet);
  if (p.dateEntree != null) fields[AIRTABLE_FIELDS.DATE_ENTREE] = p.dateEntree; // ignoré en create (auto)
  if (p.dateRappel != null) fields[AIRTABLE_FIELDS.DATE_RAPPEL] = toAirtableDateTime(p.dateRappel);
  if (p.dateRdv != null) fields[AIRTABLE_FIELDS.DATE_RDV] = toAirtableDateTime(p.dateRdv, p.heureRdv);
  if (p.status != null) fields[AIRTABLE_FIELDS.STATUT] = STATUS_TO_AIRTABLE_STATUT[p.status];
  if (p.notes != null) fields['Notes'] = p.notes;
  return fields;
}

/** Retire les clés à valeur undefined pour ne pas envoyer de champs vides non désirés */
function cleanFields(fields: Record<string, string | null | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v != null && v !== '') out[k] = v;
  }
  return out;
}

export function isAirtableConfigured(): boolean {
  return getConfig() !== null;
}

export async function fetchProspectsFromAirtable(): Promise<Prospect[]> {
  const config = getConfig();
  if (!config) throw new Error('Airtable non configuré (VITE_AIRTABLE_*)');

  const { token, baseId, tableId } = config;
  const url = `${API_BASE}/${baseId}/${encodeURIComponent(tableId)}`;
  const prospects: Prospect[] = [];
  let offset: string | undefined;

  do {
    const params = new URLSearchParams();
    if (offset) params.set('offset', offset);
    const res = await fetch(`${url}?${params}`, {
      headers: getHeaders(token),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Airtable: ${res.status} ${err}`);
    }
    const data = (await res.json()) as { records: { id: string; fields: Record<string, unknown> }[]; offset?: string };
    for (const record of data.records) {
      prospects.push(recordToProspect(record));
    }
    offset = data.offset;
  } while (offset);

  return prospects;
}

export async function createProspectInAirtable(prospect: Omit<Prospect, 'id'>): Promise<Prospect> {
  const config = getConfig();
  if (!config) throw new Error('Airtable non configuré');

  const { token, baseId, tableId } = config;
  const url = `${API_BASE}/${baseId}/${encodeURIComponent(tableId)}`;
  const fields = prospectToFields(prospect);
  delete fields[AIRTABLE_FIELDS.DATE_ENTREE]; // Airtable le calcule
  const body = { records: [{ fields: cleanFields(fields) }] };
  const res = await fetch(url, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Airtable create: ${res.status} ${err}`);
  }
  const data = (await res.json()) as { records: { id: string; fields: Record<string, unknown> }[] };
  const created = data.records[0];
  if (!created) throw new Error('Airtable create: aucun enregistrement retourné');
  return recordToProspect(created);
}

export async function updateProspectInAirtable(id: string, updates: Partial<Prospect>): Promise<void> {
  const config = getConfig();
  if (!config) throw new Error('Airtable non configuré');

  const { token, baseId, tableId } = config;
  const url = `${API_BASE}/${baseId}/${encodeURIComponent(tableId)}/${id}`;
  const fields = cleanFields(prospectToFields(updates));
  const res = await fetch(url, {
    method: 'PATCH',
    headers: getHeaders(token),
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Airtable update: ${res.status} ${err}`);
  }
}

export async function deleteProspectInAirtable(id: string): Promise<void> {
  const config = getConfig();
  if (!config) throw new Error('Airtable non configuré');

  const { token, baseId, tableId } = config;
  const url = `${API_BASE}/${baseId}/${encodeURIComponent(tableId)}/${id}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: getHeaders(token),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Airtable delete: ${res.status} ${err}`);
  }
}
