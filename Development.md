# Development

## Getting Started

1. [Install `nvm`](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating)
2. Setup `nvm`
   ```bash
    nvm install
    ```
3. Setup all the dependencies
    ```bash
    npm run setup
    ```

## Start Local Development Environment

```bash
npm run dev
```

This starts compiling and watching all the packages in the monorepo. It also starts a local dev server for the example
package at `http://localhost:8080`.

## Formatting

#### Check for formatting issues

```bash
npm run lint
```

#### Apply default fixes

```bash
npm run fix
```

## Run Tests

```bash
npm run test
```

#### Unit Tests

```bash
npm run test:unit
```

#### Integration Tests

```bash
npm run test:integration
```

> ⚠️ Playwright uses the local dev server for tests which depends on port `8080` being available.

## Publishing New Version

#### Recording A New Demo

```bash
npm run demo
```

> ⚠️ The demo conversion depends on `ffmpeg` being installed on your system.
