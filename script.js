const seasonData = {
  updated: "Not yet updated",
  record: { wins: null, losses: null, ties: null },
  goalsScored: null,
  cleanSheets: null,
  nextMatch: {
    date: "Date to be added",
    opponent: "Opponent to be added",
    time: "Time to be added",
    location: "Location to be added",
  },
  players: [],
  results: [],
};

const byId = (id) => document.getElementById(id);
const { wins, losses, ties } = seasonData.record;
const gamesPlayed = (wins ?? 0) + (losses ?? 0) + (ties ?? 0);

byId("last-updated").textContent = seasonData.updated;
byId("record").textContent = wins === null ? "—" : `${wins}–${losses}–${ties}`;
byId("win-rate").textContent = gamesPlayed
  ? `${Math.round((wins / gamesPlayed) * 100)}%`
  : "—";
byId("goals-scored").textContent = seasonData.goalsScored ?? "—";
byId("clean-sheets").textContent = seasonData.cleanSheets ?? "—";
byId("next-date").textContent = seasonData.nextMatch.date;
byId("next-opponent").textContent = seasonData.nextMatch.opponent;
byId("next-time").textContent = seasonData.nextMatch.time;
byId("next-location").textContent = seasonData.nextMatch.location;

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

function renderPlayers() {
  byId("player-table").innerHTML = seasonData.players.length
    ? seasonData.players
        .map(
          (player) => `
    <tr>
      <td class="player-name"><span class="player-initial">${getInitials(player.name)}</span>${player.name}</td>
      <td>${player.position}</td>
      <td>${player.goals}</td>
      <td>${player.assists}</td>
    </tr>
  `,
        )
        .join("")
    : '<tr><td class="empty-state" colspan="4">Player stats will appear here once added.</td></tr>';
}

function renderResults(filter = "all") {
  const results =
    filter === "all"
      ? seasonData.results
      : seasonData.results.filter((result) => result.outcome === filter);

  byId("results-list").innerHTML = results.length
    ? results
        .map(
          (result) => `
    <article class="result ${result.outcome}">
      <span class="result-date">${result.date}</span>
      <div class="result-main">
        <span class="result-opponent">${result.opponent}</span>
        <strong class="result-score ${result.outcome}">${result.score}</strong>
      </div>
    </article>
  `,
        )
        .join("")
    : '<p class="empty-results">No results have been added yet.</p>';
}

document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(".filter-button.active").classList.remove("active");
    button.classList.add("active");
    renderResults(button.dataset.filter);
  });
});

renderPlayers();
renderResults();
