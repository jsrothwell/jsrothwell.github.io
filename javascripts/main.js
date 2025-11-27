async function loadRepos() {
  const response = await fetch("https://api.github.com/users/jsrothwell/repos");
  const repos = await response.json();
  const grid = document.getElementById("repo-grid");

  repos.forEach(repo => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${repo.name}</h3>
      <p>${repo.description || "No description provided."}</p>
      <p>⭐ ${repo.stargazers_count} | 🍴 ${repo.forks_count} | 💻 ${repo.language || "N/A"}</p>
      <p>⏱ Updated: ${new Date(repo.updated_at).toLocaleDateString()}</p>
      <a href="${repo.html_url}" target="_blank">View Repo</a>
    `;
    grid.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", loadRepos);
