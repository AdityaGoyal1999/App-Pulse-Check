#!/usr/bin/env bash
set -euo pipefail

API="${API_BASE:-http://localhost:${PORT:-3000}}"
EMAIL="e2e-$(date +%s)@test.local"
PASSWORD="testpassword123"

TOKEN=""
CHECK_ID=""
CHECK_UUID=""
CLEANUP_DONE=0

step() {
  echo "==> $1"
}

pass() {
  echo "PASS: $1"
}

fail() {
  echo "FAIL: $1" >&2
  exit 1
}

assert_status() {
  local actual="$1"
  local expected="$2"
  local label="$3"
  if [[ "$actual" != "$expected" ]]; then
    fail "${label}: expected HTTP ${expected}, got ${actual}"
  fi
}

# macOS-compatible: sed '$d' drops the last line (HTTP status from curl -w).
http_json() {
  local method="$1"
  local url="$2"
  local auth="${3:-}"
  local body="${4:-}"

  local curl_args=(
    -sS
    -w "\n%{http_code}"
    -X "$method"
    -H "Content-Type: application/json"
  )

  if [[ -n "$auth" ]]; then
    curl_args+=(-H "Authorization: Bearer ${auth}")
  fi

  if [[ -n "$body" ]]; then
    curl_args+=(-d "$body")
  fi

  local resp
  resp=$(curl "${curl_args[@]}" "$url")
  HTTP_BODY=$(echo "$resp" | sed '$d')
  HTTP_CODE=$(echo "$resp" | tail -n 1)
}

get_check_status() {
  http_json GET "${API}/api/checks" "$TOKEN"
  assert_status "$HTTP_CODE" "200" "GET /api/checks"
  echo "$HTTP_BODY" | jq -r --arg id "$CHECK_ID" '.checks[] | select(.id == $id) | .status'
}

cleanup() {
  if [[ "$CLEANUP_DONE" -eq 1 ]]; then
    return
  fi
  CLEANUP_DONE=1

  if [[ -n "${CHECK_ID}" && -n "${TOKEN}" ]]; then
    step "Cleanup: deleting check ${CHECK_ID}"
    http_json DELETE "${API}/api/checks/${CHECK_ID}" "$TOKEN" || true
  fi
}

trap cleanup EXIT

command -v curl >/dev/null || fail "curl is required"
command -v jq >/dev/null || fail "jq is required (brew install jq)"

step "Prerequisites: API health check at ${API}"
if ! curl -sf "${API}/health" >/dev/null; then
  fail "API not reachable at ${API}. Start the stack with: npm run dev:backend"
fi
pass "API is reachable"

step "1. Signup"
http_json POST "${API}/api/auth/signup" "" \
  "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}"
assert_status "$HTTP_CODE" "201" "POST /api/auth/signup"
TOKEN=$(echo "$HTTP_BODY" | jq -r '.token')
[[ "$TOKEN" != "null" && -n "$TOKEN" ]] || fail "signup response missing token"
pass "Signed up as ${EMAIL}"

step "2. Create check (interval=60, grace=0)"
http_json POST "${API}/api/checks" "$TOKEN" \
  '{"name":"E2E Check","intervalSeconds":60,"graceSeconds":0}'
assert_status "$HTTP_CODE" "201" "POST /api/checks"
CHECK_ID=$(echo "$HTTP_BODY" | jq -r '.id')
CHECK_UUID=$(echo "$HTTP_BODY" | jq -r '.uuid')
[[ "$CHECK_ID" != "null" && -n "$CHECK_ID" ]] || fail "create check response missing id"
[[ "$CHECK_UUID" != "null" && -n "$CHECK_UUID" ]] || fail "create check response missing uuid"
pass "Created check id=${CHECK_ID} uuid=${CHECK_UUID}"

step "3. First ping → UP"
http_json GET "${API}/ping/${CHECK_UUID}" ""
assert_status "$HTTP_CODE" "200" "GET /ping/:uuid"
PING_OK=$(echo "$HTTP_BODY" | jq -r '.ok')
[[ "$PING_OK" == "true" ]] || fail "ping response ok != true"

STATUS=$(get_check_status)
[[ "$STATUS" == "UP" ]] || fail "expected status UP after first ping, got ${STATUS}"
pass "Check is UP after first ping"

step "4. Wait for worker to mark check DOWN (poll up to 150s)"
STATUS=""
for _ in $(seq 1 15); do
  STATUS=$(get_check_status)
  if [[ "$STATUS" == "DOWN" ]]; then
    break
  fi
  sleep 10
done
[[ "$STATUS" == "DOWN" ]] || fail "check never went DOWN within 150s (last status: ${STATUS})"
pass "Check is DOWN after missed pings"

step "5. Recovery ping → UP"
http_json GET "${API}/ping/${CHECK_UUID}" ""
assert_status "$HTTP_CODE" "200" "GET /ping/:uuid (recovery)"
PING_OK=$(echo "$HTTP_BODY" | jq -r '.ok')
[[ "$PING_OK" == "true" ]] || fail "recovery ping response ok != true"

STATUS=$(get_check_status)
[[ "$STATUS" == "UP" ]] || fail "expected status UP after recovery ping, got ${STATUS}"
pass "Check recovered to UP"

step "6. Delete check"
http_json DELETE "${API}/api/checks/${CHECK_ID}" "$TOKEN"
assert_status "$HTTP_CODE" "200" "DELETE /api/checks/:id"
DELETE_OK=$(echo "$HTTP_BODY" | jq -r '.ok')
[[ "$DELETE_OK" == "true" ]] || fail "delete response ok != true"
CHECK_ID=""
pass "Check deleted"

echo ""
echo "All E2E steps passed."
