# Collection Provisioning Resources

  **[<code>DELETE http://api.sprout.ph/:collection/:id</code>](https://github.com/facascante/sprout/blob/master/endpoints/delete_one.md)**


## Description
   Delete Existing Document by Id

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

 **[<code>DELETE http://api.sprout.ph/:collection/:id</code>](https://github.com/facascante/sprout/blob/master/endpoints/delete_one.md)**

**Header**

``` json
   { "Authorisation" : "<JWT>", "Content-Type" : "application/json" } 
``` 

**Return**

``` javascript
   Boolean
``` 

