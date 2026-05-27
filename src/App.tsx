import { useState, useRef } from "react";

// ─── Constants ───────────────────────────────────────────────
const SAUCES = ["Blanche", "Algérienne", "Harissa", "Ketchup", "Barbecue", "Burger", "Andalouse", "Sans sauce"];
const VIANDES = ["Poulet pané", "Poulet mariné", "Kébab", "Kofté", "Boeuf haché", "Merguez", "Américain (steack)", "Falafel"];
const SUPPLEMENTS = [
  { name: "Oeuf", price: 1 }, { name: "Féta", price: 1 },
  { name: "Munster", price: 1 }, { name: "Galette de pdt", price: 1 },
  { name: "+ Viande", price: 3 },
];
const SIDES = ["Frites", "Boulgour"];
const fmt = (n) => n.toFixed(2).replace(".", ",") + " €";
const TALLY_FORM_URL = "https://tally.so/r/b56aM7";

function buildOrderPayload(cart, total) {
  const entries = Object.values(cart);

  const recap = entries.map((entry, index) => {
    const { item, qty, unitPrice, options } = entry;
    const details = [];

    if (item.menuPrice) {
      details.push(options?.formule ? "Formule : menu" : "Formule : article seul");
    }

    if (options?.viandes?.length) {
      details.push(`Viande(s) : ${options.viandes.join(", ")}`);
    }

    if (options?.side) {
      details.push(`Accompagnement : ${options.side}`);
    }

    if (options?.sauces?.length) {
      details.push(`Sauce(s) : ${options.sauces.join(", ")}`);
    }

    if (options?.supplements?.length) {
      details.push(
        `Supplément(s) : ${options.supplements
          .map((s) => `${s.name} (+${fmt(s.price)})`)
          .join(", ")}`
      );
    }

    return `${index + 1}. ${item.name} x${qty} — ${fmt(unitPrice * qty)}
Prix unitaire : ${fmt(unitPrice)}
${details.length ? details.join("\n") : "Aucune option particulière"}`;
  }).join("\n\n");

  return {
    commande_id: `AKM-${Date.now()}`,
    commande_recap: `${recap}\n\nTOTAL COMMANDE : ${fmt(total)}`,
    commande_total: fmt(total),
    commande_total_num: total.toFixed(2),
    commande_json: JSON.stringify(
      entries.map(({ item, qty, unitPrice, options }) => ({
        produit: item.name,
        quantite: qty,
        prix_unitaire: unitPrice,
        total_ligne: unitPrice * qty,
        options,
      }))
    ),
    source: "akm_resto_app",
  };
}

function openTallyCheckout(cart, total) {
  const payload = buildOrderPayload(cart, total);
  const params = new URLSearchParams();

  Object.entries(payload).forEach(([key, value]) => {
    params.set(key, String(value));
  });

  const separator = TALLY_FORM_URL.includes("?") ? "&" : "?";
  window.location.href = `${TALLY_FORM_URL}${separator}${params.toString()}`;
}
// ─── Categories ──────────────────────────────────────────────
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

// Flags:
//   meatChoice: 1|2|3  → choose N viandes
//   sideChoice: true    → frites ou boulgour
//   hasSauces: true     → sauce selector
//   hasSupplements: true → supplement selector
//   menuPrice           → formule toggle

