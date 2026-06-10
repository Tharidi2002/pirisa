#!/bin/bash

emp_id=$1

statuses=("PRESENT" "WORK_FROM_HOME" "LEAVE" "HALF_DAY")
start_date=$(date -d '60 days ago' +%Y-%m-%d)

json_objects=()

for i in {0..59}; do
  current_date=$(date -d "$start_date + $i days" +%Y-%m-%d)
  
  weekday=$(date -d "$current_date" +%u)
  
  status=""
  if [ $weekday -ge 6 ]; then
      if [ $(shuf -i 1-2 -n 1) -eq 1 ]; then
          status="WEEKEND_WORK"
      fi
  else
      status=${statuses[$(shuf -i 0-3 -n 1)]}
  fi
  
  if [ -n "$status" ]; then
    started_at="${current_date}T09:00:00"
    ended_at="${current_date}T17:00:00"
    if [ "$status" == "HALF_DAY" ]; then
      ended_at="${current_date}T13:00:00"
    fi

    json_objects+=("{\"empId\": $emp_id, \"attendanceDate\": \"$current_date\", \"startedAt\": \"$started_at\", \"endedAt\": \"$ended_at\", \"working_status\": \"$status\", \"departureNotes\": \"$status day for employee $emp_id\"}")
  fi
done

printf -v json_array '[%s]' "$(IFS=,; echo "${json_objects[*]}")" 
echo "$json_array" > attendance_data.json
