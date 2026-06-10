#!/bin/bash

# Read the service file to get the original code
original_code=$(cat HRM-main/src/main/java/com/knoweb/HRM/service/AttendanceService.java)

# Prepare the modifications
fix_code='''
    public List<Attendance> markBulkAttendance(List<Attendance> attendanceList) {
        if (attendanceList == null || attendanceList.isEmpty()) {
            throw new IllegalArgumentException("Attendance list cannot be empty");
        }

        List<Attendance> validatedList = new ArrayList<>();
        for (Attendance attendance : attendanceList) {
            if (attendance != null) {
                validateAttendanceJoinDate(attendance);
                validatedList.add(attendance);
            }
        }

        return attendanceRepository.saveAll(validatedList);
    }
'''

# Replace the original method with the corrected one
new_code=$(awk '
BEGIN {
  in_method=0
}
/public List<Attendance> markBulkAttendance\(List<Attendance> attendanceList\) \{/ {
  in_method=1
  print "    public List<Attendance> markBulkAttendance(List<Attendance> attendanceList) {"
  print "        if (attendanceList == null || attendanceList.isEmpty()) {"
  print "            throw new IllegalArgumentException(\"Attendance list cannot be empty\");"
  print "        }"
  print ""
  print "        List<Attendance> validatedList = new ArrayList<>();"
  print "        for (Attendance attendance : attendanceList) {"
  print "            if (attendance != null) {"
  print "                validateAttendanceJoinDate(attendance);"
  print "                validatedList.add(attendance);"
  print "            }"
  print "        }"
  print ""
  print "        return attendanceRepository.saveAll(validatedList);"
  print "    }"
  next
}
/return attendanceRepository.saveAll\(validatedList\);/ {
  if (in_method) {
    in_method=0
    next
  }
}
{ if (!in_method) print $0 }
' HRM-main/src/main/java/com/knoweb/HRM/service/AttendanceService.java)

# Write the corrected code back to the file
echo "$new_code" > HRM-main/src/main/java/com/knoweb/HRM/service/AttendanceService.java

