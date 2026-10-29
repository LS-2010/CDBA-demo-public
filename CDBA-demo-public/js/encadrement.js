// Espaces moniteur et administrateur (maquette) : inscrits par fosse, fiches, palanquées, rôles et forfaits.
// Données EXEMPLE. L’état reste en mémoire : tout est perdu au rechargement. Rien n’est stocké ni envoyé.

const NIVEAUX_PLONGEE = ['Baptême', 'PN1', 'N1', 'PN2', 'N2', 'PN3', 'N3', 'PN4', 'GDP', 'E1', 'E2', 'E3', 'E4'];
const NIVEAUX_APNEE = ['AP', 'ACP', 'AEL', 'ACEL', 'AEEL', 'IE1', 'IE2', 'MEF1', 'MEF2', 'IN'];
const ROLES = { adherent: 'Adhérent', moniteur: 'Moniteur', admin: 'Administrateur' };

const FOSSES = new Map([
  ['2026-12-06-plongee', 'Dimanche 6 décembre 2026, plongée'],
  ['2027-01-17-plongee', 'Dimanche 17 janvier 2027, plongée'],
  ['2027-01-24-apnee', 'Dimanche 24 janvier 2027, apnée'],
  ['2027-02-28-plongee', 'Dimanche 28 février 2027, plongée'],
  ['2027-03-14-plongee', 'Dimanche 14 mars 2027, plongée'],
  ['2027-03-14-apnee', 'Dimanche 14 mars 2027, apnée'],
  ['2027-04-25-plongee', 'Dimanche 25 avril 2027, plongée'],
  ['2027-05-23-apnee', 'Dimanche 23 mai 2027, apnée'],
  ['2027-06-06-apnee', 'Dimanche 6 juin 2027, apnée'],
]);

// inscriptions : fosse → [covoiturage, véhicule, places hors chauffeur].
const PERSONNES = [
  { id: 'marie', nom: 'Exemple', prenom: 'Marie', role: 'adherent', plongee: 'N2', apnee: '', certificat: '15 septembre 2026', fosses: 2, forfait: true, mineur: false, dossier: 'À vérifier',
    inscriptions: { '2026-12-06-plongee': ['oui', 'non'], '2027-01-17-plongee': ['non', 'non'] } },
  { id: 'camille', nom: 'Dupont', prenom: 'Camille', role: 'adherent', plongee: 'PN1', apnee: '', certificat: '2 octobre 2026', fosses: 1, forfait: false, mineur: false, dossier: 'Incomplet',
    inscriptions: { '2026-12-06-plongee': ['oui', 'oui', 3], '2027-02-28-plongee': ['oui', 'oui', 3] } },
  { id: 'hugo', nom: 'Durand', prenom: 'Hugo', role: 'adherent', plongee: 'N3', apnee: '', certificat: '20 septembre 2026', fosses: 3, forfait: true, mineur: false, dossier: 'Complet',
    inscriptions: { '2026-12-06-plongee': ['non', 'non'], '2027-03-14-plongee': ['oui', 'non'] } },
  { id: 'lea', nom: 'Petit', prenom: 'Léa', role: 'adherent', plongee: '', apnee: 'AP', certificat: '1er octobre 2026', fosses: 0, forfait: false, mineur: true, dossier: 'Incomplet (autorisation parentale à fournir)',
    inscriptions: { '2027-01-24-apnee': ['oui', 'non'], '2027-03-14-apnee': ['oui', 'non'] } },
  { id: 'paul', nom: 'Exemple', prenom: 'Paul', role: 'moniteur', plongee: 'E3', apnee: '', certificat: '10 septembre 2026', fosses: 4, forfait: false, mineur: false, dossier: 'Complet',
    inscriptions: { '2026-12-06-plongee': ['oui', 'oui', 2], '2027-01-17-plongee': ['non', 'oui', 1] } },
  { id: 'nadia', nom: 'Moreau', prenom: 'Nadia', role: 'moniteur', plongee: 'E2', apnee: 'MEF1', certificat: '5 septembre 2026', fosses: 2, forfait: false, mineur: false, dossier: 'Complet',
    inscriptions: { '2026-12-06-plongee': ['non', 'non'], '2027-01-24-apnee': ['oui', 'oui', 3], '2027-03-14-apnee': ['non', 'non'] } },
  { id: 'thomas', nom: 'Leroy', prenom: 'Thomas', role: 'moniteur', plongee: 'E2', apnee: '', certificat: '12 septembre 2026', fosses: 1, forfait: false, mineur: false, dossier: 'Complet',
    inscriptions: { '2027-02-28-plongee': ['non', 'oui', 4], '2027-04-25-plongee': ['non', 'non'] } },
  { id: 'sophie', nom: 'Exemple', prenom: 'Sophie', role: 'admin', plongee: '', apnee: '', certificat: 'non renseigné', fosses: 0, forfait: false, mineur: false, dossier: 'sans objet',
    inscriptions: {} },
];

