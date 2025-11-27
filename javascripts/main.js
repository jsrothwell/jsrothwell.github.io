async function loadRepos() {
  const response = await fetch("https://api.github.com/users/jsrothwell/repos");
  const repos = await response.json();
  const grid = document.getElementById("repo-grid");

  // --- Sort repos before rendering ---
  // Sort by stars (descending)
  repos.sort((a, b) => b.stargazers_count - a.stargazers_count);

  // If you prefer sorting by update date instead, use:
  // repos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

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

document.addEventListener("DOMContentLoaded", loadRepos);