const MENU = {
  burgers: [
    { id:"b1", name:"Chicken Burger", desc:"Poulet pané", price:6.50, menuPrice:9.50, hasSauces:true, hasSupplements:true },
    { id:"b2", name:"Hamburger Classique", desc:"Pain, steak, sauce maison", price:6.50, menuPrice:9.50, hasSauces:true, hasSupplements:true },
    { id:"b3", name:"Hamburger Géant", desc:"Steack de 180g", price:8.00, menuPrice:11.00, hasSauces:true, hasSupplements:true },
    { id:"b4", name:"Paysan", desc:"Steack haché local façon bouchère 100g", price:8.00, menuPrice:11.00, hasSauces:true, hasSupplements:true },
    { id:"b5", name:"Patato Végétarien", desc:"Galette de pdt, féta, crudités", price:6.00, menuPrice:9.00, hasSauces:true, hasSupplements:true },
  ],
  burgersSpeciaux: [
    { id:"bs1", name:"Vosgien Chicken", desc:"Poulet, galette de pdt, bacon, munster", price:8.50, menuPrice:11.50, hasSauces:true, hasSupplements:true },
    { id:"bs2", name:"Vosgien Classique", desc:"Steack haché, galette de pdt, bacon, munster", price:8.50, menuPrice:11.50, hasSauces:true, hasSupplements:true },
    { id:"bs3", name:"Vosgien Géant", desc:"Steack haché 180g, galette de pdt, bacon, munster", price:9.50, menuPrice:12.50, hasSauces:true, hasSupplements:true },
    { id:"bs4", name:"Vosgien Paysan", desc:"Steack haché local, galette de pdt, bacon, munster", price:9.50, menuPrice:12.50, hasSauces:true, hasSupplements:true },
    { id:"bs5", name:"Raclette Chicken", desc:"Poulet, galette de pdt, lardons, fromage à raclette", price:8.50, menuPrice:11.50, hasSauces:true, hasSupplements:true },
    { id:"bs6", name:"Raclette Classique", desc:"Steack haché, galette de pdt, lardons, raclette", price:8.50, menuPrice:11.50, hasSauces:true, hasSupplements:true },
    { id:"bs7", name:"Raclette Géant", desc:"Steack haché 180g, galette de pdt, lardons, raclette", price:9.50, menuPrice:12.50, hasSauces:true, hasSupplements:true },
    { id:"bs8", name:"Raclette Paysan", desc:"Steack haché local, galette de pdt, lardons, raclette", price:9.50, menuPrice:12.50, hasSauces:true, hasSupplements:true },
  ],
  wraps: [
    { id:"w1", name:"Wrap Classique", desc:"Poulet pané, mariné, kébab, kofté, boeuf ou merguez", price:7.00, menuPrice:10.00, meatChoice:1, hasSauces:true, hasSupplements:true },
    { id:"w2", name:"Wrap Végétarien", desc:"Crudités, falafels", price:7.00, menuPrice:10.00, hasSauces:true, hasSupplements:true },
    { id:"w3", name:"Wrap Mixte", desc:"2 viandes au choix", price:9.00, menuPrice:12.00, meatChoice:2, hasSauces:true, hasSupplements:true },
    { id:"w4", name:"Wrap Vosgien", desc:"Steack haché, munster, galette de pdt", price:9.50, menuPrice:12.50, hasSauces:true, hasSupplements:true },
  ],
  gundi: [
    { id:"g1", name:"Gundi Classique", desc:"Wrap, mozza, crudités, galette de pdt, féta, oeuf + viande au choix", price:9.00, menuPrice:12.00, meatChoice:1, hasSauces:true, hasSupplements:true },
    { id:"g2", name:"Gundi Vosgien", desc:"Steack haché, munster, galette de pdt", price:9.00, menuPrice:12.00, hasSauces:true, hasSupplements:true },
    { id:"g3", name:"Gundi Épinards", desc:"Truite fumée, épinards, crème fraîche, galette de pdt, oignons, oeuf, féta", price:10.00, menuPrice:13.00, hasSauces:true, hasSupplements:true },
    { id:"g4", name:"Gundi Mixte", desc:"2 viandes au choix", price:11.00, menuPrice:14.00, meatChoice:2, hasSauces:true, hasSupplements:true },
  ],
  sandwichs: [
    { id:"s1", name:"Kébab Classique", desc:"Salade, tomates, oignons, viande", price:7.00, menuPrice:10.00, hasSauces:true, hasSupplements:true },
    { id:"s2", name:"Kébab Nature", desc:"Viande seule ou avec tomates/oignons", price:8.00, menuPrice:11.00, hasSauces:true, hasSupplements:true },
    { id:"s3", name:"Kébab Vosgien", desc:"Galette de pdt, oeuf, munster, bacon", price:9.50, menuPrice:12.50, hasSauces:true, hasSupplements:true },
    { id:"s4", name:"Américain / Kofté / Merguez / Poulet", desc:"Au choix", price:7.00, menuPrice:10.00, meatChoice:1, hasSauces:true, hasSupplements:true },
    { id:"s5", name:"Américain Géant + Frites", desc:"Steack haché de 180g", price:8.50, menuPrice:11.50, hasSauces:true, hasSupplements:true },
    { id:"s6", name:"Américain Paysan + Frites", desc:"Steack haché local façon bouchère", price:9.50, menuPrice:12.50, hasSauces:true, hasSupplements:true },
    { id:"s7", name:"Sandwich Brochette", desc:"Onglet de boeuf de 180g", price:9.50, menuPrice:12.50, hasSauces:true, hasSupplements:true },
    { id:"s8", name:"Yufka", desc:"Galette fine garnie - viande au choix", price:7.00, menuPrice:10.00, meatChoice:1, hasSauces:true, hasSupplements:true },
    { id:"s9", name:"Végétarien", desc:"Crudités, féta", price:6.00, menuPrice:9.00, hasSauces:true, hasSupplements:true },
    { id:"s10", name:"Végétarien Falafels", desc:"Crudités, féta, falafels", price:7.00, menuPrice:10.00, hasSauces:true, hasSupplements:true },
    { id:"s11", name:"Panini Kébab / Bacon / Poulet / Merguez", desc:"Au choix", price:7.00, menuPrice:10.00, meatChoice:1, hasSauces:true, hasSupplements:true },
    { id:"s12", name:"Panini Végétarien", desc:"Emmental, féta, mozza, tomates", price:6.00, menuPrice:9.00, hasSauces:true, hasSupplements:true },
    { id:"s13", name:"Pizza Turque (Lahmacun)", desc:"", price:9.50, menuPrice:12.50, hasSauces:true, hasSupplements:true },
  ],
  salades: [
    { id:"sal1", name:"Salade Kébab", desc:"Salade, crudités, kébab", price:9.00, hasSauces:true, hasSupplements:true },
    { id:"sal2", name:"Salade Vosgienne", desc:"Salade verte, tomates, lardons, galette de pdt, munster", price:9.00, hasSauces:true, hasSupplements:true },
    { id:"sal3", name:"Salade Grecque", desc:"Tomates, salade, concombre, oignons, féta, olives", price:8.00, hasSauces:true, hasSupplements:true },
    { id:"sal4", name:"Salade Composée & Nuggets", desc:"", price:8.00, hasSauces:true, hasSupplements:true },
    { id:"sal5", name:"Salade Végétarienne", desc:"Crudités, falafels", price:8.00, hasSauces:true, hasSupplements:true },
  ],
  assiettes: [
    { id:"a1", name:"Côte de Boeuf", desc:"Maturée 15 jours ~350-400g + crudités", price:21.00, sideChoice:true, hasSauces:true, hasSupplements:true },
    { id:"a2", name:"Entrecôte", desc:"Maturée 15 jours ~220g + crudités", price:17.00, sideChoice:true, hasSauces:true, hasSupplements:true },
    { id:"a3", name:"Brochettes (1 pièce)", desc:"Onglet de boeuf 180g + crudités", price:14.00, sideChoice:true, hasSauces:true, hasSupplements:true },
    { id:"a4", name:"Brochettes (2 pièces)", desc:"Onglet de boeuf 180g x2 + crudités", price:20.00, sideChoice:true, hasSauces:true, hasSupplements:true },
    { id:"a5", name:"Kébab Vosgien", desc:"Galette de pdt, oeuf, munster, bacon + crudités", price:14.00, sideChoice:true, hasSauces:true, hasSupplements:true },
    { id:"a6", name:"Kébab / Américain / Poulet Pané / Kofté", desc:"1 viande au choix + crudités", price:11.00, meatChoice:1, sideChoice:true, hasSauces:true, hasSupplements:true },
    { id:"a7", name:"Poulet Mariné / Merguez / Américain", desc:"1 viande au choix + crudités", price:12.00, meatChoice:1, sideChoice:true, hasSauces:true, hasSupplements:true },
    { id:"a8", name:"Mixte 2 Viandes", desc:"2 viandes au choix + crudités", price:14.00, meatChoice:2, sideChoice:true, hasSauces:true, hasSupplements:true },
    { id:"a9", name:"Mixte 3 Viandes", desc:"3 viandes au choix + crudités", price:17.00, meatChoice:3, sideChoice:true, hasSauces:true, hasSupplements:true },
    { id:"a10", name:"Végétarienne", desc:"Crudités, concombre, féta", price:9.50, sideChoice:true, hasSauces:true, hasSupplements:true },
    { id:"a11", name:"Végétarienne Falafels", desc:"Crudités, concombre, féta, falafels", price:11.00, sideChoice:true, hasSauces:true, hasSupplements:true },
  ],
  petiteFaim: [
    { id:"pf1", name:"Mini Yufka ou Mini Kébab", desc:"", price:4.50, hasSauces:true },
    { id:"pf2", name:"Mini Burger / 5 Nuggets / Mini Wrap", desc:"Poulet pané", price:3.50, hasSauces:true },
    { id:"pf3", name:"Barquette de Viande (petite)", desc:"", price:6.00, hasSauces:true },
    { id:"pf4", name:"Barquette de Viande (moyenne)", desc:"", price:7.00, hasSauces:true },
    { id:"pf5", name:"Barquette de Viande (grande)", desc:"", price:8.00, hasSauces:true },
    { id:"pf6", name:"Frites (petite)", desc:"", price:2.50, hasSauces:true },
    { id:"pf7", name:"Frites (moyenne)", desc:"", price:3.50, hasSauces:true },
    { id:"pf8", name:"Frites (grande)", desc:"", price:4.50, hasSauces:true },
    { id:"pf9", name:"Potatoes (petite)", desc:"", price:3.00, hasSauces:true },
    { id:"pf10", name:"Potatoes (moyenne)", desc:"", price:4.00, hasSauces:true },
    { id:"pf11", name:"Potatoes (grande)", desc:"", price:5.00, hasSauces:true },
    { id:"pf12", name:"Hot Dog", desc:"", price:5.00, menuPrice:8.00, hasSauces:true, hasSupplements:true },
    { id:"pf13", name:"Chicken Filet", desc:"Véritable filet de poulet pané PP", price:1.00, hasSauces:true },
  ],
  enfants: [
    { id:"e1", name:"Kilyan Box / Yélize Box", desc:"1 petit burger OU 5 nuggets OU viande kébab OU wrap poulet pané OU falafel + petite frite + jus 20cl + SURPRISE", price:7.00, meatChoice:1, hasSauces:true },
  ],
  desserts: [
    { id:"d1", name:"Tarte Tatin", desc:"", price:4.00 },
    { id:"d2", name:"Glace Ben & Jerry's", desc:"Cookie Dough ou Chocolate Fudge Brownie", price:4.00 },
    { id:"d3", name:"Tiramisu", desc:"Spéculos ou café", price:4.00 },
    { id:"d4", name:"Crêpe au Sucre", desc:"", price:3.00 },
    { id:"d5", name:"Crêpe Garnie", desc:"Pâte à tartiner, caramel beurre salé, fraise ou myrtille", price:3.50 },
    { id:"d6", name:"Muffin Vanille-Chocolat", desc:"", price:2.50 },
    { id:"d7", name:"Cookies Tout Chocolat", desc:"", price:2.50 },
    { id:"d8", name:"Café", desc:"", price:1.50 },
    { id:"d9", name:"Liqueur de Bluets des Vosges", desc:"", price:3.00 },
  ],
  boissons: [
    { id:"bo1", name:"Sirop", desc:"", price:1.50 },
    { id:"bo2", name:"Canette 33cl", desc:"", price:2.00 },
    { id:"bo3", name:"Diabolo", desc:"", price:2.50 },
    { id:"bo4", name:"Redbull 25cl", desc:"", price:3.00 },
    { id:"bo5", name:"Bière Pression", desc:"", price:3.00 },
    { id:"bo6", name:"Picon Bière", desc:"", price:3.50 },
    { id:"bo7", name:"Amer Blaise (Mirabelle)", desc:"", price:3.50 },
    { id:"bo8", name:"Bière Artisanale", desc:"", price:5.00 },
    { id:"bo9", name:"Efes (Bière Turque)", desc:"", price:3.50 },
    { id:"bo10", name:"Désperados / Smirnoff", desc:"", price:4.50 },
    { id:"bo11", name:"Kir Cassis ou Mirabelle / Martini Blanc", desc:"", price:3.50 },
    { id:"bo12", name:"Vin au Verre", desc:"Rouge, rosé ou blanc", price:3.00 },
    { id:"bo13", name:"Bordeaux 75cl", desc:"", price:15.00 },
    { id:"bo14", name:"Rosé Lâl ou Rouge Yakut 37,5cl", desc:"Vin turc", price:9.00 },
    { id:"bo15", name:"Rosé Lâl ou Rouge Yakut 75cl", desc:"Vin turc", price:15.00 },
  ],
};