// État de l’interface, en mémoire seulement.
const etat = { fosse: FOSSES.keys().next().value, palanquees: {}, dp: {} };

const $ = (id) => document.getElementById(id);
const personne = (id) => PERSONNES.find((p) => p.id === id);
const nomComplet = (p) => `${p.prenom} ${p.nom}`;
const niveaux = (p) => [p.plongee && `Plongée ${p.plongee}`, p.apnee && `Apnée ${p.apnee}`].filter(Boolean).join(', ') || 'aucun';
const inscrits = () => PERSONNES.filter((p) => etat.fosse in p.inscriptions);
const palanquees = () => (etat.palanquees[etat.fosse] ??= []);
// Règle du DP donnée par le club : E3 minimum ou MEF1 minimum. MEF2 et IN sont admis par l’ordre des listes [À CONFIRMER].
const peutEtreDP = (p) => NIVEAUX_PLONGEE.indexOf(p.plongee) >= NIVEAUX_PLONGEE.indexOf('E3')
  || NIVEAUX_APNEE.indexOf(p.apnee) >= NIVEAUX_APNEE.indexOf('MEF1');
const REGLE_DP = 'E3 minimum ou MEF1 minimum';

function el(nom, texte, attributs = {}) {
  const e = document.createElement(nom);
  if (texte != null) e.textContent = texte;
  for (const [cle, valeur] of Object.entries(attributs)) e.setAttribute(cle, valeur);
  return e;
}

function bouton(texte, action) {
  const b = el('button', texte, { type: 'button', class: 'bouton bouton-secondaire' });
  b.addEventListener('click', action);
  return b;
}

function annoncer(zone, texte) {
  $(zone).textContent = texte;
}

function rendreInscrits() {
  for (const [role, id] of [['adherent', 'liste-adherents'], ['moniteur', 'liste-moniteurs']]) {
    const corps = $(id);
    corps.replaceChildren();
    const liste = inscrits().filter((p) => p.role === role);
    if (!liste.length) {
      const tr = el('tr');
      tr.append(el('td', 'Aucun inscrit à cette fosse.', { colspan: '9' }));
      corps.append(tr);
    }
    for (const p of liste) {
      const [covoiturage, vehicule, places] = p.inscriptions[etat.fosse];
      const tr = el('tr');
      const nom = el('td', p.nom + ' ');
      nom.append(el('span', 'EXEMPLE', { class: 'exemple' }));
      tr.append(nom, ...[p.prenom, niveaux(p), p.certificat, String(p.fosses), p.forfait ? 'oui' : 'non',
        covoiturage, vehicule, vehicule === 'oui' ? String(places) : 'sans objet'].map((t) => el('td', t)));
      corps.append(tr);
    }
  }
}

function rendreFiche() {
  const p = personne($('choix-fiche').value);
  $('fiche').replaceChildren(...[
    ['Nom', p.nom], ['Prénom', p.prenom], ['Rôle', ROLES[p.role]],
    ['Niveau de plongée', p.plongee || 'aucun'], ['Niveau d’apnée', p.apnee || 'aucun'],
    ['Date du certificat médical', p.certificat], ['Fosses cette saison', String(p.fosses)],
    ['Forfait payé', p.forfait ? 'oui' : 'non'], ['Moins de 18 ans', p.mineur ? 'oui' : 'non'], ['Dossier', p.dossier],
    ['Inscriptions', Object.keys(p.inscriptions).map((f) => FOSSES.get(f)).join(' ; ') || 'aucune'],
  ].flatMap(([intitule, valeur]) => [el('dt', intitule), el('dd', valeur)]));
}

