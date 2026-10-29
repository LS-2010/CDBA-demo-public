// Espace administrateur (maquette) : modification des dates de fosses affichées sur cette page.
// Liste en mémoire, lue dans les lignes du tableau : rien n’est stocké ni envoyé, tout est perdu au rechargement.
// Les dates de l’accueil restent celles du fichier source.

// Bloc : les noms de premier niveau d’encadrement.js ($, el…) sont partagés entre scripts classiques.
{
  const FORMAT = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const libelle = (iso) => FORMAT.format(new Date(iso));

  // Une entrée par ligne : activité (légende du tableau), date ISO, ligne affichée.
  const dates = [...document.querySelectorAll('tr[data-date]')].map((tr) => ({
    activite: tr.closest('table').caption.textContent, date: tr.dataset.date, tr,
  }));

  function rendreChoix(choisie) {
    const choix = document.getElementById('date-a-modifier');
    choix.replaceChildren(...dates.map((d, i) => new Option(`${d.activite}, ${libelle(d.date)}`, String(i))));
    choix.value = String(choisie);
  }

  function afficher(d) {
    const [jour, ...reste] = libelle(d.date).split(' ');
    const jourEl = document.createElement('span');
    jourEl.className = 'jour';
    jourEl.textContent = jour[0].toUpperCase() + jour.slice(1);
    d.tr.dataset.date = d.date;
    d.tr.querySelector('th').replaceChildren(jourEl, ' ' + reste.join(' '));
    // Lignes du même tableau remises dans l’ordre chronologique.
    const corps = d.tr.parentElement;
    corps.append(...[...corps.rows].sort((a, b) => a.dataset.date.localeCompare(b.dataset.date)));
  }

  function erreur(texte) {
    const zone = document.getElementById('erreur-date');
    zone.textContent = texte;
    zone.hidden = !texte;
    document.getElementById('nouvelle-date').setAttribute('aria-invalid', String(Boolean(texte)));
  }

  function modifier() {
    const i = Number(document.getElementById('date-a-modifier').value);
    const nouvelle = document.getElementById('nouvelle-date').value;
    const d = dates[i];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(nouvelle)) return erreur('Indiquez une date complète.');
    if (dates.some((x) => x !== d && x.activite === d.activite && x.date === nouvelle)) {
      return erreur(`Cette date existe déjà pour : ${d.activite.toLowerCase()}.`);
    }
    erreur('');
    d.date = nouvelle;
    afficher(d);
    rendreChoix(i);
    document.getElementById('annonce-dates').textContent = `${d.activite} : date modifiée, ${libelle(nouvelle)}.`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const bloc = document.getElementById('modifier-dates');
    if (!bloc || !dates.length) return;
    rendreChoix(0);
    document.getElementById('modifier-date').addEventListener('click', modifier);
    bloc.hidden = false;
  });
}
