let reposData = []; // store repos globally

async function loadRepos() {
  const response = await fetch("https://api.github.com/users/jsrothwell/repos");
  reposData = await response.json();
  renderRepos("stars", ""); // default sort by stars, no search filter
}

function renderRepos(sortBy, searchTerm) {
  const grid = document.getElementById("repo-grid");
  grid.innerHTML = ""; // clear existing cards

  let repos = [...reposData]; // copy array

  // --- Filter by search term ---
  if (searchTerm) {
    repos = repos.filter(repo =>
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
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
      <p>
        <i class="fa-solid fa-star"></i> ${repo.stargazers_count}
        &nbsp; <i class="fa-solid fa-code-fork"></i> ${repo.forks_count}
        &nbsp; <i class="fa-solid fa-code"></i> ${repo.language || "N/A"}
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

  // Sort buttons
  document.getElementById("sort-stars").addEventListener("click", () => {
    const searchTerm = document.getElementById("search").value;
    renderRepos("stars", searchTerm);
  });

  document.getElementById("sort-updated").addEventListener("click", () => {
    const searchTerm = document.getElementById("search").value;
    renderRepos("updated", searchTerm);
  });

  // Search bar (live filtering)
  document.getElementById("search").addEventListener("input", (e) => {
    renderRepos("stars", e.target.value); // default sort by stars while typing
  });
});
