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

The workflow does not use a PAT: it signs in to Entra ID through workload identity federation (GitHub OIDC) and publishes with an Entra token for Azure DevOps. One-time setup:

1. In Entra ID, create an app registration (or a user-assigned managed identity) and add a federated credential: issuer `https://token.actions.githubusercontent.com`, subject `repo:flightroom@346019903/azure-dev-ops-pipeline-stage@1435411130:environment:marketplace`, audience `api://AzureADTokenExchange`. The repository uses GitHub's immutable OIDC subject, so the owner and repository IDs are part of it.
2. Add the service principal as a Stakeholder of an Azure DevOps organization connected to the same tenant, then add it to the Marketplace publisher as Contributor. The publisher Members page looks identities up in the caller's directory, so an owner from that tenant must add it. The Marketplace user ID of the service principal is not its organization identity ID: run the workflow once, and the 403 error from the publish step prints the ID to add.
3. In GitHub, create the `marketplace` environment with the variables `AZURE_CLIENT_ID` and `AZURE_TENANT_ID`, and keep the `AZURE_PUBLISHER_ID` secret.

See [overview.md](./overview.md) for task examples.
