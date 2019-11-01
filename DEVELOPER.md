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

- allowedRequester(...) is used to define the permission for the requester accessing the route

# Entities

I was trying to make the entities reflect exactly how typeORM works.

When you load an entity from the db, your related objects may not be loaded

- Fields that may not be loaded are defined with ?
- Fields always loaded are defined with !
- Fields can be intentionally hiden with select: false, e.g. User.password. Defined with ?
- Nullable fields are defined with !: type | null e.g. discardedAt!: Date | null
- This is because discardedAt is always loaded, but when it is loaded it may be null.

There’s a few ways to load them, you can set eager: true in the entities file, so when you load an entity you will automatically eagerly load those with eager: true
This has some serious limitations though, so I don’t really advice it - it only works for find\* commands, stuff like save won’t load the eager ones

You can also do find(id, { relations: [“paperUser”, “paperUser.user”] })
This is preferred - its very explicit so you know what exactly is loaded

typeORM documentation doesn’t cover this too well because they only guide you how to use ts without strict mode

# Cascade Soft Delete

- When a parent is discarded, its children are NOT discarded.
- Instead, the children's getListData() will reflect the parent's discardedAt if its parent has been discarded.
- See: QuestionTemplate.ts

# Script Template

Key Assumptions

- An exam paper will always be sorted in ascending order of page number.
- An exam paper's PageTemplates will not change. They are generated when an Owner uploads the base PDF.
- Uploading a new Exam Template PDF is not allowed unless the existing Script Template has been discarded. Owner will have to create a new Script Template.

# Test

- Refer to papers.spec.ts for an example
- Take note that if you want to close the api server manually, you should always close it before calling expect() because if expect fails, it immediately quits executing.

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
