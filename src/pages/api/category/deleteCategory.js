import prisma from "../../../../utils/prisma"

export default async function deleteCategory(req, res) {
    try {
        await prisma.category.delete({
            where: {
                id: req.body.category,
            },
        })

        res.status(200).json({content: {}})
    } catch (err) {
        res.status(500).json(err)
    }
}