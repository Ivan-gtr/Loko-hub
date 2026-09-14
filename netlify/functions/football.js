exports.handler = async function () {
    const API_KEY = process.env.API_FOOTBALL_KEY;

    // Проверяем, добавлен ли API-ключ в Netlify
    if (!API_KEY) {
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                error: "API key is not configured",
                message: "Добавь API_FOOTBALL_KEY в Netlify Environment variables"
            })
        };
    }

    // Для бесплатного тарифа используем конкретную дату и сезон
    const API_URL =
        "https://v3.football.api-sports.io/fixtures" +
        "?team=1353" +
        "&date=2026-09-15" +
        "&season=2026";

    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "x-apisports-key": API_KEY,
                "Accept": "application/json"
            }
        });

        const data = await response.json();

        // Если API вернул ошибку
        if (!response.ok || data.errors && Object.keys(data.errors).length > 0) {
            return {
                statusCode: response.status || 500,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    error: "API-Football returned an error",
                    apiStatus: response.status,
                    apiErrors: data.errors || {},
                    parameters: data.parameters || {},
                    message: "Проверь параметры запроса, тариф и лимит запросов"
                })
            };
        }

        // Успешный ответ
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "public, max-age=60"
            },
            body: JSON.stringify({
                success: true,
                results: data.results || 0,
                fixtures: data.response || [],
                originalResponse: data
            })
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                error: "Failed to connect to API-Football",
                details: error.message
            })
        };
    }
};
