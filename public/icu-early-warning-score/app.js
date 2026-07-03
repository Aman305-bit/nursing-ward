// ============================================================
// PiMedCal — app shell, state, and rendering
// Depends on instruments.js (window.ClinicalRegistry)
// ============================================================

(function () {
  "use strict";

  const REG = window.ClinicalRegistry;
  const { SHARED_PARAMS, CORE_PARAM_KEYS, INSTRUMENTS, num } = REG;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ----------------------------------------------------------------
  // Central state
  // ----------------------------------------------------------------
  const state = {};
  SHARED_PARAMS.forEach(p => { state[p.key] = ""; });
  INSTRUMENTS.forEach(inst => {
    Object.entries(inst.ownFields || {}).forEach(([k, f]) => { state[k] = f.default; });
  });

  let activeTab = "index";
  let breakdownUnlocked = false;
  let pendingBreakdownId = null;
  const listeners = [];
  function onChange(fn) { listeners.push(fn); }
  function notifyChange() { listeners.forEach(fn => fn()); }

  // ----------------------------------------------------------------
  // Live clock
  // ----------------------------------------------------------------
  function updateClock() {
    const el = $("clock");
    if (!el) return;
    const now = new Date();
    el.textContent = now.toLocaleString(undefined, {
      weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
    });
  }
  updateClock();
  setInterval(updateClock, 30000);

  // ----------------------------------------------------------------
  // Render: shared Patient Parameters panel
  // ----------------------------------------------------------------
  function renderParamPanel() {
    const grid = $("paramGrid");
    grid.innerHTML = SHARED_PARAMS.map(p => `
      <div class="param-field" data-param-field="${p.key}">
        <label class="param-field-label" for="param-${p.key}">
          <span>${esc(p.label)}</span>
          <span class="param-field-used-by">${p.usedBy.join(" · ")}</span>
        </label>
        <input type="${p.type}" id="param-${p.key}" step="${p.step || 1}" inputmode="decimal"
               placeholder="" value="${esc(state[p.key] ?? "")}">
        <span class="param-field-unit">${esc(p.unit || "")}</span>
      </div>
    `).join("");

    SHARED_PARAMS.forEach(p => {
      const input = $("param-" + p.key);
      input.addEventListener("input", () => {
        state[p.key] = input.value;
        updateParamCompleteness();
        notifyChange();
      });
    });
    updateParamCompleteness();
  }

  function updateParamCompleteness() {
    const total = CORE_PARAM_KEYS.length;
    const filled = CORE_PARAM_KEYS.filter(k => num(state[k]) !== null).length;
    $("paramCompletenessNum").textContent = filled;
    $("paramCompletenessTotal").textContent = total;

    SHARED_PARAMS.forEach(p => {
      const fieldEl = document.querySelector(`[data-param-field="${p.key}"]`);
      if (fieldEl) fieldEl.classList.toggle("is-filled", num(state[p.key]) !== null);
    });
  }

  // ----------------------------------------------------------------
  // Render: tab list
  // ----------------------------------------------------------------
  function renderTabList() {
    const tabs = [{ id: "index", shortName: "Index", isIndex: true }, ...INSTRUMENTS];
    const tabList = $("tabList");
    tabList.innerHTML = tabs.map(t => `
      <button class="tab-btn" id="tabbtn-${t.id}" role="tab" type="button"
              aria-selected="${activeTab === t.id}" aria-controls="tabpanel-${t.id}" tabindex="${activeTab === t.id ? 0 : -1}">
        ${t.isIndex ? "" : `<span class="tab-flag flag-neutral" id="tabflag-${t.id}" aria-hidden="true"></span>`}
        ${esc(t.shortName)}
      </button>
    `).join("");

    tabs.forEach((t, i) => {
      const btn = $("tabbtn-" + t.id);
      btn.addEventListener("click", () => selectTab(t.id));
      btn.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          const dir = e.key === "ArrowRight" ? 1 : -1;
          const next = tabs[(i + dir + tabs.length) % tabs.length];
          selectTab(next.id);
          $("tabbtn-" + next.id).focus();
        } else if (e.key === "Home") {
          e.preventDefault(); selectTab(tabs[0].id); $("tabbtn-" + tabs[0].id).focus();
        } else if (e.key === "End") {
          e.preventDefault(); selectTab(tabs[tabs.length - 1].id); $("tabbtn-" + tabs[tabs.length - 1].id).focus();
        }
      });
    });
  }

  function selectTab(id) {
    activeTab = id;
    document.querySelectorAll(".tab-btn").forEach(btn => {
      const isActive = btn.id === "tabbtn-" + id;
      btn.setAttribute("aria-selected", String(isActive));
      btn.tabIndex = isActive ? 0 : -1;
    });
    document.querySelectorAll(".tab-panel").forEach(panel => {
      panel.hidden = panel.id !== "tabpanel-" + id;
    });
  }

  // ----------------------------------------------------------------
  // Render: tab panels shell (index + one per instrument)
  // ----------------------------------------------------------------
  function renderPanelsShell() {
    const container = $("tabPanels");
    let html = `<section class="tab-panel" id="tabpanel-index" role="tabpanel" aria-labelledby="tabbtn-index" tabindex="0">
      <div class="index-intro">
        <h2>Screening index</h2>
      </div>
      <div class="index-flags-summary" id="indexFlagsSummary"></div>
      <div class="index-cards" id="indexCards"></div>
    </section>`;

    INSTRUMENTS.forEach(inst => {
      html += `<section class="tab-panel" id="tabpanel-${inst.id}" role="tabpanel" aria-labelledby="tabbtn-${inst.id}" tabindex="0" hidden>
        <div id="instrumentRoot-${inst.id}"></div>
      </section>`;
    });

    container.innerHTML = html;
    INSTRUMENTS.forEach(inst => renderInstrumentShell(inst));
    document.querySelectorAll(".tab-panel").forEach(p => { p.hidden = p.id !== "tabpanel-index"; });
  }

  // ----------------------------------------------------------------
  // Render: one instrument's static shell (header + fields + result panel)
  // Built once; values/scores updated reactively by updateInstrument().
  // ----------------------------------------------------------------
  function sharedFieldRow(rowKey, label, paramKeys) {
    const jumpKeys = paramKeys.join(",");
    return `
      <li class="criterion-row from-shared" data-row="${rowKey}">
        <div class="criterion-label-wrap">
          <p class="criterion-label">${label} <span class="shared-pill">shared</span></p>
        </div>
        <div class="field-control">
          <span class="shared-readonly" id="${rowKey}-readonly">—</span>
          <button class="jump-to-param" type="button" data-jump="${jumpKeys}">Edit in Patient Parameters ↑</button>
        </div>
        <div class="points-readout" id="${rowKey}-pts" aria-live="polite">—</div>
      </li>`;
  }

  function renderInstrumentShell(inst) {
    const root = $("instrumentRoot-" + inst.id);

    let bodyHtml = `
      <div class="instrument" data-instrument="${inst.id}">
        <div class="instrument-main">
          <div class="instrument-header">
            <h2 class="instrument-title">${esc(inst.title)}</h2>
          </div>
    `;

    if (inst.id === "sirs") {
      bodyHtml += `
          <div class="section-label"><p class="instrument-eyebrow" style="margin-bottom:2px;">Step 1 — SIRS criteria (≥2 of 4 required)</p></div>
          <ul class="ledger" id="sirsList">
            ${sharedFieldRow("temp", "Temperature", ["tempC"])}
            ${sharedFieldRow("hr", "Heart rate", ["hr"])}
            ${sharedFieldRow("rr", "Respiratory rate or PaCO₂", ["rr","paco2"])}
            ${sharedFieldRow("wbc", "White blood cell count", ["wbc","bandsPct"])}
          </ul>
          <div class="section-label" style="border-top:1px solid var(--rule); margin-top:8px;">
            <p class="instrument-eyebrow" style="margin-bottom:2px;">Step 2–4 — Sepsis pathway</p>
          </div>
          <div class="cascade" id="cascade">
            <div class="cascade-step">
              <div class="cascade-num" id="cascade-num-sirs">1</div>
              <div><p class="cascade-title">SIRS positive (≥2 criteria)</p></div>
              <div class="cascade-status" id="cascade-status-sirs">—</div>
            </div>
            <div class="cascade-step">
              <div class="cascade-num" id="cascade-num-infection">2</div>
              <div>
                <p class="cascade-title">Suspected or confirmed source of infection</p>
                <div class="check-row" style="margin-top:8px;"><input type="checkbox" id="cb-infection"><label for="cb-infection">Infection suspected or confirmed</label></div>
              </div>
              <div class="cascade-status" id="cascade-status-infection">—</div>
            </div>
            <div class="cascade-step">
              <div class="cascade-num" id="cascade-num-organ">3</div>
              <div>
                <p class="cascade-title">Organ dysfunction, hypotension, or hypoperfusion</p>
                <div class="lactate-input-row">
                  <span class="shared-readonly" id="organ-lactate-readonly">—</span>
                  <span class="shared-readonly" id="organ-sbp-readonly">—</span>
                  <label class="check-row"><input type="checkbox" id="cb-sbpdrop"><span style="font-size:0.85rem;">SBP drop ≥40 mmHg from baseline</span></label>
                  <button class="jump-to-param" type="button" data-jump="lactate,sbp">Edit lactate/SBP in Patient Parameters ↑</button>
                </div>
              </div>
              <div class="cascade-status" id="cascade-status-organ">—</div>
            </div>
            <div class="cascade-step">
              <div class="cascade-num" id="cascade-num-shock">4</div>
              <div>
                <p class="cascade-title">Septic shock — hypotension despite adequate fluid resuscitation</p>
                <div class="check-row" style="margin-top:8px;"><input type="checkbox" id="cb-shock"><label for="cb-shock">Hypotension persists despite adequate fluid resuscitation</label></div>
              </div>
              <div class="cascade-status" id="cascade-status-shock">—</div>
            </div>
          </div>
      `;
    } else if (inst.id === "cpis") {
      bodyHtml += `
          <ul class="ledger" id="cpisList">
            ${sharedFieldRow("cpis-temp", "Temperature", ["tempC"])}
            ${sharedFieldRow("cpis-wbc", "White blood cell count", ["wbc","bandsAbs"])}
            <li class="criterion-row" data-row="cpis-secretions">
              <div class="criterion-label-wrap">
                <p class="criterion-label">Tracheal secretions</p>
              </div>
              <div class="field-control">
                <label class="sr-label" for="cpis-secretions-input">Select</label>
                <select id="cpis-secretions-input">
                  <option value="" selected>— Select —</option>
                  <option value="0">&lt;14+ (scant)</option>
                  <option value="1">≥14+ (abundant, non-purulent)</option>
                  <option value="2">≥14+ and purulent</option>
                </select>
              </div>
              <div class="points-readout" id="cpis-secretions-pts" aria-live="polite">—</div>
            </li>
            <li class="criterion-row" data-row="cpis-ox">
              <div class="criterion-label-wrap">
                <p class="criterion-label">Oxygenation: PaO₂/FiO₂</p>
              </div>
              <div class="field-control">
                <label class="sr-label" for="cpis-pf-input">PaO₂/FiO₂ (mmHg)</label>
                <input type="number" id="cpis-pf-input" step="1" inputmode="numeric" placeholder="">
                <label class="check-row" style="margin-top:6px;"><input type="checkbox" id="cpis-ards-input"><span style="font-size:0.85rem;">ARDS present</span></label>
              </div>
              <div class="points-readout" id="cpis-ox-pts" aria-live="polite">—</div>
            </li>
            <li class="criterion-row" data-row="cpis-xray">
              <div class="criterion-label-wrap">
                <p class="criterion-label">Pulmonary radiography</p>
              </div>
              <div class="field-control">
                <label class="sr-label" for="cpis-xray-input">Select</label>
                <select id="cpis-xray-input">
                  <option value="" selected>— Select —</option>
                  <option value="0">No infiltrate</option>
                  <option value="1">Diffuse or patchy infiltrate</option>
                  <option value="2">Localized infiltrate</option>
                </select>
              </div>
              <div class="points-readout" id="cpis-xray-pts" aria-live="polite">—</div>
            </li>
            <li class="criterion-row" data-row="cpis-culture">
              <div class="criterion-label-wrap">
                <p class="criterion-label">Tracheal aspirate culture (semi-quantitative)</p>
              </div>
              <div class="field-control">
                <label class="sr-label" for="cpis-culture-input">Select</label>
                <select id="cpis-culture-input">
                  <option value="" selected>— Select —</option>
                  <option value="0">≤1+ pathogenic bacteria or no growth</option>
                  <option value="1">&gt;1+ pathogenic bacteria cultured</option>
                  <option value="2">&gt;1+ pathogenic bacteria, same organism on Gram stain &gt;1+</option>
                </select>
              </div>
              <div class="points-readout" id="cpis-culture-pts" aria-live="polite">—</div>
            </li>
          </ul>
      `;
    } else if (inst.kind === "checklist") {
      const groups = {};
      Object.entries(inst.ownFields).forEach(([k, f]) => {
        const g = f.group || "default";
        groups[g] = groups[g] || [];
        groups[g].push([k, f]);
      });

      if (inst.id === "shorr") {
        bodyHtml += `
          <ul class="ledger" id="${inst.id}List">
            <li class="criterion-row" data-row="shorr-age">
              <div class="criterion-label-wrap">
                <p class="criterion-label">Age 19–29 or &gt;79 years <span class="shared-pill">shared</span></p>
              </div>
              <div class="field-control">
                <span class="shared-readonly" id="shorr-age-readonly">—</span>
                <button class="jump-to-param" type="button" data-jump="age">Edit in Patient Parameters ↑</button>
              </div>
              <div class="points-readout" id="shorr-age-pts" aria-live="polite">—</div>
            </li>
          </ul>
        `;
      }

      Object.entries(groups).forEach(([groupName, fields]) => {
        if (groupName !== "default") {
          const label = groupName === "major" ? "Major risk factors (+2 each)" : "Minor risk factors (+1 each)";
          bodyHtml += `<div class="section-label"><p class="instrument-eyebrow" style="margin-bottom:2px;">${label}</p></div>`;
        }
        bodyHtml += `<ul class="ledger">`;
        fields.forEach(([k, f]) => {
          bodyHtml += `
            <li class="criterion-row" data-row="${inst.id}-${k}">
              <div class="criterion-label-wrap">
                <p class="criterion-label">${esc(f.label)}</p>
              </div>
              <div class="field-control">
                <div class="toggle-group" role="group" aria-label="${esc(f.label)}" data-toggle-field="${k}">
                  <button type="button" class="toggle-btn" data-bool="false" aria-pressed="false">No</button>
                  <button type="button" class="toggle-btn" data-bool="true" aria-pressed="false">Yes</button>
                </div>
              </div>
              <div class="points-readout" id="${inst.id}-${k}-pts" aria-live="polite">—</div>
            </li>
          `;
        });
        bodyHtml += `</ul>`;
      });
    }

    bodyHtml += `
          <div class="result-panel">
            <div class="result-panel-inner">
              <p class="result-heading">Classification</p>
              <p class="result-statement" id="${inst.id}-result-statement">Awaiting input</p>
              <button class="breakdown-toggle" type="button" id="${inst.id}BreakdownToggle" aria-expanded="false" aria-controls="${inst.id}Breakdown">Show calculation breakdown</button>
              <div class="breakdown" id="${inst.id}Breakdown" tabindex="-1" hidden>
                <div class="breakdown-heading">
                  <span class="breakdown-heading-icon" aria-hidden="true">✓</span>
                  <div><strong>Calculation breakdown unlocked</strong><span>Review the entered values and points below.</span></div>
                </div>
                <table class="breakdown-table">
                  <caption class="visually-hidden">${esc(inst.title)} scoring breakdown</caption>
                  <thead><tr><th scope="col">Criterion</th><th scope="col">Value entered</th><th scope="col">Threshold / band</th><th scope="col" style="text-align:right;">Points</th></tr></thead>
                  <tbody id="${inst.id}BreakdownBody"></tbody>
                </table>
                <div class="breakdown-formula" id="${inst.id}Formula"></div>
              </div>
            </div>
          </div>
        </div>

        <aside class="tally-rail" aria-label="${esc(inst.scoreLabel)}">
          <div>
            <p class="tally-label">${esc(inst.scoreLabel)}</p>
            <p class="tally-score"><span id="${inst.id}TallyNum">0</span><span class="of">&nbsp;/&nbsp;${inst.maxScore}</span></p>
          </div>
          <div class="tally-track" aria-hidden="true">
            <div class="tally-track-bg"></div>
            <div class="tally-fill" id="${inst.id}TallyFill" style="height:0%;"></div>
            <div class="tally-tick" style="bottom:${(inst.thresholdLine.value / inst.maxScore) * 100}%;">
              <span class="tally-tick-label">${esc(inst.thresholdLine.label)}</span>
            </div>
          </div>
          <div class="tally-verdict flag-neutral" id="${inst.id}TallyVerdict" role="status">Awaiting input</div>
          <div class="tally-missing" id="${inst.id}TallyMissing" hidden></div>
        </aside>
      </div>
    `;

    root.innerHTML = bodyHtml;
    wireInstrumentInputs(inst);
    wireBreakdownToggle(inst.id);
    wireJumpLinks(root);
  }

  function wireJumpLinks(root) {
    root.querySelectorAll(".jump-to-param").forEach(btn => {
      btn.addEventListener("click", () => {
        selectTab("index"); // ensure param panel visible regardless of active tab (panel lives outside tabs)
        const keys = btn.getAttribute("data-jump").split(",");
        const target = $("param-" + keys[0]);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
          target.focus();
        }
      });
    });
  }

  // ----------------------------------------------------------------
  // Wire instrument-specific (non-shared) inputs to state
  // ----------------------------------------------------------------
  function wireInstrumentInputs(inst) {
    if (inst.id === "sirs") {
      bindCheckbox("cb-infection", "cbInfection");
      bindCheckbox("cb-sbpdrop", "sbpDrop");
      bindCheckbox("cb-shock", "cbShock");
    } else if (inst.id === "cpis") {
      bindSelect("cpis-secretions-input", "secretions");
      bindNumber("cpis-pf-input", "pf");
      bindCheckbox("cpis-ards-input", "ards");
      bindSelect("cpis-xray-input", "xray");
      bindSelect("cpis-culture-input", "culture");
    } else if (inst.kind === "checklist") {
      Object.keys(inst.ownFields).forEach(k => bindToggle(k));
    }
  }
  function bindToggle(stateKey) {
    const group = document.querySelector(`[data-toggle-field="${stateKey}"]`);
    if (!group) return;
    const btns = group.querySelectorAll(".toggle-btn");
    function paint() {
      const touched = !!state["__touched_" + stateKey];
      const val = !!state[stateKey];
      btns.forEach(b => {
        const isThisVal = (b.getAttribute("data-bool") === "true") === val;
        const pressed = touched && isThisVal;
        b.setAttribute("aria-pressed", String(pressed));
      });
      group.classList.toggle("toggle-untouched", !touched);
    }
    btns.forEach(b => {
      b.addEventListener("click", () => {
        state[stateKey] = b.getAttribute("data-bool") === "true";
        state["__touched_" + stateKey] = true;
        paint();
        notifyChange();
      });
    });
    paint();
  }
  function bindNumber(elId, stateKey) {
    const el = $(elId); if (!el) return;
    el.value = state[stateKey] ?? "";
    el.addEventListener("input", () => { state[stateKey] = el.value; notifyChange(); });
  }
  function bindCheckbox(elId, stateKey) {
    const el = $(elId); if (!el) return;
    el.checked = !!state[stateKey];
    el.addEventListener("change", () => {
      state[stateKey] = el.checked;
      state["__touched_" + stateKey] = true;
      notifyChange();
    });
  }
  function bindSelect(elId, stateKey) {
    const el = $(elId); if (!el) return;
    el.value = state[stateKey] ?? "";
    el.addEventListener("change", () => { state[stateKey] = el.value; notifyChange(); });
  }

  // ----------------------------------------------------------------
  // Reactive update: re-render all dynamic bits without rebuilding shells
  // ----------------------------------------------------------------
  function setPts(el, met, label) {
    if (!el) return;
    el.textContent = label;
    el.classList.toggle("active", !!met);
  }
  function setRowMet(rowEl, met) {
    if (!rowEl) return;
    rowEl.classList.toggle("is-met", !!met);
  }
  function fmtSharedVal(val, unit) {
    if (val === "" || val === null || val === undefined) return `<span class="empty">not entered</span>`;
    return `${esc(val)}${unit ? " " + esc(unit) : ""}`;
  }

  function updateSirsView(result) {
    const c = result.criteria;
    const map = { temp: c[0], hr: c[1], rr: c[2], wbc: c[3] };
    Object.entries(map).forEach(([rowKey, crit]) => {
      setPts($(`${rowKey === "temp" ? "sirs-temp" : rowKey === "hr" ? "sirs-hr" : rowKey === "rr" ? "sirs-rr" : "sirs-wbc"}-pts`),
        crit.met === true, crit.met === null ? "—" : (crit.met ? "+1" : "0"));
      setRowMet(document.querySelector(`[data-row="${rowKey}"]`), crit.met === true);
    });

    $("temp-readonly").innerHTML = fmtSharedVal(state.tempC, "°C");
    $("hr-readonly").innerHTML = fmtSharedVal(state.hr, "bpm");
    $("rr-readonly").innerHTML = (state.rr || state.paco2)
      ? `${fmtSharedVal(state.rr, "/min")}${state.paco2 ? " · PaCO₂ " + esc(state.paco2) : ""}`
      : fmtSharedVal("", "");
    $("wbc-readonly").innerHTML = (state.wbc || state.bandsPct)
      ? `${fmtSharedVal(state.wbc, "/mm³")}${state.bandsPct ? " · " + esc(state.bandsPct) + "% bands" : ""}`
      : fmtSharedVal("", "");

    // breakdown table
    const tbody = $("sirsBreakdownBody");
    tbody.innerHTML = c.map(cr => `
      <tr class="${cr.met === true ? "row-met" : ""} ${!cr.entered ? "row-missing" : ""}">
        <td>${esc(cr.label)}</td>
        <td>${cr.reason || "<em>not entered</em>"}</td>
        <td>${esc(cr.threshold)}</td>
        <td class="num">${cr.met === null ? "—" : (cr.met ? "+1 ✓" : "0")}</td>
      </tr>
    `).join("");
    $("sirsFormula").textContent = `SIRS criteria met = ${result.metCount} of 4   →   SIRS positive requires ≥ 2`;

    // cascade
    const casc = result.cascade;
    function paint(numId, statusId, achieved, evaluated, labelYes, labelNo) {
      const numEl = $(numId), statusEl = $(statusId);
      numEl.classList.remove("cleared", "unmet");
      if (!evaluated) { numEl.classList.add("unmet"); statusEl.textContent = "—"; statusEl.className = "cascade-status notmet"; }
      else if (achieved) { numEl.classList.add("cleared"); statusEl.textContent = labelYes; statusEl.className = "cascade-status met"; }
      else { numEl.classList.add("unmet"); statusEl.textContent = labelNo; statusEl.className = "cascade-status notmet"; }
    }
    paint("cascade-num-sirs", "cascade-status-sirs", casc.sirsPositive, result.anyEntered, "MET", "NOT MET");
    paint("cascade-num-infection", "cascade-status-infection", casc.infection, true, "MARKED", "not marked");
    paint("cascade-num-organ", "cascade-status-organ", casc.organDysfunctionFlag, casc.organAnyEntered, "MET", "NOT MET");
    paint("cascade-num-shock", "cascade-status-shock", casc.shockMarked, true, "MARKED", "not marked");
    $("organ-lactate-readonly").innerHTML = fmtSharedVal(state.lactate, "mmol/L");
    $("organ-sbp-readonly").innerHTML = fmtSharedVal(state.sbp, "mmHg");

    // tally
    $("sirsTallyNum").textContent = result.metCount;
    const fill = $("sirsTallyFill");
    fill.style.height = ((result.metCount / 4) * 100) + "%";
    fill.style.background = casc.sirsPositive ? "var(--clay)" : "#6FA08C";
    renderVerdict("sirs", result);

    // result statement
    renderResultStatement("sirs", result);
  }

  function updateCpisView(result) {
    const d = result.domains;
    setPts($("cpis-temp-pts"), d[0].pts > 0, d[0].pts === null ? "—" : `+${d[0].pts}`);
    setRowMet(document.querySelector('[data-row="cpis-temp"]'), d[0].pts > 0);
    $("cpis-temp-readonly").innerHTML = fmtSharedVal(state.tempC, "°C");

    setPts($("cpis-wbc-pts"), d[1].pts > 0, d[1].pts === null ? "—" : `+${d[1].pts}`);
    setRowMet(document.querySelector('[data-row="cpis-wbc"]'), d[1].pts > 0);
    $("cpis-wbc-readonly").innerHTML = (state.wbc || state.bandsAbs)
      ? `${fmtSharedVal(state.wbc, "/mm³")}${state.bandsAbs ? " · bands " + esc(state.bandsAbs) + "/mm³" : ""}`
      : fmtSharedVal("", "");

    setPts($("cpis-secretions-pts"), d[2].pts > 0, d[2].pts === null ? "—" : `+${d[2].pts}`);
    setRowMet(document.querySelector('[data-row="cpis-secretions"]'), d[2].pts > 0);
    document.querySelector('[data-row="cpis-secretions"]')?.classList.toggle("is-unreviewed", d[2].pts === null);

    setPts($("cpis-ox-pts"), d[3].pts > 0, d[3].pts === null ? "—" : `+${d[3].pts}`);
    setRowMet(document.querySelector('[data-row="cpis-ox"]'), d[3].pts > 0);

    setPts($("cpis-xray-pts"), d[4].pts > 0, d[4].pts === null ? "—" : `+${d[4].pts}`);
    setRowMet(document.querySelector('[data-row="cpis-xray"]'), d[4].pts > 0);
    document.querySelector('[data-row="cpis-xray"]')?.classList.toggle("is-unreviewed", d[4].pts === null);

    setPts($("cpis-culture-pts"), d[5].pts > 0, d[5].pts === null ? "—" : `+${d[5].pts}`);
    setRowMet(document.querySelector('[data-row="cpis-culture"]'), d[5].pts > 0);
    document.querySelector('[data-row="cpis-culture"]')?.classList.toggle("is-unreviewed", d[5].pts === null);

    const tbody = $("cpisBreakdownBody");
    tbody.innerHTML = d.map(dom => `
      <tr class="${dom.pts > 0 ? "row-met" : ""} ${dom.pts === null ? "row-missing" : ""}">
        <td>${esc(dom.key)}</td><td>${esc(dom.valueText)}</td><td>${esc(dom.band)}</td>
        <td class="num">${dom.pts === null ? "—" : `+${dom.pts}`}</td>
      </tr>
    `).join("");
    const enteredCount = d.filter(x => x.pts !== null).length;
    $("cpisFormula").textContent = `CPIS total = sum of points across ${enteredCount}/6 domains entered = ${result.total} / 12   →   association with VAP described above a score of 6`;

    $("cpisTallyNum").textContent = result.total;
    const fill = $("cpisTallyFill");
    fill.style.height = Math.min((result.total / 12) * 100, 100) + "%";
    fill.style.background = result.total > 6 ? "var(--clay)" : "#6FA08C";
    renderVerdict("cpis", result);
    renderResultStatement("cpis", result);
  }

  function updateChecklistView(inst, result) {
    result.criteria.forEach(cr => {
      if (cr.fromShared) {
        const ptsEl = $(`${inst.id}-age-pts`);
        setPts(ptsEl, cr.pts > 0, cr.entered === false ? "—" : `+${cr.pts}`);
        setRowMet(document.querySelector(`[data-row="${inst.id}-age"]`), cr.pts > 0);
        const ro = $(`${inst.id}-age-readonly`);
        if (ro) ro.innerHTML = fmtSharedVal(state.age, "years");
      } else {
        const ptsEl = $(`${inst.id}-${cr.key}-pts`);
        const label = cr.touched ? `+${cr.pts}` : "—";
        setPts(ptsEl, cr.touched && cr.pts > 0, label);
        const rowEl = document.querySelector(`[data-row="${inst.id}-${cr.key}"]`);
        setRowMet(rowEl, cr.touched && cr.pts > 0);
        if (rowEl) rowEl.classList.toggle("is-unreviewed", !cr.touched);
      }
    });

    const tbody = $(inst.id + "BreakdownBody");
    tbody.innerHTML = result.criteria.map(cr => `
      <tr class="${cr.touched && cr.pts > 0 ? "row-met" : ""} ${cr.touched === false ? "row-missing" : ""}">
        <td>${esc(cr.label)}</td>
        <td>${cr.fromShared ? (cr.entered ? esc(cr.reason) : "not entered") : (!cr.touched ? "not yet reviewed" : (cr.checked ? "Yes" : "No"))}</td>
        <td>${cr.help ? esc(cr.help) : (cr.fromShared ? "19–29 or >79 years = +1" : "Yes = +" + cr.maxPts)}</td>
        <td class="num">${cr.touched === false ? "—" : `+${cr.pts}`}</td>
      </tr>
    `).join("");
    $(inst.id + "Formula").textContent = `${inst.scoreLabel} = sum of points across all reviewed factors = ${result.total} / ${inst.maxScore}   →   positive threshold ${inst.thresholdLine.label}`;

    $(inst.id + "TallyNum").textContent = result.total;
    const fill = $(inst.id + "TallyFill");
    fill.style.height = Math.min((result.total / inst.maxScore) * 100, 100) + "%";
    const positive = inst.id === "shorr" ? result.total > inst.thresholdLine.value : result.total >= inst.thresholdLine.value;
    fill.style.background = positive ? "var(--clay)" : "#6FA08C";
    renderVerdict(inst.id, result);
    renderResultStatement(inst.id, result);
  }

  function renderVerdict(instId, result) {
    const verdict = $(instId + "TallyVerdict");
    const missingBox = $(instId + "TallyMissing");
    if (result.verdictFlag === "neutral") {
      verdict.textContent = "Awaiting input";
      verdict.className = "tally-verdict flag-neutral";
    } else {
      verdict.textContent = result.headline;
      verdict.className = "tally-verdict flag-" + result.verdictFlag;
    }
    if (result.missing && result.missing.length > 0) {
      missingBox.hidden = false;
      missingBox.innerHTML = `Missing parameters:<ul>${result.missing.map(m => `<li>${esc(m)}</li>`).join("")}</ul>`;
    } else {
      missingBox.hidden = true;
      missingBox.innerHTML = "";
    }
  }

  function renderResultStatement(instId, result) {
    const stEl = $(instId + "-result-statement");
    if (result.verdictFlag === "neutral") {
      stEl.innerHTML = "Awaiting input";
      return;
    }
    const cls = result.verdictFlag === "positive" ? "pos" : result.verdictFlag === "negative" ? "neg" : "incomplete";
    stEl.innerHTML = `<span class="${cls}">${esc(result.headline)}</span>`;
  }

  function wireBreakdownToggle(instId) {
    const btn = $(instId + "BreakdownToggle"), panel = $(instId + "Breakdown");
    btn.addEventListener("click", () => {
      if (panel.hasAttribute("hidden") && !breakdownUnlocked) {
        pendingBreakdownId = instId;
        openBreakdownLogin();
        return;
      }
      toggleBreakdown(instId);
    });
  }

  function toggleBreakdown(instId) {
    const btn = $(instId + "BreakdownToggle"), panel = $(instId + "Breakdown");
      const isHidden = panel.hasAttribute("hidden");
      if (isHidden) { panel.removeAttribute("hidden"); btn.setAttribute("aria-expanded", "true"); btn.textContent = "Hide calculation breakdown"; }
      else { panel.setAttribute("hidden", ""); btn.setAttribute("aria-expanded", "false"); btn.textContent = "Show calculation breakdown"; }
  }

  function revealBreakdownAfterLogin(instId) {
    toggleBreakdown(instId);
    const panel = $(instId + "Breakdown");
    requestAnimationFrame(() => {
      panel.classList.add("just-unlocked");
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
      panel.focus({ preventScroll: true });
      setTimeout(() => panel.classList.remove("just-unlocked"), 1600);
    });
  }

  function ensureBreakdownLoginModal() {
    if ($("breakdownLoginModal")) return;
    const modal = document.createElement("div");
    modal.className = "login-modal";
    modal.id = "breakdownLoginModal";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="login-dialog" role="dialog" aria-modal="true" aria-labelledby="breakdownLoginTitle">
        <button class="login-close" type="button" id="breakdownLoginClose" aria-label="Close login">x</button>
        <h2 class="login-title" id="breakdownLoginTitle">Login required</h2>
        <form id="breakdownLoginForm">
          <label class="login-field">
            <span>Username</span>
            <input id="breakdownUsername" type="text" autocomplete="username">
          </label>
          <label class="login-field">
            <span>Password</span>
            <input id="breakdownPassword" type="password" autocomplete="current-password">
          </label>
          <p class="login-error" id="breakdownLoginError" role="alert"></p>
          <button class="login-submit" type="submit">Unlock breakdown</button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    $("breakdownLoginClose").addEventListener("click", closeBreakdownLogin);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeBreakdownLogin();
    });
    $("breakdownLoginForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const username = $("breakdownUsername").value.trim();
      const password = $("breakdownPassword").value;
      if (username === "Bunty" && password === "00000") {
        breakdownUnlocked = true;
        const targetId = pendingBreakdownId;
        closeBreakdownLogin();
        if (targetId) revealBreakdownAfterLogin(targetId);
        return;
      }
      $("breakdownLoginError").textContent = "Invalid username or password.";
      $("breakdownPassword").select();
    });
  }

  function openBreakdownLogin() {
    ensureBreakdownLoginModal();
    const modal = $("breakdownLoginModal");
    modal.hidden = false;
    $("breakdownUsername").value = "";
    $("breakdownPassword").value = "";
    $("breakdownLoginError").textContent = "";
    setTimeout(() => $("breakdownUsername").focus(), 0);
  }

  function closeBreakdownLogin() {
    const modal = $("breakdownLoginModal");
    if (!modal) return;
    modal.hidden = true;
    pendingBreakdownId = null;
  }

  // ----------------------------------------------------------------
  // Index tab
  // ----------------------------------------------------------------
  function renderIndexCards(results) {
    const cardsEl = $("indexCards");
    cardsEl.innerHTML = results.map(({ inst, result }) => {
      const score = result.metCount !== undefined ? result.metCount : result.total;
      const max = inst.maxScore;
      const flagClass = "flag-" + result.verdictFlag;
      return `
        <button class="index-card" type="button" data-goto="${inst.id}">
          <div class="index-card-top">
            <div>
              <p class="index-card-eyebrow">${esc(inst.eyebrow)}</p>
              <p class="index-card-title">${esc(inst.shortName)}</p>
            </div>
            <p class="index-card-score">${score}<span class="of">/${max}</span></p>
          </div>
          <p class="index-card-verdict ${flagClass}">${esc(result.verdictFlag === "neutral" ? "Awaiting input" : result.headline)}</p>
        </button>
      `;
    }).join("");

    cardsEl.querySelectorAll(".index-card").forEach(card => {
      card.addEventListener("click", () => selectTab(card.getAttribute("data-goto")));
    });

    // Update tab flags
    results.forEach(({ inst, result }) => {
      const flagEl = $("tabflag-" + inst.id);
      if (flagEl) flagEl.className = "tab-flag flag-" + result.verdictFlag;
    });

    // Summary banner
    const positives = results.filter(r => r.result.verdictFlag === "positive").map(r => r.inst.shortName);
    const incompletes = results.filter(r => r.result.verdictFlag === "incomplete").map(r => r.inst.shortName);
    const summaryEl = $("indexFlagsSummary");
    if (positives.length === 0 && incompletes.length === 0) {
      summaryEl.className = "index-flags-summary";
      summaryEl.textContent = results.every(r => r.result.verdictFlag === "neutral")
        ? "No data entered yet. Start with Patient Parameters above, or open any instrument tab."
        : "No instruments currently flag a positive risk classification, and all entered instruments have complete data.";
    } else {
      summaryEl.className = "index-flags-summary" + (positives.length > 0 ? " has-positive" : "");
      const parts = [];
      if (positives.length > 0) parts.push(`<strong>${positives.length} flagged positive:</strong> ${esc(positives.join(", "))}`);
      if (incompletes.length > 0) parts.push(`<strong>${incompletes.length} incomplete:</strong> ${esc(incompletes.join(", "))} — missing required parameters`);
      summaryEl.innerHTML = parts.join("  ·  ");
    }
  }

  // ----------------------------------------------------------------
  // Main reactive recompute
  // ----------------------------------------------------------------
  function recomputeAll() {
    const results = INSTRUMENTS.map(inst => ({ inst, result: inst.compute(state) }));
    results.forEach(({ inst, result }) => {
      if (inst.id === "sirs") updateSirsView(result);
      else if (inst.id === "cpis") updateCpisView(result);
      else updateChecklistView(inst, result);
    });
    renderIndexCards(results);
    announce(results.map(r => `${r.inst.shortName}: ${r.result.verdictFlag === "neutral" ? "no data" : r.result.headline}`).join(". "));
  }
  onChange(recomputeAll);

  // ----------------------------------------------------------------
  // Print
  // ----------------------------------------------------------------
  function wirePrint() {
    $("printBtn").addEventListener("click", () => {
      INSTRUMENTS.forEach(inst => {
        const panel = $(inst.id + "Breakdown");
        if (panel) panel.removeAttribute("hidden");
        const btn = $(inst.id + "BreakdownToggle");
        if (btn) btn.setAttribute("aria-expanded", "true");
      });
      // Print needs every tab panel visible
      document.querySelectorAll(".tab-panel").forEach(p => { p.hidden = false; });
      window.print();
      // restore tab visibility after print dialog closes
      setTimeout(() => selectTab(activeTab), 300);
    });
  }

  // ----------------------------------------------------------------
  // Live region for screen readers
  // ----------------------------------------------------------------
  let announceTimer = null;
  function announce(msg) {
    clearTimeout(announceTimer);
    announceTimer = setTimeout(() => { $("liveStatus").textContent = msg; }, 400);
  }

  // ----------------------------------------------------------------
  // Init
  // ----------------------------------------------------------------
  function init() {
    renderParamPanel();
    renderTabList();
    renderPanelsShell();
    wirePrint();
    recomputeAll();
  }

  window.PiMedCalInit = init;
})();
