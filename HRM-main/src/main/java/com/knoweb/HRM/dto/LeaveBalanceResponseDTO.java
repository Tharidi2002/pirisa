package com.knoweb.HRM.dto;

import java.time.LocalDate;
import java.util.List;

public class LeaveBalanceResponseDTO {
    private int resultCode;
    private String resultDesc;
    private Long empId;
    private Long cmpId;
    private String asOfMode;
    private LocalDate asOfDate;
    private LocalDate lastLeaveCalculationDate;
    private List<LeavePlanBalanceDTO> planBalances;

    public LeaveBalanceResponseDTO(int resultCode, String resultDesc, Long empId, Long cmpId, String asOfMode, LocalDate asOfDate, LocalDate lastLeaveCalculationDate, List<LeavePlanBalanceDTO> planBalances) {
        this.resultCode = resultCode;
        this.resultDesc = resultDesc;
        this.empId = empId;
        this.cmpId = cmpId;
        this.asOfMode = asOfMode;
        this.asOfDate = asOfDate;
        this.lastLeaveCalculationDate = lastLeaveCalculationDate;
        this.planBalances = planBalances;
    }

    // Getters and setters
    public int getResultCode() {
        return resultCode;
    }

    public void setResultCode(int resultCode) {
        this.resultCode = resultCode;
    }

    public String getResultDesc() {
        return resultDesc;
    }

    public void setResultDesc(String resultDesc) {
        this.resultDesc = resultDesc;
    }

    public Long getEmpId() {
        return empId;
    }

    public void setEmpId(Long empId) {
        this.empId = empId;
    }

    public Long getCmpId() {
        return cmpId;
    }

    public void setCmpId(Long cmpId) {
        this.cmpId = cmpId;
    }

    public String getAsOfMode() {
        return asOfMode;
    }

    public void setAsOfMode(String asOfMode) {
        this.asOfMode = asOfMode;
    }

    public LocalDate getAsOfDate() {
        return asOfDate;
    }

    public void setAsOfDate(LocalDate asOfDate) {
        this.asOfDate = asOfDate;
    }

    public LocalDate getLastLeaveCalculationDate() {
        return lastLeaveCalculationDate;
    }

    public void setLastLeaveCalculationDate(LocalDate lastLeaveCalculationDate) {
        this.lastLeaveCalculationDate = lastLeaveCalculationDate;
    }

    public List<LeavePlanBalanceDTO> getPlanBalances() {
        return planBalances;
    }

    public void setPlanBalances(List<LeavePlanBalanceDTO> planBalances) {
        this.planBalances = planBalances;
    }
}