function rendreDP() {
  const choix = $('choix-dp');
  const candidats = inscrits().filter(peutEtreDP);
  choix.replaceChildren(...(candidats.length
    ? candidats.map((p) => el('option', `${nomComplet(p)} (${niveaux(p)})`, { value: p.id }))
    : [el('option', 'Aucun inscrit n’a le niveau requis', { value: '' })]));
  const dp = etat.dp[etat.fosse];
  if (dp && candidats.some((p) => p.id === dp)) choix.value = dp;
  $('dp-actuel').textContent = 'DP de cette fosse : ' + (dp ? nomComplet(personne(dp)) : 'aucun');
}

function definirDP() {
  const choix = $('choix-dp');
  const p = personne(choix.value);
  // Contrôle aussi au clic : seul un niveau E3 ou MEF1 minimum est accepté, même si la liste a été modifiée.
  const texte = !p ? `Aucun inscrit à cette fosse n’a le niveau requis pour être DP : ${REGLE_DP}.`
    : peutEtreDP(p) ? '' : `${nomComplet(p)} n’a pas le niveau requis pour être DP : ${REGLE_DP}.`;
  const erreur = $('erreur-dp');
  erreur.textContent = texte;
  erreur.hidden = !texte;
  choix.setAttribute('aria-invalid', String(Boolean(texte)));
  if (texte) return;
  etat.dp[etat.fosse] = p.id;
  rendreDP();
  annoncer('annonce-palanquees', `${nomComplet(p)} est DP de cette fosse.`);
}

// Liste déroulante et bouton « Ajouter … à la palanquée n » ; texte simple s’il n’y a personne à ajouter.
function ajout(n, type, candidats, appliquer) {
  const mot = type === 'moniteur' ? 'moniteur' : 'élève';
  const bloc = el('div', null, { class: 'champ' });
  if (!candidats.length) {
    bloc.append(el('p', `Aucun ${mot} disponible pour cette fosse.`));
    return bloc;
  }
  const id = `${type}-${n}`;
  const liste = el('select', null, { id });
  liste.append(...candidats.map((p) => el('option', `${nomComplet(p)} (${niveaux(p)})`, { value: p.id })));
  const action = bouton(type === 'moniteur' ? `Ajouter le moniteur à la palanquée ${n}` : `Ajouter l’élève à la palanquée ${n}`, () => {
    const p = personne(liste.value);
    appliquer(p.id);
    rendrePalanquees([id, `eleve-${n}`, `palanquee-${n}`]);
    annoncer('annonce-palanquees', `${nomComplet(p)} ajouté(e) à la palanquée ${n} comme ${mot}.`);
  });
  bloc.append(el('label', `${mot === 'moniteur' ? 'Moniteur' : 'Élève'} à ajouter à la palanquée ${n}`, { for: id }), liste, el('p', null, { class: 'actions' }));
  bloc.lastChild.append(action);
  return bloc;
}

// Recrée la liste des palanquées, puis remet le focus sur le premier élément existant parmi « focus ».
function rendrePalanquees(focus = []) {
  const prises = new Set(palanquees().flatMap((q) => [q.moniteur, ...q.eleves]));
  const libres = (role) => inscrits().filter((p) => p.role === role && !prises.has(p.id));
  $('palanquees').replaceChildren(...palanquees().map((q, i) => {
    const n = i + 1;
    const bloc = el('div', null, { class: 'palanquee' });
    bloc.append(el('h3', `Palanquée ${n}`, { id: `palanquee-${n}`, tabindex: '-1' }));
    const membres = el('ul', null, { class: 'liste' });
    for (const [id, role] of [[q.moniteur, 'moniteur'], ...q.eleves.map((e) => [e, 'élève'])]) {
      if (!id) continue;
      const p = personne(id);
      const li = el('li', `${nomComplet(p)}, ${role} (${niveaux(p)}) `);
      li.append(bouton(`Retirer ${nomComplet(p)}`, () => {
        if (q.moniteur === id) q.moniteur = null; else q.eleves.splice(q.eleves.indexOf(id), 1);
        rendrePalanquees([`palanquee-${n}`]);
        annoncer('annonce-palanquees', `${nomComplet(p)} retiré(e) de la palanquée ${n}.`);
      }));
      membres.append(li);
    }
    if (!membres.children.length) membres.append(el('li', 'Palanquée vide.'));
    bloc.append(membres);
    if (!q.moniteur) bloc.append(ajout(n, 'moniteur', libres('moniteur'), (id) => { q.moniteur = id; }));
    bloc.append(ajout(n, 'eleve', libres('adherent'), (id) => q.eleves.push(id)));
    const fin = el('p', null, { class: 'actions' });
    fin.append(bouton(`Supprimer la palanquée ${n}`, () => {
      palanquees().splice(i, 1);
      rendrePalanquees(['creer-palanquee']);
      annoncer('annonce-palanquees', `Palanquée ${n} supprimée.`);
    }));
    bloc.append(fin);
    return bloc;
  }));
  focus.map($).find(Boolean)?.focus();
}

