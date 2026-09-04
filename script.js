// ---------- Config ----------
const GITHUB_USERNAME = "illmalicsi"; // TODO: replace with your own GitHub username
const API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&direction=desc&per_page=12&type=owner`;

// ---------- Mock data toggle ----------
// Set to true to bypass the real GitHub API and use MOCK_REPOS below.
// Remember to flip this back to false before shipping.
const USE_MOCK_DATA = true;

// Matches the actual shape of GitHub's /users/:user/repos response.
const MOCK_REPOS = [
  {
    id: 1,
    name: "portfolio-site",
    full_name: "illmalicsi/portfolio-site",
    description: "Personal portfolio built with vanilla JS.",
    html_url: "https://github.com/illmalicsi/portfolio-site",
    stargazers_count: 12,
    language: "JavaScript",
    owner: {
      login: "illmalicsi",
      avatar_url: "https://avatars.githubusercontent.com/u/000000?v=4",
    },
  },
  {
    id: 2,
    name: "weather-app",
    full_name: "illmalicsi/weather-app",
    description: null, // tests the "No description provided." fallback
    html_url: "https://github.com/illmalicsi/weather-app",
    stargazers_count: 0,
    language: null, // tests the "—" fallback
    owner: {
      login: "illmalicsi",
      avatar_url: "https://avatars.githubusercontent.com/u/000000?v=4",
    },
  },
  {
    id: 3,
    name: "todo-cli",
    full_name: "illmalicsi/todo-cli",
    description: "A command-line todo manager.",
    html_url: "https://github.com/illmalicsi/todo-cli",
    stargazers_count: 34,
    language: "Python",
    owner: {
      login: "illmalicsi",
      avatar_url: "https://avatars.githubusercontent.com/u/000000?v=4",
    },
  },
];

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
    let data;

    if (USE_MOCK_DATA) {
      // Simulate network latency so loading states actually get exercised.
      await new Promise((resolve) => setTimeout(resolve, 400));
      data = MOCK_REPOS;
    } else {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`GitHub API responded with status ${response.status}`);
      }

      data = await response.json();
    }

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