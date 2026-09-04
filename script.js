// ---------- Config ----------
const GITHUB_USERNAME = "illmalicsi"; // TODO: replace with your own GitHub username
const API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&direction=desc&per_page=12&type=owner`;

// ---------- State ----------
let allRepos = [];

// ---------- DOM refs ----------
const grid = document.getElementById("project-grid");
const spinner = document.getElementById("loading-spinner");
const statusEl = document.getElementById("fetch-status");
const emptyState = document.getElementById("empty-state");
const searchInput = document.getElementById("project-search");
const hasProjectsPage = Boolean(grid);

// ---------- Fetch & render ----------
async function loadRepos() {
  spinner.hidden = false;
  statusEl.textContent = "";
  grid.innerHTML = "";
  emptyState.hidden = true;

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`GitHub API responded with status ${response.status}`);
    }

    const data = await response.json();
    allRepos = Array.isArray(data) ? data : [];

    if (allRepos.length === 0) {
      statusEl.textContent = "No public repositories found for this account.";
    } else {
      statusEl.textContent = `Showing ${allRepos.length} repositories from GitHub.`;
    }

    renderRepos(allRepos);
  } catch (err) {
    console.error(err);
    statusEl.textContent = "";
    grid.innerHTML = "";
    emptyState.hidden = false;
    emptyState.textContent =
      "Couldn't load repositories right now. Check your connection and try again in a moment.";
  } finally {
    spinner.hidden = true;
  }
}

// Build project cards dynamically — no hardcoded HTML
function renderRepos(repos) {
  grid.innerHTML = "";

  if (repos.length === 0) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  const fragment = document.createDocumentFragment();

  repos.forEach((repo) => {
    const card = document.createElement("article");
    card.className = "project-card";

    const header = document.createElement("div");
    header.className = "project-card-header";

    const avatar = document.createElement("img");
    avatar.src = repo.owner?.avatar_url || "";
    avatar.alt = `${repo.owner?.login || "Repository owner"} avatar`;
    avatar.loading = "lazy";

    const name = document.createElement("h3");
    name.className = "project-name";
    name.textContent = repo.name;

    header.append(avatar, name);

    const desc = document.createElement("p");
    desc.className = "project-desc";
    desc.textContent = repo.description || "No description provided.";

    const meta = document.createElement("div");
    meta.className = "project-meta";
    meta.innerHTML = "";

    const lang = document.createElement("span");
    lang.textContent = repo.language || "—";

    const stars = document.createElement("span");
    stars.textContent = `★ ${repo.stargazers_count ?? 0}`;

    meta.append(lang, stars);

    const link = document.createElement("a");
    link.className = "project-link";
    link.href = repo.html_url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "View on GitHub →";

    card.append(header, desc, meta, link);
    fragment.appendChild(card);
  });

  grid.appendChild(fragment);
}

// ---------- Search (partial, case-insensitive) ----------
if (hasProjectsPage && searchInput) {
  searchInput.addEventListener("input", (e) => {
    const term = e.target.value.trim().toLowerCase();
    const filtered = term
      ? allRepos.filter((repo) => repo.name.toLowerCase().includes(term))
      : allRepos;
    renderRepos(filtered);
  });
}

// ---------- Contact form (only present on the Home page) ----------
const form = document.getElementById("contact-form");
const feedback = document.getElementById("form-feedback");

if (form && feedback) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      feedback.textContent = "Please fill in every field correctly before sending.";
      feedback.className = "form-feedback error";
      form.reportValidity();
      return;
    }

    feedback.textContent = "Message sent — thanks for reaching out!";
    feedback.className = "form-feedback success";
    form.reset();
  });
}

// ---------- Init ----------
if (hasProjectsPage) {
  loadRepos();
}