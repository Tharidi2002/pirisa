package com.knoweb.HRM.dto;

import java.time.LocalDate;

public class LeavePlanBalanceDTO {
    private String leaveType;
    private int available;
    private int taken;
    private int remaining;
    private LocalDate calculatedOn;

    public LeavePlanBalanceDTO(String leaveType, int available, int taken, int remaining, LocalDate calculatedOn) {
        this.leaveType = leaveType;
        this.available = available;
        this.taken = taken;
        this.remaining = remaining;
        this.calculatedOn = calculatedOn;
    }

    // Getters and setters

    public String getLeaveType() {
        return leaveType;
    }

    public void setLeaveType(String leaveType) {
        this.leaveType = leaveType;
    }

    public int getAvailable() {
        return available;
    }

    public void setAvailable(int available) {
        this.available = available;
    }

    public int getTaken() {
        return taken;
    }

    public void setTaken(int taken) {
        this.taken = taken;
    }

    public int getRemaining() {
        return remaining;
    }

    public void setRemaining(int remaining) {
        this.remaining = remaining;
    }

    public LocalDate getCalculatedOn() {
        return calculatedOn;
    }

    public void setCalculatedOn(LocalDate calculatedOn) {
        this.calculatedOn = calculatedOn;
    }
}
