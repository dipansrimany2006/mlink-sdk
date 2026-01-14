# Mlink SDK — Description & Platform Scope

## Overview
Mlink SDK provides a lightweight, framework-agnostic toolkit for building, executing, and integrating "mlink" functionality across server and client applications. It includes adapters for popular server frameworks, React components and hooks for client-side integration, TypeScript types, utilities, and validation helpers.

## Purpose
The SDK's goal is to standardize how applications generate and handle mlink objects/flows, simplifying integration across different runtimes (Node/Express/Next.js) and front-end apps (React). It focuses on developer ergonomics, type safety, and modular adapters so teams can plug features into existing apps quickly.

## Key Features
- Server adapters: built integrations for Express and Next.js to expose mlink endpoints.
- React support: `Mlink`, `MlinkProvider`, `useMlink`, and `useExecuteMlink` for easy client-side consumption.
- Utilities: builders, validators, and helper functions to create and verify mlink payloads.
- TypeScript-first: exported types for strong typing across apps.
- Extensible adapters: architecture allows adding new framework or platform adapters.

## In-Scope
- Tools and primitives to build, validate, and execute mlink payloads.
- Middleware and route adapters for Express and Next.js to serve/handle mlink flows.
- React components and hooks to render and invoke mlink experiences on the client.
- Useful utilities, constants, and TypeScript types used across the SDK.

## Out-of-Scope
- Hosted services, analytics, or 3rd-party telemetry for mlink usage.
- Persistent storage, user management, or authentication systems (the SDK can integrate with these but does not provide them).
- Deployment, CI/CD, or platform-level monitoring tooling.

## Getting Started (quick)
1. Install the package (published name may vary): `npm install mlink-sdk` or use the local package in this repo.
2. Server: register the provided adapter/middleware for your chosen framework (e.g., Express/Next).
3. Client: wrap your app with `MlinkProvider` and use `useMlink` or `useExecuteMlink` where needed.

See the source files in `src/` for exact APIs and examples.

## Contributing
Contributions, bug reports, and improvements are welcome. Follow the repository's contribution guidelines and run tests/lints before submitting PRs.

---
Created for the repository root to explain SDK scope and intended usage.
