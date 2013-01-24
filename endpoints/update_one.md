# Collection Provisioning Resources

  **[<code>PUT http://sprout.ph/api/:collection/:id</code>](https://github.com/facascante/sprout/blob/master/endpoints/update_one.md)**


## Description
   Update Existing Document by Id

***

## Requires authentication
JWT

***

## Parameters

Essential information:

- **collection**
- **id**

Optional information:

- **cnt**
- **cnd**

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

  **[<code>PUT http://sprout.ph/api/:collection/:id</code>](https://github.com/facascante/sprout/blob/master/endpoints/update_one.md)**

**Header**

``` json
   { "Authorisation" : "<JWT>", "Content-Type" : "application/json" } 
``` 

**Return**

``` javascript
   Boolean
``` 

