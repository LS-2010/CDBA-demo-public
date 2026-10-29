// Espace adhérent et connexion (maquette) : profil, mot de passe fictif, mot de passe oublié simulé, inscription à une fosse.
// Vérification locale, erreur sous chaque champ. Rien n’est envoyé ni enregistré.

// Vérifie chaque règle [nom, test, message, active?] ; affiche les erreurs, renvoie le premier champ fautif.
function verifier(formulaire, regles) {
  let premier = null;
  for (const [nom, valide, texte, active = () => true] of regles) {
    const erreur = document.getElementById('erreur-' + nom);
    const entrees = formulaire.querySelectorAll(`[name="${nom}"]`);
    const ok = !active() || Boolean(valide());
    erreur.textContent = ok ? '' : texte;
    erreur.hidden = ok;
    for (const entree of entrees) entree.setAttribute('aria-invalid', String(!ok));
    if (!ok && !premier) premier = entrees[0];
  }
  return premier;
}

// Relie chaque champ à son message d’erreur.
function relier(formulaire, regles) {
  for (const [nom] of regles) {
    for (const entree of formulaire.querySelectorAll(`[name="${nom}"]`)) entree.setAttribute('aria-describedby', 'erreur-' + nom);
  }
}

function annoncer(message, texte) {
  message.textContent = texte;
  message.focus();
}

document.addEventListener('DOMContentLoaded', () => {
  const profil = document.getElementById('formulaire-profil');
  if (profil) {
    const regles = [
      ['nom', () => profil.elements.nom.value.trim(), 'Indiquez votre nom.'],
      ['prenom', () => profil.elements.prenom.value.trim(), 'Indiquez votre prénom.'],
      // Au moins un des deux niveaux (plongée, apnée) [À CONFIRMER].
      ['niveau', () => [...profil.querySelectorAll('select[name="niveau"]')].some((liste) => liste.value), 'Choisissez au moins un niveau : plongée ou apnée.'],
    ];
    relier(profil, regles);
    profil.addEventListener('submit', (evenement) => {
      evenement.preventDefault();
      const message = document.getElementById('message-profil');
      message.textContent = '';
      const premier = verifier(profil, regles);
      if (premier) { premier.focus(); return; }
      annoncer(message, 'Maquette : profil valide, mais rien n’a été enregistré ni envoyé.');
    });
  }

  // Mot de passe et oubli : formulaires fictifs. Les champs ne sont jamais lus, seulement vidés.
  for (const fictif of document.querySelectorAll('.formulaire-fictif')) {
    fictif.addEventListener('submit', (evenement) => {
      evenement.preventDefault();
      fictif.reset();
      const message = fictif.querySelector('.message');
      annoncer(message, message.dataset.texte);
    });
  }

  const formulaire = document.getElementById('formulaire-inscription');
  const message = document.getElementById('message');
  if (!formulaire || !message) return;

  const autorisation = document.getElementById('autorisation-parentale');
  const ligneDossier = document.getElementById('ligne-autorisation');
  const champPlaces = document.getElementById('champ-places');
  const coche = (nom) => formulaire.querySelector(`input[name="${nom}"]:checked`);
  const avecVehicule = () => coche('vehicule')?.value === 'oui';

  const regles = [
    ['date', () => coche('date'), 'Choisissez une date.'],
    ['stab', () => coche('stab'), 'Choisissez une taille de stab.'],
    ['covoiturage', () => coche('covoiturage'), 'Répondez oui ou non.'],
    ['vehicule', () => coche('vehicule'), 'Répondez oui ou non.'],
    ['places', () => /^[0-8]$/.test(formulaire.elements.places.value), 'Indiquez un nombre de places entre 0 et 8.', avecVehicule],
    ['mineur', () => coche('mineur'), 'Répondez oui ou non.'],
  ];
  relier(formulaire, regles);

  formulaire.addEventListener('change', (evenement) => {
    if (evenement.target.name === 'vehicule') champPlaces.hidden = !avecVehicule();
    if (evenement.target.name !== 'mineur') return;
    const mineur = evenement.target.value === 'oui';
    autorisation.hidden = !mineur;
    // Moins de 18 ans : la pièce « Autorisation parentale : à fournir » apparaît dans « Mon dossier ».
    if (ligneDossier) ligneDossier.hidden = !mineur;
  });

  formulaire.addEventListener('submit', (evenement) => {
    evenement.preventDefault();
    message.textContent = '';
    const premier = verifier(formulaire, regles);
    if (premier) {
      premier.focus();
      return;
    }
    annoncer(message, coche('mineur').value === 'oui'
      ? 'Maquette : inscription incomplète tant que l’autorisation parentale n’est pas fournie. Rien n’a été envoyé ni enregistré.'
      : 'Maquette : l’inscription est complète, mais rien n’a été envoyé ni enregistré.');
  });
});
