const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { makeBookmarksArray, makeMaliciousBookmark, makeSantizedBookmark } = require('./bookmarks.fixtures')

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

    describe('GET /bookmarks', () => {
        context('Given no Bearer token', () => {
            const testBookmarks = makeBookmarksArray();
            
            beforeEach('insert bookmarks', () => {
                return db
                    .into('bookmarks')
                    .insert(testBookmarks)
            });
        
            it('responds with 401', () => {
                    return supertest(app)
                        .get('/bookmarks')
                        .expect(401, { error: 'Unauthorized request' })
            });
        });

        context('Given invalid Bearer token', () => {
            const testBookmarks = makeBookmarksArray();
            
            beforeEach('insert bookmarks', () => {
                return db
                    .into('bookmarks')
                    .insert(testBookmarks)
            });
    
            it('responds with 401', () => {
                return supertest(app)
                    .get('/bookmarks')
                    .set('Authorization', `Bearer 123456`)
                    .expect(401, { error: 'Unauthorized request' })
            });
        });
        
        context('Given valid Bearer token', () => {
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

            context(`Given an XSS attack article`, () => {
                const maliciousBookmark = makeMaliciousBookmark();
                const sanitizedBookmark = makeSantizedBookmark();

                beforeEach('insert malicious bookmark', () => {
                    return db
                        .into('bookmarks')
                        .insert([ maliciousBookmark ])
                });

                it('removes XSS attack content', () => {
                    return supertest(app)
                        .get('/bookmarks')
                        .set('Authorization', `Bearer ${apiToken}`)
                        .expect(200)
                        .expect(res => {
                            expect(res.body[0].title).to.eql(sanitizedBookmark.title);
                            expect(res.body[0].description).to.eql(sanitizedBookmark.description);
                        })
                });
            });
        }) ;
    });
        
    describe('GET /bookmarks/:bookmark_id', () => {
        context('Given no Bearer token', () => {
            const testBookmarks = makeBookmarksArray();
            
            beforeEach('insert bookmarks', () => {
                return db
                    .into('bookmarks')
                    .insert(testBookmarks)
            });
    
            it('responds with 401', () => {
                const bookmarkId = 1;
                return supertest(app)
                    .get(`/bookmarks/${bookmarkId}`)
                    .expect(401, { error: 'Unauthorized request' })
            });
        });

        context('Given invalid Bearer token', () => {
            const testBookmarks = makeBookmarksArray();
            
            beforeEach('insert bookmarks', () => {
                return db
                    .into('bookmarks')
                    .insert(testBookmarks)
            });
    
            it('responds with 401', () => {
                    const bookmarkId = 1;
                    return supertest(app)
                        .get(`/bookmarks/${bookmarkId}`)
                        .set('Authorization', `Bearer 123456`)
                        .expect(401, { error: 'Unauthorized request' })
                });
        });

        context('Given valid Bearer token', () => {
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

                it('responds with 200 and the specified bookmark', () => {
                    const bookmarkId = 2;
                    const expectedBookmark = testBookmarks[bookmarkId - 1];

                    return supertest(app)
                        .get(`/bookmarks/${bookmarkId}`)
                        .set('Authorization', `Bearer ${apiToken}`)
                        .expect(200, expectedBookmark)
                });
            });

            context('Given an XSS attack article', () => {
                const maliciousBookmark = makeMaliciousBookmark();
                const sanitizedBookmark = makeSantizedBookmark();

                beforeEach('insert malicious bookmark', () => {
                    return db
                        .into('bookmarks')
                        .insert([ maliciousBookmark ])
                });

                it('removes XSS attack content', () => {
                    return supertest(app)
                        .get(`/bookmarks/${maliciousBookmark.id}`)
                        .set('Authorization', `Bearer ${apiToken}`)
                        .expect(200)
                        .expect(res => {
                            expect(res.body.title).to.eql(sanitizedBookmark.title);
                            expect(res.body.description).to.eql(sanitizedBookmark.description);
                        })
                });
            });
        });
    });

    describe(`POST /bookmarks`, () => {
        const newBookmark = {
            title: 'Test new bookmark',
            url: 'https://www.newbookmark.com',
            description: 'Test new bookmark description...',
            rating: 1
        };

        context('Given no Bearer token', () => {
            it('responds with 401', () => {
                return supertest(app)
                    .post('/bookmarks')
                    .send(newBookmark)
                    .expect(401, { error: 'Unauthorized request' })
            });
        });

        context('Given invalid Bearer token', () => {
            it('responds with 401', () => {
                return supertest(app)
                    .post('/bookmarks')
                    .set('Authorization', `Bearer 123456`)
                    .send(newBookmark)
                    .expect(401, { error: 'Unauthorized request' })
            });
        });

        context('Given valid Bearer token', () => {
            it('creates a new bookmark, responding with 201 and the new bookmark', function() {
                return supertest(app)
                    .post('/bookmarks')
                    .set('Authorization', `Bearer ${apiToken}`)
                    .send(newBookmark)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.title).to.eql(newBookmark.title)
                        expect(res.body.url).to.eql(newBookmark.url)
                        expect(res.body.description).to.eql(newBookmark.description)
                        expect(res.body.rating).to.eql(newBookmark.rating)
                        expect(res.headers.location).to.eql(`/bookmarks/${res.body.id}`)
                    })
                    .then(postRes =>
                        supertest(app)
                        .get(`/bookmarks/${postRes.body.id}`)
                        .set('Authorization', `Bearer ${apiToken}`)
                        .expect(postRes.body)
                    )
            });
        });

        context(`Given an XSS attack bookmark`, () => {
            const maliciousBookmark = makeMaliciousBookmark();
            const sanitizedBookmark = makeSantizedBookmark();

            it('removes XSS attack content', () => {
                return supertest(app)
                    .post('/bookmarks')
                    .set('Authorization', `Bearer ${apiToken}`)
                    .send(maliciousBookmark)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.title).to.eql(sanitizedBookmark.title);
                        expect(res.body.description).to.eql(sanitizedBookmark.description);
                    })
            });
        });
    });

    describe('DELETE /bookmarks/:bookmark_id', () => {
        context('Given no Bearer token', () => {
            const testBookmarks = makeBookmarksArray();
            
            beforeEach('insert bookmarks', () => {
                return db
                    .into('bookmarks')
                    .insert(testBookmarks)
            });
    
            it('responds with 401', () => {
                const bookmarkId = 1;
                return supertest(app)
                    .delete(`/bookmarks/${bookmarkId}`)
                    .expect(401, { error: 'Unauthorized request' })
            });
        });

        context('Given invalid Bearer token', () => {
            const testBookmarks = makeBookmarksArray();
            
            beforeEach('insert bookmarks', () => {
                return db
                    .into('bookmarks')
                    .insert(testBookmarks)
            });
    
            it('responds with 401', () => {
                    const bookmarkId = 1;
                    return supertest(app)
                        .delete(`/bookmarks/${bookmarkId}`)
                        .set('Authorization', `Bearer 123456`)
                        .expect(401, { error: 'Unauthorized request' })
                });
        });

        context('Given valid Bearer token', () => {
            context('Given there are no bookmarks', () => {
                it('responds with 404', () => {
                    const bookmarkId = 123456;

                    return supertest(app)
                        .delete(`/bookmarks/${bookmarkId}`)
                        .set('Authorization', `Bearer ${apiToken}`)
                        .expect(404, { error: { message: `Bookmark doesn't exist` } })
                });
            });
        });

        context('Given there are bookmarks in the database', () => {
            const testBookmarks = makeBookmarksArray();
    
            beforeEach('insert bookmarks', () => {
                return db
                    .into('bookmarks')
                    .insert(testBookmarks)
            });

            it('responds with 204 and removes the bookmark', () => {
                const idToRemove = 3;
                const expectedBookmarks = testBookmarks.filter(bookmark => bookmark.id !== idToRemove);

                return supertest(app)
                    .delete(`/bookmarks/${idToRemove}`)
                    .set('Authorization', `Bearer ${apiToken}`)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                        .get('/bookmarks')
                        .set('Authorization', `Bearer ${apiToken}`)
                        .expect(expectedBookmarks)
                    )
            });
        });
    });
});