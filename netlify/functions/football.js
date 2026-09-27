const API_BASE_URL = "https://soccer.highlightly.net";
const DEFAULT_TIMEZONE = "Europe/Moscow";
const REQUEST_TIMEOUT_MS = 10000;
const TEAM_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const LIVE_STATES = new Set(["First half", "Second half", "Half time", "Extra time", "Break time", "Penalties", "In progress"]);
const FINISHED_STATES = new Set(["Finished", "Finished after penalties", "Finished after extra time", "Awarded"]);
let teamCache = null;

function jsonResponse(statusCode, body, cacheControl = "no-store") {
    return { statusCode, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": cacheControl }, body: JSON.stringify(body) };
}

function normaliseTeamName(name) {
    return String(name || "").toLocaleLowerCase("en-US").replace(/[^a-z0-9]/g, "");
}

function isLokomotivMoscow(team) {
    const name = normaliseTeamName(team && team.name);
    return (
        name === "lokomotivmoscow" ||
        name === "fclokomotivmoscow" ||
        name === "lokomotivmoskva" ||
        name === "fclokomotivmoskva"
    );
}

function getTimezone(value) {
    return typeof value === "string" && /^[A-Za-z_]+\/[A-Za-z_]+$/.test(value) ? value : DEFAULT_TIMEZONE;
}

function getLimit(value) {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) ? Math.min(Math.max(parsed, 1), 100) : 100;
}

function getDate(value) {
    return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

async function requestHighlightly(path, apiKey) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(`${API_BASE_URL}${path}`, {
            headers: { "x-rapidapi-key": apiKey, "Accept": "application/json" },
            signal: controller.signal
        });
        const text = await response.text();
        let data;

        try { data = text ? JSON.parse(text) : null; } catch { data = null; }

        if (!response.ok) {
            throw new Error((data && (data.message || data.error)) || `Highlightly returned HTTP ${response.status}`);
        }

        return data;
    } finally {
        clearTimeout(timeout);
    }
}

async function findLokomotiv(apiKey) {
    if (teamCache && Date.now() - teamCache.cachedAt < TEAM_CACHE_TTL_MS) {
        return teamCache.team;
    }

    const result = await requestHighlightly("/teams?name=Lokomotiv&type=club&limit=100&offset=0", apiKey);
    const teams = Array.isArray(result) ? result : result && result.data;
    const team = Array.isArray(teams) && teams.find(isLokomotivMoscow);

    if (!team || !Number.isFinite(Number(team.id))) {
        throw new Error("Lokomotiv Moscow was not found in Highlightly team data");
    }

    teamCache = { team, cachedAt: Date.now() };
    return team;
}

function getMatches(payload) {
    return Array.isArray(payload) ? payload : (payload && payload.data) || [];
}

function uniqueMatches(matches) {
    return Array.from(new Map(matches.filter(Boolean).map((match) => [match.id, match])).values());
}

function matchTime(match) {
    const time = Date.parse(match && match.date);
    return Number.isNaN(time) ? 0 : time;
}

function buildMatchPath(teamKey, teamId, timezone, limit, date) {
    const params = new URLSearchParams({ [teamKey]: String(teamId), timezone, limit: String(limit) });
    if (date) params.set("date", date);
    return `/matches?${params.toString()}`;
}

exports.handler = async function (event) {
    const apiKey = process.env.HIGHLIGHTLY_API_KEY;

    if (!apiKey) {
        return jsonResponse(500, { success: false, error: "HIGHLIGHTLY_API_KEY is not configured" });
    }

    const query = event.queryStringParameters || {};
    const timezone = getTimezone(query.timezone);
    const limit = getLimit(query.limit);
    const date = getDate(query.date);

    if (query.date && !date) {
        return jsonResponse(400, { success: false, error: "date must use YYYY-MM-DD format" });
    }

    try {
        // Resolve the club from Highlightly's catalogue; no guessed or client-side ID is used.
        const team = await findLokomotiv(apiKey);
        const [homePayload, awayPayload] = await Promise.all([
            requestHighlightly(buildMatchPath("homeTeamId", team.id, timezone, limit, date), apiKey),
            requestHighlightly(buildMatchPath("awayTeamId", team.id, timezone, limit, date), apiKey)
        ]);
        const matches = uniqueMatches([...getMatches(homePayload), ...getMatches(awayPayload)])
            .sort((left, right) => matchTime(left) - matchTime(right));
        const now = Date.now();
        const live = matches.filter((match) => LIVE_STATES.has(match.state && match.state.description));
        const upcoming = matches
            .filter((match) => matchTime(match) >= now && !LIVE_STATES.has(match.state && match.state.description))
            .sort((left, right) => matchTime(left) - matchTime(right));
        const recent = matches
            .filter((match) => FINISHED_STATES.has(match.state && match.state.description) || matchTime(match) < now)
            .sort((left, right) => matchTime(right) - matchTime(left));

        return jsonResponse(200, {
            success: true,
            team: { id: team.id, name: team.name, logo: team.logo || null },
            matches: { live, upcoming, recent, all: matches },
            fetchedAt: new Date().toISOString()
        }, "public, max-age=30, s-maxage=60");
    } catch (error) {
        const isTimeout = error && error.name === "AbortError";
        return jsonResponse(isTimeout ? 504 : 502, {
            success: false,
            error: isTimeout ? "Highlightly request timed out" : "Failed to fetch Highlightly football data",
            details: error && error.message ? error.message : "Unknown error"
        });
    }
};
