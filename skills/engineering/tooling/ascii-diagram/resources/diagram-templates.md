# Structural ASCII & Unicode Diagram Templates

Pre-measured and verified diagram canvases for immediate adaptation across system architectures, decision flows, and sequence lifelines.

---

## 1. Single Component Box (Width = 25 columns)

### Unicode Light
```text
┌───────────────────────┐
│      Component        │
└───────────────────────┘
```

### Pure ASCII
```text
+-----------------------+
|      Component        |
+-----------------------+
```

### Rounded Unicode
```text
╭───────────────────────╮
│      Component        │
╰───────────────────────╯
```

---

## 2. Vertical Pipeline (Width = 25 columns, Symmetric Center = Col 13)

```text
┌───────────────────────┐
│      API Gateway      │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│     Auth Service      │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│   Database Cluster    │
└───────────────────────┘
```

---

## 3. Parallel Tier / Side-by-Side Dispatch (Width = 61 columns)

```text
┌───────────────────────────────────────────────────────────┐
│                       Load Balancer                       │
└─────────────┬───────────────────────────────┬─────────────┘
              │                               │
              ▼                               ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│      Worker Node 01       │   │      Worker Node 02       │
└─────────────┬─────────────┘   └─────────────┬─────────────┘
              │                               │
              └───────────────┬───────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────┐
│                    Shared Cache Store                     │
└───────────────────────────────────────────────────────────┘
```

---

## 4. Branching Decision Flow (Width = 55 columns)

```text
┌─────────────────────────────────────────────────────┐
│                   Incoming Request                  │
└──────────────────────────┬──────────────────────────┘
                           │
                           ▼
                  /─────────────────\
                 <   Is Authorized?  >
                  \─────────────────/
                    │             │
                [No]│             │[Yes]
                    ▼             ▼
┌─────────────────────┐         ┌─────────────────────┐
│    Reject (401)     │         │   Forward Handler   │
└─────────────────────┘         └─────────────────────┘
```

---

## 5. Sequence / Message Flow Lifeline

```text
Client                  Gateway                 Service
  │                        │                       │
  │─── POST /checkout ────►│                       │
  │                        │──── Process Order ───►│
  │                        │                       │
  │                        │◄─── Order Settled ────│
  │◄── 200 OK (Invoice) ───│                       │
  │                        │                       │
```
