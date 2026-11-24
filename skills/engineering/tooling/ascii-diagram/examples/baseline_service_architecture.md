# Baseline Service Architecture Diagram

A clean, production reference diagram demonstrating a 3-tier microservice system with symmetric vertical connectors, boundary labels, and uniform line width.

```text
┌───────────────────────────────────────────────────────────┐
│                      Browser Client                       │
└─────────────────────────────┬─────────────────────────────┘
                              │ HTTPS / JSON
                              ▼
┌───────────────────────────────────────────────────────────┐
│                    API Gateway Service                    │
└──────────────┬─────────────────────────────┬──────────────┘
               │                             │
               │ gRPC                        │ gRPC
               ▼                             ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│     Identity Service      │   │       Order Service       │
└──────────────┬────────────┘   └────────────┬──────────────┘
               │                             │
               │ SQL                         │ SQL
               ▼                             ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│     PostgreSQL Auth DB    │   │      PostgreSQL Order DB  │
└───────────────────────────┘   └───────────────────────────┘
```
