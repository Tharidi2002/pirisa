#!/bin/bash

TOKEN=$(jq -r '.details.token' response.txt)
YESTERDAY=$(date -d "yesterday" '+%Y-%m-%d')
STARTED_AT="${YESTERDAY}T09:00:00"
ENDED_AT="${YESTERDAY}T17:00:00"

# Note the [ and ] to make it a list of one
JSON_PAYLOAD="[{\"empId\": 1, \"attendanceDate\": \"$YESTERDAY\", \"startedAt\": \"$STARTED_AT\", \"endedAt\": \"$ENDED_AT\", \"working_status\": \"PRESENT\", \"departureNotes\": \"Test attendance\"}]"

curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "$JSON_PAYLOAD" http://localhost:8080/api/attendance/bulk-mark
