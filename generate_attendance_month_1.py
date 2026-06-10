'''
import json
import random
from datetime import date, timedelta

today = date.today()
start_date = today - timedelta(days=60)

attendance_list = []
employee_ids = range(1, 13)
statuses = ["PRESENT", "WORK_FROM_HOME", "LEAVE", "HALF_DAY"]

for n in range(30):
    single_date = start_date + timedelta(n)
    for emp_id in employee_ids:
        if single_date.weekday() >= 5 and random.random() < 0.5:
            status = "WEEKEND_WORK"
        elif single_date.weekday() < 5:
            status = random.choice(statuses)
        else:
            continue

        started_at = f"{single_date.strftime('%Y-%m-%d')}T09:00:00"
        ended_at = f"{single_date.strftime('%Y-%m-%d')}T17:00:00"
        if status == "HALF_DAY":
            ended_at = f"{single_date.strftime('%Y-%m-%d')}T13:00:00"

        attendance_list.append({
            "empId": emp_id,
            "attendanceDate": single_date.strftime("%Y-%m-%d"),
            "startedAt": started_at,
            "endedAt": ended_at,
            "working_status": status,
            "departureNotes": f"{status} day for employee {emp_id}"
        })

with open("attendance_data_month_1.json", "w") as f:
    json.dump(attendance_list, f)
'''