const state = {
  screen: "chat",
  card: "private",
  budgetHidden: false,
  slotsUsed: 0,
  selected: null,
  meeting: null,
  credit: true,
  offers: [
    {
      id: "peak",
      name: "PeakView Roofing",
      lic: "PA HIC #PA102354",
      start: "Thu, Sep 3 · 3 weeks",
      why: "8 miles from 17601 · available in 3 weeks · standard $149 intro fee is not why they rank first.",
      warranty: "10-year workmanship",
      person: "Maria K., estimator"
    },
    {
      id: "summit",
      name: "Summit Home Pros",
      lic: "PA HIC #PA098712",
      start: "Fri, Sep 4 · 3 weeks",
      why: "Strong local completion history · similar two-story homes in Lititz.",
      warranty: "8-year workmanship",
      person: "James R., owner"
    },
    {
      id: "ever",
      name: "Evergreen Roofing Co.",
      lic: "PA HIC #PA074587",
      start: "Mon, Sep 7 · 4 weeks",
      why: "Good fit for asphalt replacement size and Lancaster timing.",
      warranty: "12-year workmanship",
      person: "Dana P., estimator"
    }
  ],
  log: []
};

const $ = (sel, root = document) => root.querySelector(sel);

function go(screen) {
  state.screen = screen;
  render();
}

function openCard() {
  state.card = "open";
  state.log.unshift({
    t: "Just now",
    title: "You opened this card",
    detail: "Visible: job, Lancaster 17601, 30–90 days, max 3. Hidden: " +
      (state.budgetHidden ? "budget, " : "") + "name, phone, street."
  });
  state.log.unshift({
    t: "Just now",
    title: "12 local roofers notified",
    detail: "Identity locked. Budget " + (state.budgetHidden ? "hidden" : "shown as a band") + "."
  });
  go("opened");
}

function closeCard() {
  state.card = "closed";
  state.log.unshift({
    t: "Just now",
    title: "You closed this card",
    detail: "Contractors lost access. Pending offers canceled. Number stayed hidden."
  });
  hideSheet();
  go("receipt");
}

function choose(id) {
  state.selected = state.offers.find(o => o.id === id);
  go("detail");
}

function book(slot) {
  state.meeting = slot;
  state.card = "booked";
  state.slotsUsed = Math.min(3, state.slotsUsed + 1);
  state.log.unshift({
    t: "Just now",
    title: state.selected.name + " can see your name and address",
    detail: slot + " · identity unlocked for this contractor only."
  });
  go("booked");
}

function stripCopy() {
  if (state.card === "private") return "Private · this chat stays with YourAI";
  if (state.card === "open") return "Identity locked · " + state.slotsUsed + " of 3 slots used";
  if (state.card === "booked") return "Name shared with " + (state.selected?.name || "contractor") + " only";
  return "Closed · nobody can see this card";
}

function stripClass() {
  if (state.card === "booked") return "shared";
  if (state.card === "closed") return "closed";
  if (state.card === "open") return "open";
  return "private";
}

function showSheet(html) {
  const back = $("#modal");
  back.classList.add("show");
  back.innerHTML = `<div class="sheet">${html}</div>`;
}
function hideSheet() {
  const back = $("#modal");
  if (!back) return;
  back.classList.remove("show");
  back.innerHTML = "";
}

