package com.pirisa.hrm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveBalanceSummaryDTO {
    private Long employeeId;
    private String employeeName;
    private String asOfDate;
    private List<LeaveTypeBalance> balances;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LeaveTypeBalance {
        private String leaveType;
        private int entitled;
        private int taken;
        private int pending;
        private int remaining;
    }
}