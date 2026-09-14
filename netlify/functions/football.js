exports.handler = async function () {
    const API_KEY = process.env.HIGHLIGHTLY_API_KEY;

    if (!API_KEY) {
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                success: false,
                error: "HIGHLIGHTLY_API_KEY is not configured"
            })
        };
    }

    const API_URL =
        "https://soccer.highlightly.net/football/matches" +
        "?date=2026-09-15" +
        "&limit=100";

    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "x-rapidapi-key": API_KEY,
                "Accept": "application/json"
            }
        });

        const data = await response.json();

        return {
            statusCode: response.status,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "public, max-age=60"
            },
            body: JSON.stringify({
                success: response.ok,
                apiStatus: response.status,
                data: data
            })
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                success: false,
                error: "Failed to connect to Highlightly",
                details: error.message
            })
        };
    }
};
