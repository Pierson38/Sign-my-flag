export type Lang = "fr" | "en";

export const translations = {
  fr: {
    // Header
    title: "Signe mon drapeau !",
    subtitle: "Clique sur une zone libre du drapeau pour y laisser ton message",

    // Welcome modal
    welcomeTitle: "Bienvenue !",
    welcomeIntro:
      "Julien est en echange a San Diego et il aimerait que tout le monde signe son drapeau de Californie, comme le veut la tradition !",
    welcomeStep1: "Clique sur une zone libre du drapeau (les zones vides)",
    welcomeStep2: "Remplis le formulaire avec ton prenom, ton nom et ton message",
    welcomeStep3: "Tu peux choisir une couleur et ajouter une image",
    welcomeStep4: "Ton message apparaitra directement sur le drapeau",
    welcomeHowTitle: "Comment ca marche ?",
    welcomeLangQuestion: "Dans quelle langue veux-tu le site ?",
    welcomeStart: "C'est parti !",

    // Form
    formTitle: "Signe le drapeau !",
    formFirstName: "Prenom",
    formLastName: "Nom",
    formEmail: "Email",
    formMessage: "Message",
    formMessagePlaceholder: "Ton message pour Julien...",
    formColor: "Couleur",
    formImage: "Image (optionnel)",
    formAddImage: "+ Ajouter une image",
    formPreview: "Apercu sur le drapeau",
    formPreviewFirstName: "Prenom",
    formPreviewMessage: "ton message",
    formCancel: "Annuler",
    formSubmit: "Signer !",
    formSubmitting: "Envoi...",
    formCells: "cellule",
    formCellsPlural: "cellules",
    formMaxHere: "max {n} ici",
    formAllRequired: "Tous les champs sont requis.",
    formImageTooLarge: "Image trop volumineuse (max 2 Mo).",
    formUploadError: "Erreur lors de l'upload.",
    formError: "Une erreur est survenue.",
    formConnectionError: "Erreur de connexion.",

    // Flag
    signatures: "signature",
    signaturesPlural: "signatures",
    places: "place",
    placesPlural: "places",

    // Viewing message
    viewClose: "Fermer",

    // Zoom
    zoomIn: "Zoomer",
    zoomOut: "Dezoomer",
    zoomReset: "Reset zoom",

    // Language
    langLabel: "FR",
  },
  en: {
    // Header
    title: "Sign my flag!",
    subtitle: "Click on a free zone of the flag to leave your message",

    // Welcome modal
    welcomeTitle: "Welcome!",
    welcomeIntro:
      "Julien is on exchange in San Diego and would love for everyone to sign his California flag, as tradition goes!",
    welcomeStep1: "Click on a free zone of the flag (the empty areas)",
    welcomeStep2: "Fill in the form with your first name, last name, and message",
    welcomeStep3: "You can choose a color and add an image",
    welcomeStep4: "Your message will appear directly on the flag",
    welcomeHowTitle: "How does it work?",
    welcomeLangQuestion: "Which language do you want?",
    welcomeStart: "Let's go!",

    // Form
    formTitle: "Sign the flag!",
    formFirstName: "First name",
    formLastName: "Last name",
    formEmail: "Email",
    formMessage: "Message",
    formMessagePlaceholder: "Your message for Julien...",
    formColor: "Color",
    formImage: "Image (optional)",
    formAddImage: "+ Add an image",
    formPreview: "Preview on the flag",
    formPreviewFirstName: "Name",
    formPreviewMessage: "your message",
    formCancel: "Cancel",
    formSubmit: "Sign!",
    formSubmitting: "Sending...",
    formCells: "cell",
    formCellsPlural: "cells",
    formMaxHere: "max {n} here",
    formAllRequired: "All fields are required.",
    formImageTooLarge: "Image too large (max 2 MB).",
    formUploadError: "Upload error.",
    formError: "An error occurred.",
    formConnectionError: "Connection error.",

    // Flag
    signatures: "signature",
    signaturesPlural: "signatures",
    places: "spot",
    placesPlural: "spots",

    // Viewing message
    viewClose: "Close",

    // Zoom
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    zoomReset: "Reset zoom",

    // Language
    langLabel: "EN",
  },
} as const;

export type Translations = {
  [K in keyof (typeof translations)["fr"]]: string;
};

export function t(lang: Lang): Translations {
  return translations[lang];
}
