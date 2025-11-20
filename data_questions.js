// BANQUE DE QUESTIONS (V3 - EXTENDED)
// Pour atteindre 300 questions, nous utilisons un mélange de questions statiques et de générateurs.

const STATIC_QUESTIONS = [
    // --- ARCHITECTURE ---
    { cat: "ARCHI", q: "Quel composant exécute les instructions ?", a: ["CPU", "RAM", "SSD", "GPU"], ok: 0 },
    { cat: "ARCHI", q: "Que signifie ALU ?", a: ["Arithmetic Logic Unit", "All Logic Union", "Array Link Unit", "Auto Load Unit"], ok: 0 },
    { cat: "ARCHI", q: "Combien de bits dans un octet ?", a: ["8", "16", "4", "32"], ok: 0 },
    { cat: "ARCHI", q: "En hexadécimal, F vaut ?", a: ["15", "16", "10", "12"], ok: 0 },
    { cat: "ARCHI", q: "Quelle mémoire est volatile ?", a: ["RAM", "ROM", "Disque Dur", "Flash"], ok: 0 },
    { cat: "ARCHI", q: "Le bus de données transporte...", a: ["Des données", "Des adresses", "Du courant", "Des instructions"], ok: 0 },
    { cat: "ARCHI", q: "Rôle du Registre PC ?", a: ["Pointe la prochaine instruction", "Stocke le résultat", "Compte les cycles", "Refroidit le CPU"], ok: 0 },
    
    // --- TELECOM / SIGNAL ---
    { cat: "SIGNAL", q: "Unité de la fréquence ?", a: ["Hertz", "Watt", "Joule", "Volt"], ok: 0 },
    { cat: "SIGNAL", q: "Vitesse de la lumière (approx) ?", a: ["300 000 km/s", "340 m/s", "1000 km/h", "Infini"], ok: 0 },
    { cat: "SIGNAL", q: "Formule de la période T ?", a: ["1/f", "f*2", "2*pi*f", "f/10"], ok: 0 },
    { cat: "SIGNAL", q: "Type de signal du son ?", a: ["Analogique", "Numérique", "Binaire", "Quantique"], ok: 0 },
    { cat: "SIGNAL", q: "Quel câble pour la fibre ?", a: ["Verre", "Cuivre", "Or", "Aluminium"], ok: 0 },
    
    // --- ELEC ---
    { cat: "ELEC", q: "Loi d'Ohm ?", a: ["U = R x I", "U = R / I", "U = I / R", "U = R + I"], ok: 0 },
    { cat: "ELEC", q: "Unité de la résistance ?", a: ["Ohm", "Ampère", "Volt", "Watt"], ok: 0 },
    { cat: "ELEC", q: "Composant qui stocke l'énergie ?", a: ["Condensateur", "Résistance", "Diode", "Transistor"], ok: 0 },
    { cat: "ELEC", q: "Symbole de la diode ?", a: ["Triangle + Barre", "Rectangle", "Zigzag", "Deux barres //"], ok: 0 },
    
    // --- WEB / INFO ---
    { cat: "WEB", q: "Balise pour le plus grand titre ?", a: ["h1", "head", "title", "big"], ok: 0 },
    { cat: "WEB", q: "Signification de CSS ?", a: ["Cascading Style Sheets", "Computer Style System", "Creative Style Sheet", "Code Super Simple"], ok: 0 },
    { cat: "WEB", q: "Langage pour la logique web ?", a: ["JavaScript", "HTML", "CSS", "SQL"], ok: 0 },
    { cat: "WEB", q: "Port par défaut du HTTP ?", a: ["80", "443", "21", "22"], ok: 0 },
    
    // --- MATHS RAPIDES ---
    { cat: "MATH", q: "Dérivée de x² ?", a: ["2x", "x", "1", "x²"], ok: 0 },
    { cat: "MATH", q: "cos(0) = ?", a: ["1", "0", "-1", "pi"], ok: 0 },
    { cat: "MATH", q: "Racine de 144 ?", a: ["12", "14", "10", "11"], ok: 0 },
    { cat: "MATH", q: "2^10 = ?", a: ["1024", "512", "2048", "100"], ok: 0 }
];

// Générateur procédural pour atteindre un volume infini
function generateMathQuestion() {
    const types = ['ADD', 'SUB', 'MULT', 'BIN'];
    const type = types[Math.floor(Math.random() * types.length)];
    let q, r, a;

    if (type === 'ADD') {
        let x = Math.floor(Math.random() * 100);
        let y = Math.floor(Math.random() * 100);
        q = `${x} + ${y} ?`;
        r = x + y;
    } else if (type === 'SUB') {
        let x = Math.floor(Math.random() * 100) + 50;
        let y = Math.floor(Math.random() * 50);
        q = `${x} - ${y} ?`;
        r = x - y;
    } else if (type === 'MULT') {
        let x = Math.floor(Math.random() * 12);
        let y = Math.floor(Math.random() * 10);
        q = `${x} x ${y} ?`;
        r = x * y;
    } else if (type === 'BIN') {
        let x = Math.floor(Math.random() * 15);
        q = `${x} en binaire ?`;
        r = x.toString(2);
    }

    // Génération mauvaises réponses
    let answers = [r.toString()];
    while(answers.length < 4) {
        let fake;
        if(type === 'BIN') {
            fake = (Math.floor(Math.random() * 15)).toString(2);
        } else {
            fake = (parseInt(r) + Math.floor(Math.random() * 10) - 5).toString();
        }
        if(!answers.includes(fake)) answers.push(fake);
    }
    
    // Shuffle
    answers.sort(() => Math.random() - 0.5);
    
    return {
        cat: "CALCUL",
        q: q,
        a: answers,
        ok: answers.indexOf(r.toString())
    };
}

// API Principale pour récupérer une question
function getQuestion() {
    // 60% de chance d'avoir une question statique (cours), 40% math procédural
    if(Math.random() > 0.4) {
        const q = STATIC_QUESTIONS[Math.floor(Math.random() * STATIC_QUESTIONS.length)];
        // Clone pour shuffle les réponses sans toucher l'original
        let indices = [0,1,2,3].sort(() => Math.random() - 0.5);
        let shuffledAnswers = indices.map(i => q.a[i]);
        return {
            cat: q.cat,
            q: q.q,
            a: shuffledAnswers,
            ok: indices.indexOf(q.ok)
        };
    } else {
        return generateMathQuestion();
    }
}
