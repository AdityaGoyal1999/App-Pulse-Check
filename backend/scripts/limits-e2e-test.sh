#!/usr/bin/env bash
# E2E checks for plan limits: 20-check cap (403 on 21st) and ping log retention.
set -euo pipefail

API="${API_BASE:-http://localhost:${PORT:-3000}}"
EMAIL="limits-e2e-$(date +%s)@test.local"
PASSWORD="testpassword123"

TOKEN=""
CHECK_IDS=()
TRIM_CHECK_ID=""
TRIM_CHECK_UUID=""
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

cleanup() {
  if [[ "$CLEANUP_DONE" -eq 1 ]]; then
    return
  fi
  CLEANUP_DONE=1

  if [[ -n "${TOKEN}" ]]; then
    for id in "${CHECK_IDS[@]}"; do
      if [[ -n "$id" ]]; then
        step "Cleanup: deleting check ${id}"
        http_json DELETE "${API}/api/checks/${id}" "$TOKEN" || true
      fi
    done
    if [[ -n "${TRIM_CHECK_ID}" ]]; then
      step "Cleanup: deleting trim test check ${TRIM_CHECK_ID}"
      http_json DELETE "${API}/api/checks/${TRIM_CHECK_ID}" "$TOKEN" || true
    fi
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

step "2. Create 20 checks (Free tier cap)"
CHECK_IDS=()
for i in $(seq 1 20); do
  http_json POST "${API}/api/checks" "$TOKEN" \
    "{\"name\":\"Limit Check ${i}\",\"intervalSeconds\":3600,\"graceSeconds\":0}"
  assert_status "$HTTP_CODE" "201" "POST /api/checks #${i}"
  id=$(echo "$HTTP_BODY" | jq -r '.id')
  [[ "$id" != "null" && -n "$id" ]] || fail "create check #${i} missing id"
  CHECK_IDS+=("$id")
done
pass "Created 20 checks"

step "3. 21st check returns 403"
http_json POST "${API}/api/checks" "$TOKEN" \
  '{"name":"Limit Check 21","intervalSeconds":3600,"graceSeconds":0}'
assert_status "$HTTP_CODE" "403" "POST /api/checks (21st)"
ERROR=$(echo "$HTTP_BODY" | jq -r '.error')
PLAN=$(echo "$HTTP_BODY" | jq -r '.plan')
LIMIT=$(echo "$HTTP_BODY" | jq -r '.limit')
CHECK_COUNT=$(echo "$HTTP_BODY" | jq -r '.checkCount')
[[ "$ERROR" == "Check limit reached" ]] || fail "expected error 'Check limit reached', got ${ERROR}"
[[ "$PLAN" == "FREE" ]] || fail "expected plan FREE, got ${PLAN}"
[[ "$LIMIT" == "20" ]] || fail "expected limit 20, got ${LIMIT}"
[[ "$CHECK_COUNT" == "20" ]] || fail "expected checkCount 20, got ${CHECK_COUNT}"
pass "21st check blocked with 403"

step "4. Ping log retention — make room, create check, ping 101 times"
http_json DELETE "${API}/api/checks/${CHECK_IDS[0]}" "$TOKEN"
assert_status "$HTTP_CODE" "200" "DELETE first cap check to make room for trim test"
CHECK_IDS=("${CHECK_IDS[@]:1}")

http_json POST "${API}/api/checks" "$TOKEN" \
  '{"name":"Trim Test","intervalSeconds":3600,"graceSeconds":0}'
assert_status "$HTTP_CODE" "201" "POST trim test check"
TRIM_CHECK_ID=$(echo "$HTTP_BODY" | jq -r '.id')
TRIM_CHECK_UUID=$(echo "$HTTP_BODY" | jq -r '.uuid')
[[ "$TRIM_CHECK_ID" != "null" && -n "$TRIM_CHECK_ID" ]] || fail "trim test check missing id"

for _ in $(seq 1 101); do
  http_json GET "${API}/ping/${TRIM_CHECK_UUID}" ""
  assert_status "$HTTP_CODE" "200" "GET /ping/:uuid"
done
pass "Sent 101 pings"

step "5. Ping log API returns at most 100 entries"
http_json GET "${API}/api/checks/${TRIM_CHECK_ID}/ping-logs?limit=200" "$TOKEN"
assert_status "$HTTP_CODE" "200" "GET /api/checks/:id/ping-logs"
LOG_COUNT=$(echo "$HTTP_BODY" | jq '.logs | length')
RETENTION=$(echo "$HTTP_BODY" | jq -r '.retentionLimit')
[[ "$LOG_COUNT" -le 100 ]] || fail "expected at most 100 logs, got ${LOG_COUNT}"
[[ "$RETENTION" == "100" ]] || fail "expected retentionLimit 100, got ${RETENTION}"
pass "Ping logs capped at ${LOG_COUNT} (retention limit ${RETENTION})"

echo ""
echo "All limits E2E steps passed."
