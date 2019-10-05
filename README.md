# Bookmarks API

An API for the Bookmarks client supporting GET, POST, DELETE.

## Set up

Install the node dependencies `npm install`

## Endpoints

`GET /bookmarks` returns a list of bookmarks

`GET /bookmarks/:id` returns a single bookmark with the given ID

`POST /bookmarks` accepts a JSON object representing a bookmark and adds it to the list of bookmarks after validation

`DELETE /bookmarks/:id` deletes the bookmark with the given ID

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`
