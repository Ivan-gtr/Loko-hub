const navItems = document.querySelectorAll(".nav-item");
const screens = document.querySelectorAll(".screen");

const notification = document.getElementById("notification");
const notificationText = document.getElementById("notificationText");
const closeNotification = document.getElementById("closeNotification");

const matchCenterButton = document.getElementById("matchCenterButton");
const backToMatches = document.getElementById("backToMatches");

const voteButton = document.getElementById("voteButton");

let notificationTimer;


/* ================= УВЕДОМЛЕНИЯ ================= */

function showNotification(message) {
    if (!notification || !notificationText) {
        return;
    }

    notificationText.textContent = message;
    notification.classList.add("active");

    clearTimeout(notificationTimer);

    notificationTimer = setTimeout(() => {
        notification.classList.remove("active");
    }, 3500);
}

if (closeNotification) {
    closeNotification.addEventListener("click", () => {
        notification.classList.remove("active");
    });
}


/* ================= ПЕРЕКЛЮЧЕНИЕ ЭКРАНОВ ================= */

function openScreen(screenId) {
    screens.forEach((screen) => {
        screen.classList.remove("active");
    });

    const targetScreen = document.getElementById(screenId);

    if (!targetScreen) {
        return;
    }

    targetScreen.classList.add("active");

    navItems.forEach((item) => {
        item.classList.toggle(
            "active",
            item.dataset.screen === screenId
        );
    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* ================= НИЖНЯЯ НАВИГАЦИЯ ================= */

navItems.forEach((item) => {
    item.addEventListener("click", () => {
        openScreen(item.dataset.screen);
    });
});


/* ================= КНОПКИ ПЕРЕХОДА ================= */

document
    .querySelectorAll("[data-open-screen]")
    .forEach((element) => {
        element.addEventListener("click", () => {
            openScreen(element.dataset.openScreen);
        });

        element.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openScreen(element.dataset.openScreen);
            }
        });
    });


/* ================= МАТЧ-ЦЕНТР ================= */

function openMatchDetails() {
    const matchDetailScreen =
        document.getElementById("matchDetailScreen");

    if (!matchDetailScreen) {
        return;
    }

    screens.forEach((screen) => {
        screen.classList.remove("active");
    });

    navItems.forEach((item) => {
        item.classList.remove("active");
    });

    matchDetailScreen.classList.add("active");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* Кнопка "Открыть матч-центр" */

if (matchCenterButton) {
    matchCenterButton.addEventListener("click", () => {
        openMatchDetails();
    });
}


/* Карточка ближайшего матча */

document
    .querySelectorAll(".match-open-trigger")
    .forEach((element) => {
        element.addEventListener("click", () => {
            openMatchDetails();
        });

        element.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openMatchDetails();
            }
        });
    });


/* Кнопка "Назад к матчам" */

if (backToMatches) {
    backToMatches.addEventListener("click", () => {
        openScreen("matchesScreen");
    });
}


/* ================= НОВОСТИ ================= */

document
    .querySelectorAll(".news-read-button")
    .forEach((button) => {
        button.addEventListener("click", () => {
            showNotification(
                "Полная новость скоро будет доступна 📰"
            );
        });
    });


/* ================= ГОЛОСОВАНИЕ ================= */

if (voteButton) {
    voteButton.addEventListener("click", () => {
        showNotification(
            "Голосования появятся после запуска фанатского раздела 🔥"
        );
    });
}


/* ================= ИГРОКИ ================= */

const playerCards = document.querySelectorAll(".player-card");
const playerDetailScreen =
    document.getElementById("playerDetailScreen");

const backToSquad =
    document.getElementById("backToSquad");

const detailPlayerImage =
    document.getElementById("detailPlayerImage");

const detailPlayerName =
    document.getElementById("detailPlayerName");

const detailPlayerPosition =
    document.getElementById("detailPlayerPosition");

const detailPlayerNumber =
    document.getElementById("detailPlayerNumber");

const detailPlayerAge =
    document.getElementById("detailPlayerAge");

const detailPlayerHeight =
    document.getElementById("detailPlayerHeight");

