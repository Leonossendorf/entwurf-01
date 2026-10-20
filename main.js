/* N. Krabbe – Entwurf. Formulare verschicken nichts. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* Menü */
  var menuBtn = $(".menu-btn"), nav = $("#nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open);
    });
    $$("a", nav).forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); });
    });
  }

  /* Entwurfs-Hinweis und Notizen */
  var pill = $(".draft-pill"), panel = $("#draft-panel"), notesBtn = $(".notes-toggle");
  if (pill && panel) {
    pill.addEventListener("click", function () {
      var open = panel.hidden;
      panel.hidden = !open;
      pill.setAttribute("aria-expanded", open);
    });
  }
  function setNotes(on) {
    document.body.classList.toggle("show-notes", on);
    if (notesBtn) {
      notesBtn.setAttribute("aria-pressed", on);
      notesBtn.textContent = on ? "Entwurfsnotizen ausblenden" : "Entwurfsnotizen einblenden";
    }
  }
  setNotes(store.get("krabbe-notes") === "1" || /[?&]notizen/.test(location.search));
  if (notesBtn) notesBtn.addEventListener("click", function () {
    var on = !document.body.classList.contains("show-notes");
    setNotes(on);
    store.set("krabbe-notes", on ? "1" : "0");
  });

  /* Referenzen nach Objekttyp */
  var REFS = [
    { id: "privat", tab: "Privatgarten", title: "Privatgärten", text: "Ein Garten, der zum Haus passt und wenig Arbeit macht. Wir planen mit Ihnen, bauen alles aus einer Hand und übernehmen auf Wunsch die Pflege.",
      steck: [["Typische Arbeiten", "Neugestaltung, Wege und Terrassen, Einfahrt, Zaun und Sichtschutz, Pflanzung"], ["Auftraggeber", "Haus- und Grundstückseigentümer"]],
      img: ["privat-gartenweg", "privat-mauer", "rasengitter"] },
    { id: "wohnen", tab: "Wohnungsbau", title: "Wohnanlagen & Innenhöfe", text: "Außenanlagen für Mehrfamilienhäuser: Zuwege, Stellplätze, Grün und Spielflächen, die viele Menschen täglich nutzen.",
      steck: [["Typische Arbeiten", "Neugestaltung der Außenanlage, Pflaster, Stellplätze, Spielflächen, Pflanzung"], ["Auftraggeber", "Wohnungsgesellschaften, Bauträger, Hausverwaltungen"]],
      img: ["wohnungsbau-innenhof", "rasengitter"] },
    { id: "gewerbe", tab: "Gewerbe & Industrie", title: "Gewerbe- und Industrieflächen", text: "Flächen, die Lkw-Verkehr und Kundschaft aushalten. Mit Wege- und Straßennetz, Parkplätzen und, wenn nötig, Erd- und Abrissarbeiten vorab.",
      steck: [["Typische Arbeiten", "Erd- und Abrissarbeiten, Wege- und Straßennetz, Parkplätze, Begrünung"], ["Auftraggeber", "Unternehmen, Investoren, Architekten"]],
      img: ["gewerbe-buero", "krabbe:erdarbeiten"] },
    { id: "spiel", tab: "Spielplätze", title: "Spielplatzanlagen", text: "Gestaltung und Bau von Spielplätzen für Kommunen, Kitas, Schulen und Wohnanlagen.",
      steck: [["Typische Arbeiten", "Planung, Erdarbeiten, Fallschutz, Aufbau der Geräte, Einfassung und Bepflanzung"], ["Auftraggeber", "Kommunen, Kitas, Schulen, Wohnungsgesellschaften"]],
      img: ["spielplatz"] },
    { id: "oeffentlich", tab: "Öffentliches Grün", title: "Öffentliche Grünflächen", text: "Plätze, Wege und Grünanlagen, die das ganze Jahr ordentlich aussehen sollen. Wir bauen sie und kümmern uns danach um die Pflege, einschließlich Baumpflege.",
      steck: [["Typische Arbeiten", "Platz- und Wegebau, Grünflächenpflege, Baum- und Heckenschnitt"], ["Auftraggeber", "Städte und Gemeinden, öffentliche Einrichtungen"]],
      img: ["oeffentlich-stufen", "baumpflege-hubsteiger", "pflege", "krabbe:dahlien"] },
    { id: "begruenung", tab: "Dach & Fassade", title: "Dach- und Fassadenbegrünung", text: "Grün auf und an Gebäuden. Das kühlt, hält Regenwasser zurück und wird in Bebauungsplänen immer häufiger verlangt.",
      steck: [["Typische Arbeiten", "Dachbegrünung, Fassadenbegrünung, Zaun- und Sichtschutzbegrünung"], ["Auftraggeber", "Gewerbe, Wohnungsbau, öffentliche Bauherren"]],
      img: ["dachbegruenung"] }
  ];
  var OFFEN = [["Ort, Jahr, Umfang", "folgt mit Ihren Projektfotos"]];
  var ALT = {
    "privat-gartenweg": "Gepflasterter Gartenweg vor Natursteinmauer und Hecken",
    "privat-mauer": "Natursteinmauer mit Kiesstreifen und Pflasterfläche",
    "rasengitter": "Betonplatten mit Rasenfugen",
    "wohnungsbau-innenhof": "Begrünter Innenhof zwischen Backsteingebäuden",
    "gewerbe-buero": "Gepflasterter Platz mit Pflanzkübeln zwischen Bürogebäuden",
    "krabbe:erdarbeiten": "Bagger bei Erdarbeiten auf einem Grundstück",
    "spielplatz": "Spielgerät aus Holz auf einer Rasenfläche",
    "oeffentlich-stufen": "Geschwungene Sitzstufen aus Naturstein an einem gepflasterten Platz",
    "baumpflege-hubsteiger": "Baumpfleger schneidet Straßenbäume von einer Hubarbeitsbühne",
    "pflege": "Heckenschnitt mit der Motorheckenschere",
    "krabbe:dahlien": "Blühende Dahlien in einer Grünanlage",
    "dachbegruenung": "Gebäude mit begrüntem Flachdach und Wegen"
  };
  function src(key, big) {
    if (key.indexOf("krabbe:") === 0) return "img/krabbe-" + key.slice(7) + "-480x320.jpg";
    return "img/" + key + (big ? "-1200x800.jpg" : "-720x480.jpg");
  }
  var tabs = $("#ref-tabs");
  if (tabs) {
    var img = $("#ref-img"), tag = $("#ref-tag"), thumbs = $("#ref-thumbs"), steck = $("#ref-steck");
    REFS.forEach(function (r, i) {
      var b = document.createElement("button");
      b.type = "button"; b.setAttribute("role", "tab"); b.id = "tab-" + r.id; b.dataset.id = r.id;
      b.setAttribute("aria-controls", "ref-panel");
      b.innerHTML = r.tab + " <small>" + String(i + 1).padStart(2, "0") + "</small>";
      b.addEventListener("click", function () { showRef(r.id); });
      tabs.appendChild(b);
    });
    tabs.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var list = $$("button", tabs), cur = list.indexOf(document.activeElement);
      if (cur < 0) return;
      var next = list[(cur + (e.key === "ArrowRight" ? 1 : -1) + list.length) % list.length];
      next.focus(); next.click();
    });
    var showImg = function (key) {
      img.classList.add("fade");
      var pre = new Image();
      pre.onload = pre.onerror = function () {
        img.src = pre.src; img.alt = ALT[key] || "";
        img.classList.remove("fade");
      };
      pre.src = src(key, true);
      var own = key.indexOf("krabbe:") === 0;
      tag.textContent = own ? "Foto: gartenkrabbe.de" : "Beispielbild";
      tag.classList.toggle("tag-own", own);
      $$("button", thumbs).forEach(function (t) { t.setAttribute("aria-pressed", t.dataset.key === key); });
    };
    var showRef = function (id) {
      var r = REFS.filter(function (x) { return x.id === id; })[0] || REFS[0];
      $$("button", tabs).forEach(function (b) {
        var on = b.dataset.id === r.id;
        b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1;
      });
      $("#ref-panel").setAttribute("aria-labelledby", "tab-" + r.id);
      $("#ref-kicker").textContent = "Objekttyp " + String(REFS.indexOf(r) + 1).padStart(2, "0") + " von " + String(REFS.length).padStart(2, "0");
      $("#ref-title").textContent = r.title;
      $("#ref-text").textContent = r.text;
      steck.innerHTML = "";
      r.steck.concat(OFFEN).forEach(function (row, i) {
        var d = document.createElement("div");
        d.innerHTML = "<dt></dt><dd" + (i >= r.steck.length ? ' class="offen"' : "") + "></dd>";
        d.firstChild.textContent = row[0]; d.lastChild.textContent = row[1];
        steck.appendChild(d);
      });
      thumbs.innerHTML = "";
      if (r.img.length > 1) r.img.forEach(function (key) {
        var t = document.createElement("button");
        t.type = "button"; t.dataset.key = key;
        t.setAttribute("aria-label", (ALT[key] || "Foto") + " zeigen");
        t.innerHTML = '<img alt="" loading="lazy" width="720" height="480">' + (key.indexOf("krabbe:") === 0 ? "<span>Original</span>" : "");
        t.firstChild.src = src(key, false);
        t.addEventListener("click", function () { showImg(key); });
        thumbs.appendChild(t);
      });
      showImg(r.img[0]);
      $("#ref-btn").textContent = r.id === "privat" ? "Gartenprojekt anfragen" : "Ähnliches Projekt anfragen";
      $("#ref-btn").dataset.typ = { privat: "Privat", wohnen: "Gewerbe", gewerbe: "Gewerbe", spiel: "Öffentlich", oeffentlich: "Öffentlich", begruenung: "Gewerbe" }[r.id];
    };
    showRef("privat");
    $$("[data-ref]").forEach(function (a) {
      a.addEventListener("click", function () { showRef(a.dataset.ref); });
    });
    $("#ref-btn").addEventListener("click", function () {
      var t = this.dataset.typ, radio = t && $('input[name="typ"][value="' + t + '"]');
      if (radio) radio.checked = true;
    });
  }

  /* Anfrageformular: verschickt nichts */
  $$('form[data-kind="anfrage"]').forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var st = $(".form-status", f);
      if (!f.elements.text.value.trim() || !f.elements.kontakt.value.trim()) {
        st.className = "form-status err";
        st.textContent = "Bitte kurz beschreiben, worum es geht, und wie wir Sie erreichen.";
        return;
      }
      st.className = "form-status";
      st.textContent = "So würde es aussehen: „Danke, wir melden uns.“ Im Entwurf wurde nichts verschickt.";
    });
  });

  /* Schnellbewerbung (Jobseite) */
  var sb = $("#sb");
  if (sb) {
    var steps = $$(".sb-step", sb), bar = $$(".sb-bar i", sb), cur = 0;
    var status = $(".form-status", sb);
    var go = function (n) {
      cur = n;
      steps.forEach(function (s, i) { s.classList.toggle("on", i === n); });
      bar.forEach(function (b, i) { b.classList.toggle("on", i <= n); });
      status.textContent = ""; status.className = "form-status";
      var first = $("input, button", steps[n]);
      if (first && sb.dataset.touched) first.focus({ preventScroll: true });
    };
    var val = function (name) {
      var el = $$('[name="' + name + '"]', sb).filter(function (x) { return (x.type !== "radio" && x.type !== "checkbox") || x.checked; });
      return el.map(function (x) { return x.value.trim(); }).filter(Boolean).join(", ");
    };
    var syncStelle = function () {
      var s = val("stelle");
      $$("[data-for]", sb).forEach(function (el) { el.hidden = el.dataset.for.split(" ").indexOf(s) < 0; });
    };
    $$('[name="stelle"]', sb).forEach(function (r) { r.addEventListener("change", syncStelle); });
    syncStelle();
    $$(".sb-next", sb).forEach(function (b) {
      b.addEventListener("click", function () {
        sb.dataset.touched = "1";
        if (cur === 0 && !val("stelle")) { status.className = "form-status err"; status.textContent = "Bitte wähle eine Stelle."; return; }
        go(cur + 1);
      });
    });
    $$(".sb-back", sb).forEach(function (b) { b.addEventListener("click", function () { go(Math.max(cur - 1, 0)); }); });
    sb.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!val("vorname") || !val("handy")) { status.className = "form-status err"; status.textContent = "Vorname und Handynummer reichen, aber die brauchen wir."; return; }
      var s = val("stelle");
      var rows = [["Stelle", s], ["Erfahrung", s === "Landschaftsgärtner" ? val("erfahrung") : val("schule")], ["Führerschein", s === "Landschaftsgärtner" ? val("fs") : ""], ["Rückruf", val("zeit")], ["Name", val("vorname")], ["Handy", val("handy")]];
      var dl = $(".sb-done dl", sb.parentNode);
      dl.innerHTML = "";
      rows.forEach(function (r) {
        if (!r[1]) return;
        var d = document.createElement("div");
        d.innerHTML = "<dt></dt><dd></dd>";
        d.firstChild.textContent = r[0]; d.lastChild.textContent = r[1];
        dl.appendChild(d);
      });
      $(".sb-name", sb.parentNode).textContent = val("vorname");
      sb.hidden = true;
      $(".sb-done", sb.parentNode).classList.add("on");
    });
    var again = $(".sb-again");
    if (again) again.addEventListener("click", function () {
      sb.reset(); syncStelle(); sb.hidden = false;
      $(".sb-done", sb.parentNode).classList.remove("on");
      go(0);
    });
    /* Stellen-Buttons wählen die Stelle vor */
    $$("[data-pick]").forEach(function (a) {
      a.addEventListener("click", function () {
        var r = $('[name="stelle"][value="' + a.dataset.pick + '"]', sb);
        if (r) { r.checked = true; syncStelle(); go(0); }
      });
    });
    go(0);
  }
})();