function render() {
  const app = $("#app");
  const strip = stripCopy();
  const d = state.selected;

  const chatScreen = `
    <div class="screen chat ${state.screen === "chat" ? "active" : ""}">
      <div class="bubble user">I probably need to replace my roof this fall. Insurance might cover part of it.</div>
      <div class="bubble ai">
        I can help you compare roofing systems, estimate costs, review warranties, and understand what insurance may cover.
        <div class="whisper">This stays between you and YourAI.</div>
      </div>
      <div class="meta-line">5:41 PM · locked</div>
      <div class="bubble user">Can you find contractors without giving out my number?</div>
      <div class="choice-card">
        <p>Need help finding contractors?<br>I can build a card they see — no name, no phone.</p>
        <div class="row">
          <button class="btn quiet" onclick="go('chat')">Keep this private</button>
          <button class="btn green" onclick="go('preview')">Preview a card</button>
        </div>
      </div>
    </div>`;

  const previewScreen = `
    <div class="screen preview ${state.screen === "preview" ? "active" : ""}">
      <div class="kicker">Nothing goes out until you say so</div>
      <div class="page-title">Review what contractors will see</div>
      <div class="card">
        <div class="field"><div><b>Roof replacement</b><span>Job type</span></div></div>
        <div class="field"><div><b>Lancaster, PA · 17601</b><span>City + ZIP only</span></div></div>
        <div class="field"><div><b>30–90 days</b><span>Purchase window</span></div></div>
        <div class="field">
          <div><b>${state.budgetHidden ? "Budget hidden" : "$15k–$30k"}</b><span>Budget band</span></div>
          <button class="toggle ${state.budgetHidden ? "" : "on"}" onclick="state.budgetHidden=!state.budgetHidden;render()">
            ${state.budgetHidden ? "Show" : "Hide"}
          </button>
        </div>
        <div class="field"><div><b>Max 3 meetings</b><span>You choose who</span></div></div>
        <div class="field"><div><b>Identity locked</b><span>No name or phone on this card</span></div></div>
      </div>
      <button class="btn primary block" onclick="showSheet(` +
        "`<h3>Open this card?</h3><p class='fine'>Up to 3 licensed roofers in Lancaster County can see the preview. They will not get your name or phone unless you pick them.</p><div style='margin-top:12px;display:flex;gap:8px'><button class='btn quiet' onclick='hideSheet()'>Back</button><button class='btn primary' style='flex:1' onclick='openCard()'>Open card</button></div>`" +
      `)">Open to 3 local contractors</button>
      <button class="btn ghost block" onclick="go('chat')">Keep private</button>
      <p class="fine">They will not get your name or phone unless you pick them.</p>
    </div>`;

  const openedScreen = `
    <div class="screen preview ${state.screen === "opened" ? "active" : ""}">
      <div class="page-title">Card is open</div>
      <p class="fine">3 licensed roofers can see the preview. Your name and phone are still locked.</p>
      <button class="btn green block" onclick="go('offers')">See offers</button>
      <button class="btn quiet block" onclick="go('receipt')">See who can view it</button>
      <button class="btn danger block" onclick="confirmClose()">Close this card</button>
    </div>`;

  const offers = state.offers.map(o => `
    <article class="offer">
      <div class="offer-top">
        <div>
          <h3>${o.name}</h3>
          <div class="lic">${o.lic}</div>
        </div>
        <div class="lic">${o.start}</div>
      </div>
      <div class="why"><b>Why this match.</b> ${o.why}</div>
      <div class="fee">Introduction fee $149 · paid by contractor</div>
      <button class="btn quiet" onclick="choose('${o.id}')">View</button>
    </article>`).join("");

  const offersScreen = `
    <div class="screen offers ${state.screen === "offers" ? "active" : ""}">
      <div class="kicker">Roof replacement · Lancaster</div>
      <div class="page-title">Choose up to 3</div>
      ${state.card === "closed" ? "<p class='fine'>This card is closed. No new offers.</p>" : offers}
    </div>`;

  const detailScreen = d ? `
    <div class="screen detail ${state.screen === "detail" ? "active" : ""}">
      <div class="kicker">${d.lic}</div>
      <div class="page-title">${d.name}</div>
      <div class="why">
        <b>Why they are showing.</b><br>
        • 8 miles from 17601<br>
        • Licensed + insured on file<br>
        • ${d.warranty}<br>
        • Introduction fee is the standard $149 (not why they ranked)
      </div>
      <p class="fine">Who comes: ${d.person}</p>
      <div class="split">
        <div class="line"><span>What they pay</span><b>$149.00</b></div>
        <div class="line"><span>YourAI fee</span><span>−$29.80</span></div>
        <div class="line"><span>Your completion credit</span><span>${state.credit ? "$75.00" : "$0.00"}</span></div>
        <div class="line total"><span>Released after the visit</span><span>${state.credit ? "$75.00" : "No credit"}</span></div>
      </div>
      <button class="btn quiet" onclick="state.credit=!state.credit;render()">${state.credit ? "I don’t want the credit" : "Include $75 credit"}</button>
      <button class="btn primary block" onclick="go('schedule')">Choose this contractor</button>
      <button class="btn ghost block" onclick="go('offers')">Back to offers</button>
    </div>` : "";

  const scheduleScreen = `
    <div class="screen schedule ${state.screen === "schedule" ? "active" : ""}">
      <div class="page-title">Meet ${d ? d.name : ""}</div>
      <p class="fine">Your name and phone unlock after you pick a time.</p>
      <div class="slots">
        <button class="slot" onclick="book('Thursday 6:00–6:30 PM · in person')">Thu 6:00–6:30 PM · In person</button>
        <button class="slot" onclick="book('Friday 8:00–8:30 AM · in person')">Fri 8:00–8:30 AM · In person</button>
        <button class="slot" onclick="book('Saturday 10:00–10:30 AM · in person')">Sat 10:00–10:30 AM · In person</button>
      </div>
    </div>`;

  const bookedScreen = `
    <div class="screen schedule ${state.screen === "booked" ? "active" : ""}">
      <div class="page-title">Meeting booked</div>
      <p class="fine">${state.meeting || ""}</p>
      <div class="card">
        <div class="field"><div><b>${d ? d.person : ""}</b><span>${d ? d.name : ""} now sees your name, phone, and the address you confirmed.</span></div></div>
        <div class="field"><div><b>Other offers stay locked</b><span>You can still choose 1 more or close leftover slots.</span></div></div>
      </div>
      <button class="btn green block" onclick="go('visit')">Skip to after the visit</button>
      <button class="btn quiet block" onclick="go('receipt')">View activity log</button>
    </div>`;

  const receiptScreen = `
    <div class="screen receipt ${state.screen === "receipt" ? "active" : ""}">
      <div class="page-title">Activity on this card</div>
      <div class="log">
        ${state.log.length ? state.log.map(i => `<div class="log-item"><b>${i.title}</b><span>${i.t} · ${i.detail}</span></div>`).join("") : `<div class="log-item"><b>No market activity yet</b><span>Your chat has not left the vault.</span></div>`}
      </div>
    </div>`;

  const visitScreen = `
    <div class="screen visit ${state.screen === "visit" ? "active" : ""}">
      <div class="page-title">Did they show up?</div>
      <p class="fine">Payout releases after you confirm the visit happened.</p>
      <button class="btn green block" onclick="state.card='closed';state.log.unshift({t:'Just now',title:'Visit confirmed · $75 released',detail:'PeakView marked complete. Card closed.'});go('receipt')">Yes, they came</button>
      <button class="btn quiet block">No-show</button>
      <button class="btn danger block">Something was off</button>
    </div>`;

  app.innerHTML = `
    <div class="status-ios"><span>5:41</span><span>YourAI</span></div>
    <div class="app-header">
      <button onclick="historyBack()">${backLabel()}</button>
      <h2>YourAI</h2>
      <button onclick="confirmClose()">Close</button>
    </div>
    <div class="lock-strip ${stripClass()}" onclick="go('receipt')"><span class="dot"></span> ${strip}</div>
    <div class="screens">
    ${chatScreen}${previewScreen}${openedScreen}${offersScreen}${detailScreen}${scheduleScreen}${bookedScreen}${receiptScreen}${visitScreen}
    </div>
    <div class="tabbar">
      <button class="tab ${state.screen==="chat"?"active":""}" onclick="go('chat')"><small>○</small>Chat</button>
      <button class="tab ${["preview","opened"].includes(state.screen)?"active":""}" onclick="go(state.card==='private'?'preview':'opened')"><small>□</small>Card</button>
      <button class="tab ${["offers","detail","schedule","booked"].includes(state.screen)?"active":""}" onclick="go('offers')"><small>☰</small>Offers</button>
      <button class="tab ${state.screen==="receipt"?"active":""}" onclick="go('receipt')"><small>≡</small>Activity</button>
    </div>
    <div id="modal" class="modal-back" onclick="if(event.target.id==='modal')hideSheet()"></div>
  `;

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };
  setText("state-card", state.card);
  setText("state-screen", state.screen);
  setText("state-budget", state.budgetHidden ? "hidden" : "visible band");
  setText("state-slots", state.slotsUsed + " / 3");
  setText("state-credit", state.credit ? "on" : "opted out");
}