const detailPlayerCountry =
    document.getElementById("detailPlayerCountry");

const detailPlayerAbout =
    document.getElementById("detailPlayerAbout");


const playersData = {
    barinov: {
        name: "Дмитрий Баринов",
        surname: "Баринов",
        position: "Полузащитник",
        number: "6",
        age: "29 лет",
        height: "179 см",
        country: "Россия",
        image: "https://placehold.co/500x600/151515/FFFFFF?text=Баринов",
        about:
            "Центральный полузащитник. Известен работоспособностью, характером и сильной игрой в центре поля."
    },

    miranchuk: {
        name: "Алексей Миранчук",
        surname: "Миранчук",
        position: "Полузащитник",
        number: "10",
        age: "30 лет",
        height: "177 см",
        country: "Россия",
        image: "https://placehold.co/500x600/151515/FFFFFF?text=Миранчук",
        about:
            "Техничный атакующий полузащитник с хорошим пасом и видением поля."
    },

    suleymanov: {
        name: "Сулейманов",
        surname: "Сулейманов",
        position: "Нападающий",
        number: "9",
        age: "—",
        height: "—",
        country: "Россия",
        image: "https://placehold.co/500x600/151515/FFFFFF?text=Сулейманов",
        about:
            "Нападающий команды. Подробная статистика будет добавлена позже."
    },

    morozov: {
        name: "Морозов",
        surname: "Морозов",
        position: "Защитник",
        number: "3",
        age: "—",
        height: "—",
        country: "Россия",
        image: "https://placehold.co/500x600/151515/FFFFFF?text=Морозов",
        about:
            "Защитник команды. Здесь позже появятся подробная биография и статистика."
    },

    lantratov: {
        name: "Лантратов",
        surname: "Лантратов",
        position: "Вратарь",
        number: "1",
        age: "—",
        height: "—",
        country: "Россия",
        image: "https://placehold.co/500x600/151515/FFFFFF?text=Лантратов",
        about:
            "Вратарь команды. Здесь будет информация о матчах, сейвах и сухих играх."
    },

    silyanov: {
        name: "Сильянов",
        surname: "Сильянов",
        position: "Защитник",
        number: "45",
        age: "—",
        height: "—",
        country: "Россия",
        image: "https://placehold.co/500x600/151515/FFFFFF?text=Сильянов",
        about:
            "Защитник команды. Подробная информация и статистика будут добавлены позже."
    }
};


function openPlayerDetails(playerId) {
    const player = playersData[playerId];

    if (!player || !playerDetailScreen) {
        return;
    }

    if (detailPlayerImage) {
        detailPlayerImage.src = player.image;
        detailPlayerImage.alt = player.name;
    }

    if (detailPlayerName) {
        detailPlayerName.textContent = player.name;
    }

    if (detailPlayerPosition) {
        detailPlayerPosition.textContent = player.position;
    }

    if (detailPlayerNumber) {
        detailPlayerNumber.textContent =
            `№ ${player.number}`;
    }

    if (detailPlayerAge) {
        detailPlayerAge.textContent = player.age;
    }

    if (detailPlayerHeight) {
        detailPlayerHeight.textContent = player.height;
    }

    if (detailPlayerCountry) {
        detailPlayerCountry.textContent = player.country;
    }

    if (detailPlayerAbout) {
        detailPlayerAbout.textContent = player.about;
    }

    openScreen("playerDetailScreen");
}


playerCards.forEach((card) => {
    card.addEventListener("click", () => {
        openPlayerDetails(card.dataset.player);
    });

    card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPlayerDetails(card.dataset.player);
        }
    });
});


if (backToSquad) {
    backToSquad.addEventListener("click", () => {
        openScreen("squadScreen");
    });
}


/* ================= ФУТБОЛЬНОЕ ЯДРО ================= */

const FOOTBALL_ENDPOINT = "/.netlify/functions/football?timezone=Europe%2FMoscow&limit=100";
const LIVE_MATCH_STATES = new Set([
    "First half",
    "Second half",
    "Half time",
    "Extra time",
    "Break time",
    "Penalties",
    "In progress"
]);

let footballMatches = [];
let selectedMatch = null;

