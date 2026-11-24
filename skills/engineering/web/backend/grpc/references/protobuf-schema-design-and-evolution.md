# Protocol Buffers Schema Design, Evolution, and Backward Compatibility

This document specifies the rules for Protocol Buffers (proto3) schema design, backward and forward compatibility, and package versioning.

---

## 1. Field Tag Mechanics and Wire Format

In Protocol Buffers, messages are serialized as key-value pairs where the key is composed of the field number (tag) and wire type:
$$\text{key} = (\text{field\_number} \ll 3) \mid \text{wire\_type}$$

Because the wire format encodes field numbers rather than string identifiers:
1. Renaming a field name does NOT break wire compatibility.
2. Changing a field number BREAKS binary compatibility completely.
3. Changing a field type between incompatible wire representations causes deserialization failures or value corruption.

---

## 2. Backward and Forward Compatibility Rules

```
+-------------------------------------------------------------+
| Old Client (Proto v1)               New Server (Proto v2)   |
| Sends: fields 1, 2                  Accepts: fields 1, 2, 3 |
| Result: Field 3 receives default value. SUCCESS             |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
| New Client (Proto v2)               Old Server (Proto v1)   |
| Sends: fields 1, 2, 3               Accepts: fields 1, 2    |
| Result: Field 3 stored in unknownFields buffer. SUCCESS     |
+-------------------------------------------------------------+
```

### The Invariants of Safe Evolution
1. **Never Change Existing Field Numbers**: A field tag number is immutable once deployed to production.
2. **Never Remove a Field Without `reserved`**: When removing an obsolete field, reserve its tag and name to prevent new engineers or automated generators from reusing it:
   ```protobuf
   message UserProfile {
     reserved 4, 9 to 12;
     reserved "social_security_number", "fax_number";

     string user_id = 1;
     string email = 2;
   }
   ```
3. **Enum Default Value Invariant**: In proto3, the first enum element must have value 0 and should be named `<ENUM_NAME>_UNSPECIFIED = 0`. If value 0 is assigned to a valid business state (e.g. `STATUS_ACTIVE = 0`), an uninitialized message defaults to `ACTIVE`, masking bugs.

---

## 3. Package Versioning & Directory Hierarchy

Always include the API version in the package namespace and directory structure:
```
apis/
└── payment/
    └── v1/
        ├── payment_service.proto
        └── payment_models.proto
```
Inside the proto file:
```protobuf
syntax = "proto3";

package payment.v1;

option go_package = "github.com/company/apis/gen/go/payment/v1;paymentv1";
option java_package = "com.company.apis.payment.v1";
```
When breaking changes are unavoidable, introduce `payment.v2` in a separate directory and run both versions concurrently until clients migrate.