function backLabel() {
  if (state.screen === "chat") return "";
  return "Back";
}
function historyBack() {
  const map = {
    preview: "chat",
    opened: "preview",
    offers: "opened",
    detail: "offers",
    schedule: "detail",
    booked: "offers",
    receipt: "chat",
    visit: "booked"
  };
  go(map[state.screen] || "chat");
}
function confirmClose() {
  showSheet(`
    <h3>Close this card?</h3>
    <p class="fine">Contractors lose access immediately. Pending offers are canceled. Your number stays hidden.</p>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn quiet" onclick="hideSheet()">Keep card open</button>
      <button class="btn danger" onclick="closeCard()">Close card</button>
    </div>
  `);
}

function resetDemo() {
  state.screen = "chat";
  state.card = "private";
  state.budgetHidden = false;
  state.slotsUsed = 0;
  state.selected = null;
  state.meeting = null;
  state.credit = true;
  state.log = [];
  hideSheet();
  render();
}

window.go = go;
window.openCard = openCard;
window.closeCard = closeCard;
window.choose = choose;
window.book = book;
window.hideSheet = hideSheet;
window.showSheet = showSheet;
window.confirmClose = confirmClose;
window.resetDemo = resetDemo;
window.historyBack = historyBack;
window.state = state;
window.render = render;

render();
