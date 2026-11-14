const navItems = document.querySelectorAll(".nav-item");
const screens = document.querySelectorAll(".screen");

const notification = document.getElementById("notification");
const notificationText = document.getElementById("notificationText");
const closeNotification = document.getElementById("closeNotification");

const matchCenterButton = document.getElementById("matchCenterButton");
const backToMatches = document.getElementById("backToMatches");

let notificationTimer;


/* ================= ЛОГОТИП: FALLBACK ================= */

const brandLogo = document.getElementById("brandLogo");

function applyLogoFallback() {
    if (!brandLogo) {
        return;
    }
    brandLogo.classList.add("logo-image-fallback");
    brandLogo.removeAttribute("src");
}

if (brandLogo) {
    brandLogo.addEventListener("error", applyLogoFallback);
    // Случай, когда ошибка загрузки случилась до навешивания обработчика
    if (brandLogo.complete && brandLogo.naturalWidth === 0) {
        applyLogoFallback();
    }
}


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
        screen.hidden = true;
        screen.style.display = "none";
        screen.setAttribute("aria-hidden", "true");
    });

    const targetScreen = document.getElementById(screenId);

    if (!targetScreen) {
        return;
    }

    targetScreen.classList.add("active");
    targetScreen.hidden = false;
    targetScreen.style.display = "block";
    targetScreen.setAttribute("aria-hidden", "false");

    navItems.forEach((item) => {
        const isActive = item.dataset.screen === screenId;
        item.classList.toggle("active", isActive);
        if (isActive) {
            item.setAttribute("aria-current", "page");
        } else {
            item.removeAttribute("aria-current");
        }
    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    if (window.location.hash !== `#${screenId}`) {
        window.history.replaceState(null, "", `#${screenId}`);
    }
}


/* ================= НИЖНЯЯ НАВИГАЦИЯ ================= */

navItems.forEach((item) => {
    item.addEventListener("click", () => {
        openScreen(item.dataset.screen);
    });
});

const hashScreenId = window.location.hash.slice(1);
if (hashScreenId && document.getElementById(hashScreenId)) {
    openScreen(hashScreenId);
} else {
    openScreen("homeScreen");
}

window.addEventListener("hashchange", () => {
    const nextScreenId = window.location.hash.slice(1);

    if (nextScreenId && document.getElementById(nextScreenId)) {
        openScreen(nextScreenId);
    }
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


/* ================= LOKO MEDIA: РЕАЛЬНЫЕ МАТЕРИАЛЫ ================= */

const mediaFilters = document.querySelectorAll("[data-media-filter]");
const mediaListContainer = document.getElementById("mediaList");
const mediaStatusNote = document.getElementById("mediaStatusNote");
const mediaEmptyState = document.getElementById("mediaEmptyState");
let mediaItems = [];
let mediaFilter = "all";

const MEDIA_CATEGORY_LABELS = {
    news: "НОВОСТИ",
    video: "ВИДЕО",
    podcast: "ПОДКАСТЫ",
    stream: "СТРИМЫ",
    project: "ПРОЕКТЫ"
};

const MEDIA_CATEGORY_ICONS = {
    news: "📰",
    video: "🎬",
    podcast: "🎙",
    stream: "📡",
    project: "✦"
};

function formatMediaDate(dateString) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return new Intl.DateTimeFormat("ru-RU", {
        timeZone: "Europe/Moscow",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit"
    }).format(date);
}

function createMediaCard(item) {
    const card = document.createElement("article");
    card.className = "news-card";
    card.dataset.mediaCategory = item.category;

    const image = document.createElement("div");
    image.className = "news-card-image";
    image.textContent = MEDIA_CATEGORY_ICONS[item.category] || "📰";

    if (item.thumbnailUrl) {
        image.style.backgroundImage = `url(${JSON.stringify(item.thumbnailUrl)})`;
        image.textContent = "";
    }

    const content = document.createElement("div");
    content.className = "news-card-content";

    const category = document.createElement("span");
    category.className = "news-category";
    category.textContent = MEDIA_CATEGORY_LABELS[item.category] || "МАТЕРИАЛ";

    const date = document.createElement("span");
    date.className = "news-date";
    date.textContent = item.sourceName
        ? `${item.sourceName} · ${formatMediaDate(item.publishedAt)}`
        : formatMediaDate(item.publishedAt);

    const title = document.createElement("h2");
    title.textContent = item.title;

    content.append(category, date, title);

    if (item.description) {
        const description = document.createElement("p");
        description.textContent = item.description;
        content.appendChild(description);
    }

    const link = document.createElement("a");
    link.className = "text-button news-read-button";
    link.href = item.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Открыть оригинал ↗";
    content.appendChild(link);

    card.append(image, content);
    return card;
}

function renderMediaList() {
    if (!mediaListContainer || !mediaEmptyState) {
        return;
    }

    mediaListContainer.replaceChildren();

    const visible = mediaItems.filter(
        (item) => mediaFilter === "all" || item.category === mediaFilter
    );

    visible.forEach((item) => {
        mediaListContainer.appendChild(createMediaCard(item));
    });

    mediaEmptyState.hidden = visible.length > 0;
}

async function loadMedia() {
    if (!mediaListContainer) {
        return;
    }

    if (mediaStatusNote) {
        mediaStatusNote.textContent = "Загружаем материалы LOKO MEDIA…";
    }

    try {
        const response = await fetch("/.netlify/functions/content?limit=60", {
            headers: { Accept: "application/json" }
        });
        const payload = await response.json();

        if (!response.ok || !payload.success) {
            throw new Error(payload.error || "Сервис медиа вернул ошибку");
        }

        mediaItems = Array.isArray(payload.items) ? payload.items : [];

        if (mediaStatusNote) {
            mediaStatusNote.textContent = mediaItems.length
                ? "Материалы от фанатских сообществ. Открывайте оригиналы на площадках авторов."
                : "";
            mediaStatusNote.hidden = mediaItems.length > 0;
        }

        renderMediaList();
    } catch (error) {
        mediaItems = [];

        if (mediaStatusNote) {
            mediaStatusNote.hidden = false;
            mediaStatusNote.textContent =
                "Не удалось загрузить материалы. Сервис LOKO MEDIA временно недоступен.";
        }

        renderMediaList();
    }
}

function applyMediaFilter(filter) {
    mediaFilter = filter;
    renderMediaList();
}

mediaFilters.forEach((button) => {
    button.addEventListener("click", () => {
        applyMediaFilter(button.dataset.mediaFilter || "all");
    });
});

applyMediaFilter("all");
loadMedia();


/* ================= МАТЧ-ЦЕНТР ================= */

function openMatchDetails() {
    const matchDetailScreen =
        document.getElementById("matchDetailScreen");

    if (!matchDetailScreen) {
        return;
    }

    screens.forEach((screen) => {
        screen.classList.remove("active");
        screen.hidden = true;
        screen.style.display = "none";
    });

    navItems.forEach((item) => {
        item.classList.remove("active");
    });

    matchDetailScreen.classList.add("active");
    matchDetailScreen.hidden = false;
    matchDetailScreen.style.display = "block";

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


/* ================= ГОЛОСОВАНИЯ ================= */

const POLLS_ENDPOINT = "/.netlify/functions/polls";
const VOTE_ENDPOINT = "/.netlify/functions/vote";
const VOTED_STORAGE_KEY = "loko-hub:voted-polls";

let pollsData = [];

function getVotedPollIds() {
    try {
        const raw = window.localStorage.getItem(VOTED_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function markPollVoted(pollId) {
    const voted = getVotedPollIds();
    if (!voted.includes(pollId)) {
        voted.push(pollId);
        try {
            window.localStorage.setItem(VOTED_STORAGE_KEY, JSON.stringify(voted));
        } catch {
            // localStorage может быть недоступен — не критично
        }
    }
}

function formatPollEndDate(dateString) {
    if (!dateString) {
        return "";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return ` · до ${new Intl.DateTimeFormat("ru-RU", {
        timeZone: "Europe/Moscow",
        day: "numeric",
        month: "long"
    }).format(date)}`;
}

function createPollElement(poll, { compact = false } = {}) {
    const wrapper = document.createElement("div");
    wrapper.className = "poll";

    const question = document.createElement("h2");
    question.textContent = poll.question;
    wrapper.appendChild(question);

    const voted = getVotedPollIds().includes(poll.id);
    const total = poll.totalVotes || 0;

    if (!compact) {
        const meta = document.createElement("p");
        meta.className = "muted";
        meta.textContent = `${total} голосов${formatPollEndDate(poll.endsAt)}`;
        wrapper.appendChild(meta);
    }

    const optionsList = document.createElement("div");
    optionsList.className = "poll-options";

    poll.options.forEach((option) => {
        const percent = total ? Math.round((option.votes / total) * 100) : 0;

        const optionButton = document.createElement("button");
        optionButton.type = "button";
        optionButton.className = "poll-option";

        const label = document.createElement("span");
        label.className = "poll-option-label";
        label.textContent = option.text;

        const value = document.createElement("span");
        value.className = "poll-option-value";
        value.textContent = voted || total === 0 ? `${percent}%` : "";

        const bar = document.createElement("span");
        bar.className = "poll-option-bar";
        bar.style.width = voted || total === 0 ? `${percent}%` : "0%";

        optionButton.append(bar, label, value);

        if (voted || total === 0) {
            optionButton.disabled = true;
            optionButton.classList.add("poll-option-result");
        } else {
            optionButton.addEventListener("click", () => submitVote(poll.id, option.id));
        }

        optionsList.appendChild(optionButton);
    });

    wrapper.appendChild(optionsList);

    if (!voted && total > 0 && compact) {
        const hint = document.createElement("p");
        hint.className = "muted";
        hint.textContent = "Проголосуйте, чтобы увидеть результаты.";
        wrapper.appendChild(hint);
    }

    return wrapper;
}

async function submitVote(pollId, optionId) {
    try {
        const response = await fetch(VOTE_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ poll_id: pollId, option_id: optionId })
        });
        const payload = await response.json();

        if (!response.ok || !payload.success) {
            if (response.status === 409) {
                markPollVoted(pollId);
                renderPolls();
                showNotification("Вы уже голосовали в этом опросе");
                return;
            }
            throw new Error(payload.error || "Не удалось принять голос");
        }

        markPollVoted(pollId);

        // Обновляем локальные счётчики
        const poll = pollsData.find((item) => item.id === pollId);
        if (poll && payload.counts) {
            poll.options.forEach((option) => {
                option.votes = payload.counts[option.id] || option.votes;
            });
            poll.totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
        }

        renderPolls();
        showNotification("Голос учтён. Спасибо! 🔥");
    } catch (error) {
        showNotification(error.message || "Не удалось отправить голос");
    }
}

function renderPolls() {
    const fansContainer = document.getElementById("pollContainer");
    const homeContainer = document.getElementById("homePollContainer");
    const fansStatus = document.getElementById("pollCardStatus");
    const homeStatus = document.getElementById("homePollStatus");

    if (fansContainer) {
        fansContainer.replaceChildren();

        if (!pollsData.length) {
            const empty = document.createElement("p");
            empty.className = "muted";
            empty.textContent = "Сейчас нет активных опросов. Новое голосование скоро появится.";
            fansContainer.appendChild(empty);
        } else {
            pollsData.forEach((poll) => {
                fansContainer.appendChild(createPollElement(poll));
            });
        }
    }

    if (homeContainer) {
        homeContainer.replaceChildren();

        if (!pollsData.length) {
            const empty = document.createElement("h2");
            empty.textContent = "Опрос скоро появится";
            homeContainer.appendChild(empty);
        } else {
            homeContainer.appendChild(createPollElement(pollsData[0], { compact: true }));
        }
    }

    if (fansStatus) {
        fansStatus.textContent = pollsData.length ? "АКТИВЕН" : "НЕТ ОПРОСОВ";
    }
    if (homeStatus) {
        homeStatus.textContent = pollsData.length ? "АКТИВЕН" : "СКОРО";
    }
}

async function loadPolls() {
    try {
        const response = await fetch(POLLS_ENDPOINT, { headers: { Accept: "application/json" } });
        const payload = await response.json();

        if (!response.ok || !payload.success) {
            throw new Error(payload.error || "Сервис опросов вернул ошибку");
        }

        pollsData = Array.isArray(payload.polls) ? payload.polls : [];
    } catch (error) {
        pollsData = [];
    }

    renderPolls();
}

loadPolls();


/* ================= ИГРОКИ: ДЕТАЛЬНАЯ ИНФОРМАЦИЯ ================= */

const POSITION_LABELS = {
    goalkeeper: "Вратарь",
    defender: "Защитник",
    midfielder: "Полузащитник",
    forward: "Нападающий"
};

function formatBirthDate(dateString) {
    if (!dateString) {
        return "—";
    }

    const date = new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(date);
}

function setPlayerDetailText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

function openPlayerDetails(player) {
    const playerDetailScreen = document.getElementById("playerDetailScreen");

    if (!player || !playerDetailScreen) {
        return;
    }

    const image = document.getElementById("detailPlayerImage");

    if (image) {
        if (player.photoUrl) {
            image.src = player.photoUrl;
            image.alt = player.name || "Игрок Локомотива";
            image.hidden = false;
        } else {
            image.hidden = true;
            image.removeAttribute("src");
        }
    }

    const positionLabel = POSITION_LABELS[player.position] || "Игрок";

    setPlayerDetailText("detailPlayerPosition", positionLabel.toUpperCase());
    setPlayerDetailText("detailPlayerName", player.name || "Игрок");

    const number = document.getElementById("detailPlayerNumber");

    if (number) {
        if (player.number) {
            number.textContent = `№ ${player.number}`;
            number.hidden = false;
        } else {
            number.hidden = true;
        }
    }

    setPlayerDetailText("detailPlayerAge", formatBirthDate(player.birthDate));
    setPlayerDetailText("detailPlayerPositionDetail", player.positionDetail || positionLabel);
    setPlayerDetailText("detailPlayerCountry", player.nationality || "—");
    setPlayerDetailText(
        "detailPlayerAbout",
        "Игрок основного состава сезона 2026/2027. Биография и статистика появятся после подтверждения данных источниками."
    );

    openScreen("playerDetailScreen");
}

const backToSquad = document.getElementById("backToSquad");

if (backToSquad) {
    backToSquad.addEventListener("click", () => {
        openScreen("squadScreen");
    });
}


/* ================= СОСТАВ ================= */

const SQUAD_ENDPOINT = "/.netlify/functions/squad";
const SQUAD_DATA_URL = "data/squad-2026-2027.json";
const squadState = {
    groups: [],
    filter: "all"
};

async function fetchSquadFromApi() {
    const response = await fetch(SQUAD_ENDPOINT, { headers: { Accept: "application/json" } });
    const payload = await response.json();

    if (!response.ok || !payload.success || !Array.isArray(payload.groups)) {
        throw new Error(payload.error || "Сервис состава вернул ошибку");
    }

    return payload.groups;
}

async function fetchSquadFromFile() {
    const response = await fetch(SQUAD_DATA_URL, {
        headers: { "Accept": "application/json" },
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.groups)) {
        throw new Error("Некорректная структура состава");
    }

    return data.groups;
}

function squadElement(id) {
    return document.getElementById(id);
}

function setSquadStatus(message, type = "info", withRetry = false) {
    const status = squadElement("squadStatus");

    if (!status) {
        return;
    }

    status.textContent = message;
    status.className = `squad-status ${type}`;

    if (withRetry) {
        const retryButton = document.createElement("button");
        retryButton.type = "button";
        retryButton.className = "secondary-button squad-retry";
        retryButton.textContent = "Повторить загрузку";
        retryButton.addEventListener("click", loadSquad);
        status.appendChild(retryButton);
    }
}

function isConfirmedSquadNumber(player) {
    return Boolean(
        player.number &&
        !(player.notes || "").includes("требует дополнительного подтверждения")
    );
}

function createSquadPlayerCard(player, groupLabel) {
    const card = document.createElement("article");
    card.className = "squad-player-card";

    const visual = document.createElement("div");
    visual.className = "squad-player-visual";

    if (player.photoUrl) {
        const image = document.createElement("img");
        image.src = player.photoUrl;
        image.alt = player.name || "Игрок Локомотива";
        image.loading = "lazy";
        visual.appendChild(image);
    } else {
        const placeholder = document.createElement("span");
        placeholder.className = "squad-player-placeholder";
        placeholder.textContent = "ЛОКО";
        visual.appendChild(placeholder);
    }

    const body = document.createElement("div");
    body.className = "squad-player-body";

    const position = document.createElement("span");
    position.className = "squad-player-position";
    position.textContent = groupLabel;

    const name = document.createElement("h3");
    name.textContent = player.name || "Имя не указано";

    body.append(position, name);

    if (isConfirmedSquadNumber(player)) {
        const number = document.createElement("span");
        number.className = "squad-player-number";
        number.textContent = `№ ${player.number}`;
        card.append(visual, body, number);
    } else {
        card.append(visual, body);
    }

    card.classList.add("squad-player-card-clickable");
    card.setAttribute("role", "button");
    card.tabIndex = 0;
    card.setAttribute("aria-label", `Подробнее об игроке: ${player.name || "игрок"}`);
    card.addEventListener("click", () => openPlayerDetails(player));
    card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPlayerDetails(player);
        }
    });

    return card;
}

function renderSquad() {
    const groupsRoot = squadElement("squadGroups");
    const count = squadElement("squadPlayerCount");

    if (!groupsRoot) {
        return;
    }

    groupsRoot.textContent = "";

    const allPlayers = squadState.groups.flatMap((group) => group.players || []);

    if (count) {
        count.textContent = allPlayers.length;
    }

    const visibleGroups = squadState.groups
        .filter((group) => squadState.filter === "all" || group.position === squadState.filter)
        .map((group) => ({
            ...group,
            players: (group.players || []).filter((player) =>
                squadState.filter === "all" || group.position === squadState.filter
            )
        }))
        .filter((group) => group.players.length);

    if (!visibleGroups.length) {
        setSquadStatus("В выбранной категории пока нет игроков.", "empty");
        return;
    }

    setSquadStatus("Состав загружен.", "success");

    visibleGroups.forEach((group) => {
        const section = document.createElement("section");
        section.className = "squad-group";

        const heading = document.createElement("h2");
        heading.textContent = group.label;

        const grid = document.createElement("div");
        grid.className = "squad-player-grid";

        group.players.forEach((player) => {
            grid.appendChild(createSquadPlayerCard(player, group.label));
        });

        section.append(heading, grid);
        groupsRoot.appendChild(section);
    });
}

async function loadSquad() {
    setSquadStatus("Загрузка состава…", "loading");

    try {
        let groups;

        try {
            groups = await fetchSquadFromApi();
        } catch (apiError) {
            // Fallback: локальный проверенный JSON, пока Supabase недоступен
            groups = await fetchSquadFromFile();
        }

        squadState.groups = groups;

        const loadedPlayers = squadState.groups.reduce(
            (total, group) => total + (Array.isArray(group.players) ? group.players.length : 0),
            0
        );

        if (!loadedPlayers) {
            throw new Error("Список игроков пуст");
        }

        renderSquad();
    } catch (error) {
        squadState.groups = [];
        const groupsRoot = squadElement("squadGroups");

        if (groupsRoot) {
            groupsRoot.textContent = "";
        }

        const count = squadElement("squadPlayerCount");
        if (count) {
            count.textContent = "—";
        }

        setSquadStatus(
            "Не удалось загрузить состав. Попробуйте обновить страницу.",
            "error",
            true
        );
    }
}

document.querySelectorAll("[data-squad-filter]").forEach((button) => {
    button.addEventListener("click", () => {
        squadState.filter = button.dataset.squadFilter;

        document.querySelectorAll("[data-squad-filter]").forEach((filterButton) => {
            filterButton.classList.toggle(
                "active",
                filterButton === button
            );
        });

        renderSquad();
    });
});

loadSquad();


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

function renderLastMatch(match) {
    const button = footballElement("homeLastMatchButton");

    if (!match) {
        setText("homeLastMatchStatus", "НЕТ ДАННЫХ");
        setText("homeLastMatchMeta", "Последний завершённый матч пока не найден.");
        if (button) {
            button.disabled = true;
            button.onclick = null;
        }
        return;
    }

    setTeamLogo("homeLastHomeLogo", match.homeTeam, "Л");
    setTeamLogo("homeLastAwayLogo", match.awayTeam, "?");
    setText("homeLastHomeName", match.homeTeam && match.homeTeam.name || "Локомотив");
    setText("homeLastAwayName", match.awayTeam && match.awayTeam.name || "Соперник");
    setText("homeLastMatchScore", getMatchScore(match));
    setText("homeLastMatchStatus", getMatchStatus(match).toUpperCase());
    setText(
        "homeLastMatchMeta",
        `${formatMatchDate(match.date, { day: "numeric", month: "long", year: "numeric" })} · ${match.league && match.league.name || "Турнир не указан"}`
    );

    if (button) {
        button.disabled = false;
        button.onclick = () => openMatchDetails(match);
    }
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
    renderLastMatch(null);
    setText("homeMatchStatus", "ОШИБКА");
    setText("homeMatchDate", "Не удалось загрузить матч");
    setText("liveBannerMessage", "Данные матчей временно недоступны.");
    setText("nextMatchTime", "ОШИБКА");
    setText("nextMatchDate", "Повторите попытку позже");
    const freshness = footballElement("matchesFreshness");
    if (freshness) {
        freshness.hidden = true;
    }
    const recent = footballElement("recentMatches");

    if (recent) {
        recent.classList.add("empty-state");
        recent.replaceChildren();
        const title = document.createElement("h3");
        const text = document.createElement("p");
        title.textContent = "Не удалось загрузить результаты";
        text.textContent = "Источник матчей временно недоступен. Проверьте запуск через Netlify Dev или повторите позже.";
        recent.append(title, text);
    }
}

async function loadFootballMatches() {
    try {
        const response = await fetch(FOOTBALL_ENDPOINT, { headers: { Accept: "application/json" } });
        const responseText = await response.text();
        let payload;

        try {
            payload = JSON.parse(responseText);
        } catch (parseError) {
            throw new Error("Сервис матчей вернул некорректный ответ");
        }

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
        renderLastMatch(recent[0]);
        renderMatchDetails(primaryMatch);
        renderFreshness(payload);
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
