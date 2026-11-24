#!/usr/bin/env bash
set -euo pipefail

readonly TARGET_BINARY="${1:?Error: Target binary path must be provided}"
readonly SIGNING_IDENTITY="${2:--}"

strip_quarantine() {
  if xattr -p com.apple.quarantine "${TARGET_BINARY}" >/dev/null 2>&1; then
    printf 'Removing com.apple.quarantine extended attribute from %s...\n' "${TARGET_BINARY}"
    xattr -d com.apple.quarantine "${TARGET_BINARY}"
  fi
}

sign_macho() {
  printf 'Signing binary %s with identity [%s] and Hardened Runtime...\n' "${TARGET_BINARY}" "${SIGNING_IDENTITY}"
  if [[ "${SIGNING_IDENTITY}" == "-" ]]; then
    # Ad-hoc signing for local Apple Silicon development
    codesign --force --deep --sign - "${TARGET_BINARY}"
  else
    # Formal Developer ID signing with timestamp and hardened runtime
    codesign --force --options runtime --timestamp --sign "${SIGNING_IDENTITY}" "${TARGET_BINARY}"
  fi
}

verify_signature() {
  printf '\n=== Codesign Verification Details ===\n'
  codesign -dvvv "${TARGET_BINARY}"

  printf '\n=== Gatekeeper Assessment ===\n'
  if spctl --assess --type execute --verbose "${TARGET_BINARY}" 2>&1; then
    printf 'Gatekeeper assessment passed: Binary accepted.\n'
  else
    printf 'Gatekeeper assessment failed or ad-hoc signed.\n'
  fi
}

main() {
  strip_quarantine
  sign_macho
  verify_signature
}

main "$@"
