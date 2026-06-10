#!/bin/bash

for emp_id in {1..12}; do
  bash generate_attendance.sh $emp_id
  TOKEN=$(jq -r '.details.token' response.txt)
  curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d @attendance_data.json http://localhost:8080/api/attendance/bulk-mark
done
