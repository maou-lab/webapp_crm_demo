# CRM Interface - Suivi de Clients

Interface CRM moderne avec vue Kanban pour le suivi de prospects et clients.

## Fonctionnalités

- **Vue Kanban** avec 8 statuts de suivi :
  - Nouveaux lead
  - Relance +1
  - Relance +3
  - Rappel à prévoir
  - RDV planifié
  - Vendu
  - Pas intéressé
  - Demande clôturé

- **Gestion des prospects** :
  - Nom/prénom
  - Téléphone
  - Email
  - Ville
  - Type de projet (Pergolas, Menuiserie, Veranda)
  - Date d'entrée
  - Date de rappel
  - Date de RDV

- **Actions rapides** :
  - Pas répondu
  - Rappel
  - RDV planifié
  - Vendu
  - Pas intéressé

- **Stockage** : Données en local (localStorage) ou synchronisées avec **Airtable** si configuré

## Configuration Airtable (optionnel)

Pour utiliser Airtable comme base de données :

1. **Créer un token** : Airtable → Paramètres du compte → Développer → Personal access tokens. Créez un token avec les scopes `data.records:read` et `data.records:write` sur votre base.

2. **Créer une base** avec une table contenant les colonnes suivantes (noms exacts) :
   - `nomPrenom` (Une ligne de texte)
   - `telephone` (Une ligne de texte)
   - `email` (Une ligne de texte)
   - `ville` (Une ligne de texte)
   - `typeProjet` (Sélection unique : pergolas, menuiserie, veranda)
   - `dateEntree` (Date)
   - `dateRappel` (Date)
   - `dateRdv` (Date)
   - `heureRdv` (Une ligne de texte)
   - `status` (Sélection unique : nouveaux-lead, relance-1, relance-3, rappel-prevoir, rdv-planifie, vendu, pas-interesse, demande-cloture)
   - `notes` (Texte long)

3. **Configurer le projet** : copiez `.env.example` en `.env` et remplissez :
   - `VITE_AIRTABLE_TOKEN` : votre token personnel
   - `VITE_AIRTABLE_BASE_ID` : l’ID de la base (dans l’URL Airtable, partie `appXXXXXXXXXXXXXX`)
   - `VITE_AIRTABLE_TABLE_ID` : le nom de la table (ex. `Prospects`) ou son ID

**Important** : ne commitez jamais le fichier `.env` (il est dans `.gitignore`). Si le token est exposé, révoquez-le dans Airtable et créez-en un nouveau.

## Installation

```bash
npm install
```

## Démarrage

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## Build

```bash
npm run build
```

## Technologies

- React 18
- TypeScript
- Vite
- CSS3 (design moderne avec gradients)
# crm_pergopose
