// Jamie Rothwell — project index
// Loads every public repo (all pages), shows a curated Featured row,
// groups the rest, and hides forks / stale / housekeeping repos by default.

const USER = "jsrothwell";

// Curated, in display order. Descriptions here override GitHub's.
const FEATURED = {
  "Sitka": "Design system — see the Sitka case study on rothwell.design.",
  "Design-Token-Inspector": "Firefox add-on that surfaces the design tokens behind any website.",
  "Tygge": "Design system: tokens, components and documentation.",
  "Bogu": "Sketch UI kit for the Kendo UI component library.",
  "Prodra": "A product-management suite built for designers.",
  "JobAppTracker": "Native macOS app (Swift) for tracking job applications.",
};

const GROUPS = [
  { title: "Design & product tools", match: r => /design|token|ui kit|sitka|tygge|bogu|screenshot|app ?store|pricing|prodra|lymegrove/i.test(r.name + " " + (r.description || "")) },
  { title: "AI experiments", match: r => /\bai\b|agent|antigravity|claude|v0-/i.test(r.name + " " + (r.description || "")) },
  { title: "WordPress & web", match: r => !/job|ats|ghost/i.test(r.name) && /wordpress|theme|plugin|youtube|php|substack|medium|social|seo/i.test(r.name + " " + (r.description || "") + " " + (r.language || "")) },
  { title: "Job-search tools I built", match: r => /job|ats|ghost|workday|linkedin|resume/i.test(r.name + " " + (r.description || "")) },
  { title: "Other", match: () => true },
];

// Never listed: profile/site repos and app support trackers.
const HIDDEN = /^(jsrothwell|jsrothwell\.github\.io|bogu\.github\.io)$|-support$/i;
const ARCHIVE_BEFORE = new Date("2024-01-01");

let repos = [];

const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

async function fetchAllRepos() {
  const all = [];
  for (let page = 1; page < 10; page++) {
    const res = await fetch(`https://api.github.com/users/${USER}/repos?per_page=100&page=${page}&sort=updated`, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const batch = await res.json();
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return all;
}

function isArchive(r) {
  return r.fork || new Date(r.pushed_at || r.updated_at) < ARCHIVE_BEFORE;
}

function card(r, descOverride) {
  const desc = descOverride || r.description || "";
  const updated = new Date(r.pushed_at || r.updated_at).toLocaleDateString(undefined, { year: "numeric", month: "short" });
  const meta = [r.language, r.stargazers_count ? `★ ${r.stargazers_count}` : "", r.fork ? "Fork" : "", `Updated ${updated}`].filter(Boolean);
  return `
    <a class="card" href="${esc(r.html_url)}">
      <h3>${esc(r.name.replace(/-+/g, " ").trim())}</h3>
      ${desc ? `<p>${esc(desc)}</p>` : ""}
      <div class="meta">${meta.map(m => `<span>${esc(m)}</span>`).join("")}</div>
    </a>`;
}

function renderFeatured() {
  const byName = Object.fromEntries(repos.map(r => [r.name, r]));
  $("featured").innerHTML = Object.entries(FEATURED)
    .filter(([name]) => byName[name])
    .map(([name, desc]) => card(byName[name], desc))
    .join("");
}

function renderGroups() {
  const term = $("search").value.trim().toLowerCase();
  const sort = $("sort").value;
  const showArchive = $("show-archive").checked;

  let list = repos.filter(r => !HIDDEN.test(r.name) && !(r.name in FEATURED));
  if (!showArchive) list = list.filter(r => !isArchive(r));
  if (term) list = list.filter(r => (r.name + " " + (r.description || "") + " " + (r.language || "")).toLowerCase().includes(term));

  const sorters = {
    updated: (a, b) => new Date(b.pushed_at || b.updated_at) - new Date(a.pushed_at || a.updated_at),
    stars: (a, b) => b.stargazers_count - a.stargazers_count,
    name: (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  };
  list.sort(sorters[sort]);

  const used = new Set();
  const html = GROUPS.map(g => {
    const items = list.filter(r => !used.has(r.name) && g.match(r));
    items.forEach(r => used.add(r.name));
    if (!items.length) return "";
    return `<h3 class="group-title">${esc(g.title)} <span>${items.length}</span></h3><div class="grid">${items.map(r => card(r)).join("")}</div>`;
  }).join("");

  const hiddenCount = repos.filter(r => !HIDDEN.test(r.name) && !(r.name in FEATURED) && isArchive(r)).length;
  $("groups").innerHTML = (html || `<p class="status">No projects match “${esc(term)}”.</p>`) +
    (!showArchive && hiddenCount ? `<p class="status">${hiddenCount} older or forked repos hidden — tick “Include older &amp; forked” to see them.</p>` : "");
}

document.addEventListener("DOMContentLoaded", async () => {
  ["search", "sort", "show-archive"].forEach(id => $(id).addEventListener("input", renderGroups));
  try {
    repos = await fetchAllRepos();
    renderFeatured();
    renderGroups();
  } catch (err) {
    $("groups").innerHTML = `<p class="status">Couldn't load projects right now. <a href="https://github.com/${USER}?tab=repositories">See them on GitHub</a>.</p>`;
  }
});
