# Security Policy

## Reporting a vulnerability

Please report security issues privately to **security@peritus.is**. We aim to acknowledge reports within 48 hours.

Do not open public GitHub issues for security vulnerabilities.

## Scope

This repository is a public, read-only REST API exposing open data. It has no authentication or user accounts. Valid reports typically involve:

- Input validation bypass (Cypher injection, DoS via unbounded queries)
- Information disclosure beyond the open dataset
- Misconfigured security headers or CORS
- Supply-chain issues in dependencies