// ─── CustomizationModal ─────────────────────────────────────
function CustomModal({ item, onClose, onConfirm }) {
  const [formule, setFormule] = useState(false);
  const [viandes, setViandes] = useState([]);
  const [sauces, setSauces] = useState([]);
  const [supplements, setSupplements] = useState([]);
  const [side, setSide] = useState(item.sideChoice ? "Frites" : null);

  const suppTotal = supplements.reduce((s, x) => s + x.price, 0);
  const baseP = formule && item.menuPrice ? item.menuPrice : item.price;
  const totalP = baseP + suppTotal;
  const meatOK = !item.meatChoice || viandes.length === item.meatChoice;

  function toggleViande(v) {
    if (item.meatChoice === 1) { setViandes([v]); return; }
    setViandes(p => p.includes(v) ? p.filter(x => x !== v) : p.length < item.meatChoice ? [...p, v] : p);
  }

  function toggleSauce(s) {
    setSauces(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  }

  function toggleSup(sup) {
    setSupplements(p => p.find(x => x.name === sup.name) ? p.filter(x => x.name !== sup.name) : [...p, sup]);
  }

  function handleAdd() {
    const opts = { formule, viandes, sauces, supplements, side };
    const key = `${item.id}_${JSON.stringify(opts)}`;
    onConfirm({ key, item, unitPrice: totalP, options: opts });
    onClose();
  }

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontWeight: 800, fontSize: 11, color: "#e8400c", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );

  const Chip = ({ label, selected, onClick, price, disabled }) => (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "7px 13px", borderRadius: 20, margin: "3px",
      border: selected ? "none" : "1.5px solid #e0d8d0",
      background: selected ? "linear-gradient(135deg,#ff6b1a,#e8400c)" : disabled ? "#f5f0eb" : "#fff",
      color: selected ? "#fff" : disabled ? "#ccc" : "#1a1207",
      fontWeight: selected ? 700 : 500, fontSize: 13,
      cursor: disabled ? "not-allowed" : "pointer",
      boxShadow: selected ? "0 2px 8px rgba(232,64,12,0.3)" : "none",
      transition: "all 0.15s",
    }}>
      {label}{price ? ` +${price.toFixed(2).replace(".", ",")}€` : ""}
    </button>
  );

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 50,
      display: "flex", alignItems: "flex-end",
    }}>
      <div style={{
        background: "#faf7f3", width: "100%", maxHeight: "92vh",
        borderRadius: "24px 24px 0 0", display: "flex", flexDirection: "column",
        animation: "slideUp 0.3s ease-out", overflow: "hidden",
      }}>

        {/* ── Modal Header ── */}
        <div style={{
          background: "linear-gradient(135deg,#ff6b1a,#e8400c)",
          padding: "20px 20px 16px", flexShrink: 0,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1, paddingRight: 12 }}>
              <div style={{ fontWeight: 900, fontSize: 18, color: "#fff" }}>{item.name}</div>
              {item.desc && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 3, lineHeight: 1.4 }}>{item.desc}</div>}
            </div>
            <button onClick={onClose} style={{
              background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%",
              width: 30, height: 30, color: "#fff", fontWeight: 700, cursor: "pointer",
              fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>✕</button>
          </div>

          {/* Formule toggle */}
          {item.menuPrice && (
            <div style={{
              display: "flex", background: "rgba(255,255,255,0.15)",
              borderRadius: 12, padding: 4, marginTop: 14, gap: 4,
            }}>
              {[
                { label: `Seul · ${item.price.toFixed(2).replace(".",",")}€`, val: false },
                { label: `Formule · ${item.menuPrice.toFixed(2).replace(".",",")}€`, val: true },
              ].map(({ label, val }) => (
                <button key={String(val)} onClick={() => setFormule(val)} style={{
                  flex: 1, padding: "9px 6px", borderRadius: 10, border: "none",
                  background: formule === val ? "#fff" : "transparent",
                  color: formule === val ? "#e8400c" : "rgba(255,255,255,0.85)",
                  fontWeight: 800, fontSize: 13, cursor: "pointer", transition: "all 0.2s",
                }}>{label}</button>
              ))}
            </div>
          )}
          {formule && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 6, textAlign: "center" }}>
              Formule = sandwich + petite frite ou salade + boisson 33cl non alcoolisée
            </div>
          )}
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 0" }}>

          {/* Choix viande(s) */}
          {item.meatChoice && (
            <Section title={`Choix viande${item.meatChoice > 1 ? "s" : ""} — ${item.meatChoice === 1 ? "1 au choix" : `${item.meatChoice} au choix`} *`}>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {VIANDES.map(v => (
                  <Chip key={v} label={v}
                    selected={viandes.includes(v)}
                    disabled={!viandes.includes(v) && viandes.length >= item.meatChoice}
                    onClick={() => toggleViande(v)}
                  />
                ))}
              </div>
              {viandes.length > 0 && (
                <div style={{ fontSize: 12, color: "#6b5c4e", marginTop: 7, fontWeight: 600 }}>
                  ✓ {viandes.join(" · ")}
                  {item.meatChoice > 1 && (
                    <span style={{ color: viandes.length < item.meatChoice ? "#e8400c" : "#22a06b", marginLeft: 6 }}>
                      ({viandes.length}/{item.meatChoice})
                    </span>
                  )}
                </div>
              )}
              {!meatOK && viandes.length === 0 && (
                <div style={{ fontSize: 11, color: "#e8400c", marginTop: 5 }}>
                  ⚠ Veuillez choisir {item.meatChoice} viande{item.meatChoice > 1 ? "s" : ""}
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
                    border: side === s ? "none" : "1.5px solid #e0d8d0",
                    background: side === s ? "linear-gradient(135deg,#ff6b1a,#e8400c)" : "#fff",
                    color: side === s ? "#fff" : "#1a1207",
                    fontWeight: 700, fontSize: 14, cursor: "pointer",
                    boxShadow: side === s ? "0 3px 12px rgba(232,64,12,0.3)" : "0 1px 4px rgba(0,0,0,0.07)",
                    transition: "all 0.2s",
                  }}>
                    {s === "Frites" ? "🍟" : "🌾"} {s}
                  </button>
                ))}
              </div>
            </Section>
          )}

          {/* Sauces */}
          {item.hasSauces && (
            <Section title="Sauces (incluses)">
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {SAUCES.map(s => (
                  <Chip key={s} label={s} selected={sauces.includes(s)} onClick={() => toggleSauce(s)} />
                ))}
              </div>
              {sauces.length > 0 && (
                <div style={{ fontSize: 12, color: "#6b5c4e", marginTop: 7, fontWeight: 600 }}>
                  ✓ {sauces.join(" · ")}
                </div>
              )}
            </Section>
          )}

          {/* Suppléments */}
          {item.hasSupplements && (
            <Section title="Suppléments (optionnels)">
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {SUPPLEMENTS.map(sup => (
                  <Chip key={sup.name} label={sup.name} price={sup.price}
                    selected={!!supplements.find(s => s.name === sup.name)}
                    onClick={() => toggleSup(sup)}
                  />
                ))}
              </div>
              {supplements.length > 0 && (
                <div style={{ fontSize: 12, color: "#6b5c4e", marginTop: 7, fontWeight: 600 }}>
                  ✓ {supplements.map(s => s.name).join(" · ")} (+{suppTotal.toFixed(2).replace(".",",")}€)
                </div>
              )}
            </Section>
          )}

          <div style={{ height: 16 }} />
        </div>

        {/* ── Footer ── */}
        <div style={{ padding: "14px 20px 20px", background: "#fff", borderTop: "1px solid #f0ece6", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: "#9c8d7a", lineHeight: 1.4 }}>
              {formule ? "Formule menu" : "Article seul"}
              {suppTotal > 0 && <span style={{ color: "#e8400c" }}> + {fmt(suppTotal)} supp.</span>}
            </div>
            <div style={{ fontWeight: 900, fontSize: 24, color: "#e8400c" }}>{fmt(totalP)}</div>
          </div>
          <button onClick={handleAdd} disabled={!meatOK} style={{
            width: "100%",
            background: meatOK ? "linear-gradient(135deg,#ff6b1a,#e8400c)" : "#e0d8d0",
            color: meatOK ? "#fff" : "#9c8d7a",
            border: "none", borderRadius: 14, padding: "16px",
            fontWeight: 900, fontSize: 15, cursor: meatOK ? "pointer" : "not-allowed",
            boxShadow: meatOK ? "0 4px 18px rgba(232,64,12,0.4)" : "none",
            transition: "all 0.2s",
          }}>
            {meatOK
              ? `✓ Ajouter au panier · ${fmt(totalP)}`
              : `Choisissez encore ${item.meatChoice - viandes.length} viande(s)`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Cart Panel ──────────────────────────────────────────────
function CartPanel({ cart, onClose, onClear, onQtyChange, total }) {
  const [done, setDone] = useState(false);
  const entries = Object.values(cart);

  if (done) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:16, padding:32 }}>
      <div style={{ fontSize:60 }}>✅</div>
      <div style={{ fontWeight:900, fontSize:22, color:"#1a1207", textAlign:"center" }}>Commande envoyée !</div>
      <div style={{ color:"#9c8d7a", textAlign:"center", fontSize:14 }}>Votre commande a été transmise à l'équipe AKM Resto'.</div>
      <div style={{ fontWeight:700, fontSize:18, color:"#e8400c" }}>Total : {fmt(total)}</div>
      <button onClick={() => { onClear(); setDone(false); onClose(); }} style={{
        background:"linear-gradient(135deg,#ff6b1a,#e8400c)", color:"#fff", border:"none",
        borderRadius:14, padding:"14px 32px", fontWeight:800, fontSize:15, cursor:"pointer",
        boxShadow:"0 4px 14px rgba(232,64,12,0.35)"
      }}>Nouvelle commande</button>
    </div>
  );

  function optSummary(options) {
    const parts = [];
    if (options.formule) parts.push("Formule menu");
    if (options.viandes?.length) parts.push(options.viandes.join(", "));
    if (options.side) parts.push(options.side);
    if (options.sauces?.length) parts.push("Sauce: " + options.sauces.join(", "));
    if (options.supplements?.length) parts.push(options.supplements.map(s => s.name).join(", "));
    return parts;
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      {/* Header */}
      <div style={{ padding:"20px 20px 12px", borderBottom:"1px solid #f0ece6", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
        <div style={{ fontWeight:900, fontSize:20, color:"#1a1207" }}>🛒 Ma Commande</div>
        <button onClick={onClose} style={{ background:"#f5f0eb", border:"none", borderRadius:"50%", width:32, height:32, cursor:"pointer", fontWeight:700, fontSize:16, color:"#9c8d7a" }}>✕</button>
      </div>

      {entries.length === 0 ? (
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:"#9c8d7a", gap:12, padding:32 }}>
          <div style={{ fontSize:48 }}>🛒</div>
          <div style={{ fontWeight:600 }}>Votre panier est vide</div>
          <div style={{ fontSize:13, textAlign:"center" }}>Ajoutez des articles depuis le menu</div>
        </div>
      ) : (
        <>
          <div style={{ flex:1, overflowY:"auto", padding:"10px 16px" }}>
            {entries.map(({ key, item, qty, unitPrice, options }) => (
              <div key={key} style={{ padding:"12px 0", borderBottom:"1px solid #f5f0eb" }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:"#1a1207" }}>{item.name}</div>
                    {/* Options tags */}
                    <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:4 }}>
                      {optSummary(options).map((tag, i) => (
                        <span key={i} style={{
                          fontSize:10, background:"#fff4ee", color:"#c73009",
                          borderRadius:10, padding:"2px 7px", fontWeight:600,
                          border:"1px solid #f9c4ae",
                        }}>{tag}</span>
                      ))}
                    </div>
                    <div style={{ fontSize:13, color:"#e8400c", fontWeight:700, marginTop:5 }}>{fmt(unitPrice)} × {qty}</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                    <button onClick={() => onQtyChange(key, -1)} style={{
                      width:26, height:26, borderRadius:"50%", border:"1.5px solid #e8400c",
                      background:"#fff", color:"#e8400c", fontWeight:900, fontSize:16,
                      cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                    }}>−</button>
                    <span style={{ fontWeight:800, minWidth:16, textAlign:"center" }}>{qty}</span>
                    <button onClick={() => onQtyChange(key, +1)} style={{
                      width:26, height:26, borderRadius:"50%", border:"none",
                      background:"linear-gradient(135deg,#ff6b1a,#e8400c)", color:"#fff",
                      fontWeight:900, fontSize:16, cursor:"pointer",
                      display:"flex", alignItems:"center", justifyContent:"center",
                    }}>+</button>
                    <div style={{ fontWeight:800, fontSize:14, color:"#1a1207", minWidth:58, textAlign:"right" }}>
                      {fmt(unitPrice * qty)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ padding:"14px 20px 20px", borderTop:"2px solid #f0ece6", background:"#fff", flexShrink:0 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <span style={{ fontWeight:700, fontSize:16 }}>Total</span>
              <span style={{ fontWeight:900, fontSize:24, color:"#e8400c" }}>{fmt(total)}</span>
            </div>
            <button onClick={() => openTallyCheckout(cart, total)} style={{
              width:"100%", background:"linear-gradient(135deg,#ff6b1a,#e8400c)",
              color:"#fff", border:"none", borderRadius:14, padding:16,
              fontWeight:900, fontSize:16, cursor:"pointer",
              boxShadow:"0 4px 18px rgba(232,64,12,0.4)",
            }}>
              Finaliser ma commande · {fmt(total)}
            </button>
            <button onClick={onClear} style={{
              width:"100%", background:"transparent", color:"#9c8d7a", border:"none",
              marginTop:8, padding:8, fontWeight:600, fontSize:13, cursor:"pointer",
            }}>Vider le panier</button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Item Card ───────────────────────────────────────────────
function ItemCard({ item, totalQty, onOpen }) {
  return (
    <div style={{
      background:"#fff", borderRadius:16, padding:"14px 16px",
      display:"flex", alignItems:"center", gap:12,
      boxShadow:"0 2px 12px rgba(0,0,0,0.07)", border:"1.5px solid #f0ece6",
      marginBottom:10,
    }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:700, fontSize:15, color:"#1a1207", lineHeight:1.3 }}>{item.name}</div>
        {item.desc && <div style={{ fontSize:12, color:"#9c8d7a", marginTop:3, lineHeight:1.4 }}>{item.desc}</div>}
        <div style={{ marginTop:6, display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
          <span style={{ fontWeight:800, fontSize:16, color:"#e8400c" }}>{fmt(item.price)}</span>
          {item.menuPrice && (
            <span style={{ fontSize:11, background:"#fff4ee", color:"#e8400c", border:"1px solid #f9c4ae", borderRadius:20, padding:"2px 8px", fontWeight:600 }}>
              Formule {fmt(item.menuPrice)}
            </span>
          )}
          {(item.meatChoice || item.sideChoice || item.hasSauces || item.hasSupplements) && (
            <span style={{ fontSize:10, background:"#f0f7ff", color:"#3b82f6", borderRadius:20, padding:"2px 8px", fontWeight:600 }}>
              ✏️ Personnalisable
            </span>
          )}
        </div>
      </div>
      <button onClick={onOpen} style={{
        position:"relative", width:38, height:38, borderRadius:"50%", border:"none",
        background:"linear-gradient(135deg,#ff6b1a,#e8400c)", color:"#fff",
        fontWeight:900, fontSize:22, cursor:"pointer", flexShrink:0,
        display:"flex", alignItems:"center", justifyContent:"center",
        boxShadow:"0 3px 10px rgba(232,64,12,0.35)",
      }}>
        +
        {totalQty > 0 && (
          <span style={{
            position:"absolute", top:-5, right:-5, background:"#1a1207",
            color:"#fff", borderRadius:"50%", width:18, height:18,
            fontSize:10, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center",
          }}>{totalQty}</span>
        )}
      </button>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────
export default function AKMRestoApp() {
  const [activeCategory, setActiveCategory] = useState("burgers");
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [modalItem, setModalItem] = useState(null);
  const navRef = useRef(null);

  // Simple direct-add (desserts, boissons with no flags)
  const needsModal = (item) =>
    item.meatChoice || item.sideChoice || item.hasSauces || item.hasSupplements || item.menuPrice;

  function handleOpen(item) {
    if (needsModal(item)) {
      setModalItem(item);
    } else {
      const key = `${item.id}_simple`;
      setCart(prev => ({
        ...prev,
        [key]: { key, item, qty: (prev[key]?.qty || 0) + 1, unitPrice: item.price, options: {} }
      }));
    }
  }

  function handleConfirm({ key, item, unitPrice, options }) {
    setCart(prev => ({
      ...prev,
      [key]: { key, item, qty: (prev[key]?.qty || 0) + 1, unitPrice, options }
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

  const total = Object.values(cart).reduce((s, e) => s + e.unitPrice * e.qty, 0);
  const totalItems = Object.values(cart).reduce((s, e) => s + e.qty, 0);

  // Count qty per item.id for badge
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
    <div style={{ fontFamily:"'Segoe UI', system-ui, sans-serif", background:"#faf7f3", minHeight:"100vh", maxWidth:480, margin:"0 auto", position:"relative" }}>

      {/* ── Header ── */}
      <div style={{
        background:"linear-gradient(135deg,#ff6b1a 0%,#e8400c 60%,#c73009 100%)",
        padding:"20px 20px 16px", position:"sticky", top:0, zIndex:20,
        boxShadow:"0 4px 20px rgba(232,64,12,0.3)",
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontWeight:900, fontSize:26, color:"#fff", letterSpacing:"-0.5px", textShadow:"0 2px 8px rgba(0,0,0,0.15)" }}>AKM Resto'</div>
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
                position:"absolute", top:-6, right:-6, background:"#fff", color:"#e8400c",
                borderRadius:"50%", width:20, height:20, fontSize:11, fontWeight:900,
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:"0 2px 6px rgba(0,0,0,0.2)",
              }}>{totalItems}</span>
            )}
          </button>
        </div>
      </div>

      {/* ── Category Nav ── */}
      <div ref={navRef} style={{
        display:"flex", gap:8, overflowX:"auto", padding:"12px 16px",
        scrollbarWidth:"none", background:"#fff",
        borderBottom:"1px solid #f0ece6",
        position:"sticky", top:90, zIndex:15,
        boxShadow:"0 2px 8px rgba(0,0,0,0.04)",
      }}>
        {CATEGORIES.map(cat => (
          <button key={cat.key} data-key={cat.key} onClick={() => selectCat(cat.key)} style={{
            flexShrink:0, padding:"6px 14px", borderRadius:20,
            border: activeCategory === cat.key ? "none" : "1.5px solid #e8e0d8",
            background: activeCategory === cat.key ? "linear-gradient(135deg,#ff6b1a,#e8400c)" : "#faf7f3",
            color: activeCategory === cat.key ? "#fff" : "#6b5c4e",
            fontWeight:700, fontSize:12, cursor:"pointer", whiteSpace:"nowrap",
            transition:"all 0.2s",
            boxShadow: activeCategory === cat.key ? "0 3px 10px rgba(232,64,12,0.3)" : "none",
          }}>
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* ── Items ── */}
      <div style={{ padding:"16px 16px 110px" }}>
        <div style={{ fontWeight:900, fontSize:22, color:"#1a1207", marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
          <span>{currentCat?.emoji}</span><span>{currentCat?.label}</span>
        </div>

        {currentItems.map(item => (
          <ItemCard key={item.id} item={item} totalQty={qtyByItemId[item.id] || 0} onOpen={() => handleOpen(item)} />
        ))}

        {/* Notes */}
        {["sandwichs","assiettes","burgers","burgersSpeciaux","wraps","gundi"].includes(activeCategory) && (
          <div style={{ background:"#fff8f5", border:"1px solid #f9c4ae", borderRadius:12, padding:"10px 14px", fontSize:12, color:"#9c6a4e", marginTop:8 }}>
            💡 Suppléments : oeuf, féta, munster, galette de pdt <strong>+1€</strong> · viande <strong>+3€</strong>
          </div>
        )}
        {["wraps","gundi","burgers","burgersSpeciaux","sandwichs","petiteFaim"].includes(activeCategory) && (
          <div style={{ background:"#f0f7ff", border:"1px solid #bfdbfe", borderRadius:12, padding:"10px 14px", fontSize:12, color:"#3b5999", marginTop:8 }}>
            📋 <strong>Formule menu</strong> = article + petite frite ou salade + boisson 33cl non alcoolisée
          </div>
        )}
      </div>

      {/* ── Floating Cart Button ── */}
      {totalItems > 0 && !cartOpen && (
        <button onClick={() => setCartOpen(true)} style={{
          position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
          background:"linear-gradient(135deg,#ff6b1a,#e8400c)", color:"#fff", border:"none",
          borderRadius:20, padding:"16px 28px", fontWeight:900, fontSize:15, cursor:"pointer",
          boxShadow:"0 6px 24px rgba(232,64,12,0.45)", display:"flex", alignItems:"center",
          gap:12, whiteSpace:"nowrap", zIndex:30, animation:"pulse 2s infinite",
        }}>
          <span style={{ background:"rgba(255,255,255,0.25)", borderRadius:"50%", width:24, height:24, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:900 }}>
            {totalItems}
          </span>
          Voir ma commande · {fmt(total)}
        </button>
      )}

      {/* ── Cart Overlay ── */}
      {cartOpen && (
        <div onClick={e => e.target === e.currentTarget && setCartOpen(false)} style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:40,
          display:"flex", alignItems:"flex-end",
        }}>
          <div style={{
            background:"#fff", width:"100%", maxHeight:"88vh",
            borderRadius:"24px 24px 0 0", display:"flex", flexDirection:"column",
            animation:"slideUp 0.3s ease-out",
          }}>
            <CartPanel cart={cart} total={total} onClose={() => setCartOpen(false)}
              onClear={() => setCart({})} onQtyChange={handleQtyChange} />
          </div>
        </div>
      )}

      {/* ── Customization Modal ── */}
      {modalItem && (
        <CustomModal item={modalItem} onClose={() => setModalItem(null)} onConfirm={handleConfirm} />
      )}

      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        ::-webkit-scrollbar{display:none}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes pulse{0%,100%{box-shadow:0 6px 24px rgba(232,64,12,0.45)}50%{box-shadow:0 6px 32px rgba(232,64,12,0.65)}}
        button:active{opacity:0.85}
      `}</style>
    </div>
  );
}
