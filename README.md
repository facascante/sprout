# Sprout API

Sprout API provides programmatic access to Sprout functionality and content.

The API is [REST API](http://en.wikipedia.org/wiki/Representational_State_Transfer "RESTful")
Currently, return format for all endpoints is [JSON](http://json.org/ "JSON").


***

## Endpoints

URL Parameter - part of the url, i.e. <url>/:collection/:id

- **collection** _(required)_ — collection containing the document.
- **id** _(required)_ — id of the document.

Request Body - request body or content

- **cnt** _(required)_ — content to be save or update, should include mongodb operation if update, i.e {"$push":{"<field>":"sample"}}.

Request Query - appended to url, i.e. <url>?cnd={"<field>":1}

- **cnd** _(optional)_ — condition or criteria for searching.
- **fmt** _(optional)_ — list of document fields, format or columns to return., i.e. {id:1,rs:0} (return id and other except rs)
- **srt** _(optional)_ — list of document fields, format or columns to sort., i.e. {id:1,rs:0} (sort by id ascending, rs descending)
- **skp** _(optional)_ — Number of page to skip, default 0.
- **lmt** _(optional)_ — Number of rows to return, default 100.

***

## Endpoints

#### Object Provisioning Resources

- **[<code>GET http://api.sprout.ph/:collection</code>](https://github.com/facascante/sprout/blob/master/endpoints/get_all.md)**
- **[<code>GET http://api.sprout.ph/:collection/:id</code>](https://github.com/facascante/sprout/blob/master/endpoints/get_one.md)**
- **[<code>POST http://api.sprout.ph/:collection</code>](https://github.com/facascante/sprout/blob/master/endpoints/create_one.md)**
- **[<code>PUT http://api.sprout.ph/:collection/:id</code>](https://github.com/facascante/sprout/blob/master/endpoints/update_one.md)**
- **[<code>DELETE http://api.sprout.ph/:collection/:id</code>](https://github.com/facascante/sprout/blob/master/endpoints/delete_one.md)**
