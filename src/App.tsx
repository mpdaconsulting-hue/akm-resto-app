import { useState, useRef, useEffect } from "react";

// ─── CONFIG ──────────────────────────────────────────────────
const TALLY_FORM_URL = "https://tally.so/r/b56aM7";

// 🎨 Palette pro (inspirée Uber Eats / Deliveroo)
const COLORS = {
  primary: "#FF4F18",       // Orange punchy
  primaryDark: "#D63A0F",
  primaryLight: "#FF6B3D",
  accent: "#FFB800",        // Jaune (rappel logo)
  bg: "#FCFAF7",            // Cream très clair
  bgAlt: "#F5F1EB",
  card: "#FFFFFF",
  ink: "#1B1B1B",           // Noir doux
  inkSoft: "#4A4A4A",
  muted: "#8A8580",
  border: "#EDE7DF",
  borderSoft: "#F5F0E8",
  success: "#22A06B",
  danger: "#E8400C",
};

// 🥬 CRUDITÉS
const CRUDITES = ["Salade", "Tomates", "Oignons", "Concombre", "Cornichons", "Olives"];
const CRUDITES_AUCUNE = "Sans crudités";

// 🥫 SAUCES (max 2 + sans sauce exclusif)
const SAUCES = ["Blanche", "Algérienne", "Harissa", "Ketchup", "Barbecue", "Burger", "Andalouse", "Sans sauce"];
const MAX_SAUCES = 2;

// 🥩 VIANDES (choix viande principale + supplément viande)
const VIANDES = ["Poulet pané", "Poulet mariné", "Kébab", "Kofté", "Boeuf haché", "Merguez", "Américain (steack)", "Falafel"];
const VIANDES_SUPP = ["Kébab", "Poulet pané", "Poulet mariné", "Kofté", "Boeuf haché", "Merguez", "Américain"];

// ➕ SUPPLÉMENTS classiques (sans viande, viande = section dédiée)
const SUPPLEMENTS = [
  { name: "Oeuf", price: 1, allergenes: ["O"] },
  { name: "Féta", price: 1, allergenes: ["L"] },
  { name: "Munster", price: 1, allergenes: ["L"] },
  { name: "Galette de pdt", price: 1, allergenes: ["G"] },
];
const PRIX_SUPP_VIANDE = 3;

// 🍟 SIDES
const SIDES = ["Frites", "Boulgour"];

// 🥤 BOISSONS FORMULE (boisson 33cl incluse)
const BOISSONS_FORMULE = [
  { name: "Coca-Cola", emoji: "🥤" },
  { name: "Coca Zéro", emoji: "🥤" },
  { name: "Fanta Orange", emoji: "🥤" },
  { name: "Sprite", emoji: "🥤" },
  { name: "Ice Tea Pêche", emoji: "🍑" },
  { name: "Oasis Tropical", emoji: "🌴" },
  { name: "Sirop Menthe", emoji: "🌿" },
  { name: "Sirop Grenadine", emoji: "🍷" },
  { name: "Sirop Fraise", emoji: "🍓" },
  { name: "Sirop Citron", emoji: "🍋" },
  { name: "Sirop Pêche", emoji: "🍑" },
];
const DEFAULT_BOISSON_FORMULE = "Coca-Cola";

// 🍺 BOISSONS SUPPLÉMENT (multi, prix ajouté)
const BOISSONS_SUPPLEMENT = [
  { name: "Sirop", price: 1.50, group: "Sodas" },
  { name: "Canette 33cl Coca", price: 2.00, group: "Sodas" },
  { name: "Canette 33cl Coca Zéro", price: 2.00, group: "Sodas" },
  { name: "Canette 33cl Fanta", price: 2.00, group: "Sodas" },
  { name: "Canette 33cl Sprite", price: 2.00, group: "Sodas" },
  { name: "Canette 33cl Ice Tea", price: 2.00, group: "Sodas" },
  { name: "Canette 33cl Oasis", price: 2.00, group: "Sodas" },
  { name: "Diabolo", price: 2.50, group: "Sodas" },
  { name: "Redbull 25cl", price: 3.00, group: "Sodas" },
  { name: "Bière pression", price: 3.00, group: "Bières", allergenes: ["G"] },
  { name: "Picon bière", price: 3.50, group: "Bières", allergenes: ["G"] },
  { name: "Amer Blaise", price: 3.50, group: "Bières", allergenes: ["G"] },
  { name: "Efes (turque)", price: 3.50, group: "Bières", allergenes: ["G"] },
  { name: "Bière artisanale", price: 5.00, group: "Bières", allergenes: ["G"] },
  { name: "Désperados/Smirnoff", price: 4.50, group: "Bières", allergenes: ["G"] },
  { name: "Vin au verre", price: 3.00, group: "Vins", allergenes: ["SU"] },
  { name: "Kir/Martini", price: 3.50, group: "Vins", allergenes: ["SU"] },
  { name: "Café", price: 1.50, group: "Café" },
];

const CATEGORIES_AVEC_BOISSONS = ["burgers","burgersSpeciaux","wraps","gundi","sandwichs","salades","assiettes","petiteFaim","desserts"];

// 🕐 HORAIRES
const HORAIRES_AKM = {
  0: { name: "Dimanche", services: [["11:45","14:00"], ["18:00","22:00"]] },
  1: { name: "Lundi",    ferme: true },
  2: { name: "Mardi",    services: [["11:45","14:00"], ["18:00","22:00"]] },
  3: { name: "Mercredi", services: [["11:45","14:00"], ["18:00","22:00"]] },
  4: { name: "Jeudi",    services: [["11:45","14:00"], ["18:00","22:00"]] },
  5: { name: "Vendredi", services: [["11:45","14:00"], ["18:00","23:00"]] },
  6: { name: "Samedi",   services: [["11:45","14:00"], ["18:00","23:00"]] },
};

// ⚠️ Allergènes (codes courts)
const ALLERGENES_LABELS = {
  G: "Gluten", L: "Lactose", O: "Œufs", P: "Poisson",
  F: "Fruits à coque", M: "Moutarde", S: "Sésame", SU: "Sulfites"
};

const fmt = (n) => n.toFixed(2).replace(".", ",") + " €";

// ─── CATEGORIES ──────────────────────────────────────────────
const CATEGORIES = [
  { key: "burgers", label: "Burgers", emoji: "🍔" },
  { key: "burgersSpeciaux", label: "Spéciaux", emoji: "⭐" },
  { key: "wraps", label: "Wraps", emoji: "🌯" },
  { key: "gundi", label: "Gundi", emoji: "🫔" },
  { key: "sandwichs", label: "Sandwichs", emoji: "🥪" },
  { key: "salades", label: "Salades", emoji: "🥗" },
  { key: "assiettes", label: "Assiettes", emoji: "🍽️" },
  { key: "petiteFaim", label: "Petite Faim", emoji: "😋" },
  { key: "enfants", label: "Enfants", emoji: "🧒" },
  { key: "desserts", label: "Desserts", emoji: "🍰" },
  { key: "boissons", label: "Boissons", emoji: "🥤" },
];

