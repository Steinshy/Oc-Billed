# Plan de test End-to-End du parcours employé

---

## Scénario n°1 : Validation des champs de connexion employé

**Given**  
Je suis un visiteur (non connecté).

**When**  
Je ne remplis pas le champ e-mail ou le champ password du login employé  
et je clique sur le bouton **"Se connecter"**.

**Then**  
Je reste sur la page Login et je suis invité à remplir le champ manquant.

---

## Scénario n°2 : Validation du format e-mail employé

**Given**  
Je suis un visiteur (non connecté).

**When**  
Je remplis le champ e-mail du login employé au mauvais format  
(sans la forme `chaîne@chaîne`) et je clique sur **"Se connecter"**.

**Then**  
Je reste sur la page Login et je suis invité à remplir le champ e-mail  
au bon format.

---

## Scénario n°3 : Connexion réussie en tant qu'employé

**Given**  
Je suis un visiteur (non connecté).

**When**  
Je remplis :
- le champ e-mail au bon format (`chaîne@chaîne`)
- le champ password  
puis je clique sur **"Se connecter"**.

**Then**  
Je suis envoyé sur la page **Bills (Mes notes de frais)** affichant  
la liste de mes notes de frais.

---

## Scénario n°4 : Affichage de la liste des notes de frais

**Given**  
Je suis connecté en tant qu'employé et je suis sur la page Bills.

**When**  
La page charge les données via l'appel API `GET /bills`.

**Then**  
Je vois un tableau contenant :
- Type
- Nom
- Date
- Montant
- Statut
- Actions  

Les notes sont triées de la plus récente à la plus ancienne.

---

## Scénario n°5 : Navigation vers la création d'une nouvelle note de frais

**Given**  
Je suis connecté en tant qu'employé et je suis sur la page Bills.

**When**  
Je clique sur le bouton **"Nouvelle note de frais"**.

**Then**  
Je suis redirigé vers la page **"Envoyer une note de frais"**  
avec un formulaire vierge.

---

## Scénario n°6 : Validation du formulaire de création – champs requis

**Given**  
Je suis connecté et sur la page de création d'une nouvelle note de frais.

**When**  
Je tente de soumettre le formulaire sans remplir tous les champs obligatoires :
- Type de dépense
- Nom de la dépense
- Date
- Montant
- TVA
- Justificatif

**Then**  
Le formulaire bloque la soumission et indique les champs manquants.

---

## Scénario n°7 : Upload de justificatif avec extension valide

**Given**  
Je suis sur la page de création d'une note de frais.

**When**  
Je sélectionne un fichier avec l’extension :
- `.jpg`
- `.jpeg`
- `.png`

**Then**  
Le fichier est accepté, uploadé via l’API `POST`,  
son nom s’affiche et aucune erreur n’apparaît.

---

## Scénario n°8 : Upload de justificatif avec extension non autorisée

**Given**  
Je suis sur la page de création d'une note de frais.

**When**  
Je sélectionne un fichier avec une extension non autorisée  
(ex : `.pdf`, `.gif`, `.doc`).

**Then**  
- Le fichier est rejeté  
- Le champ est vidé  
- Un message d’erreur s’affiche :  
  > *"Les fichiers autorisés sont : jpg, jpeg ou png"*  

Le formulaire reste bloqué.

---

## Scénario n°9 : Création réussie d'une nouvelle note de frais

**Given**  
Je suis sur la page de création et j’ai uploadé un justificatif valide.

**When**  
Je remplis tous les champs obligatoires et clique sur **"Envoyer"**.

**Then**  
- La note est créée avec le statut `pending` (`POST new bill`)
- Elle est mise à jour via `PATCH`
- Je suis redirigé vers la page Bills
- La note apparaît avec le statut **"En attente"**

---

## Scénario n°10 : Visualisation d'un justificatif depuis la liste

**Given**  
Je suis sur la page Bills avec des notes contenant des justificatifs.

**When**  
Je clique sur l’icône **œil** dans la colonne Actions.

**Then**  
Une modale s’ouvre et affiche l’image du justificatif,  
redimensionnée à la fenêtre.

---

## Scénario n°11 : Test de l'appel API GET bills

**Given**  
Je suis connecté en tant qu'employé.

**When**  
L’appel API `GET /bills` est effectué.

**Then**  
- Réponse `200 OK`
- Données JSON valides
- Dates formatées
- Statuts traduits en français

---

## Scénario n°12 : Test de l'appel API POST new bill

**Given**  
Le formulaire est correctement rempli avec un justificatif valide.

**When**  
Je clique sur **"Envoyer"**.

**Then**  
- Réponse `201 Created`
- La note est créée puis mise à jour
- Redirection vers la page Bills

---

## Scénario n°13 : Gestion des erreurs API 404

**Given**  
Je suis sur la page Bills.

**When**  
L’appel API `GET /bills` retourne une erreur `404`.

**Then**  
Un message **"Erreur 404"** s’affiche sans faire planter l’application.

---

## Scénario n°14 : Gestion des erreurs API 500

**Given**  
Je suis sur la page Bills.

**When**  
L’appel API `GET /bills` retourne une erreur `500`.

**Then**  
Un message **"Erreur 500"** s’affiche avec une option pour réessayer.

---

## Scénario n°15 : Déconnexion de l'employé

**Given**  
Je suis connecté (page Bills ou création).

**When**  
Je clique sur **"Se déconnecter"**.

**Then**  
- Le token JWT est supprimé
- Les données utilisateur sont nettoyées
- Redirection vers la page Login

---

## Scénario n°16 : Navigation avec le bouton retour du navigateur

**Given**  
Je suis sur la page de création d'une note de frais.

**When**  
Je clique sur le bouton **Retour** du navigateur.

**Then**  
Je suis redirigé vers la page Bills.

---

## Fin du plan de test
