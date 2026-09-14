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
                error: "HIGHLIGHTLY_API_KEY is not configured",
                message: "Проверь переменную HIGHLIGHTLY_API_KEY в Netlify"
            })
        };
    }

    const API_URL =
        "https://soccer-highlights-api.p.rapidapi.com/fixtures" +
        "?date=2026-09-15";

    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "x-rapidapi-key": API_KEY,
                "x-rapidapi-host": "soccer-highlights-api.p.rapidapi.com",
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
