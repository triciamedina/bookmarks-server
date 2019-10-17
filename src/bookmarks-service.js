const BookmarksService = {
    getAllBookmarks(knex) {
        return knex.select('*').from('bookmarks')
    },
    getById(knex, id) {
        return knex('bookmarks')
            .select('*')
            .where('id', id)
            .first()
    },
}

module.exports = BookmarksService;