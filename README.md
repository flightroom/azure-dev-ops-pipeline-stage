# Flightroom Azure DevOps extension

The extension packages two pipeline tasks:

- `flightroom-upload@1` zips and uploads a BUNDLE frontend.
- `flightroom-register-docker-image@1` registers a Docker image that a preceding pipeline step has pushed, as a version of a backend (or maintenance agent) or of a DOCKER frontend.

Both tasks accept the API key as a secret task input and send it in the `api-key` header.

## Build and check

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

To package a VSIX:

```bash
pnpm build:complete
pnpm exec tfx extension create --manifest-globs vss-extension.json --publisher "$AZURE_PUBLISHER_ID" --output-path dist
```

## Publishing

Create a GitHub release: [publish.yml](.github/workflows/publish.yml) sets the release version on the extension and on every `tasks/*/task.json`, then packages and publishes the extension to the Marketplace.

See [overview.md](./overview.md) for task examples.
