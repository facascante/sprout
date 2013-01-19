# Collection Provisioning Resources

  **[<code>GET http://api.sprout.ph/:collection/:id</code>](https://github.com/facascante/sprout/blob/master/endpoints/get_one.md)**


## Description
   Get Document by id

***

## Requires authentication
JWT

***

## Parameters

Essential information:

- **collection** _(required)_ — collection containing the documents.
- **id** _(required)_ — id of the document to be find.

Optional information:

- **cnd** _(required)_ — condition for searching.
- **fmt** _(required)_ — return column format.
- **srt** _(required)_ — sorting.
- **skp** _(required)_ — paging, default no limit.
- **lmt** _(required)_ — limit, default 100 rows.

***

## Request / Response Format
  **<code>JSON</code>**

***

## Errors
All known errors cause the resource to return HTTP error code header together with a JSON array containing message describing the source of error.

- **400 Bad Request** — One or more of the required fields was missing or Invalid.

***

## Example

**Request**

  **[<code>GET http://api.sprout.ph/:collection/:id</code>](https://github.com/facascante/sprout/blob/master/endpoints/get_one.md)**

**Header**

``` json
   { "Authorisation" : "<JWT>" } 
``` 

**Return**

``` javascript
   {Docoument}
``` 