// Flags additionnels :
// hasCrudites: true → choix crudités multi-sélection
// allergenes: array → codes courts
const MENU = {
  burgers: [
    { id:"b1", name:"Chicken Burger", desc:"Poulet pané, sauce maison", price:6.50, menuPrice:9.50, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G","O","L"] },
    { id:"b2", name:"Hamburger Classique", desc:"Pain, steak, sauce maison", price:6.50, menuPrice:9.50, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G","L"] },
    { id:"b3", name:"Hamburger Géant", desc:"Steack haché de 180g", price:8.00, menuPrice:11.00, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G","L"] },
    { id:"b4", name:"Paysan", desc:"Steack haché local façon bouchère 100g", price:8.00, menuPrice:11.00, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G","L"] },
    { id:"b5", name:"Patato Végétarien", desc:"Galette de pdt, féta, crudités", price:6.00, menuPrice:9.00, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G","L","O"] },
  ],
  burgersSpeciaux: [
    { id:"bs1", name:"Vosgien Chicken", desc:"Poulet, galette de pdt, bacon, munster", price:8.50, menuPrice:11.50, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G","L","O"] },
    { id:"bs2", name:"Vosgien Classique", desc:"Steack haché, galette de pdt, bacon, munster", price:8.50, menuPrice:11.50, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G","L"] },
    { id:"bs3", name:"Vosgien Géant", desc:"Steack haché 180g, galette de pdt, bacon, munster", price:9.50, menuPrice:12.50, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G","L"] },
    { id:"bs4", name:"Vosgien Paysan", desc:"Steack haché local, galette de pdt, bacon, munster", price:9.50, menuPrice:12.50, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G","L"] },
    { id:"bs5", name:"Raclette Chicken", desc:"Poulet, galette de pdt, lardons, raclette", price:8.50, menuPrice:11.50, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G","L","O"] },
    { id:"bs6", name:"Raclette Classique", desc:"Steack haché, galette de pdt, lardons, raclette", price:8.50, menuPrice:11.50, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G","L"] },
    { id:"bs7", name:"Raclette Géant", desc:"Steack haché 180g, galette de pdt, lardons, raclette", price:9.50, menuPrice:12.50, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G","L"] },
    { id:"bs8", name:"Raclette Paysan", desc:"Steack haché local, galette de pdt, lardons, raclette", price:9.50, menuPrice:12.50, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G","L"] },
  ],
  wraps: [
    { id:"w1", name:"Wrap Classique", desc:"1 viande au choix + crudités", price:7.00, menuPrice:10.00, meatChoice:1, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G"] },
    { id:"w2", name:"Wrap Végétarien", desc:"Crudités, falafels", price:7.00, menuPrice:10.00, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G"] },
    { id:"w3", name:"Wrap Mixte", desc:"2 viandes au choix", price:9.00, menuPrice:12.00, meatChoice:2, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G"] },
    { id:"w4", name:"Wrap Vosgien", desc:"Steack haché, munster, galette de pdt", price:9.50, menuPrice:12.50, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G","L","O"] },
  ],
  gundi: [
    { id:"g1", name:"Gundi Classique", desc:"Wrap, mozza, crudités, galette pdt, féta, oeuf + viande", price:9.00, menuPrice:12.00, meatChoice:1, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G","L","O"] },
    { id:"g2", name:"Gundi Vosgien", desc:"Steack haché, munster, galette de pdt", price:9.00, menuPrice:12.00, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G","L","O"] },
    { id:"g3", name:"Gundi Épinards", desc:"Truite fumée, épinards, crème fraîche, galette pdt, oignons, oeuf, féta", price:10.00, menuPrice:13.00, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G","L","O","P"] },
    { id:"g4", name:"Gundi Mixte", desc:"2 viandes au choix", price:11.00, menuPrice:14.00, meatChoice:2, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G","L","O"] },
  ],
  sandwichs: [
    { id:"s1", name:"Kébab Classique", desc:"Salade, tomates, oignons, viande", price:7.00, menuPrice:10.00, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G"] },
    { id:"s2", name:"Kébab Nature", desc:"Viande seule ou avec tomates/oignons", price:8.00, menuPrice:11.00, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G"] },
    { id:"s3", name:"Kébab Vosgien", desc:"Galette de pdt, oeuf, munster, bacon", price:9.50, menuPrice:12.50, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G","L","O"] },
    { id:"s4", name:"Américain / Kofté / Merguez / Poulet", desc:"1 viande au choix", price:7.00, menuPrice:10.00, meatChoice:1, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G"] },
    { id:"s5", name:"Américain Géant + Frites", desc:"Steack haché de 180g", price:8.50, menuPrice:11.50, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G"] },
    { id:"s6", name:"Américain Paysan + Frites", desc:"Steack haché local", price:9.50, menuPrice:12.50, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G"] },
    { id:"s7", name:"Sandwich Brochette", desc:"Onglet de boeuf de 180g", price:9.50, menuPrice:12.50, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G"] },
    { id:"s8", name:"Yufka", desc:"Galette fine - 1 viande au choix", price:7.00, menuPrice:10.00, meatChoice:1, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G"] },
    { id:"s9", name:"Végétarien", desc:"Crudités, féta", price:6.00, menuPrice:9.00, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G","L"] },
    { id:"s10", name:"Végétarien Falafels", desc:"Crudités, féta, falafels", price:7.00, menuPrice:10.00, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G","L"] },
    { id:"s11", name:"Panini Kébab / Bacon / Poulet / Merguez", desc:"1 viande au choix", price:7.00, menuPrice:10.00, meatChoice:1, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G","L"] },
    { id:"s12", name:"Panini Végétarien", desc:"Emmental, féta, mozza, tomates", price:6.00, menuPrice:9.00, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G","L"] },
    { id:"s13", name:"Pizza Turque (Lahmacun)", desc:"Pâte fine, viande, légumes", price:9.50, menuPrice:12.50, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G"] },
  ],
  salades: [
    { id:"sal1", name:"Salade Kébab", desc:"Salade, crudités, kébab", price:9.00, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:[] },
    { id:"sal2", name:"Salade Vosgienne", desc:"Salade verte, tomates, lardons, galette pdt, munster", price:9.00, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["L"] },
    { id:"sal3", name:"Salade Grecque", desc:"Tomates, salade, concombre, oignons, féta, olives", price:8.00, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["L"] },
    { id:"sal4", name:"Salade Composée & Nuggets", desc:"Salade + nuggets de poulet", price:8.00, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G","O"] },
    { id:"sal5", name:"Salade Végétarienne", desc:"Crudités, falafels", price:8.00, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G"] },
  ],
  assiettes: [
    { id:"a1", name:"Côte de Boeuf", desc:"Maturée 15 jours ~350-400g + crudités", price:21.00, sideChoice:true, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:[] },
    { id:"a2", name:"Entrecôte", desc:"Maturée 15 jours ~220g + crudités", price:17.00, sideChoice:true, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:[] },
    { id:"a3", name:"Brochettes (1 pièce)", desc:"Onglet de boeuf 180g + crudités", price:14.00, sideChoice:true, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:[] },
    { id:"a4", name:"Brochettes (2 pièces)", desc:"Onglet de boeuf 180g x2 + crudités", price:20.00, sideChoice:true, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:[] },
    { id:"a5", name:"Kébab Vosgien", desc:"Galette pdt, oeuf, munster, bacon + crudités", price:14.00, sideChoice:true, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["L","O"] },
    { id:"a6", name:"Kébab / Américain / Poulet Pané / Kofté", desc:"1 viande au choix + crudités", price:11.00, meatChoice:1, sideChoice:true, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["G"] },
    { id:"a7", name:"Poulet Mariné / Merguez / Américain", desc:"1 viande au choix + crudités", price:12.00, meatChoice:1, sideChoice:true, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:[] },
    { id:"a8", name:"Mixte 2 Viandes", desc:"2 viandes au choix + crudités", price:14.00, meatChoice:2, sideChoice:true, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:[] },
    { id:"a9", name:"Mixte 3 Viandes", desc:"3 viandes au choix + crudités", price:17.00, meatChoice:3, sideChoice:true, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:[] },
    { id:"a10", name:"Végétarienne", desc:"Crudités, concombre, féta", price:9.50, sideChoice:true, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["L"] },
    { id:"a11", name:"Végétarienne Falafels", desc:"Crudités, concombre, féta, falafels", price:11.00, sideChoice:true, hasSauces:true, hasSupplements:true, hasCrudites:true, allergenes:["L","G"] },
  ],
  petiteFaim: [
    { id:"pf1", name:"Mini Yufka ou Mini Kébab", desc:"", price:4.50, hasSauces:true, allergenes:["G"] },
    { id:"pf2", name:"Mini Burger / 5 Nuggets / Mini Wrap", desc:"Poulet pané", price:3.50, hasSauces:true, allergenes:["G"] },
    { id:"pf3", name:"Barquette de Viande (petite)", desc:"", price:6.00, hasSauces:true, allergenes:[] },
    { id:"pf4", name:"Barquette de Viande (moyenne)", desc:"", price:7.00, hasSauces:true, allergenes:[] },
    { id:"pf5", name:"Barquette de Viande (grande)", desc:"", price:8.00, hasSauces:true, allergenes:[] },
    { id:"pf6", name:"Frites (petite)", desc:"", price:2.50, hasSauces:true, allergenes:[] },
    { id:"pf7", name:"Frites (moyenne)", desc:"", price:3.50, hasSauces:true, allergenes:[] },
    { id:"pf8", name:"Frites (grande)", desc:"", price:4.50, hasSauces:true, allergenes:[] },
    { id:"pf9", name:"Potatoes (petite)", desc:"", price:3.00, hasSauces:true, allergenes:[] },
    { id:"pf10", name:"Potatoes (moyenne)", desc:"", price:4.00, hasSauces:true, allergenes:[] },
    { id:"pf11", name:"Potatoes (grande)", desc:"", price:5.00, hasSauces:true, allergenes:[] },
    { id:"pf12", name:"Hot Dog", desc:"", price:5.00, menuPrice:8.00, hasSauces:true, hasSupplements:true, allergenes:["G","L"] },
    { id:"pf13", name:"Chicken Filet", desc:"Filet de poulet pané PP", price:1.00, hasSauces:true, allergenes:["G","O"], allowDirectQuantity:true, maxDirectQuantity:20 },
  ],
  enfants: [
    { id:"e1g", name:"Kilyan Box (Garçon)", desc:"1 petit burger OU 5 nuggets OU viande kébab OU wrap poulet OU falafel + petite frite + jus 20cl + SURPRISE", price:7.00, meatChoice:1, hasSauces:true, allergenes:["G","O"] },
    { id:"e1f", name:"Yélize Box (Fille)", desc:"1 petit burger OU 5 nuggets OU viande kébab OU wrap poulet OU falafel + petite frite + jus 20cl + SURPRISE", price:7.00, meatChoice:1, hasSauces:true, allergenes:["G","O"] },
  ],
  desserts: [
    { id:"d1", name:"Tarte Tatin", desc:"Pommes caramélisées", price:4.00, allergenes:["G","L","O"] },
    { id:"d2", name:"Glace Ben & Jerry's", desc:"Cookie Dough ou Chocolate Fudge Brownie", price:4.00, allergenes:["L","G","O"] },
    { id:"d3", name:"Tiramisu", desc:"Spéculos ou café", price:4.00, allergenes:["L","O","G"] },
    { id:"d4", name:"Crêpe au Sucre", desc:"", price:3.00, allergenes:["G","L","O"] },
    { id:"d5", name:"Crêpe Garnie", desc:"Pâte à tartiner, caramel, fraise ou myrtille", price:3.50, allergenes:["G","L","O","F"] },
    { id:"d6", name:"Muffin Vanille-Chocolat", desc:"", price:2.50, allergenes:["G","L","O"] },
    { id:"d7", name:"Cookies Tout Chocolat", desc:"", price:2.50, allergenes:["G","L","O"] },
    { id:"d8", name:"Café", desc:"", price:1.50, allergenes:[] },
    { id:"d9", name:"Liqueur de Bluets des Vosges", desc:"", price:3.00, allergenes:["SU"] },
  ],
  boissons: [
    { id:"bo1", name:"Sirop", desc:"Menthe, grenadine, fraise, citron, pêche", price:1.50 },
    { id:"bo2a", name:"Canette 33cl Coca-Cola", desc:"", price:2.00 },
    { id:"bo2b", name:"Canette 33cl Coca Zéro", desc:"", price:2.00 },
    { id:"bo2c", name:"Canette 33cl Fanta Orange", desc:"", price:2.00 },
    { id:"bo2d", name:"Canette 33cl Sprite", desc:"", price:2.00 },
    { id:"bo2e", name:"Canette 33cl Ice Tea Pêche", desc:"", price:2.00 },
    { id:"bo2f", name:"Canette 33cl Oasis Tropical", desc:"", price:2.00 },
    { id:"bo3", name:"Diabolo", desc:"", price:2.50 },
    { id:"bo4", name:"Redbull 25cl", desc:"", price:3.00 },
    { id:"bo5", name:"Bière Pression", desc:"", price:3.00, allergenes:["G"] },
    { id:"bo6", name:"Picon Bière", desc:"", price:3.50, allergenes:["G"] },
    { id:"bo7", name:"Amer Blaise (Mirabelle)", desc:"", price:3.50, allergenes:["G"] },
    { id:"bo8", name:"Bière Artisanale", desc:"", price:5.00, allergenes:["G"] },
    { id:"bo9", name:"Efes (Bière Turque)", desc:"", price:3.50, allergenes:["G"] },
    { id:"bo10", name:"Désperados / Smirnoff", desc:"", price:4.50, allergenes:["G"] },
    { id:"bo11", name:"Kir Cassis / Mirabelle / Martini", desc:"", price:3.50, allergenes:["SU"] },
    { id:"bo12", name:"Vin au Verre", desc:"Rouge, rosé ou blanc", price:3.00, allergenes:["SU"] },
    { id:"bo13", name:"Bordeaux 75cl", desc:"", price:15.00, allergenes:["SU"] },
    { id:"bo14", name:"Rosé Lâl ou Rouge Yakut 37,5cl", desc:"Vin turc", price:9.00, allergenes:["SU"] },
    { id:"bo15", name:"Rosé Lâl ou Rouge Yakut 75cl", desc:"Vin turc", price:15.00, allergenes:["SU"] },
  ],
};

// ─── HELPERS ─────────────────────────────────────────────────
const MONTHS_FR = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];

function formatTime(date) {
  return `${date.getHours()}h${String(date.getMinutes()).padStart(2,'0')}`;
}
function getDayLabel(date, dayOffset) {
  if (dayOffset === 0) return "Aujourd'hui";
  if (dayOffset === 1) return "Demain";
  return `${HORAIRES_AKM[date.getDay()].name} ${date.getDate()} ${MONTHS_FR[date.getMonth()]}`;
}
function getDayFullLabel(date) {
  return `${HORAIRES_AKM[date.getDay()].name} ${date.getDate()} ${MONTHS_FR[date.getMonth()]}`;
}

function generateTimeSlots() {
  const now = new Date();
  const result = [];
  for (let offset = 0; offset < 8 && result.length < 2; offset++) {
    const day = new Date(now);
    day.setDate(day.getDate() + offset);
    day.setHours(0,0,0,0);
    const info = HORAIRES_AKM[day.getDay()];
    if (info.ferme) continue;

    const slots = [];
    for (const [openS, closeS] of info.services) {
      const [oH,oM] = openS.split(':').map(Number);
      const [cH,cM] = closeS.split(':').map(Number);
      const openD = new Date(day); openD.setHours(oH,oM,0,0);
      const lastOrder = new Date(day); lastOrder.setHours(cH,cM,0,0);
      lastOrder.setMinutes(lastOrder.getMinutes() - 30);

      let start = new Date(openD);
      if (offset === 0) {
        const min = new Date(now.getTime() + 30*60000);
        if (min > start) start = new Date(min);
        const m = start.getMinutes();
        const rounded = Math.ceil(m / 10) * 10;
        if (rounded === 60) { start.setHours(start.getHours()+1, 0, 0, 0); }
        else { start.setMinutes(rounded, 0, 0); }
      }
      if (start > lastOrder) continue;
      const current = new Date(start);
      while (current <= lastOrder) {
        slots.push(new Date(current));
        current.setMinutes(current.getMinutes() + 10);
      }
    }
    if (slots.length > 0) result.push({ day, dayOffset: offset, slots });
  }
  return result;
}

function buildOrderPayload(cart, total, creneauLabel) {
  const entries = Object.values(cart);
  const recap = entries.map((entry, index) => {
    const { item, qty, unitPrice, options } = entry;
    const details = [];
    if (item.menuPrice) details.push(options?.formule ? "Formule menu" : "Article seul");
    if (options?.viandes?.length) details.push(`Viande(s) : ${options.viandes.join(", ")}`);
    if (options?.side) details.push(`Accompagnement : ${options.side}`);
    if (options?.crudites?.length) details.push(`Crudités : ${options.crudites.join(", ")}`);
    if (options?.crudites === "none") details.push(`Sans crudités`);
    if (options?.boissonFormule) details.push(`Boisson formule : ${options.boissonFormule}`);
    if (options?.sauces?.length) details.push(`Sauce(s) : ${options.sauces.join(", ")}`);
    if (options?.supplements?.length) {
      details.push(`Suppléments : ${options.supplements.map(s => `${s.name} (+${fmt(s.price)})`).join(", ")}`);
    }
    if (options?.supplementViande) {
      details.push(`Suppl. viande : ${options.supplementViande} (+${fmt(PRIX_SUPP_VIANDE)})`);
    }
    if (options?.boissonsSupp?.length) {
      details.push(`Boissons supp. : ${options.boissonsSupp.map(b => `${b.name} (+${fmt(b.price)})`).join(", ")}`);
    }
    return `${index + 1}. ${item.name} x${qty} — ${fmt(unitPrice * qty)}\nPrix unitaire : ${fmt(unitPrice)}\n${details.length ? details.join("\n") : "Aucune option particulière"}`;
  }).join("\n\n");

  return {
    commande_id: `AKM-${Date.now()}`,
    commande_recap: `${recap}\n\nTOTAL COMMANDE : ${fmt(total)}\nCRÉNEAU : ${creneauLabel}`,
    commande_total: fmt(total),
    commande_total_num: total.toFixed(2),
    heure_recuperation: creneauLabel,
    commande_json: JSON.stringify(entries.map(({ item, qty, unitPrice, options }) => ({
      produit: item.name, quantite: qty, prix_unitaire: unitPrice,
      total_ligne: unitPrice * qty, options,
    }))),
    source: "akm_resto_app",
  };
}

function redirectToTally(cart, total, creneauLabel) {
  const payload = buildOrderPayload(cart, total, creneauLabel);
  const params = new URLSearchParams();
  Object.entries(payload).forEach(([k, v]) => params.set(k, String(v)));
  const sep = TALLY_FORM_URL.includes("?") ? "&" : "?";
  window.location.href = `${TALLY_FORM_URL}${sep}${params.toString()}`;
}

// ─── UI : Chip / Section ─────────────────────────────────────
const Section = ({ title, optional, children }) => (
  <div style={{ marginBottom: 22 }}>
    <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom: 10 }}>
      <div style={{ fontWeight: 800, fontSize: 11, color: COLORS.primary, textTransform: "uppercase", letterSpacing: 1.2 }}>{title}</div>
      {optional && <div style={{ fontSize:10, color: COLORS.muted, fontWeight:600 }}>optionnel</div>}
    </div>
    {children}
  </div>
);

const Chip = ({ label, selected, onClick, price, disabled, danger }) => (
  <button onClick={onClick} disabled={disabled} style={{
    padding: "8px 14px", borderRadius: 50, margin: "3px",
    border: selected ? "none" : `1.5px solid ${COLORS.border}`,
    background: selected
      ? (danger ? "linear-gradient(135deg,#ef4444,#dc2626)" : `linear-gradient(135deg,${COLORS.primaryLight},${COLORS.primary})`)
      : disabled ? COLORS.bgAlt : COLORS.card,
    color: selected ? "#fff" : disabled ? "#bbb" : COLORS.ink,
    fontWeight: selected ? 700 : 500, fontSize: 13,
    cursor: disabled ? "not-allowed" : "pointer",
    boxShadow: selected ? "0 3px 10px rgba(255,79,24,0.35)" : "none",
    transition: "all 0.15s",
  }}>
    {label}{price ? ` +${price.toFixed(2).replace(".", ",")}€` : ""}
  </button>
);

// ─── QUANTITY STEPPER ────────────────────────────────────────
function QuantityStepper({ value, onChange, min = 1, max = 20 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:14, justifyContent:"center" }}>
      <button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} style={{
        width:38, height:38, borderRadius:"50%", border: `2px solid ${COLORS.primary}`,
        background: value <= min ? COLORS.bgAlt : "#fff",
        color: value <= min ? "#ccc" : COLORS.primary,
        fontWeight:900, fontSize:20, cursor: value <= min ? "not-allowed" : "pointer",
      }}>−</button>
      <div style={{ minWidth:50, textAlign:"center", fontWeight:900, fontSize:22, color: COLORS.ink }}>{value}</div>
      <button onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} style={{
        width:38, height:38, borderRadius:"50%", border:"none",
        background: value >= max ? COLORS.bgAlt : `linear-gradient(135deg,${COLORS.primaryLight},${COLORS.primary})`,
        color: value >= max ? "#ccc" : "#fff",
        fontWeight:900, fontSize:20, cursor: value >= max ? "not-allowed" : "pointer",
        boxShadow: value >= max ? "none" : "0 3px 10px rgba(255,79,24,0.35)",
      }}>+</button>
    </div>
  );
}

// ─── CUSTOMIZATION MODAL ─────────────────────────────────────
function CustomModal({ item, categoryKey, onClose, onConfirm }) {
  const [quantity, setQuantity] = useState(1);
  const [formule, setFormule] = useState(false);
  const [viandes, setViandes] = useState([]);
  const [sauces, setSauces] = useState([]);
  const [supplements, setSupplements] = useState([]);
  const [supplementViande, setSupplementViande] = useState(null);
  const [side, setSide] = useState(item.sideChoice ? "Frites" : null);
  const [crudites, setCrudites] = useState(CRUDITES); // par défaut tout coché
  const [boissonFormule, setBoissonFormule] = useState(DEFAULT_BOISSON_FORMULE);
  const [boissonsSupp, setBoissonsSupp] = useState([]);

  const showBoissonsSupp = CATEGORIES_AVEC_BOISSONS.includes(categoryKey);
  const showBoissonFormule = formule && item.menuPrice;

  const suppTotal = supplements.reduce((s, x) => s + x.price, 0);
  const suppViandeTotal = supplementViande ? PRIX_SUPP_VIANDE : 0;
  const boissonsSuppTotal = boissonsSupp.reduce((s, b) => s + b.price, 0);
  const baseP = formule && item.menuPrice ? item.menuPrice : item.price;
  const unitP = baseP + suppTotal + suppViandeTotal + boissonsSuppTotal;
  const totalP = unitP * quantity;
  const meatOK = !item.meatChoice || viandes.length === item.meatChoice;
  const saucesValid = sauces.length === 0 || !sauces.includes("Sans sauce") || sauces.length === 1;

  function toggleViande(v) {
    if (item.meatChoice === 1) { setViandes([v]); return; }
    setViandes(p => p.includes(v) ? p.filter(x => x !== v) : p.length < item.meatChoice ? [...p, v] : p);
  }

  // ✅ SANS SAUCE = exclusif + max 2 sauces
  function toggleSauce(s) {
    setSauces(prev => {
      if (s === "Sans sauce") {
        return prev.includes("Sans sauce") ? [] : ["Sans sauce"];
      }
      // Si on ajoute une sauce normale, on retire "Sans sauce" automatiquement
      let next = prev.filter(x => x !== "Sans sauce");
      if (next.includes(s)) {
        next = next.filter(x => x !== s);
      } else {
        if (next.length >= MAX_SAUCES) return prev;
        next = [...next, s];
      }
      return next;
    });
  }

  function toggleSup(sup) {
    setSupplements(p => p.find(x => x.name === sup.name) ? p.filter(x => x.name !== sup.name) : [...p, sup]);
  }
  function toggleBoissonSupp(bo) {
    setBoissonsSupp(p => p.find(x => x.name === bo.name) ? p.filter(x => x.name !== bo.name) : [...p, bo]);
  }
  function toggleCrudite(c) {
    if (c === CRUDITES_AUCUNE) {
      setCrudites(prev => prev === "none" ? [] : "none");
      return;
    }
    setCrudites(prev => {
      if (prev === "none") return [c];
      return prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c];
    });
  }

  function handleAdd() {
    const opts = {
      formule, viandes, sauces, supplements, supplementViande, side,
      crudites: crudites === "none" ? "none" : crudites,
      boissonFormule: showBoissonFormule ? boissonFormule : null,
      boissonsSupp,
    };
    const key = `${item.id}_${JSON.stringify(opts)}_${Date.now()}`;
    onConfirm({ key, item, unitPrice: unitP, options: opts, qty: quantity });
    onClose();
  }

  // Allergènes consolidés
  const allergenesConsolidés = new Set(item.allergenes || []);
  supplements.forEach(s => s.allergenes?.forEach(a => allergenesConsolidés.add(a)));
  boissonsSupp.forEach(b => b.allergenes?.forEach(a => allergenesConsolidés.add(a)));

  const boissonsGroups = BOISSONS_SUPPLEMENT.reduce((acc, b) => {
    if (!acc[b.group]) acc[b.group] = [];
    acc[b.group].push(b);
    return acc;
  }, {});

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 50,
      display: "flex", alignItems: "flex-end",
    }}>
      <div style={{
        background: COLORS.bg, width: "100%", height: "92dvh", maxHeight: "92dvh",
        borderRadius: "24px 24px 0 0", display: "flex", flexDirection: "column",
        animation: "slideUp 0.3s ease-out", overflow: "hidden",
      }}>
        {/* HEADER */}
        <div style={{ background: `linear-gradient(135deg,${COLORS.primaryLight},${COLORS.primary})`, padding: "18px 20px 14px", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1, paddingRight: 12 }}>
              <div style={{ fontWeight: 900, fontSize: 18, color: "#fff", lineHeight:1.2 }}>{item.name}</div>
              {item.desc && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 4, lineHeight: 1.4 }}>{item.desc}</div>}
              <div style={{ fontSize: 22, fontWeight: 900, color:"#fff", marginTop: 6 }}>{fmt(item.price)}{item.menuPrice && <span style={{ fontSize: 12, opacity: 0.85, marginLeft: 8, fontWeight: 600 }}>· Formule {fmt(item.menuPrice)}</span>}</div>
            </div>
            <button onClick={onClose} style={{
              background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%",
              width: 30, height: 30, color: "#fff", fontWeight: 700, cursor: "pointer",
              fontSize: 16, flexShrink: 0,
            }}>✕</button>
          </div>

          {item.menuPrice && (
            <div style={{ display: "flex", background: "rgba(255,255,255,0.18)", borderRadius: 12, padding: 4, marginTop: 14, gap: 4 }}>
              {[
                { label: `Seul · ${item.price.toFixed(2).replace(".",",")}€`, val: false },
                { label: `Formule · ${item.menuPrice.toFixed(2).replace(".",",")}€`, val: true },
              ].map(({ label, val }) => (
                <button key={String(val)} onClick={() => setFormule(val)} style={{
                  flex: 1, padding: "9px 6px", borderRadius: 10, border: "none",
                  background: formule === val ? "#fff" : "transparent",
                  color: formule === val ? COLORS.primary : "rgba(255,255,255,0.85)",
                  fontWeight: 800, fontSize: 13, cursor: "pointer", transition: "all 0.2s",
                }}>{label}</button>
              ))}
            </div>
          )}
        </div>

        {/* BODY SCROLL */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 16px 0", minHeight: 0 }}>

          {/* Quantité */}
          <Section title="Quantité">
            <QuantityStepper value={quantity} onChange={setQuantity} min={1} max={item.allowDirectQuantity ? (item.maxDirectQuantity || 20) : 10} />
          </Section>

          {/* Viandes */}
          {item.meatChoice && (
            <Section title={`Choix viande${item.meatChoice > 1 ? "s" : ""} — ${item.meatChoice === 1 ? "1 au choix" : `${item.meatChoice} au choix`} *`}>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {VIANDES.map(v => (
                  <Chip key={v} label={v} selected={viandes.includes(v)}
                    disabled={!viandes.includes(v) && viandes.length >= item.meatChoice}
                    onClick={() => toggleViande(v)} />
                ))}
              </div>
              {viandes.length > 0 && (
                <div style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 7, fontWeight: 600 }}>
                  ✓ {viandes.join(" · ")}
                  {item.meatChoice > 1 && (
                    <span style={{ color: viandes.length < item.meatChoice ? COLORS.primary : COLORS.success, marginLeft: 6 }}>
                      ({viandes.length}/{item.meatChoice})
                    </span>
                  )}
                </div>
              )}
            </Section>
          )}

          {/* Accompagnement */}
          {item.sideChoice && (
            <Section title="Accompagnement *">
              <div style={{ display: "flex", gap: 10 }}>
                {SIDES.map(s => (
                  <button key={s} onClick={() => setSide(s)} style={{
                    flex: 1, padding: "13px 0", borderRadius: 14,
                    border: side === s ? "none" : `1.5px solid ${COLORS.border}`,
                    background: side === s ? `linear-gradient(135deg,${COLORS.primaryLight},${COLORS.primary})` : "#fff",
                    color: side === s ? "#fff" : COLORS.ink,
                    fontWeight: 700, fontSize: 14, cursor: "pointer",
                    boxShadow: side === s ? "0 3px 12px rgba(255,79,24,0.3)" : "0 1px 4px rgba(0,0,0,0.06)",
                    transition: "all 0.2s",
                  }}>
                    {s === "Frites" ? "🍟" : "🌾"} {s}
                  </button>
                ))}
              </div>
            </Section>
          )}

          {/* Boisson formule */}
          {showBoissonFormule && (
            <Section title="🥤 Boisson de la formule (incluse)">
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {BOISSONS_FORMULE.map(b => (
                  <Chip key={b.name} label={`${b.emoji} ${b.name}`}
                    selected={boissonFormule === b.name}
                    onClick={() => setBoissonFormule(b.name)} />
                ))}
              </div>
              <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 6, fontStyle: "italic" }}>
                Boisson 33cl non alcoolisée incluse dans la formule
              </div>
            </Section>
          )}

          {/* Crudités */}
          {item.hasCrudites && (
            <Section title="🥬 Crudités" optional>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {CRUDITES.map(c => (
                  <Chip key={c} label={c}
                    selected={crudites !== "none" && crudites.includes(c)}
                    onClick={() => toggleCrudite(c)} />
                ))}
                <Chip label={CRUDITES_AUCUNE} selected={crudites === "none"} danger onClick={() => toggleCrudite(CRUDITES_AUCUNE)} />
              </div>
            </Section>
          )}

          {/* Sauces */}
          {item.hasSauces && (
            <Section title={`🥫 Sauces (max ${MAX_SAUCES}, incluses)`} optional>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {SAUCES.filter(s => s !== "Sans sauce").map(s => (
                  <Chip key={s} label={s} selected={sauces.includes(s)}
                    disabled={!sauces.includes(s) && (sauces.includes("Sans sauce") || sauces.length >= MAX_SAUCES)}
                    onClick={() => toggleSauce(s)} />
                ))}
                <Chip label="Sans sauce" selected={sauces.includes("Sans sauce")} danger onClick={() => toggleSauce("Sans sauce")} />
              </div>
              {sauces.length > 0 && !sauces.includes("Sans sauce") && (
                <div style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 7, fontWeight: 600 }}>
                  ✓ {sauces.join(" · ")} ({sauces.length}/{MAX_SAUCES})
                </div>
              )}
            </Section>
          )}

          {/* Suppléments */}
          {item.hasSupplements && (
            <Section title="➕ Suppléments" optional>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {SUPPLEMENTS.map(sup => (
                  <Chip key={sup.name} label={sup.name} price={sup.price}
                    selected={!!supplements.find(s => s.name === sup.name)}
                    onClick={() => toggleSup(sup)} />
                ))}
              </div>

              {/* Supplément viande */}
              <div style={{ marginTop: 14, padding: "12px 14px", background: "#FFF4E5", borderRadius: 12, border: "1px dashed #F9C4AE" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.primary, marginBottom: 8 }}>
                  🥩 Supplément viande (+{fmt(PRIX_SUPP_VIANDE)}) — au choix
                </div>
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  {VIANDES_SUPP.map(v => (
                    <Chip key={v} label={v}
                      selected={supplementViande === v}
                      onClick={() => setSupplementViande(supplementViande === v ? null : v)} />
                  ))}
                </div>
              </div>
            </Section>
          )}

          {/* Boissons supplément */}
          {showBoissonsSupp && (
            <Section title="🥤 Boissons en supplément" optional>
              {Object.entries(boissonsGroups).map(([group, items]) => (
                <div key={group} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, marginBottom: 5, marginLeft: 4 }}>{group}</div>
                  <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {items.map(bo => (
                      <Chip key={bo.name} label={bo.name} price={bo.price}
                        selected={!!boissonsSupp.find(b => b.name === bo.name)}
                        onClick={() => toggleBoissonSupp(bo)} />
                    ))}
                  </div>
                </div>
              ))}
            </Section>
          )}

          {/* Allergènes */}
          {allergenesConsolidés.size > 0 && (
            <div style={{ background: "#FFF8E1", borderRadius: 12, padding: "10px 14px", marginBottom: 18, border: "1px solid #FFE082" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#8A6D00", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                ⚠️ Allergènes
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {[...allergenesConsolidés].map(a => (
                  <span key={a} style={{ fontSize: 11, background: "#FFF", color: "#8A6D00", padding: "3px 8px", borderRadius: 50, fontWeight: 700, border: "1px solid #FFE082" }}>
                    {ALLERGENES_LABELS[a] || a}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: 10, color: "#8A6D00", marginTop: 6, fontStyle: "italic" }}>
                En cas d'allergie, signalez-le dans les notes lors de la commande.
              </div>
            </div>
          )}

          <div style={{ height: 12 }} />
        </div>

        {/* FOOTER STICKY */}
        <div style={{ padding: "14px 18px max(18px, env(safe-area-inset-bottom))", background: "#fff", borderTop: `1px solid ${COLORS.border}`, flexShrink: 0, boxShadow: "0 -4px 16px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.4 }}>
              {quantity}× {formule ? "Formule" : "Article"}
              {(suppTotal + suppViandeTotal + boissonsSuppTotal) > 0 && <span style={{ color: COLORS.primary }}> + supp.</span>}
            </div>
            <div style={{ fontWeight: 900, fontSize: 22, color: COLORS.primary }}>{fmt(totalP)}</div>
          </div>
          <button onClick={handleAdd} disabled={!meatOK} style={{
            width: "100%",
            background: meatOK ? `linear-gradient(135deg,${COLORS.primaryLight},${COLORS.primary})` : "#E0D8D0",
            color: meatOK ? "#fff" : "#9c8d7a",
            border: "none", borderRadius: 14, padding: "15px",
            fontWeight: 900, fontSize: 15, cursor: meatOK ? "pointer" : "not-allowed",
            boxShadow: meatOK ? "0 4px 18px rgba(255,79,24,0.4)" : "none",
            transition: "all 0.2s",
          }}>
            {meatOK ? `✓ Ajouter au panier · ${fmt(totalP)}` : `Choisissez ${item.meatChoice - viandes.length} viande(s) en plus`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TIME SLOTS MODAL ────────────────────────────────────────
function TimeSlotsModal({ total, onClose, onConfirm }) {
  const [selected, setSelected] = useState(null);
  const slotsByDay = generateTimeSlots();

  if (slotsByDay.length === 0) {
    return (
      <div onClick={e => e.target === e.currentTarget && onClose()} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 60, display: "flex", alignItems: "flex-end",
      }}>
        <div style={{ background: COLORS.bg, width: "100%", padding: 32, textAlign: "center", borderRadius: "24px 24px 0 0" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>😔</div>
          <div style={{ fontWeight: 900, fontSize: 18, color: COLORS.ink, marginBottom: 8 }}>Aucun créneau disponible</div>
          <div style={{ color: COLORS.muted, marginBottom: 20 }}>Le restaurant est fermé. Réessayez plus tard ou appelez le 03 29 24 21 08.</div>
          <button onClick={onClose} style={{ background: COLORS.primary, color: "#fff", border: "none", borderRadius: 14, padding: "14px 32px", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>Retour</button>
        </div>
      </div>
    );
  }

  function handleConfirm() {
    if (!selected) return;
    const dayLabel = getDayLabel(selected.day, selected.dayOffset);
    const timeLabel = formatTime(selected.time);
    onConfirm(`${dayLabel} (${getDayFullLabel(selected.day)}) à ${timeLabel}`);
  }

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 60, display: "flex", alignItems: "flex-end",
    }}>
      <div style={{
        background: COLORS.bg, width: "100%", height: "90dvh", maxHeight: "90dvh",
        borderRadius: "24px 24px 0 0", display: "flex", flexDirection: "column",
        animation: "slideUp 0.3s ease-out", overflow: "hidden",
      }}>
        <div style={{ background: `linear-gradient(135deg,${COLORS.primaryLight},${COLORS.primary})`, padding: "18px 20px", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 900, fontSize: 20, color: "#fff" }}>🕐 Quand venir ?</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 4 }}>Choisissez votre créneau de récupération</div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 30, height: 30, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 16 }}>✕</button>
          </div>
          <div style={{ background: "rgba(255,255,255,0.18)", padding: "10px 14px", borderRadius: 10, marginTop: 12, fontSize: 12, color: "rgba(255,255,255,0.95)" }}>
            ⏰ Préparation minimum 30 min · Créneaux toutes les 10 min
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "18px 16px 0", minHeight: 0 }}>
          {slotsByDay.map(({ day, dayOffset, slots }) => (
            <div key={dayOffset} style={{ marginBottom: 22 }}>
              <div style={{ fontWeight: 900, fontSize: 13, color: COLORS.primary, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                📅 {getDayLabel(day, dayOffset)}
                <span style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600, textTransform: "none", letterSpacing: 0 }}>
                  ({getDayFullLabel(day)})
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {slots.map((slot, i) => {
                  const isSel = selected?.time?.getTime() === slot.getTime() && selected?.dayOffset === dayOffset;
                  return (
                    <button key={i} onClick={() => setSelected({ time: slot, day, dayOffset })} style={{
                      padding: "11px 0", borderRadius: 12,
                      border: isSel ? "none" : `1.5px solid ${COLORS.border}`,
                      background: isSel ? `linear-gradient(135deg,${COLORS.primaryLight},${COLORS.primary})` : "#fff",
                      color: isSel ? "#fff" : COLORS.ink,
                      fontWeight: 700, fontSize: 14, cursor: "pointer",
                      boxShadow: isSel ? "0 3px 10px rgba(255,79,24,0.3)" : "0 1px 4px rgba(0,0,0,0.05)",
                    }}>
                      {formatTime(slot)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div style={{ height: 14 }} />
        </div>

        <div style={{ padding: "12px 18px max(16px, env(safe-area-inset-bottom))", background: "#fff", borderTop: `1px solid ${COLORS.border}`, flexShrink: 0, boxShadow: "0 -4px 16px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 8 }}>
            <div style={{ fontSize: 12, color: COLORS.muted, flex: 1, minWidth: 0 }}>
              {selected ? (
                <span style={{ display: "block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  📅 {getDayLabel(selected.day, selected.dayOffset)} · {formatTime(selected.time)}
                </span>
              ) : "Sélectionnez un créneau"}
            </div>
            <div style={{ fontWeight: 900, fontSize: 18, color: COLORS.primary, flexShrink: 0 }}>{fmt(total)}</div>
          </div>
          <button onClick={handleConfirm} disabled={!selected} style={{
            width: "100%",
            background: selected ? `linear-gradient(135deg,${COLORS.primaryLight},${COLORS.primary})` : "#E0D8D0",
            color: selected ? "#fff" : "#9c8d7a",
            border: "none", borderRadius: 14, padding: "15px",
            fontWeight: 900, fontSize: 15, cursor: selected ? "pointer" : "not-allowed",
            boxShadow: selected ? "0 4px 18px rgba(255,79,24,0.4)" : "none",
          }}>
            {selected ? `✓ Confirmer & finaliser` : "Choisissez un créneau"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CART PANEL ──────────────────────────────────────────────
function CartPanel({ cart, onClose, onClear, onQtyChange, total, onSlotsOpen }) {
  const entries = Object.values(cart);

  function optSummary(options) {
    const parts = [];
    if (options.formule) parts.push("Formule menu");
    if (options.viandes?.length) parts.push("🥩 " + options.viandes.join(", "));
    if (options.side) parts.push(options.side === "Frites" ? "🍟 Frites" : "🌾 Boulgour");
    if (options.crudites === "none") parts.push("Sans crudités");
    else if (options.crudites?.length && options.crudites.length < CRUDITES.length) parts.push("🥬 " + options.crudites.join(", "));
    if (options.boissonFormule) parts.push("🥤 " + options.boissonFormule);
    if (options.sauces?.length) parts.push("🥫 " + options.sauces.join(", "));
    if (options.supplements?.length) parts.push("➕ " + options.supplements.map(s => s.name).join(", "));
    if (options.supplementViande) parts.push("🥩+ " + options.supplementViande);
    if (options.boissonsSupp?.length) parts.push("🥤+ " + options.boissonsSupp.map(b => b.name).join(", "));
    return parts;
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <div style={{ padding:"18px 20px 12px", borderBottom:`1px solid ${COLORS.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
        <div style={{ fontWeight:900, fontSize:20, color:COLORS.ink }}>🛒 Ma Commande</div>
        <button onClick={onClose} style={{ background:COLORS.bgAlt, border:"none", borderRadius:"50%", width:32, height:32, cursor:"pointer", fontWeight:700, fontSize:16, color:COLORS.muted }}>✕</button>
      </div>

      {entries.length === 0 ? (
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:COLORS.muted, gap:12, padding:32 }}>
          <div style={{ fontSize:48 }}>🛒</div>
          <div style={{ fontWeight:600 }}>Votre panier est vide</div>
          <div style={{ fontSize:13, textAlign:"center" }}>Ajoutez des articles depuis le menu</div>
        </div>
      ) : (
        <>
          <div style={{ flex:1, overflowY:"auto", padding:"10px 16px", minHeight: 0 }}>
            {entries.map(({ key, item, qty, unitPrice, options }) => (
              <div key={key} style={{ padding:"12px 0", borderBottom:`1px solid ${COLORS.borderSoft}` }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                  <div style={{ flex:1, minWidth: 0 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:COLORS.ink }}>{item.name}</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:5 }}>
                      {optSummary(options).map((tag, i) => (
                        <span key={i} style={{ fontSize:10, background:"#fff4ee", color:COLORS.primaryDark, borderRadius:10, padding:"2px 7px", fontWeight:600, border:`1px solid #F9C4AE` }}>{tag}</span>
                      ))}
                    </div>
                    <div style={{ fontSize:13, color:COLORS.primary, fontWeight:700, marginTop:5 }}>{fmt(unitPrice)} × {qty}</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                    <button onClick={() => onQtyChange(key, -1)} style={{ width:26, height:26, borderRadius:"50%", border:`1.5px solid ${COLORS.primary}`, background:"#fff", color:COLORS.primary, fontWeight:900, fontSize:16, cursor:"pointer" }}>−</button>
                    <span style={{ fontWeight:800, minWidth:16, textAlign:"center" }}>{qty}</span>
                    <button onClick={() => onQtyChange(key, +1)} style={{ width:26, height:26, borderRadius:"50%", border:"none", background:`linear-gradient(135deg,${COLORS.primaryLight},${COLORS.primary})`, color:"#fff", fontWeight:900, fontSize:16, cursor:"pointer" }}>+</button>
                  </div>
                </div>
                <div style={{ textAlign:"right", fontWeight:800, fontSize:13, color:COLORS.ink, marginTop:4 }}>
                  {fmt(unitPrice * qty)}
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding:"14px 20px max(16px, env(safe-area-inset-bottom))", borderTop:`2px solid ${COLORS.border}`, background:"#fff", flexShrink:0, boxShadow: "0 -4px 16px rgba(0,0,0,0.05)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <span style={{ fontWeight:700, fontSize:15 }}>Total</span>
              <span style={{ fontWeight:900, fontSize:22, color:COLORS.primary }}>{fmt(total)}</span>
            </div>
            <button onClick={onSlotsOpen} style={{
              width:"100%", background:`linear-gradient(135deg,${COLORS.primaryLight},${COLORS.primary})`,
              color:"#fff", border:"none", borderRadius:14, padding:15,
              fontWeight:900, fontSize:15, cursor:"pointer",
              boxShadow:"0 4px 18px rgba(255,79,24,0.4)",
            }}>
              Finaliser ma commande · {fmt(total)} →
            </button>
            <button onClick={onClear} style={{
              width:"100%", background:"transparent", color:COLORS.muted, border:"none",
              marginTop:6, padding:6, fontWeight:600, fontSize:12, cursor:"pointer",
            }}>Vider le panier</button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── ITEM CARD ───────────────────────────────────────────────
function ItemCard({ item, totalQty, onOpen }) {
  return (
    <div style={{
      background:"#fff", borderRadius:16, padding:"14px 16px",
      display:"flex", alignItems:"center", gap:12,
      boxShadow:"0 2px 8px rgba(0,0,0,0.05)", border:`1px solid ${COLORS.border}`,
      marginBottom:10,
    }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:700, fontSize:15, color:COLORS.ink, lineHeight:1.3 }}>{item.name}</div>
        {item.desc && <div style={{ fontSize:12, color:COLORS.muted, marginTop:3, lineHeight:1.4 }}>{item.desc}</div>}
        <div style={{ marginTop:6, display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
          <span style={{ fontWeight:800, fontSize:16, color:COLORS.primary }}>{fmt(item.price)}</span>
          {item.menuPrice && (
            <span style={{ fontSize:11, background:"#fff4ee", color:COLORS.primaryDark, border:"1px solid #f9c4ae", borderRadius:20, padding:"2px 8px", fontWeight:600 }}>
              Formule {fmt(item.menuPrice)}
            </span>
          )}
        </div>
      </div>
      <button onClick={onOpen} style={{
        position:"relative", width:40, height:40, borderRadius:"50%", border:"none",
        background:`linear-gradient(135deg,${COLORS.primaryLight},${COLORS.primary})`, color:"#fff",
        fontWeight:900, fontSize:22, cursor:"pointer", flexShrink:0,
        boxShadow:"0 3px 10px rgba(255,79,24,0.35)",
      }}>
        +
        {totalQty > 0 && (
          <span style={{
            position:"absolute", top:-5, right:-5, background:COLORS.ink,
            color:"#fff", borderRadius:"50%", width:18, height:18,
            fontSize:10, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center",
          }}>{totalQty}</span>
        )}
      </button>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────
export default function AKMRestoApp() {
  const [activeCategory, setActiveCategory] = useState("burgers");
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [modalItem, setModalItem] = useState(null);
  const [slotsOpen, setSlotsOpen] = useState(false);
  const navRef = useRef(null);

  const needsModal = (item, catKey) =>
    item.meatChoice || item.sideChoice || item.hasSauces || item.hasSupplements
    || item.menuPrice || item.hasCrudites
    || CATEGORIES_AVEC_BOISSONS.includes(catKey);

  function handleOpen(item) {
    if (needsModal(item, activeCategory)) {
      setModalItem({ item, categoryKey: activeCategory });
    } else {
      const key = `${item.id}_simple`;
      setCart(prev => ({
        ...prev,
        [key]: { key, item, qty: (prev[key]?.qty || 0) + 1, unitPrice: item.price, options: {} }
      }));
    }
  }

  function handleConfirm({ key, item, unitPrice, options, qty = 1 }) {
    setCart(prev => ({
      ...prev,
      [key]: { key, item, qty: (prev[key]?.qty || 0) + qty, unitPrice, options }
    }));
  }

  function handleQtyChange(key, delta) {
    setCart(prev => {
      const entry = prev[key];
      if (!entry) return prev;
      const newQty = entry.qty + delta;
      if (newQty <= 0) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: { ...entry, qty: newQty } };
    });
  }

  function handleSlotConfirm(creneauLabel) {
    redirectToTally(cart, total, creneauLabel);
  }

  const total = Object.values(cart).reduce((s, e) => s + e.unitPrice * e.qty, 0);
  const totalItems = Object.values(cart).reduce((s, e) => s + e.qty, 0);

  const qtyByItemId = {};
  Object.values(cart).forEach(e => {
    qtyByItemId[e.item.id] = (qtyByItemId[e.item.id] || 0) + e.qty;
  });

  function selectCat(key) {
    setActiveCategory(key);
    const el = navRef.current?.querySelector(`[data-key="${key}"]`);
    el?.scrollIntoView({ behavior:"smooth", inline:"center", block:"nearest" });
  }

  const currentItems = MENU[activeCategory] || [];
  const currentCat = CATEGORIES.find(c => c.key === activeCategory);

  return (
    <div style={{ fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif", background:COLORS.bg, minHeight:"100dvh", maxWidth:520, margin:"0 auto", position:"relative" }}>
      <div style={{
        background:`linear-gradient(135deg,${COLORS.primaryLight} 0%,${COLORS.primary} 60%,${COLORS.primaryDark} 100%)`,
        padding:"18px 20px 14px max(18px, env(safe-area-inset-left))", position:"sticky", top:0, zIndex:20,
        boxShadow:"0 4px 20px rgba(255,79,24,0.25)",
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontWeight:900, fontSize:24, color:"#fff", letterSpacing:"-0.5px", textShadow:"0 2px 8px rgba(0,0,0,0.15)" }}>AKM Resto'</div>
            <div style={{ color:"rgba(255,255,255,0.85)", fontSize:12, marginTop:2 }}>📍 Vagney · Sur place ou à emporter</div>
            <div style={{ color:"rgba(255,255,255,0.7)", fontSize:11, marginTop:1 }}>🕐 11h45–14h · 18h–22h (sauf lundi)</div>
          </div>
          <button onClick={() => setCartOpen(true)} style={{
            position:"relative", background:"rgba(255,255,255,0.2)",
            border:"1.5px solid rgba(255,255,255,0.4)", borderRadius:14,
            padding:"10px 14px", cursor:"pointer", color:"#fff", fontWeight:800, fontSize:20,
          }}>
            🛒
            {totalItems > 0 && (
              <span style={{
                position:"absolute", top:-6, right:-6, background:"#fff", color:COLORS.primary,
                borderRadius:"50%", width:20, height:20, fontSize:11, fontWeight:900,
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:"0 2px 6px rgba(0,0,0,0.2)",
              }}>{totalItems}</span>
            )}
          </button>
        </div>
      </div>

      <div ref={navRef} style={{
        display:"flex", gap:8, overflowX:"auto", padding:"12px 16px",
        scrollbarWidth:"none", background:"#fff",
        borderBottom:`1px solid ${COLORS.border}`,
        position:"sticky", top:88, zIndex:15,
        boxShadow:"0 2px 8px rgba(0,0,0,0.04)",
      }}>
        {CATEGORIES.map(cat => (
          <button key={cat.key} data-key={cat.key} onClick={() => selectCat(cat.key)} style={{
            flexShrink:0, padding:"7px 14px", borderRadius:50,
            border: activeCategory === cat.key ? "none" : `1.5px solid ${COLORS.border}`,
            background: activeCategory === cat.key ? `linear-gradient(135deg,${COLORS.primaryLight},${COLORS.primary})` : COLORS.bg,
            color: activeCategory === cat.key ? "#fff" : COLORS.inkSoft,
            fontWeight:700, fontSize:12, cursor:"pointer", whiteSpace:"nowrap",
            transition:"all 0.2s",
            boxShadow: activeCategory === cat.key ? "0 3px 10px rgba(255,79,24,0.3)" : "none",
          }}>
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      <div style={{ padding:"16px 16px 120px" }}>
        <div style={{ fontWeight:900, fontSize:22, color:COLORS.ink, marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
          <span>{currentCat?.emoji}</span><span>{currentCat?.label}</span>
        </div>

        {currentItems.map(item => (
          <ItemCard key={item.id} item={item} totalQty={qtyByItemId[item.id] || 0} onOpen={() => handleOpen(item)} />
        ))}

        {["sandwichs","assiettes","burgers","burgersSpeciaux","wraps","gundi"].includes(activeCategory) && (
          <div style={{ background:"#fff8f5", border:"1px solid #f9c4ae", borderRadius:12, padding:"10px 14px", fontSize:12, color:"#9c6a4e", marginTop:8 }}>
            💡 Suppléments : oeuf, féta, munster, galette de pdt <strong>+1€</strong> · viande au choix <strong>+3€</strong>
          </div>
        )}
        {["wraps","gundi","burgers","burgersSpeciaux","sandwichs","petiteFaim"].includes(activeCategory) && (
          <div style={{ background:"#f0f7ff", border:"1px solid #bfdbfe", borderRadius:12, padding:"10px 14px", fontSize:12, color:"#3b5999", marginTop:8 }}>
            📋 <strong>Formule menu</strong> = article + petite frite ou salade + boisson 33cl non alcoolisée (choix parmi 11 boissons)
          </div>
        )}
      </div>

      {totalItems > 0 && !cartOpen && !slotsOpen && (
        <button onClick={() => setCartOpen(true)} style={{
          position:"fixed", bottom:"max(20px, env(safe-area-inset-bottom))", left:"50%", transform:"translateX(-50%)",
          background:`linear-gradient(135deg,${COLORS.primaryLight},${COLORS.primary})`, color:"#fff", border:"none",
          borderRadius:50, padding:"15px 26px", fontWeight:900, fontSize:14, cursor:"pointer",
          boxShadow:"0 6px 24px rgba(255,79,24,0.45)", display:"flex", alignItems:"center",
          gap:10, whiteSpace:"nowrap", zIndex:30, animation:"pulse 2s infinite",
        }}>
          <span style={{ background:"rgba(255,255,255,0.25)", borderRadius:"50%", width:22, height:22, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:900 }}>
            {totalItems}
          </span>
          Voir ma commande · {fmt(total)}
        </button>
      )}

      {cartOpen && (
        <div onClick={e => e.target === e.currentTarget && setCartOpen(false)} style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:40,
          display:"flex", alignItems:"flex-end",
        }}>
          <div style={{
            background:"#fff", width:"100%", height:"88dvh", maxHeight:"88dvh",
            borderRadius:"24px 24px 0 0", display:"flex", flexDirection:"column",
            animation:"slideUp 0.3s ease-out",
          }}>
            <CartPanel cart={cart} total={total} onClose={() => setCartOpen(false)}
              onClear={() => setCart({})} onQtyChange={handleQtyChange}
              onSlotsOpen={() => { setCartOpen(false); setSlotsOpen(true); }} />
          </div>
        </div>
      )}

      {modalItem && (
        <CustomModal item={modalItem.item} categoryKey={modalItem.categoryKey}
          onClose={() => setModalItem(null)} onConfirm={handleConfirm} />
      )}

      {slotsOpen && (
        <TimeSlotsModal total={total} onClose={() => setSlotsOpen(false)} onConfirm={handleSlotConfirm} />
      )}

      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        ::-webkit-scrollbar{display:none}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes pulse{0%,100%{box-shadow:0 6px 24px rgba(255,79,24,0.45)}50%{box-shadow:0 6px 32px rgba(255,79,24,0.65)}}
        button:active{opacity:0.85;transform:scale(0.98)}
        button{transition:all 0.15s}
        html,body{margin:0;padding:0}
      `}</style>
    </div>
  );
}
