function isToday(isoDate) {
    if (!isoDate) return false;
    const today = new Date().toISOString().slice(0, 10);
    return isoDate.slice(0, 10) === today;
}

function normalizeKey(name) {
    return name
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "");
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

const GITHUB_API = "https://api.github.com";

function isGithubConfigured() {
    return typeof githubConfig !== "undefined" && githubConfig.token !== "SEU_TOKEN";
}

async function loadGithubScores() {
    const { owner, repo, branch, filePath, token } = githubConfig;
    const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;

    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json"
        }
    });

    if (!res.ok) throw new Error(`GitHub API error ${res.status}`);

    const data = await res.json();
    const content = atob(data.content.replace(/\n/g, ""));
    const scores = JSON.parse(content || "{}");
    return { scores, sha: data.sha };
}

async function saveGithubScores(scores, sha) {
    const { owner, repo, branch, filePath, token } = githubConfig;
    const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}`;

    const content = btoa(unescape(encodeURIComponent(JSON.stringify(scores, null, 2))));

    const res = await fetch(url, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: `placar: atualiza pontuação`,
            content,
            sha,
            branch
        })
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`GitHub save error ${res.status}: ${err.message || ""}`);
    }
}

const LOCAL_SCORES_KEY = "bingao_scores";

function getLocalScores() {
    try {
        return JSON.parse(localStorage.getItem(LOCAL_SCORES_KEY)) || {};
    } catch (e) {
        return {};
    }
}

function saveLocalScores(scores) {
    localStorage.setItem(LOCAL_SCORES_KEY, JSON.stringify(scores));
}

async function incrementScore(playerName) {
    const key = normalizeKey(playerName);
    if (!key) return false;

    if (isGithubConfigured()) {
        try {
            const { scores, sha } = await loadGithubScores();

            if (scores[key] && isToday(scores[key].lastWin)) return "already_won_today";

            if (scores[key]) {
                scores[key].score += 1;
                scores[key].name = playerName.trim();
                scores[key].lastWin = new Date().toISOString();
            } else {
                scores[key] = {
                    name: playerName.trim(),
                    score: 1,
                    lastWin: new Date().toISOString()
                };
            }

            await saveGithubScores(scores, sha);
            return true;
        } catch (e) {
            console.error("Erro ao salvar no GitHub:", e);
            return false;
        }
    }

    const scores = getLocalScores();

    if (scores[key] && isToday(scores[key].lastWin)) return "already_won_today";

    if (scores[key]) {
        scores[key].score += 1;
        scores[key].name = playerName.trim();
        scores[key].lastWin = new Date().toISOString();
    } else {
        scores[key] = { name: playerName.trim(), score: 1, lastWin: new Date().toISOString() };
    }

    saveLocalScores(scores);
    return true;
}

function renderScoreboard(scores) {
    const container = document.getElementById("scoreboard");
    if (!container) return;

    if (!scores || Object.keys(scores).length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="emoji">🦧</span>
                Nenhum bingo registrado ainda.<br>
                Gere uma cartela e faça BINGO!
            </div>
        `;
        return;
    }

    const sorted = Object.values(scores).sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.name.localeCompare(b.name);
    });

    const rankEmojis = ["🥇", "🥈", "🥉"];
    const rankClasses = ["gold", "silver", "bronze"];

    container.innerHTML = sorted.map((player, i) => {
        const rankEmoji = rankEmojis[i] || "";
        const rankClass = rankClasses[i] || "default";
        const rankDisplay = rankEmoji || `${i + 1}º`;
        const delay = i * 0.05;

        return `
            <div class="score-row" style="animation-delay: ${delay}s">
                <span class="score-rank ${rankClass}">${rankDisplay}</span>
                <span class="score-name">${escapeHtml(player.name)}</span>
                <span class="score-points">
                    ${player.score}
                    <span class="score-label">${player.score === 1 ? "vitória" : "vitórias"}</span>
                </span>
            </div>
        `;
    }).join("");

    const lastUpdated = document.getElementById("lastUpdated");
    if (lastUpdated) lastUpdated.textContent = "Atualizado em tempo real";
}

let _lastScoresJson = null;

async function checkAndRender() {
    try {
        let scores;
        if (isGithubConfigured()) {
            const result = await loadGithubScores();
            scores = result.scores;
        } else {
            scores = getLocalScores();
        }

        const json = JSON.stringify(scores);
        if (json !== _lastScoresJson) {
            _lastScoresJson = json;
            renderScoreboard(scores);
        }
    } catch (e) {
        console.error("Erro ao carregar placar:", e);
    }
}

function listenToScoreboard() {
    if (!document.getElementById("scoreboard")) return;

    checkAndRender();

    const interval = isGithubConfigured() ? 10000 : 2000;
    setInterval(checkAndRender, interval);
}

function showWinModal(warningMessage = null) {
    return new Promise((resolve) => {
        const existing = document.querySelector(".win-modal-overlay");
        if (existing) existing.remove();

        const overlay = document.createElement("div");
        overlay.className = "win-modal-overlay";

        const warningHtml = warningMessage
            ? `<p class="win-modal-warning">⚠️ ${warningMessage}</p>`
            : "";

        overlay.innerHTML = `
            <div class="win-modal">
                <h2>🎉 BINGO!</h2>
                <p>Quem foi o campeão dessa rodada?</p>
                ${warningHtml}
                <input type="text" id="winnerName" placeholder="Digite seu nome..."
                       maxlength="30" autocomplete="off" autofocus>
                <div class="win-modal-buttons">
                    <button class="btn-skip" id="btnSkip">Pular</button>
                    <button class="btn-confirm" id="btnConfirm">Registrar!</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const input = overlay.querySelector("#winnerName");
        const btnConfirm = overlay.querySelector("#btnConfirm");
        const btnSkip = overlay.querySelector("#btnSkip");

        setTimeout(() => input.focus(), 100);

        function confirm() {
            const name = input.value.trim();
            if (name) {
                overlay.remove();
                resolve(name);
            } else {
                input.style.borderColor = "red";
                input.placeholder = "Digite um nome!";
                setTimeout(() => {
                    input.style.borderColor = "";
                    input.placeholder = "Digite seu nome...";
                }, 1500);
            }
        }

        function skip() {
            overlay.remove();
            resolve(null);
        }

        btnConfirm.addEventListener("click", confirm);
        btnSkip.addEventListener("click", skip);
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") confirm();
            if (e.key === "Escape") skip();
        });
    });
}

listenToScoreboard();
