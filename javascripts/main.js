let reposData = []; // store repos globally

async function loadRepos() {
  const response = await fetch("https://api.github.com/users/jsrothwell/repos?per_page=100", {
    headers: { Accept: "application/vnd.github.mercy-preview+json" }
  });
  reposData = await response.json();

  populateYearDropdown(reposData);
  renderRepos("stars", "", "");
}

function populateYearDropdown(repos) {
  const yearSelect = document.getElementById("year-filter");
  const years = new Set();

  repos.forEach(repo => {
    const year = new Date(repo.updated_at).getFullYear();
    years.add(year);
  });

  const sortedYears = Array.from(years).sort((a, b) => b - a);
  yearSelect.innerHTML = '<option value="">All Years</option>';

  sortedYears.forEach(year => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  });
}

function renderRepos(sortBy, searchTerm, yearFilter, customRepos = null) {
  const grid = document.getElementById("repo-grid");
  grid.innerHTML = "";

  let repos = customRepos || [...reposData];

  // --- Filter by search term ---
  if (searchTerm) {
    repos = repos.filter(repo =>
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

  // --- Filter by year ---
  if (yearFilter) {
    repos = repos.filter(repo => {
      const year = new Date(repo.updated_at).getFullYear();
      return year.toString() === yearFilter;
    });
  }

  // --- Sort repos ---
  if (sortBy === "stars") {
    repos.sort((a, b) => b.stargazers_count - a.stargazers_count);
  } else if (sortBy === "updated") {
    repos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  }

  // --- Render cards ---
  repos.forEach(repo => {
    const card = document.createElement("div");
    card.className = "card";

    const languageBadge = repo.language
      ? `<span class="badge ${repo.language.toLowerCase()}">${repo.language}</span>`
      : "";

    const topicBadges = repo.topics && repo.topics.length > 0
      ? repo.topics.map(topic => `<span class="badge topic" data-topic="${topic}">${topic}</span>`).join("")
      : "";

    card.innerHTML = `
      <h3><i class="fa-brands fa-github"></i> ${repo.name}</h3>
      <div class="card-content">
        <p>${repo.description || "No description provided."}</p>
        <div class="badges">
          ${languageBadge}
          ${topicBadges}
        </div>
      </div>
      <div class="card-footer">
        <p>
          <i class="fa-solid fa-star"></i> ${repo.stargazers_count}
          &nbsp; <i class="fa-solid fa-code-fork"></i> ${repo.forks_count}
        </p>
        <p>
          <i class="fa-solid fa-clock"></i> Updated: ${new Date(repo.updated_at).toLocaleDateString()}
        </p>
        <a href="${repo.html_url}" target="_blank">View Repo</a>
      </div>
    `;
    grid.appendChild(card);
  });
}

// --- Topic filtering ---
function filterByTopic(topic) {
  const searchTerm = document.getElementById("search").value;
  const yearFilter = document.getElementById("year-filter").value;

  const filteredRepos = reposData.filter(repo =>
    repo.topics && repo.topics.includes(topic)
  );

  renderRepos("stars", searchTerm, yearFilter, filteredRepos);
}

// --- Event listeners ---
document.addEventListener("DOMContentLoaded", () => {
  loadRepos();

  const searchInput = document.getElementById("search");
  const yearSelect = document.getElementById("year-filter");

  function rerender(sortBy) {
    const searchTerm = searchInput.value;
    const yearFilter = yearSelect.value;
    renderRepos(sortBy, searchTerm, yearFilter);
  }

  document.getElementById("sort-stars").addEventListener("click", () => rerender("stars"));
  document.getElementById("sort-updated").addEventListener("click", () => rerender("updated"));
  searchInput.addEventListener("input", () => rerender("stars"));
  yearSelect.addEventListener("change", () => rerender("stars"));

  // Topic badge clicks (event delegation)
  document.getElementById("repo-grid").addEventListener("click", e => {
    if (e.target.classList.contains("topic")) {
      const selectedTopic = e.target.getAttribute("data-topic");
      filterByTopic(selectedTopic);
    }
  });

  // Clear filters
  document.getElementById("clear-filters").addEventListener("click", () => {
    searchInput.value = "";
    yearSelect.value = "";
    renderRepos("stars", "", "");
  });
});

document.getElementById("dark-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});
