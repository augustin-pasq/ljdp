export async function getCategories(gameId) {
    const request = await fetch("/api/category/getCategories", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({gameId: gameId}),
    })

    if (request.status === 200) {
        const data = await request.json()
        return data.content
    }
}