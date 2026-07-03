// ============================================================
// Instrument registry — PiMedCal
// Each instrument is pure data + a pure compute(state) function.
// To add a new tool: add one entry to INSTRUMENTS below.
// ============================================================

(function (global) {
  "use strict";

  // ----------------------------------------------------------------
  // Shared parameter registry — the "Patient Parameters" panel.
  // key   = state field name (used by any instrument's compute fn)
  // usedBy = display-only list of which tabs read this field
  // ----------------------------------------------------------------
  const SHARED_PARAMS = [
    { key: "age", label: "Age", unit: "years", type: "number", step: 1, placeholder: "e.g. 68", usedBy: ["Shorr"] },
    { key: "tempC", label: "Temperature", unit: "°C", type: "number", step: 0.1, placeholder: "e.g. 37.0", usedBy: ["SIRS", "CPIS"] },
    { key: "hr", label: "Heart rate", unit: "bpm", type: "number", step: 1, placeholder: "e.g. 80", usedBy: ["SIRS"] },
    { key: "rr", label: "Respiratory rate", unit: "/min", type: "number", step: 1, placeholder: "e.g. 16", usedBy: ["SIRS"] },
    { key: "paco2", label: "PaCO₂", unit: "mmHg", type: "number", step: 0.1, placeholder: "optional", usedBy: ["SIRS"] },
    { key: "wbc", label: "WBC", unit: "/mm³", type: "number", step: 100, placeholder: "e.g. 7500", usedBy: ["SIRS", "CPIS"] },
    { key: "bandsPct", label: "Bands", unit: "%", type: "number", step: 1, placeholder: "optional", usedBy: ["SIRS"] },
    { key: "bandsAbs", label: "Band forms", unit: "/mm³", type: "number", step: 50, placeholder: "optional", usedBy: ["CPIS"] },
    { key: "sbp", label: "Systolic BP", unit: "mmHg", type: "number", step: 1, placeholder: "e.g. 118", usedBy: ["SIRS"] },
    { key: "lactate", label: "Lactate", unit: "mmol/L", type: "number", step: 0.1, placeholder: "e.g. 1.4", usedBy: ["SIRS"] },
  ];

  // Core parameters counted toward the "X of Y core parameters entered" readout.
  // (Kept distinct from SHARED_PARAMS in case future fields are decorative/optional-only.)
  const CORE_PARAM_KEYS = ["age", "tempC", "hr", "rr", "wbc"];

  function num(v) {
    if (v === null || v === undefined) return null;
    const s = String(v).trim();
    if (s === "") return null;
    const n = parseFloat(s);
    return Number.isNaN(n) ? null : n;
  }

  // ----------------------------------------------------------------
  // Helper to build a standard criterion result object
  // ----------------------------------------------------------------
  function crit(label, met, pts, reason, threshold, opts) {
    return Object.assign({
      label, met, pts,
      reason: reason || "",
      threshold: threshold || "",
      entered: met !== null,
    }, opts || {});
  }

  // ================================================================
  // INSTRUMENT 1 — SIRS / Sepsis / Severe Sepsis / Septic Shock
  // ================================================================
  const sirsInstrument = {
    id: "sirs",
    shortName: "SIRS / Sepsis",
    eyebrow: "Instrument 01",
    title: "SIRS, Sepsis & Septic Shock Criteria",
    desc: "Stages systemic inflammatory response through sepsis to septic shock. SIRS requires ≥2 of 4 criteria; sepsis adds a suspected/confirmed infection source; severe sepsis adds organ dysfunction, hypotension, or hypoperfusion; septic shock requires hypotension despite adequate fluid resuscitation.",
    maxScore: 4,
    scoreLabel: "SIRS criteria met",
    thresholdLine: { value: 2, label: "≥2 SIRS+" },
    kind: "cascade", // custom render: SIRS ledger + cascade steps

    // Instrument-specific (non-shared) fields
    ownFields: {
      cbInfection: { type: "checkbox", default: false },
      sbpDrop: { type: "checkbox", default: false },
      cbShock: { type: "checkbox", default: false },
    },

    compute(state) {
      const tempC = num(state.tempC);
      const hr = num(state.hr);
      const rr = num(state.rr);
      const paco2 = num(state.paco2);
      const wbc = num(state.wbc);
      const bands = num(state.bandsPct);

      let tempMet = null, tempReason = "";
      if (tempC !== null) {
        tempMet = (tempC > 38) || (tempC < 36);
        tempReason = tempMet ? (tempC > 38 ? `${tempC}°C > 38°C` : `${tempC}°C < 36°C`) : `${tempC}°C within 36–38°C`;
      }

      let hrMet = null, hrReason = "";
      if (hr !== null) {
        hrMet = hr > 90;
        hrReason = hrMet ? `${hr} bpm > 90` : `${hr} bpm ≤ 90`;
      }

      let rrMet = null, rrReason = "";
      if (rr !== null || paco2 !== null) {
        const rrFlag = rr !== null && rr > 20;
        const paco2Flag = paco2 !== null && paco2 < 32;
        rrMet = rrFlag || paco2Flag;
        const parts = [];
        if (rr !== null) parts.push(`RR ${rr}/min ${rrFlag ? ">20" : "≤20"}`);
        if (paco2 !== null) parts.push(`PaCO₂ ${paco2} mmHg ${paco2Flag ? "<32" : "≥32"}`);
        rrReason = parts.join(" · ");
      }

      let wbcMet = null, wbcReason = "";
      if (wbc !== null || bands !== null) {
        const wbcHigh = wbc !== null && wbc > 12000;
        const wbcLow = wbc !== null && wbc < 4000;
        const bandsHigh = bands !== null && bands > 10;
        wbcMet = wbcHigh || wbcLow || bandsHigh;
        const parts = [];
        if (wbc !== null) parts.push(`WBC ${wbc}/mm³ ${wbcHigh ? ">12,000" : wbcLow ? "<4,000" : "4,000–12,000"}`);
        if (bands !== null) parts.push(`Bands ${bands}% ${bandsHigh ? ">10%" : "≤10%"}`);
        wbcReason = parts.join(" · ");
      }

      const criteria = [
        crit("Temperature", tempMet, tempMet ? 1 : 0, tempReason, ">38°C or <36°C", { rowKey: "temp", fromShared: true }),
        crit("Heart rate", hrMet, hrMet ? 1 : 0, hrReason, ">90 bpm", { rowKey: "hr", fromShared: true }),
        crit("Respiratory rate / PaCO₂", rrMet, rrMet ? 1 : 0, rrReason, "RR>20/min or PaCO₂<32 mmHg", { rowKey: "rr", fromShared: true }),
        crit("White blood cell count", wbcMet, wbcMet ? 1 : 0, wbcReason, ">12,000, <4,000/mm³, or >10% bands", { rowKey: "wbc", fromShared: true }),
      ];
      criteria.forEach(c => { if (c.met === null) c.pts = null; });

      const metCount = criteria.filter(c => c.met === true).length;
      const enteredCount = criteria.filter(c => c.entered).length;
      const allEntered = enteredCount === criteria.length;
      const anyEntered = enteredCount > 0;
      const sirsPositive = metCount >= 2;

      // Cascade
      const infection = !!state.cbInfection;
      const sepsisPositive = sirsPositive && infection;

      const lactate = num(state.lactate);
      const sbp = num(state.sbp);
      const sbpDrop = !!state.sbpDrop;
      const lacticAcidosis = lactate !== null && lactate >= 2;
      const sbpLow = sbp !== null && sbp < 90;
      const organDysfunctionFlag = lacticAcidosis || sbpLow || sbpDrop;
      const organAnyEntered = (lactate !== null) || (sbp !== null) || sbpDrop;
      const severeSepsisPositive = sepsisPositive && organDysfunctionFlag;

      const shockMarked = !!state.cbShock;
      const septicShockPositive = severeSepsisPositive && shockMarked;

      let verdictFlag, headline, interpretation;
      const missing = [];
      if (!anyEntered) {
        verdictFlag = "neutral";
        headline = "Enter values to begin screening.";
        interpretation = "";
      } else {
        // Missing-parameter detection for completeness messaging
        criteria.forEach(c => { if (!c.entered) missing.push(c.label); });

        if (septicShockPositive) {
          headline = "SEPTIC SHOCK"; verdictFlag = "positive";
          interpretation = "Severe sepsis criteria are met and hypotension persists despite adequate fluid resuscitation. This stage warrants immediate aggressive management — broad-spectrum antibiotics and fluids should not be delayed pending labs.";
        } else if (severeSepsisPositive) {
          headline = "SEVERE SEPSIS"; verdictFlag = "positive";
          interpretation = "Sepsis criteria are met (SIRS ≥2 + suspected/confirmed infection) plus organ dysfunction, hypotension, or hypoperfusion (lactate ≥2 mmol/L, SBP <90 mmHg, or SBP drop ≥40 mmHg). Consider obtaining a lactate level, broad-spectrum antibiotics, IV fluids, and vasopressors as clinically appropriate.";
        } else if (sepsisPositive) {
          headline = "SEPSIS"; verdictFlag = "positive";
          interpretation = "SIRS criteria (≥2/4) are met with a suspected or confirmed infectious source. Consider obtaining a lactate level to assess hypoperfusion — a level ≥2 mmol/L is considered elevated.";
        } else if (sirsPositive) {
          headline = "SIRS POSITIVE — infection source not yet marked"; verdictFlag = "positive";
          interpretation = `${metCount}/4 SIRS criteria are met (≥2 threshold reached). A clinical assessment for an infectious etiology is the next step before this can be classified as sepsis.`;
        } else if (allEntered) {
          headline = "Below SIRS threshold"; verdictFlag = "negative";
          interpretation = `${metCount}/4 SIRS criteria met — below the ≥2 threshold required for a SIRS-positive classification.`;
        } else {
          headline = `Incomplete — ${missing.length} parameter${missing.length === 1 ? "" : "s"} missing`; verdictFlag = "incomplete";
          interpretation = `${metCount}/4 SIRS criteria currently met from data entered so far (${enteredCount}/4 entered). Missing: ${missing.join(", ")}.`;
        }
      }

      return {
        id: "sirs", criteria, metCount, maxScore: 4, anyEntered, allEntered, missing,
        verdictFlag, headline, interpretation,
        cascade: { sirsPositive, infection, sepsisPositive, lactate, sbp, sbpDrop, organDysfunctionFlag, organAnyEntered, severeSepsisPositive, shockMarked, septicShockPositive },
      };
    },
  };

  // ================================================================
  // INSTRUMENT 2 — CPIS (VAP)
  // ================================================================
  const cpisInstrument = {
    id: "cpis",
    shortName: "CPIS / VAP",
    eyebrow: "Instrument 02",
    title: "Clinical Pulmonary Infection Score (CPIS)",
    desc: "Six-domain score assisting in screening for ventilator-associated pneumonia (VAP) and predicting the likely benefit of pulmonary cultures. Maximum score 12. Scores >6 correlate with higher VAP likelihood, though the instrument's clinical utility remains debated.",
    maxScore: 12,
    scoreLabel: "CPIS total",
    thresholdLine: { value: 6, label: ">6 assoc." },
    kind: "ledger",

    ownFields: {
      secretions: { type: "select", default: "", options: [
        { value: "0", label: "<14+ (scant)" },
        { value: "1", label: "≥14+ (abundant, non-purulent)" },
        { value: "2", label: "≥14+ and purulent" },
      ]},
      pf: { type: "number", default: "" },
      ards: { type: "checkbox", default: false },
      xray: { type: "select", default: "", options: [
        { value: "0", label: "No infiltrate" },
        { value: "1", label: "Diffuse or patchy infiltrate" },
        { value: "2", label: "Localized infiltrate" },
      ]},
      culture: { type: "select", default: "", options: [
        { value: "0", label: "≤1+ pathogenic bacteria or no growth" },
        { value: "1", label: ">1+ pathogenic bacteria cultured" },
        { value: "2", label: ">1+ pathogenic bacteria, same organism on Gram stain >1+" },
      ]},
    },

    compute(state) {
      const tempVal = num(state.tempC);
      const wbcRaw = num(state.wbc);
      const bandsRaw = num(state.bandsAbs);
      const secretionsRaw = state.secretions;
      const secretionsSet = secretionsRaw !== "" && secretionsRaw !== undefined && secretionsRaw !== null;
      const secretions = secretionsSet ? parseInt(secretionsRaw, 10) : null;
      const pf = num(state.pf);
      const ards = !!state.ards;
      const xrayRaw = state.xray;
      const xraySet = xrayRaw !== "" && xrayRaw !== undefined && xrayRaw !== null;
      const xray = xraySet ? parseInt(xrayRaw, 10) : null;
      const cultureRaw = state.culture;
      const cultureSet = cultureRaw !== "" && cultureRaw !== undefined && cultureRaw !== null;
      const culture = cultureSet ? parseInt(cultureRaw, 10) : null;

      const wbcThousands = wbcRaw !== null ? wbcRaw / 1000 : null;

      function evalTemp(t) {
        if (t === null) return { pts: null, band: "" };
        if (t >= 39.0 || t <= 36.0) return { pts: 2, band: "≥39.0°C or ≤36.0°C" };
        if (t >= 38.5 && t <= 38.9) return { pts: 1, band: "38.5–38.9°C" };
        if (t >= 36.5 && t <= 38.4) return { pts: 0, band: "36.5–38.4°C" };
        return { pts: 0, band: "36.0–36.5°C — outside published bands; nearest band applied, please verify" };
      }
      function evalWbc(wbcK, bandsAbs) {
        if (wbcK === null) return { pts: null, band: "" };
        const bandsHigh = bandsAbs !== null && bandsAbs >= 500;
        if (wbcK >= 4 && wbcK <= 11) return { pts: 0, band: "4,000–11,000/mm³" };
        if (bandsHigh) return { pts: 2, band: "<4,000 or >11,000/mm³ + band forms ≥500" };
        return { pts: 1, band: "<4,000 or >11,000/mm³" };
      }
      function evalOx(pfVal, ardsFlag) {
        if (pfVal === null && !ardsFlag) return { pts: null, band: "" };
        if (ardsFlag) return { pts: 0, band: "ARDS present" };
        if (pfVal > 240) return { pts: 0, band: ">240 mmHg" };
        return { pts: 2, band: "≤240 mmHg, no ARDS" };
      }

      const tempRes = evalTemp(tempVal);
      const wbcRes = evalWbc(wbcThousands, bandsRaw);
      const oxRes = evalOx(pf, ards);

      const domains = [
        { key: "Temperature", entered: tempVal !== null, valueText: tempVal !== null ? `${tempVal}°C` : "not entered", band: tempRes.band || "—", pts: tempRes.pts, fromShared: true },
        { key: "White blood cell count", entered: wbcRaw !== null, valueText: wbcRaw !== null ? `${wbcRaw}/mm³${bandsRaw !== null ? ` (bands ${bandsRaw}/mm³)` : ""}` : "not entered", band: wbcRes.band || "—", pts: wbcRes.pts, fromShared: true },
        { key: "Tracheal secretions", entered: secretionsSet, valueText: secretionsSet ? ["<14+ (scant)", "≥14+ (abundant, non-purulent)", "≥14+ and purulent"][secretions] : "not entered", band: secretionsSet ? ["<14+", "≥14+", "≥14+ and purulent"][secretions] : "—", pts: secretionsSet ? secretions : null },
        { key: "Oxygenation (PaO₂/FiO₂)", entered: (pf !== null || ards), valueText: ards ? "ARDS present" : (pf !== null ? `${pf} mmHg` : "not entered"), band: oxRes.band || "—", pts: oxRes.pts },
        { key: "Pulmonary radiography", entered: xraySet, valueText: xraySet ? ["No infiltrate", "Diffuse or patchy infiltrate", "Localized infiltrate"][xray] : "not entered", band: xraySet ? ["No infiltrate", "Diffuse/patchy infiltrate", "Localized infiltrate"][xray] : "—", pts: xraySet ? xray : null },
        { key: "Tracheal aspirate culture", entered: cultureSet, valueText: cultureSet ? ["≤1+ pathogenic bacteria or no growth", ">1+ pathogenic bacteria", ">1+ pathogenic bacteria, same organism on Gram stain >1+"][culture] : "not entered", band: cultureSet ? ["≤1+/no growth", ">1+", ">1+ and Gram stain match >1+"][culture] : "—", pts: cultureSet ? culture : null },
      ];

      // All 6 domains now genuinely track entered/missing state — a select left at its
      // placeholder option contributes 0 to the score AND is flagged as missing, so a
      // clinician can never mistake "not yet assessed" for "assessed and clear."
      const anyEntered = domains.some(d => d.pts !== null);
      const allEntered = domains.every(d => d.pts !== null);
      const total = domains.reduce((sum, d) => sum + (d.pts || 0), 0);
      const missing = domains.filter(d => d.pts === null).map(d => d.key);


      let headline, verdictFlag, interpretation;
      if (!anyEntered) {
        headline = "Enter values to begin screening."; verdictFlag = "neutral"; interpretation = "";
      } else {
        const enteredCount = domains.filter(d => d.pts !== null).length;
        const completeness = allEntered ? "(all 6 domains entered)" : `(${enteredCount}/6 domains entered — score may change as remaining values are added)`;
        if (!allEntered) {
          headline = `Incomplete — ${missing.length} domain${missing.length === 1 ? "" : "s"} missing`;
          verdictFlag = "incomplete";
          interpretation = `Current partial score ${total}/12 ${completeness}. Missing: ${missing.join(", ")}.`;
        } else if (total > 6) {
          headline = `Score ${total}/12 — above VAP-associated threshold`;
          verdictFlag = "positive";
          interpretation = `The likelihood of VAP appears somewhat higher at scores >6 ${completeness}. CPIS's overall clinical utility and role remain uncertain, and it should not be relied on in isolation.`;
        } else {
          headline = `Score ${total}/12 — below VAP-associated threshold`;
          verdictFlag = "negative";
          interpretation = `Below the >6 mark associated with somewhat higher VAP likelihood ${completeness}. CPIS's clinical utility and management role remain unvalidated.`;
        }
      }

      return { id: "cpis", domains, total, maxScore: 12, anyEntered, allEntered, missing, verdictFlag, headline, interpretation };
    },
  };

  // ================================================================
  // INSTRUMENT 3 — DRIP Score
  // ================================================================
  const dripInstrument = {
    id: "drip",
    shortName: "DRIP Score",
    eyebrow: "Instrument 03",
    title: "Drug Resistance in Pneumonia (DRIP) Score",
    desc: "Predicts risk of community-acquired pneumonia due to drug-resistant pathogens (CAP-DRP), to guide whether broad-spectrum antibiotic coverage is warranted. Major risk factors score 2 points each; minor risk factors score 1 point each.",
    maxScore: 14,
    scoreLabel: "DRIP total",
    thresholdLine: { value: 4, label: "≥4 = high risk" },
    kind: "checklist",

    ownFields: {
      abx60: { type: "checkbox", default: false, label: "Antibiotic use within 60 days", pts: 2, group: "major" },
      ltc: { type: "checkbox", default: false, label: "Long-term care resident", help: "Not including assisted living or group home facilities", pts: 2, group: "major" },
      tubeFeed: { type: "checkbox", default: false, label: "Tube feeding", help: "NG, nasojejunal, or PEG", pts: 2, group: "major" },
      priorDrp: { type: "checkbox", default: false, label: "Prior drug-resistant pneumonia diagnosis within 1 year", pts: 2, group: "major" },
      hosp60: { type: "checkbox", default: false, label: "Hospitalization within 60 days", pts: 1, group: "minor" },
      copd: { type: "checkbox", default: false, label: "Chronic pulmonary disease", pts: 1, group: "minor" },
      poorFunction: { type: "checkbox", default: false, label: "Poor functional status", help: "Karnofsky Performance Status <70 or non-ambulatory status", pts: 1, group: "minor" },
      h2ppi: { type: "checkbox", default: false, label: "H2 blocker or PPI within 14 days", pts: 1, group: "minor" },
      woundCare: { type: "checkbox", default: false, label: "Active wound care at time of admission", pts: 1, group: "minor" },
      mrsaColon: { type: "checkbox", default: false, label: "MRSA colonization within 1 year", pts: 1, group: "minor" },
    },

    compute(state) {
      const fieldDefs = this.ownFields;
      const keys = Object.keys(fieldDefs);
      const criteria = keys.map(k => {
        const f = fieldDefs[k];
        const checked = !!state[k];
        const touched = !!state["__touched_" + k];
        return { key: k, label: f.label, help: f.help || "", pts: checked ? f.pts : 0, checked, touched, maxPts: f.pts, group: f.group };
      });

      const total = criteria.reduce((s, c) => s + c.pts, 0);
      const touchedCount = criteria.filter(c => c.touched).length;
      const allTouched = touchedCount === criteria.length;
      const anyTouched = touchedCount > 0;
      const missing = criteria.filter(c => !c.touched).map(c => c.label);

      let headline, verdictFlag, interpretation;
      if (!anyTouched) {
        headline = "Enter values to begin screening.";
        verdictFlag = "neutral";
        interpretation = "";
      } else if (!allTouched) {
        const positive = total >= 4;
        headline = `Incomplete — ${missing.length} factor${missing.length === 1 ? "" : "s"} not yet reviewed`;
        verdictFlag = "incomplete";
        interpretation = `Current partial score ${total}/14 from ${touchedCount}/10 factors reviewed so far${positive ? " (already at/above the ≥4 threshold from factors marked so far)" : ""}. Unreviewed factors default to 0 points but have not been clinically ruled out. Missing: ${missing.join(", ")}.`;
      } else {
        const positive = total >= 4;
        headline = positive
          ? `DRIP ${total}/14 — high risk for drug-resistant pathogens`
          : `DRIP ${total}/14 — low risk for drug-resistant pathogens`;
        verdictFlag = positive ? "positive" : "negative";
        interpretation = positive
          ? "Score ≥4 — this patient is more likely to require broad-spectrum antibiotic coverage."
          : "Score <4 — this patient can likely be treated without broad-spectrum antibiotic coverage.";
      }

      const anyEntered = anyTouched;
      const allEntered = allTouched;

      return { id: "drip", criteria, total, maxScore: 14, anyEntered, allEntered, missing, verdictFlag, headline, interpretation };
    },
  };

  // ================================================================
  // INSTRUMENT 4 — Shorr Score (MRSA Pneumonia)
  // ================================================================
  const shorrInstrument = {
    id: "shorr",
    shortName: "Shorr Score",
    eyebrow: "Instrument 04",
    title: "Shorr Score for MRSA Pneumonia",
    desc: "Identifies pneumonia patients at low risk for MRSA, to help guide the decision of whether to initiate empiric MRSA-directed treatment. Six factors score 1 point each, two score 2 points each, for a maximum of 10.",
    maxScore: 10,
    scoreLabel: "Shorr total",
    thresholdLine: { value: 1, label: ">1 = MRSA risk" },
    kind: "checklist",

    ownFields: {
      nhSnfLtac: { type: "checkbox", default: false, label: "Nursing home, skilled nursing facility, or long-term acute care exposure", help: "Within 90 days", pts: 1 },
      ivAbx: { type: "checkbox", default: false, label: "Prior IV antibiotic therapy", help: "Within 30 days", pts: 1 },
      hosp2d: { type: "checkbox", default: false, label: "Hospitalization for ≥2 days", help: "Within 90 days", pts: 2 },
      icu: { type: "checkbox", default: false, label: "ICU admission", help: "On or before index culture", pts: 2 },
      cvd: { type: "checkbox", default: false, label: "Any cerebrovascular disease", help: "Prior to admission", pts: 1 },
      dementia: { type: "checkbox", default: false, label: "Dementia", pts: 1 },
      femaleDm: { type: "checkbox", default: false, label: "Female with diabetes mellitus", pts: 1 },
    },

    compute(state) {
      const age = num(state.age);
      const ageMet = age !== null ? (age >= 19 && age <= 29) || age > 79 : null;
      const ageReason = age !== null ? `${age} years — ${ageMet ? "within 19–29 or >79" : "outside 19–29/>79"}` : "";

      const fieldDefs = this.ownFields;
      const keys = Object.keys(fieldDefs);
      const checklistCriteria = keys.map(k => {
        const f = fieldDefs[k];
        const checked = !!state[k];
        const touched = !!state["__touched_" + k];
        return { key: k, label: f.label, help: f.help || "", pts: checked ? f.pts : 0, checked, touched, maxPts: f.pts };
      });

      const ageCriterion = { key: "age", label: "Age 19–29 or >79 years", help: "Shared parameter — entered in Patient Parameters", pts: ageMet ? 1 : 0, checked: ageMet, touched: age !== null, maxPts: 1, entered: age !== null, reason: ageReason, fromShared: true };

      const criteria = [ageCriterion, ...checklistCriteria];
      const total = criteria.reduce((s, c) => s + (c.pts || 0), 0);

      const untouched = criteria.filter(c => !c.touched);
      const missing = untouched.map(c => c.label);
      const anyTouched = criteria.some(c => c.touched);
      const allTouched = untouched.length === 0;

      let headline, verdictFlag, interpretation;
      if (!anyTouched) {
        headline = "Enter values to begin screening.";
        verdictFlag = "neutral";
        interpretation = "";
      } else if (!allTouched) {
        headline = `Incomplete — ${missing.length} factor${missing.length === 1 ? "" : "s"} not yet reviewed`;
        verdictFlag = "incomplete";
        interpretation = `Current partial score ${total}/10 from factors reviewed so far. Unreviewed factors default to 0 points but have not been clinically ruled out. Missing: ${missing.join(", ")}.`;
      } else {
        const positive = total > 1;
        headline = positive
          ? `Shorr ${total}/10 — above threshold, consider MRSA risk`
          : `Shorr ${total}/10 — low risk for MRSA pneumonia`;
        verdictFlag = positive ? "positive" : "negative";
        interpretation = positive
          ? "Score >1 — in the derivation/validation studies this threshold carried ~93% sensitivity and ~55% specificity for MRSA pneumonia (PPV 68%, NPV 89%), with prevalence rising further above a score of 3. This should be combined with other risk factors and clinical judgment (e.g. prior MRSA infection/colonization, necrotizing/cavitary pneumonia, high severity-of-illness scores, concurrent influenza) — not used alone to start or withhold empiric MRSA therapy."
          : "Score ≤1 — associated with under 10% prevalence of MRSA pneumonia in the source cohort. Still, additional risk factors and clinical judgment should be considered before ruling out MRSA coverage.";
      }

      const anyEntered = anyTouched;
      const allEntered = allTouched;

      return { id: "shorr", criteria, total, maxScore: 10, anyEntered, allEntered, missing, verdictFlag, headline, interpretation };
    },
  };

  const INSTRUMENTS = [sirsInstrument, cpisInstrument, dripInstrument, shorrInstrument];

  global.ClinicalRegistry = {
    SHARED_PARAMS,
    CORE_PARAM_KEYS,
    INSTRUMENTS,
    num,
  };
})(window);