function footballElement(id) {
    return document.getElementById(id);
}

function setText(id, value) {
    const element = footballElement(id);

    if (element) {
        element.textContent = value;
    }
}

function setTeamLogo(id, team, fallback) {
    const element = footballElement(id);

    if (!element) {
        return;
    }

    if (team && team.logo) {
        element.textContent = "";
        element.style.backgroundImage = `url(${JSON.stringify(team.logo)})`;
        element.classList.add("team-logo-image");
    } else {
        element.textContent = fallback;
        element.style.backgroundImage = "";
        element.classList.remove("team-logo-image");
    }
}

function formatMatchDate(dateString, options) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "Дата уточняется";
    }

    return new Intl.DateTimeFormat("ru-RU", {
        timeZone: "Europe/Moscow",
        ...options
    }).format(date);
}

function getMatchScore(match) {
    return (match.state && match.state.score && match.state.score.current) || "— : —";
}

function getMatchStatus(match) {
    return (match.state && match.state.description) || "Статус уточняется";
}

function isLiveMatch(match) {
    return LIVE_MATCH_STATES.has(getMatchStatus(match));
}

function updateMatchPreview(prefix, match) {
    const ids = prefix === "home"
        ? { homeLogo: "homeTeamLogo", awayLogo: "homeOpponentLogo", homeName: "homeTeamName", awayName: "homeOpponentName" }
        : { homeLogo: "nextHomeLogo", awayLogo: "nextAwayLogo", homeName: "nextHomeName", awayName: "nextAwayName" };

    setTeamLogo(ids.homeLogo, match.homeTeam, "Л");
    setTeamLogo(ids.awayLogo, match.awayTeam, "?");
    setText(ids.homeName, match.homeTeam && match.homeTeam.name || "Локомотив");
    setText(ids.awayName, match.awayTeam && match.awayTeam.name || "Соперник");
    setText(prefix === "home" ? "homeTeamMeta" : "nextHomeMeta", "Хозяева");
    setText(prefix === "home" ? "homeOpponentMeta" : "nextAwayMeta", "Гости");
    setText(`${prefix}MatchScore`, getMatchScore(match));
    setText(`${prefix}MatchDate`, formatMatchDate(match.date, {
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit"
    }));
}

function renderHomeMatch(match) {
    if (!match) {
        setText("homeMatchStatus", "НЕТ ДАННЫХ");
        setText("homeMatchDate", "Ближайший матч пока не найден");
        return;
    }

    updateMatchPreview("home", match);
    setText("homeMatchStatus", getMatchStatus(match).toUpperCase());
}

function renderNextMatch(match) {
    const button = footballElement("matchCenterButton");
    const trigger = document.querySelector(".match-open-trigger");

    if (!match) {
        setText("nextMatchTime", "НЕТ ИГР");
        setText("nextMatchDate", "Ближайшая игра пока не найдена");
        setText("nextMatchScore", "— : —");
        if (button) button.disabled = true;
        if (trigger) trigger.removeAttribute("data-match-id");
        return;
    }

    updateMatchPreview("next", match);
    setText("nextMatchTime", formatMatchDate(match.date, { hour: "2-digit", minute: "2-digit" }));
    if (button) button.disabled = false;
    if (trigger) trigger.dataset.matchId = match.id;
}

function renderLiveBanner(liveMatches) {
    const message = footballElement("liveBannerMessage");

    if (!message) {
        return;
    }

    if (!liveMatches.length) {
        message.textContent = "Сейчас матчей Локомотива в прямом эфире нет.";
        return;
    }

    const match = liveMatches[0];
    const clock = match.state && match.state.clock ? `, ${match.state.clock}'` : "";
    message.textContent = `${match.homeTeam.name} ${getMatchScore(match)} ${match.awayTeam.name}${clock}`;
}

function matchRow(match) {
    const button = document.createElement("button");
    const teams = document.createElement("strong");
    const meta = document.createElement("span");
    const score = document.createElement("b");

    button.type = "button";
    button.className = "match-result-row";
    teams.textContent = `${match.homeTeam.name} — ${match.awayTeam.name}`;
    score.textContent = getMatchScore(match);
    meta.textContent = `${formatMatchDate(match.date, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} · ${match.league && match.league.name || "Турнир не указан"} · ${getMatchStatus(match)}`;
    button.append(teams, score, meta);
    button.addEventListener("click", () => openMatchDetails(match));

    return button;
}

