# Collection Provisioning Resources

  **[<code>GET http://sprout.ph/api/:collection/:id</code>](https://github.com/facascante/sprout/blob/master/endpoints/get_one.md)**


## Description
   Get Document by id

***

## Requires authentication
JWT

***

## Parameters

Essential information:

- **collection**
- **id**

Optional information:

- **cnd**
- **fmt**

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

  **[<code>GET http://sprout.ph/api/:collection/:id</code>](https://github.com/facascante/sprout/blob/master/endpoints/get_one.md)**

**Header**

``` json
   { "Authorisation" : "<JWT>" } 
``` 

**Return**

``` javascript
   {Docoument}
``` 

