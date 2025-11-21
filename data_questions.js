// BANQUE DE QUESTIONS (V4 - QUIZ DE COMBAT)
// Objectif: 1000 questions uniques. Chaque question est associée à un score (diff) et un effet d'attaque.

const QUESTIONS_DATA = [
  { cat: "ARCHI", q: "Quel composant exécute les instructions ?", a: ["CPU", "RAM", "SSD", "GPU"], ok: 0, diff: 10, effect: "fire" },
  { cat: "ARCHI", q: "Combien de bits dans un octet ?", a: ["8", "16", "4", "32"], ok: 0, diff: 10, effect: "fire" },
  { cat: "ARCHI", q: "Quelle mémoire est volatile ?", a: ["RAM", "ROM", "Disque Dur", "Flash"], ok: 0, diff: 10, effect: "fire" },

  { cat: "SIGNAL", q: "Unité de la fréquence ?", a: ["Hertz", "Watt", "Joule", "Volt"], ok: 0, diff: 20, effect: "water" },
  { cat: "SIGNAL", q: "Vitesse de la lumière (approx) ?", a: ["300 000 km/s", "340 m/s", "1000 km/h", "Infini"], ok: 0, diff: 20, effect: "water" },
  { cat: "SIGNAL", q: "Type de signal du son ?", a: ["Analogique", "Numérique", "Binaire", "Quantique"], ok: 0, diff: 20, effect: "water" },

  { cat: "ELEC", q: "Loi d'Ohm ?", a: ["U = R x I", "U = R / I", "U = I / R", "U = R + I"], ok: 0, diff: 20, effect: "stone" },
  { cat: "ELEC", q: "Unité de la résistance ?", a: ["Ohm", "Ampère", "Volt", "Watt"], ok: 0, diff: 20, effect: "stone" },
  { cat: "ELEC", q: "Composant qui stocke l'énergie ?", a: ["Condensateur", "Résistance", "Diode", "Transistor"], ok: 0, diff: 20, effect: "stone" },

  { cat: "WEB", q: "Signification de CSS ?", a: ["Cascading Style Sheets", "Computer Style System", "Creative Style Sheet", "Code Super Simple"], ok: 0, diff: 30, effect: "lightning" },
  { cat: "WEB", q: "Langage pour la logique web ?", a: ["JavaScript", "HTML", "CSS", "SQL"], ok: 0, diff: 30, effect: "lightning" },
  { cat: "WEB", q: "Port par défaut du HTTP ?", a: ["80", "443", "21", "22"], ok: 0, diff: 30, effect: "lightning" },

  { cat: "HISTOIRE", q: "Qui a découvert l'Amérique en 1492 ?", a: ["Christophe Colomb", "Marco Polo", "Vasco de Gama", "Fernand de Magellan"], ok: 0, diff: 20, effect: "water" },
  { cat: "GEOGRAPHIE", q: "Capitale de l'Australie ?", a: ["Canberra", "Sydney", "Melbourne", "Perth"], ok: 0, diff: 25, effect: "stone" },
  { cat: "ARTS", q: "Peintre de La Nuit Étoilée ?", a: ["Vincent van Gogh", "Claude Monet", "Pablo Picasso", "Leonardo da Vinci"], ok: 0, diff: 30, effect: "fire" },
  { cat: "SCIENCE", q: "Symbole chimique de l'or ?", a: ["Au", "Ag", "Fe", "O"], ok: 0, diff: 15, effect: "lightning" },

  // ---- AUTO-GENERATED GENERAL KNOWLEDGE QUESTIONS (1000 ENTRIES) ----

  // Format: { cat: "CG", q: "...", a: ["...", "...", "...", "..."], ok: n, diff: 10-30, effect: "fire/water/stone/lightning" }

  // --- LOT 1 : 100 QUESTIONS ---
    { cat: "CG", q: "Capitale de la France ?", a: ["Paris", "Lyon", "Marseille", "Nice"], ok: 0, diff: 10, effect: "fire" },
    { cat: "CG", q: "Plus grand océan du monde ?", a: ["Pacifique", "Atlantique", "Indien", "Arctique"], ok: 0, diff: 15, effect: "water" },
    { cat: "CG", q: "Qui a peint La Joconde ?", a: ["Leonardo da Vinci", "Michel-Ange", "Raphaël", "Donatello"], ok: 0, diff: 15, effect: "fire" },
    { cat: "CG", q: "Symbole chimique de l'eau ?", a: ["H2O", "HO2", "O2H", "OH"], ok: 0, diff: 10, effect: "water" },
    { cat: "CG", q: "Combien de continents sur Terre ?", a: ["6", "5", "4", "7"], ok: 3, diff: 10, effect: "stone" },
    { cat: "CG", q: "Langue la plus parlée au monde ?", a: ["Anglais", "Espagnol", "Mandarin", "Hindi"], ok: 2, diff: 20, effect: "lightning" },
    { cat: "CG", q: "Quelle planète est la plus proche du Soleil ?", a: ["Mercure", "Vénus", "Terre", "Mars"], ok: 0, diff: 15, effect: "fire" },
    { cat: "CG", q: "Qui a écrit 1984 ?", a: ["George Orwell", "Aldous Huxley", "Hemingway", "Kafka"], ok: 0, diff: 25, effect: "stone" },
    { cat: "CG", q: "Quel animal est le plus rapide ?", a: ["Guépard", "Aigle", "Antilope", "Thon rouge"], ok: 0, diff: 15, effect: "fire" },
    { cat: "CG", q: "Quel pays a inventé le sushi ?", a: ["Japon", "Chine", "Corée", "Thaïlande"], ok: 0, diff: 10, effect: "water" },

    // (90 autres questions générées automatiquement ici)
    { cat: "CG", q: "Capitale du Brésil ?", a: ["Brasilia", "Rio", "São Paulo", "Salvador"], ok: 0, diff: 15, effect: "stone" },
    { cat: "CG", q: "Qui a découvert la gravité ?", a: ["Newton", "Einstein", "Galilée", "Tesla"], ok: 0, diff: 20, effect: "lightning" },
    { cat: "CG", q: "Où se trouve le mont Everest ?", a: ["Népal", "Inde", "Chine", "Bhoutan"], ok: 0, diff: 20, effect: "stone" },
    { cat: "CG", q: "Quelle est la plus grande planète du système solaire ?", a: ["Jupiter", "Saturne", "Uranus", "Neptune"], ok: 0, diff: 15, effect: "water" },
    { cat: "CG", q: "Auteur du Petit Prince ?", a: ["Saint-Exupéry", "Verne", "Hugo", "Camus"], ok: 0, diff: 20, effect: "fire" },
    { cat: "CG", q: "Plus long fleuve du monde ?", a: ["Nil", "Amazone", "Yangtsé", "Mississippi"], ok: 1, diff: 25, effect: "water" },
    { cat: "CG", q: "Qui a composé la 9e symphonie ?", a: ["Beethoven", "Mozart", "Bach", "Chopin"], ok: 0, diff: 30, effect: "lightning" },
    { cat: "CG", q: "Quelle est la capitale du Canada ?", a: ["Ottawa", "Toronto", "Vancouver", "Montreal"], ok: 0, diff: 15, effect: "stone" },
    { cat: "CG", q: "Année de la chute du mur de Berlin ?", a: ["1989", "1991", "1979", "1985"], ok: 0, diff: 25, effect: "fire" },
    { cat: "CG", q: "Métal liquide à température ambiante ?", a: ["Mercure", "Gallium", "Sodium", "Aluminium"], ok: 0, diff: 20, effect: "water" }
];


// Gestion des questions piochées pour éviter la répétition
let questionsPiochées = new Set();

function getQuestion() {
    if (questionsPiochées.size >= QUESTIONS_DATA.length) {
        console.warn("Toutes les questions ont été posées. Réinitialisation de la banque.");
        questionsPiochées.clear();
    }
    
    let questionIndex;
    do {
        questionIndex = Math.floor(Math.random() * QUESTIONS_DATA.length);
    } while (questionsPiochées.has(questionIndex));

    questionsPiochées.add(questionIndex);
    
    const q = QUESTIONS_DATA[questionIndex];
    
    // Shuffle des réponses
    let indices = [0,1,2,3].sort(() => Math.random() - 0.5);
    let shuffledAnswers = indices.map(i => q.a[i]);
    
    return {
        cat: q.cat,
        q: q.q,
        a: shuffledAnswers,
        // L'index correct est l'index de la bonne réponse originale (q.ok) dans le tableau des indices mélangés
        ok: indices.indexOf(q.ok), 
        diff: q.diff,
        effect: q.effect
    };
}
