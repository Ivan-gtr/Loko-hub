exports.handler = async function () {
    const API_KEY = process.env.API_FOOTBALL_KEY;

    if (!API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "API key is not configured"
            })
        };
    }

    try {
        const response = await fetch(
            "https://v3.football.api-sports.io/fixtures?team=1353&next=10",
            {
                method: "GET",
                headers: {
                    "x-apisports-key": API_KEY
                }
            }
        );

        const data = await response.json();

        return {
            statusCode: response.status,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Failed to fetch football data"
            })
        };
    }
};
