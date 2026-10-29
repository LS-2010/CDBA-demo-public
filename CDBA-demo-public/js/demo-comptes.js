// MAQUETTE : comptes fictifs de démonstration, comparés dans le navigateur. Ce n’est PAS une authentification.
// Rien n’est stocké (ni cookie, ni stockage local) ni envoyé : le rôle n’est porté que par l’adresse de la page.
// Pour retirer la démonstration : voir docs/16-COMPTES-DEMO.md.

const COMPTES_DEMO = {
  marie: { code: 'marie2026', page: '../espace-demo/index.html' },
  paul: { code: 'paul2026', page: '../espace-moniteur-demo/index.html' },
  sophie: { code: 'sophie2026', page: '../espace-admin-demo/index.html' },
};

document.addEventListener('DOMContentLoaded', () => {
  const formulaire = document.getElementById('formulaire-connexion');
  if (!formulaire) return;
  const identifiant = document.getElementById('identifiant');
  const code = document.getElementById('mot-de-passe');

  const signaler = (champ, texte) => {
    const erreur = document.getElementById('erreur-' + champ.id);
    erreur.textContent = texte;
    erreur.hidden = !texte;
    champ.setAttribute('aria-invalid', String(Boolean(texte)));
  };

  formulaire.addEventListener('submit', (evenement) => {
    evenement.preventDefault();
    const nom = identifiant.value.trim().toLowerCase();
    signaler(identifiant, nom ? '' : 'Indiquez votre identifiant.');
    signaler(code, code.value ? '' : 'Indiquez votre mot de passe.');
    if (!nom) { identifiant.focus(); return; }
    if (!code.value) { code.focus(); return; }

    const compte = Object.prototype.hasOwnProperty.call(COMPTES_DEMO, nom) ? COMPTES_DEMO[nom] : null;
    if (compte && compte.code === code.value) {
      window.location.assign(compte.page);
      return;
    }
    // Message générique : ne dit pas lequel des deux champs est faux.
    code.value = '';
    signaler(code, 'Identifiant ou mot de passe incorrect.');
    code.focus();
  });
});
