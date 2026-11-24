# Advanced Branching Workflow Diagram

A verified reference diagram featuring conditional decision routing, parallel branch execution, error compensation rollback paths, and symmetric junction confluence.

```text
┌─────────────────────────────────────────────────────────────────────┐
│                       Incoming Payment Event                        │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                                   ▼
                     /───────────────────────────\
                    <  Fraud Score < Threshold?   >
                     \─────────────┬─────────────/
                                   │
                  [Pass]           │            [Reject]
               ┌───────────────────┴───────────────────┐
               ▼                                       ▼
┌─────────────────────────────┐         ┌─────────────────────────────┐
│       Settle Payment        │         │    Trigger Compensation     │
└──────────────┬──────────────┘         └──────────────┬──────────────┘
               │                                       │
               └───────────────────┬───────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────┴──────────────────────────────────┐
│                       Audit & Event Store Log                       │
└─────────────────────────────────────────────────────────────────────┘
```
