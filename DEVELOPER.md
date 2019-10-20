# Steps to run the backend:

On development

1. Run `yarn install`
2. Run `docker-compose up`
3. Run `cd backend`
4. Run `yarn start`

On production

1. ssh into DigitalOcean Droplet
2. Run `cd backend`
3. Run `yarn production`

[API Documentation](https://documenter.getpostman.com/view/8059258/SVmyQwss?version=latest)

# Architecture

- [Data Mapper](https://github.com/typeorm/typeorm/blob/master/docs/active-record-data-mapper.md)
- [Basic access authentication](https://en.wikipedia.org/wiki/Basic_access_authentication)
  - When a user logs in, he receives two tokens
    - access token
      - valid for 15 minutes
    - refresh token
      - valid for 7 days
  - Certain API actions requires an access token
  - If the access token is expired, server will return a `401`
  - The frontend should then request for a new one by issuing a PATCH request to api/users/refresh_authentication with the refresh_token in the HTTP header
    - Returns a new access token and refresh token

API Design Guidelines

- [Nesting Resources](http://weblog.jamisbuck.org/2007/2/5/nesting-resources)
  - Rule of thumb: resources should never be nested more than 1 level deep
  - A collection may need to be scoped by its parent, but a specific member can always be accessed directly by an id
- [Robustness Principle](https://tools.ietf.org/html/rfc1122)
  - Be liberal in what you accept, and conservative in what you send

# Permissions

- [Reference](https://blog.nodeswat.com/implement-access-control-in-node-js-8567e7b484d1)

# Algolia

## Search API Key

**092aa257d26c6e1fb8733a3c0229b176**

## Developer API Key

You can get it from Shawn.

The Developer API key stored in .env has the following rights:

- addObject
- analytics
- browse
- deleteIndex
- deleteObject
- editSettings
- listIndexes
- logs
- search
- seeUnretrievableAttributes
- settings
