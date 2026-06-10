import json
import random
from datetime import date, timedelta

today = date.today()
two_months_ago = today - timedelta(days=60)

attendance_list = []
employee_ids = range(1, 13)
statuses = ["PRESENT", "WORK_FROM_HOME", "LEAVE", "HALF_DAY"]

for n in range(60):
    single_date = two_months_ago + timedelta(n)
    for emp_id in employee_ids:
        # 50% chance of having a record on weekends
        if single_date.weekday() >= 5 and random.random() < 0.5:
            status = "WEEKEND_WORK"
        elif single_date.weekday() < 5:
            status = random.choice(statuses)
        else:
            continue

        started_at = "09:00"
        ended_at = "17:00"
        if status == "HALF_DAY":
            ended_at = "13:00"
        
        attendance_list.append({
            "empId": emp_id,
            "attendanceDate": single_date.strftime("%Y-%m-%d"),
            "status": status,
            "startedAt": started_at,
            "endedAt": ended_at,
            "notes": f"{status} day for employee {emp_id}"
        })

with open("attendance_data.json", "w") as f:
    json.dump(attendance_list, f)