function rendreTout() {
  rendreInscrits();
  rendreFiche();
  rendreDP();
  $('erreur-dp').hidden = true;
  $('choix-dp').setAttribute('aria-invalid', 'false');
  rendrePalanquees();
}

// Administrateur : rôle (Adhérent par défaut, ou Moniteur) et forfait payé, modifiés en mémoire.
function rendreComptes() {
  const corps = $('comptes');
  const liste = (id, etiquette, options, valeur, changer) => {
    const td = el('td');
    const s = el('select', null, { id, 'aria-label': etiquette });
    s.append(...options.map(([v, t]) => el('option', t, { value: v })));
    s.value = valeur;
    s.addEventListener('change', () => changer(s.value));
    td.append(s);
    return td;
  };
  for (const p of PERSONNES) {
    const tr = el('tr');
    const nom = el('td', p.nom + ' ');
    nom.append(el('span', 'EXEMPLE', { class: 'exemple' }));
    tr.append(nom, el('td', p.prenom));
    if (p.role === 'admin') {
      tr.append(el('td', ROLES.admin), el('td', 'sans objet'));
    } else {
      tr.append(liste(`role-${p.id}`, `Rôle de ${nomComplet(p)}`, [['adherent', 'Adhérent'], ['moniteur', 'Moniteur']], p.role, (v) => {
        p.role = v;
        // Un rôle changé retire la personne des palanquées, pour qu’elle n’y reste pas dans l’ancien rôle.
        for (const q of Object.values(etat.palanquees).flat()) {
          if (q.moniteur === p.id) q.moniteur = null;
          q.eleves = q.eleves.filter((e) => e !== p.id);
        }
        rendreTout();
        annoncer('annonce-comptes', `${nomComplet(p)} : rôle ${ROLES[v]}.`);
      }));
      tr.append(liste(`forfait-${p.id}`, `Forfait payé par ${nomComplet(p)}`, [['non', 'non'], ['oui', 'oui']], p.forfait ? 'oui' : 'non', (v) => {
        p.forfait = v === 'oui';
        rendreInscrits();
        rendreFiche();
        annoncer('annonce-comptes', `${nomComplet(p)} : forfait payé ${v}.`);
      }));
    }
    tr.append(el('td', p.dossier));
    corps.append(tr);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const choixFosse = $('choix-fosse');
  if (!choixFosse) return;
  choixFosse.append(...[...FOSSES].map(([id, libelle]) => el('option', libelle, { value: id })));
  choixFosse.addEventListener('change', () => { etat.fosse = choixFosse.value; rendreTout(); });
  $('choix-fiche').append(...PERSONNES.map((p) => el('option', nomComplet(p), { value: p.id })));
  $('choix-fiche').addEventListener('change', rendreFiche);
  $('definir-dp').addEventListener('click', definirDP);
  $('creer-palanquee').addEventListener('click', () => {
    palanquees().push({ moniteur: null, eleves: [] });
    rendrePalanquees([`palanquee-${palanquees().length}`]);
    annoncer('annonce-palanquees', `Palanquée ${palanquees().length} créée.`);
  });
  if ($('comptes')) rendreComptes();
  rendreTout();
});
