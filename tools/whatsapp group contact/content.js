// WhatsApp Group Contact Extractor — Fixed & Enhanced
// Captures: Display Name | Saved Name | Phone Number | Country | Is Admin | Group Name

(function extractContacts() {

  // ── Helper: wrap a cell value in double-quotes, escaping internal quotes ──────
  function csvCell(value) {
    const str = String(value == null ? "" : value);
    return `"${str.replace(/"/g, '""')}"`;
  }

  // ── Helper: derive country dial-code from a raw phone string ─────────────────
  const DIAL_CODES = {
    "1":"US","7":"RU","20":"EG","27":"ZA","30":"GR","31":"NL","32":"BE","33":"FR",
    "34":"ES","36":"HU","39":"IT","40":"RO","41":"CH","43":"AT","44":"GB","45":"DK",
    "46":"SE","47":"NO","48":"PL","49":"DE","51":"PE","52":"MX","54":"AR","55":"BR",
    "56":"CL","57":"CO","58":"VE","60":"MY","61":"AU","62":"ID","63":"PH","64":"NZ",
    "65":"SG","66":"TH","81":"JP","82":"KR","84":"VN","86":"CN","90":"TR","91":"IN",
    "92":"PK","94":"LK","98":"IR","212":"MA","213":"DZ","216":"TN","218":"LY",
    "220":"GM","221":"SN","223":"ML","224":"GN","225":"CI","226":"BF","227":"NE",
    "228":"TG","229":"BJ","230":"MU","231":"LR","232":"SL","233":"GH","234":"NG",
    "235":"TD","237":"CM","238":"CV","240":"GQ","241":"GA","242":"CG","243":"CD",
    "244":"AO","249":"SD","250":"RW","251":"ET","252":"SO","254":"KE","255":"TZ",
    "256":"UG","258":"MZ","260":"ZM","263":"ZW","264":"NA","265":"MW","266":"LS",
    "267":"BW","268":"SZ","291":"ER","351":"PT","352":"LU","353":"IE","354":"IS",
    "355":"AL","356":"MT","357":"CY","358":"FI","359":"BG","370":"LT","371":"LV",
    "372":"EE","373":"MD","374":"AM","375":"BY","380":"UA","381":"RS","385":"HR",
    "386":"SI","387":"BA","420":"CZ","421":"SK","501":"BZ","502":"GT","503":"SV",
    "504":"HN","505":"NI","506":"CR","507":"PA","509":"HT","591":"BO","592":"GY",
    "593":"EC","595":"PY","598":"UY","673":"BN","880":"BD","886":"TW","960":"MV",
    "961":"LB","962":"JO","963":"SY","964":"IQ","965":"KW","966":"SA","967":"YE",
    "968":"OM","970":"PS","971":"AE","972":"IL","973":"BH","974":"QA","975":"BT",
    "976":"MN","977":"NP","992":"TJ","993":"TM","994":"AZ","995":"GE","996":"KG",
    "998":"UZ"
  };
  function dialCodeOf(phone) {
    for (const len of [3, 2, 1]) {
      const code = DIAL_CODES[phone.substring(0, len)];
      if (code) return `+${phone.substring(0, len)} (${code})`;
    }
    return "";
  }

  // ── Helper: is a string just a phone number? ─────────────────────────────────
  function isPhoneLike(str) {
    const clean = str.replace(/[+\s\-().]/g, "");
    return clean.length >= 7 && /^\d+$/.test(clean);
  }

  // ── Determine group name from the current conversation header ─────────────────
  function getGroupName() {
    const header = (
      document.querySelector('[data-testid="conversation-header"]') ||
      document.querySelector("header") ||
      document.querySelector("#main header")
    );
    if (!header) return "WhatsApp Group";
    const titleEl = (
      header.querySelector('[data-testid="conversation-info-header-chat-title"]') ||
      header.querySelector("span[title]") ||
      header.querySelector("span[dir='auto']")
    );
    return (titleEl && (titleEl.getAttribute("title") || titleEl.innerText || "")).trim()
           || "WhatsApp Group";
  }

  // ── Extract contacts from the currently-open group info / participants panel ──
  const contacts = [];
  const seenPhones = new Set();
  const groupName  = getGroupName();

  // Approach 1: data-id="<phone>@c.us" rows (group participant list items)
  document.querySelectorAll('[data-id$="@c.us"]').forEach(row => {
    // Skip rows inside the sidebar (left pane)
    if (row.closest("#pane-side")) return;

    const jid   = row.getAttribute("data-id") || "";
    const phone = jid.split("@")[0];
    if (!/^\d{7,15}$/.test(phone) || seenPhones.has(phone)) return;
    seenPhones.add(phone);

    // Display name: try saved contact name first
    const titleEl = (
      row.querySelector("span[title]") ||
      row.querySelector('[data-testid="cell-frame-title"]') ||
      row.querySelector("span[dir='auto']")
    );
    const rawName = (titleEl && (titleEl.getAttribute("title") || titleEl.innerText || "")).trim();

    // Public / push-name (shown with ~ prefix in WA)
    const subEl = (
      row.querySelector('[data-testid="cell-frame-primary-detail"]') ||
      row.querySelector("span.selectable-text")
    );
    const publicName = (subEl && subEl.innerText || "").replace(/^~/, "").trim();

    // Decide display name: prefer saved name if it's not a phone number
    let displayName = "";
    let savedName   = "";
    let isMyContact = false;

    if (rawName && !isPhoneLike(rawName)) {
      displayName = rawName;
      savedName   = rawName;
      isMyContact = true;
    } else if (publicName && !isPhoneLike(publicName)) {
      displayName = publicName;
    } else {
      displayName = `+${phone}`;
    }

    const isAdmin = !!(
      row.querySelector('[data-testid="group-participant-admin"]') ||
      row.querySelector('[aria-label*="admin" i]')
    );

    contacts.push({
      displayName,
      savedName:    savedName  || "",
      publicName:   publicName || "",
      phone:        `+${phone}`,
      country:      dialCodeOf(phone),
      isMyContact:  isMyContact ? "YES" : "NO",
      isAdmin:      isAdmin     ? "YES" : "NO",
      groupName
    });
  });

  // Approach 2: fall back to div[role="button"] items if Approach 1 found nothing
  if (contacts.length === 0) {
    document.querySelectorAll('div[role="button"]').forEach(row => {
      const nameEl = (
        row.querySelector("span[title]") ||
        row.querySelector("span[dir='auto']")
      );
      if (!nameEl) return;

      const rawName = (nameEl.getAttribute("title") || nameEl.innerText || "").trim();
      if (!rawName) return;

      // Try to get phone from a nested span that looks like a number
      let phone = "";
      row.querySelectorAll("span").forEach(s => {
        const t = s.innerText.trim();
        if (isPhoneLike(t) && t.length >= 7 && !phone) phone = t.replace(/[^+\d]/g, "");
      });

      const key = phone || rawName;
      if (seenPhones.has(key)) return;
      seenPhones.add(key);

      contacts.push({
        displayName:  rawName,
        savedName:    isPhoneLike(rawName) ? "" : rawName,
        publicName:   "",
        phone:        phone || "—",
        country:      phone ? dialCodeOf(phone.replace(/^\+/, "")) : "",
        isMyContact:  (!isPhoneLike(rawName)) ? "YES" : "NO",
        isAdmin:      "NO",
        groupName
      });
    });
  }

  // ── Build CSV with proper column headers and quoted fields ───────────────────
  if (contacts.length === 0) {
    alert(
      "No contacts found in this group panel.\n\n" +
      "Make sure you are inside a group chat and the participant list is visible/scrolled."
    );
    return;
  }

  const HEADERS = [
    "Display Name",
    "Saved Name",
    "Public Name",
    "Phone Number",
    "Country",
    "Is My Contact",
    "Is Admin",
    "Group Name"
  ];

  const headerRow = HEADERS.map(csvCell).join(",");
  const dataRows  = contacts.map(c =>
    [
      csvCell(c.displayName),
      csvCell(c.savedName),
      csvCell(c.publicName),
      csvCell(c.phone),
      csvCell(c.country),
      csvCell(c.isMyContact),
      csvCell(c.isAdmin),
      csvCell(c.groupName)
    ].join(",")
  );

  // BOM (\uFEFF) ensures Excel opens UTF-8 CSV correctly
  const csvText = "\uFEFF" + [headerRow, ...dataRows].join("\r\n");
  const blob    = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
  const url     = URL.createObjectURL(blob);

  const stamp    = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const filename = `wa_group_contacts_${stamp}.csv`;

  const link = document.createElement("a");
  link.href     = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  console.log(`[WA Extractor] Downloaded ${contacts.length} contacts → ${filename}`);
  alert(`✅ Exported ${contacts.length} contacts to: ${filename}`);

})();
