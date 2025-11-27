let reposData = []; // store repos globally

async function loadRepos() {
  const response = await fetch("https://api.github.com/users/jsrothwell/repos");
  reposData = await response.json();
  renderRepos("stars", ""); // default sort by stars, no search filter
}

function renderRepos(sortBy, searchTerm, yearFilter) {
  const grid = document.getElementById("repo-grid");
  grid.innerHTML = "";

  let repos = [...reposData];

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
    card.innerHTML = `
      <h3><i class="fa-brands fa-github"></i> ${repo.name}</h3>
      <p>${repo.description || "No description provided."}</p>
      <div class="badges">
        ${repo.language ? `<span class="badge ${repo.language.toLowerCase()}">${repo.language}</span>` : ""}
      </div>
      <p>
        <i class="fa-solid fa-star"></i> ${repo.stargazers_count}
        &nbsp; <i class="fa-solid fa-code-fork"></i> ${repo.forks_count}
      </p>
      <p>
        <i class="fa-solid fa-clock"></i> Updated: ${new Date(repo.updated_at).toLocaleDateString()}
      </p>
      <a href="${repo.html_url}" target="_blank">View Repo</a>
    `;
    grid.appendChild(card);
  });
}

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
});
