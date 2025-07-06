# Workday GraphiQL Plugins Monorepo

## Overview

This repository contains a collection of useful GraphiQL plugins developed by Workday.

## [Multipart Requests](./packages/graphiql-plugin-multipart-requests)

This plugin allows GraphiQL to include files as part of a request to a GraphQL server
implementing [GraphQL Multipart Request: V3](https://workday.github.io/graphql-multipart-request-spec/graphql-multipart-request-v3.html).

### [Development](./Development.md)

We welcome contributions! Checkout the development guide to get started.

### Publishing

Publishing is done through github actions. When a new github version is created, it will automatically trigger
a github action, that runs `lerna publish from-package`.

This will publish all packages that have a version greater than what is currently published to npm. 
[See Lerna publishing for details](https://lerna.js.org/docs/features/version-and-publish#from-package) 


### Reporting Issues

If you find a bug or have a feature request, please open an issue.