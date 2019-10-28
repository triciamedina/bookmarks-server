# Bookmarks API

An API for the Bookmarks client supporting GET, POST, DELETE, PATCH.

## Set up

Install the node dependencies `npm install`

Seed the database `psql -U dunder_mifflin -d bookmarks -f ./seeds/seed.bookmarks.sql`

## Endpoints

`GET /bookmarks` returns a list of bookmarks

`GET /bookmarks/:id` returns a single bookmark with the given ID

`POST /bookmarks` accepts a JSON object representing a bookmark and adds it to the list of bookmarks after validation

`DELETE /bookmarks/:id` deletes the bookmark with the given ID

`PATCH /bookmarks/:id` updates a bookmark with the given ID

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

Run migrations `npm run migrate`
