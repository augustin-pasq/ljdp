export async function getCategories(game, router) {
    const request = await fetch("/api/category/getCategories", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({game: game}),
    })


    if (request.status === 200) {
        const data = await request.json()
        return data.content
    } else if (request.status === 403) {
        const data = await request.json()
        await router.push({pathname: "/", query: { message: data.content }}, "/")
        return null
    }
}