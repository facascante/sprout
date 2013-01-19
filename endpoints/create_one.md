# Collection Provisioning Resources

  **[<code>POST http://api.sprout.ph/:collection</code>](https://github.com/facascante/sprout/blob/master/endpoints/create_one.md)**


## Description
   Add new Document

***

## Requires authentication
JWT

***

## Parameters

Essential information:

- **collection**

Optional information:

- **cnt**

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

  **[<code>POST http://api.sprout.ph/:collection</code>](https://github.com/facascante/sprout/blob/master/endpoints/create_one.md)**

**Header**

``` json
   { "Authorisation" : "<JWT>", "Content-Type" : "application/json" } 
``` 

**Return**

``` javascript
   {Docoument}
``` 

