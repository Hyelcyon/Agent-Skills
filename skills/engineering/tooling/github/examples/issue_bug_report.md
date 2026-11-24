### Bug Description
A clear and concise description of what the bug is.

### Reproduction Steps
1. Navigate to `/checkout`
2. Submit form with empty shipping address
3. Observe unhandled promise rejection error 500

### Expected Behavior
The form should render field-level validation errors with HTTP 422 Problem Details.

### Environment
- OS: Ubuntu 24.04 LTS
- Browser: Chrome 128
- Runtime: Node.js 22.8.0

### Relevant Logs
```json
{
  "error": "UnhandledNullReference",
  "route": "/checkout"
}
```
