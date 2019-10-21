const express = require('express');
// const uuid = require('uuid/v4');
const logger = require('../logger');
const xss = require('xss');
const BookmarksService = require('../bookmarks-service')

const bookmarksRouter = express.Router();
const bodyParser = express.json();

bookmarksRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        BookmarksService.getAllBookmarks(knexInstance)
            .then(bookmarks => {
                const bookmarksArray = bookmarks.map(bookmark => {
                    return {
                        id: bookmark.id,
                        title: xss(bookmark.title),
                        url: bookmark.url,
                        description: xss(bookmark.description),
                        rating: bookmark.rating
                    }
                });
                res.json(bookmarksArray)
            })
            .catch(next);
    })
    .post(bodyParser, (req, res, next) => {
        const { title, url, description="", rating } = req.body;
        const ratingNum = parseFloat(rating);
        // const id = uuid();
        const newBookmark = {
            // id,
            title,
            url,
            description,
            rating: ratingNum
        }

        for(const [key, value] of Object.entries(newBookmark)) {
            if (value == null) {
                logger.error(`${key} is required`)
                return res
                    .status(400)
                    .json({
                        error: { message: `Invalid data`}
                    })
            };
        };

        if (Number.isNaN(newBookmark.ratingNum)) {
            logger.error(`Rating must be numerical.`);
            return res
                .status(400)
                .json({
                    error: { message: `Invalid data`}
                })
        };

        if (newBookmark.ratingNum < 1 || newBookmark.ratingNum > 5) {
            logger.error(`Rating must be between 1 and 5.`);
            return res
                .status(404)
                .json({
                    error: { message: `Invalid data`}
                })
        };

        BookmarksService.insertBookmark(
            req.app.get('db'),
            newBookmark
        )
        .then(bookmark => {
            res
                .status(201)
                .location(`/bookmarks/${bookmark.id}`)
                .json({
                    id: bookmark.id,
                    title: xss(bookmark.title),
                    url: bookmark.url,
                    description: xss(bookmark.description),
                    rating: bookmark.rating
                });
        })
        .catch(next)
    });

bookmarksRouter
    .route('/:bookmark_id')
    .all((req, res, next) => {
        BookmarksService.getById(
            req.app.get('db'),
            req.params.bookmark_id
        )
        .then(bookmark => {
            if (!bookmark) {
                return res.status(404).json({
                    error: { message: `Bookmark doesn't exist` }
                });
            }
            res.bookmark = bookmark
            next();
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json({
            id: res.bookmark.id,
            title: xss(res.bookmark.title),
            url: res.bookmark.url,
            description: xss(res.bookmark.description),
            rating: res.bookmark.rating
        });
    })
    .delete((req, res, next) => {
        BookmarksService.deleteBookmark(
            req.app.get('db'),
            req.params.bookmark_id
            )
            .then(() => {
                res.status(204).end();
                logger.info(`Bookmark with id ${req.params.bookmark_id} deleted.`);
            })
            .catch(next)
    });

module.exports = bookmarksRouter;