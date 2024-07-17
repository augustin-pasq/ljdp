export function youtubeURLParser(url){
    const idRegex = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
    const idMatch = url.match(idRegex)

    if (idMatch && idMatch[7].length === 11) {
        const timeRegex = /&t=(\d+)(s?)/
        const timeMatch = url.match(timeRegex)

        if (timeMatch) {
            return [idMatch[7], parseInt(timeMatch[1], 10)]
        } else {
            return [idMatch[7], false]
        }
    } else {
        return false
    }
}