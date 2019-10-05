const app = require('../src/app');

describe('App', () => {
    it('GET / without valid Bearer Token responds with 401 containing "Unauthorized request"', () => {
        return supertest(app)
            .get('/')
            .expect(401, { "error":"Unauthorized request" });
    });
});