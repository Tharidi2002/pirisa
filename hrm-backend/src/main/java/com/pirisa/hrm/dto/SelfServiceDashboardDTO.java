package com.pirisa.hrm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SelfServiceDashboardDTO {
    private String employeeName;
    private String employeeId;
    private String designation;
    private String department;
    private String todayStatus; // "PRESENT", "ABSENT", "LEAVE", "NOT_MARKED"
    private String clockInTime;
    private String clockOutTime;
    private double totalHoursToday;
    private int leaveBalanceTotal;
    private int pendingRequests;
    private List<RecentPayslip> recentPayslips;
    private List<UpcomingLeave> upcomingLeaves;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentPayslip {
        private Long id;
        private String month;
        private int year;
        private double netSalary;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpcomingLeave {
        private Long id;
        private String leaveType;
        private String startDate;
        private String endDate;
        private int days;
        private String status;
    }
}