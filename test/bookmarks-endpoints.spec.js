const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { makeBookmarksArray } = require('./bookmarks.fixtures')

describe.only('Bookmarks Endpoints', function() {
    let db;
    let apiToken;

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        });
        app.set('db', db);
    });

    before('insert valid Bearer token', () => {
        apiToken = process.env.API_TOKEN;
    })

    before('clean the table', () => db('bookmarks').truncate());

    after('disconnect from db', () => db.destroy());

    afterEach('cleanup', () => db('bookmarks').truncate());

    context('Given valid Bearer token', () => {
        describe('GET /bookmarks', () => {
            context('Given there are no bookmarks', () => {
                it('responds with 200 and an empty list', () => {
                    return supertest(app)
                        .get('/bookmarks')
                        .set('Authorization', `Bearer ${apiToken}`)
                        .expect(200, [])
                });
            });

            context('Given there are bookmarks in the database', () => {
                const testBookmarks = makeBookmarksArray();
        
                beforeEach('insert bookmarks', () => {
                    return db
                        .into('bookmarks')
                        .insert(testBookmarks)
                });
        
                it('GET /bookmarks responds with 200 and all of the bookmarks', () => {
                    return supertest(app)
                        .get('/bookmarks')
                        .set('Authorization', `Bearer ${apiToken}`)
                        .expect(200, testBookmarks)
                });
            });
        });
        
        describe('GET /bookmarks/:bookmark_id', () => {
            context('Given there are no bookmarks', () => {
                it('responds with 404', () => {
                    const bookmarkId = 123456;

                    return supertest(app)
                        .get(`/bookmarks/${bookmarkId}`)
                        .set('Authorization', `Bearer ${apiToken}`)
                        .expect(404, { error: { message: `Bookmark doesn't exist` } })
                });
            });

            context('Given there are bookmarks in the database', () => {
                const testBookmarks = makeBookmarksArray();
        
                beforeEach('insert bookmarks', () => {
                    return db
                        .into('bookmarks')
                        .insert(testBookmarks)
                });

                it('GET /bookmarks/:bookmark_id responds with 200 and the specified bookmark', () => {
                    const bookmarkId = 2;
                    const expectedBookmark = testBookmarks[bookmarkId - 1];

                    return supertest(app)
                        .get(`/bookmarks/${bookmarkId}`)
                        .set('Authorization', `Bearer ${apiToken}`)
                        .expect(200, expectedBookmark)
                });
            });
        });
    });

    context('Given invalid Bearer token', () => {
        describe('GET /bookmarks', () => {
            it('responds with 401', () => {
                return supertest(app)
                    .get('/bookmarks')
                    .set('Authorization', `Bearer 123456`)
                    .expect(401, { error: 'Unauthorized request' })
            });
        });

        describe('GET /bookmarks/:bookmark_id', () => {
            it('GET /bookmarks/:bookmark_id responds with 401', () => {
                return supertest(app)
                    .get('/bookmarks')
                    .set('Authorization', `Bearer 123456`)
                    .expect(401, { error: 'Unauthorized request' })
            });
        });
    });

    context('Given no Bearer token', () => {
        describe('GET /bookmarks', () => {
            it('responds with 401', () => {
                return supertest(app)
                    .get('/bookmarks')
                    .expect(401, { error: 'Unauthorized request' })
            });
        });

        describe('GET /bookmarks/:bookmark_id', () => {
            it('GET /bookmarks/:bookmark_id responds with 401', () => {
                return supertest(app)
                    .get('/bookmarks')
                    .expect(401, { error: 'Unauthorized request' })
            });
        });
    });
});