# Collection Provisioning Resources

  **[<code>GET http://api.sprout.ph/:collection</code>](https://github.com/facascante/sprout/blob/master/endpoints/get_all.md)**


## Description
   Get array of collection record

***

## Requires authentication
JWT

***

## Parameters

Essential information:

- **collection**


Optional information:

- **cnd**
- **fmt**
- **srt**
- **skp**
- **lmt**

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

 **[<code>GET http://api.sprout.ph/:collection</code>](https://github.com/facascante/sprout/blob/master/endpoints/get_all.md)**

**Header**

``` json
   { "Authorisation" : "<JWT>" } 
``` 

**Return**

``` javascript
[collection]
``` 

