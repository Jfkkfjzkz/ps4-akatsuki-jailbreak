/*
  launch.js — NanospeedGamer landing page controller
  Countdown → auto-redirect to exploit chain, or manual start via button.
  Referrer guard: only fires when reached from index.html in the same origin.
*/

(function () {
  "use strict";

  const COUNTDOWN_SEC = 5;
  const DEST = "go.html";

  const countEl = document.getElementById("count"); // <p class="status" id="count">
  const content = document.querySelector(".content");

  /* ── referrer guard ──────────────────────────────────────────────────────
     The PS4 browser restores its last session on cold start. Without this,
     a page left open would refire the exploit with nobody watching.
     We allow if: same origin, referrer is index.html (or no referrer, which
     means a fresh navigation to / that the server routed here).          */
  function guardOk() {
    try {
      const ref = document.referrer;
      if (!ref) return true; // fresh load — OK
      const refUrl = new URL(ref);
      if (refUrl.origin !== location.origin) return false;
      // allow index.html or / routed to index.html
      const p = refUrl.pathname.replace(/\/+$/, "");
      return p === "" || p.endsWith("/index.html") || p.endsWith("/index") ;
    } catch (e) {
      return false;
    }
  }

  /* ── inject start button ─────────────────────────────────────────────── */
  const btn = document.createElement("button");
  btn.id = "startBtn";
  btn.textContent = "START NOW";
  btn.style.display = "none"; // hidden until guard passes
  if (content) content.appendChild(btn);

  /* ── go ──────────────────────────────────────────────────────────────── */
  function go() {
    if (countEl) countEl.textContent = "[ EXECUTE ]";
    if (btn) btn.disabled = true;
    location.href = DEST + location.search;
  }

  /* ── blocked by referrer guard ───────────────────────────────────────── */
  if (!guardOk()) {
    if (countEl) countEl.textContent = "[ ACCESS DENIED — NAVIGATE FROM ROOT ]";
    return; // stop — session restore, do not fire
  }

  /* ── show button now that we're cleared ─────────────────────────────── */
  btn.style.display = "";
  btn.addEventListener("click", function () {
    clearInterval(timer);
    go();
  });

  /* ── countdown ───────────────────────────────────────────────────────── */
  let remaining = COUNTDOWN_SEC;

  function tick() {
    if (countEl) {
      countEl.textContent =
        remaining > 0
          ? "[ LAUNCHING IN " + remaining + "... ]"
          : "[ EXECUTE ]";
    }
    if (remaining <= 0) {
      clearInterval(timer);
      go();
    }
    remaining--;
  }

  tick(); // show initial value immediately
  var timer = setInterval(tick, 1000);
})();
