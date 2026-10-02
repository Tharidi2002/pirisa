package com.pirisa.hrm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
public class CompanyDashboardSummaryDTO {
    private long totalEmployees;
    private long activeEmployees;
    private long presentToday;
    private long pendingLeaves;
    private long newHiresThisMonth;
    private List<DepartmentHeadcount> departmentHeadcount = new ArrayList<>();
    private List<RecentActivity> recentActivity = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentHeadcount {
        private String department;
        private long count;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivity {
        private String id;
        private String type;
        private String title;
        private String description;
        private LocalDateTime occurredAt;
        private boolean hasTime;
    }
}