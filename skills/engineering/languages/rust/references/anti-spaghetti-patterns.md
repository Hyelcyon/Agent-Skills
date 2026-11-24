# Rust 2024 Architecture & Anti-Spaghetti Playbook

Detailed reference for eliminating spaghetti code, clone-abuse, god objects, and enforcing strict clippy & deny gates.

---

## 1. Domain Modeling: The Newtype Pattern

Prevent primitive obsession (passing raw strings and ints everywhere):

```rust
use std::fmt;

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct UserId(String);

#[derive(Debug, thiserror::Error)]
#[error("invalid user identifier format")]
pub struct InvalidUserId;

impl UserId {
    pub fn parse(raw: impl Into<String>) -> Result<Self, InvalidUserId> {
        let s = raw.into();
        if s.starts_with("usr_") && s.len() > 8 {
            Ok(Self(s))
        } else {
            Err(InvalidUserId)
        }
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}
```

---

## 2. Flattening Control Flow (Eliminating Nested Match Pyramids)

Replace 4-level nested matches with early return combinators and `?`:

```rust
pub fn process_order(req: Request) -> Result<Invoice, AppError> {
    let auth = validate_token(&req.token)?;
    let user = fetch_user(&auth.user_id)?;
    let cart = get_active_cart(&user.id)?;
    
    if cart.is_empty() {
        return Err(AppError::EmptyCart);
    }

    let payment = execute_charge(&user, cart.total())?;
    create_invoice(user.id, payment.id)
}
```

---

## 3. Strict Quality Lints Setup (`lib.rs` / `main.rs`)

```rust
#![warn(
    clippy::all,
    clippy::pedantic,
    clippy::nursery,
    clippy::cargo
)]
#![deny(
    clippy::correctness,
    clippy::suspicious,
    clippy::str_to_string,
    clippy::todo,
    clippy::unimplemented
)]
```

---

## 4. Supply Chain Gatekeeper (`deny.toml`)

```toml
[advisories]
vulnerability = "deny"
unmaintained = "warn"

[licenses]
unlicensed = "deny"
allow = ["MIT", "Apache-2.0", "BSD-3-Clause"]

[bans]
multiple-versions = "deny"
wildcards = "deny"
```