function renderRecentMatches(matches) {
    const container = footballElement("recentMatches");

    if (!container) {
        return;
    }

    container.replaceChildren();

    if (!matches.length) {
        const title = document.createElement("h3");
        const text = document.createElement("p");
        title.textContent = "Завершённых матчей пока нет";
        text.textContent = "Highlightly не вернул последние результаты Локомотива.";
        container.append(title, text);
        return;
    }

    const list = document.createElement("div");
    list.className = "match-results-list";
    matches.slice(0, 5).forEach((match) => list.append(matchRow(match)));
    container.classList.remove("empty-state");
    container.append(list);
}

function renderMatchDetails(match) {
    if (!match) {
        return;
    }

    selectedMatch = match;
    setText("matchDetailTitle", `${match.homeTeam.name} — ${match.awayTeam.name}`);
    setText("detailMatchStatus", getMatchStatus(match).toUpperCase());
    setText("detailMatchDate", formatMatchDate(match.date, { day: "numeric", month: "long", year: "numeric" }));
    setText("detailMatchTime", formatMatchDate(match.date, { hour: "2-digit", minute: "2-digit" }));
    setTeamLogo("detailHomeLogo", match.homeTeam, "Л");
    setTeamLogo("detailAwayLogo", match.awayTeam, "?");
    setText("detailHomeName", match.homeTeam.name);
    setText("detailAwayName", match.awayTeam.name);
    setText("detailHomeMeta", "Хозяева");
    setText("detailAwayMeta", "Гости");
    setText("detailMatchScore", getMatchScore(match));
    setText("detailScoreStatus", getMatchStatus(match));
    setText("detailVenue", match.venue && match.venue.name || "Не указано в расписании");
    setText("detailLeague", match.league && match.league.name || "Турнир не указан");
    setText("detailStatusText", getMatchStatus(match));
}

function renderFootballError(message) {
    setText("homeMatchStatus", "ОШИБКА");
    setText("homeMatchDate", "Не удалось загрузить матч");
    setText("liveBannerMessage", "Данные матчей временно недоступны.");
    setText("nextMatchTime", "ОШИБКА");
    setText("nextMatchDate", "Повторите попытку позже");
    const recent = footballElement("recentMatches");

    if (recent) {
        recent.classList.add("empty-state");
        recent.replaceChildren();
        const title = document.createElement("h3");
        const text = document.createElement("p");
        title.textContent = "Не удалось загрузить результаты";
        text.textContent = message;
        recent.append(title, text);
    }
}

async function loadFootballMatches() {
    try {
        const response = await fetch(FOOTBALL_ENDPOINT, { headers: { Accept: "application/json" } });
        const payload = await response.json();

        if (!response.ok || !payload.success) {
            throw new Error(payload.error || "Сервис матчей вернул ошибку");
        }

        const matches = payload.matches || {};
        footballMatches = matches.all || [];
        const live = matches.live || footballMatches.filter(isLiveMatch);
        const upcoming = matches.upcoming || [];
        const recent = matches.recent || [];
        const primaryMatch = live[0] || upcoming[0] || recent[0];

        renderHomeMatch(primaryMatch);
        renderNextMatch(upcoming[0] || live[0]);
        renderLiveBanner(live);
        renderRecentMatches(recent);
        renderMatchDetails(primaryMatch);
    } catch (error) {
        renderFootballError(error && error.message ? error.message : "Проверьте подключение к сервису матчей.");
    }
}

const originalOpenMatchDetails = openMatchDetails;
openMatchDetails = function (match) {
    const requestedMatch = match || footballMatches.find(
        (item) => String(item.id) === String(document.querySelector(".match-open-trigger")?.dataset.matchId)
    ) || selectedMatch;

    renderMatchDetails(requestedMatch);
    originalOpenMatchDetails();
};

loadFootballMatches();
