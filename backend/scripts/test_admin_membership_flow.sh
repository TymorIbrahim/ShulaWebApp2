#!/bin/bash
# Usage: ./test_admin_membership_flow.sh <API_BASE> <ADMIN_EMAIL> <ADMIN_PW>
# Example: ./test_admin_membership_flow.sh http://localhost:5002/api einat@shula.com test123

set -euo pipefail

if [ "$#" -ne 3 ]; then
  echo "Usage: $0 <API_BASE> <ADMIN_EMAIL> <ADMIN_PW>"; exit 1; fi

API=$1
ADMIN_EMAIL=$2
ADMIN_PW=$3

check() { if [ "$1" -ne 0 ]; then echo "❌ $2"; exit 1; else echo "✅ $2"; fi }
need() { command -v "$1" >/dev/null 2>&1 || { echo "Install $1 first"; exit 1; }; }

need curl; need jq

echo "--- 1) Login as admin"
LOGIN=$(curl -s -X POST "$API/auth/login" -H 'Content-Type: application/json' -d '{"email":"'$ADMIN_EMAIL'","password":"'$ADMIN_PW'"}')
TOKEN=$(echo "$LOGIN" | jq -r .token)
[ "$TOKEN" = null ] && { echo "❌ Login failed"; echo "$LOGIN"; exit 1; }
echo "✅ Logged-in (token acquired)"
HDR=(-H "Authorization: Bearer $TOKEN")

echo "--- 2) List users & pick first"
LIST=$(curl -s "${API}/users?limit=1" "${HDR[@]}")
USER_ID=$(echo "$LIST" | jq -r '.users[0]._id')
[ "$USER_ID" = null ] && { echo "❌ No users found"; exit 1; }
echo "Using USER_ID=$USER_ID"

echo "--- 3) Promote user to staff"
curl -s -X PUT "${API}/users/$USER_ID" "${HDR[@]}" -H 'Content-Type: application/json' -d '{"role":"staff"}' | jq -e '.message' >/dev/null
check $? "Role updated to staff"

echo "--- 4) Process membership via checkout (contract+ID)"
MEM=$(curl -s -X PUT "${API}/users/membership/process-checkout" "${HDR[@]}" -H 'Content-Type: application/json' -d '{"contract":{"signed":true,"signatureData":"base64","agreementVersion":"1.0"},"idUpload":{"uploaded":true,"fileUrl":"https://static.wixstatic.com/media/68a62c_b6f514eea26043c985dd7487ca3a"}}')
echo "$MEM" | jq -e '.message' >/dev/null
check $? "Checkout membership processed"

echo "--- 5) Admin verifies ID"
VERIFY=$(curl -s -X PUT "${API}/users/membership/verify-id" "${HDR[@]}" -H 'Content-Type: application/json' -d '{"userId":"'$USER_ID'","verified":true,"notes":"auto-test"}')
echo "$VERIFY" | jq -e '.message' >/dev/null
check $? "ID verification approved"

echo "--- 6) Manual in-person membership processing (should return already member)"
MAN=$(curl -s -X PUT "${API}/users/membership/admin-process" "${HDR[@]}" -H 'Content-Type: application/json' -d '{"userId":"'$USER_ID'","inPersonDetails":{"location":"Office"}}')
echo "$MAN" | jq -e '.message' >/dev/null
check $? "Manual processing path runs"

echo "--- 7) Fetch membership details"
DETAIL=$(curl -s "${API}/users/membership/$USER_ID" "${HDR[@]}")
IS_MEMBER=$(echo "$DETAIL" | jq -r '.user.membership.isMember')
[ "$IS_MEMBER" = true ] && echo "✅ Membership confirmed" || { echo "❌ Membership flag false"; exit 1; }

echo "--- All admin membership tests passed ---" 