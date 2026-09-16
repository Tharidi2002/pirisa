package com.pirisa.hrm.service;

import com.pirisa.hrm.dto.*;
import com.pirisa.hrm.model.*;
import com.pirisa.hrm.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EmployeeSelfServiceService {

    private static final Logger logger = LoggerFactory.getLogger(EmployeeSelfServiceService.class);

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private PayroleRepository payroleRepository;

    @Autowired
    private CompanyLeaveRepository companyLeaveRepository;

    @Autowired
    private EmployeeLeaveRepository employeeLeaveRepository;

    @Autowired
    private MissingPunchRequestRepository missingPunchRequestRepository;

    @Autowired
    private DocumentRepository documentRepository;

    /**
     * Get comprehensive dashboard data for employee self-service
     */
    @Transactional(readOnly = true)
    public SelfServiceDashboardDTO getDashboard(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        SelfServiceDashboardDTO dashboard = new SelfServiceDashboardDTO();

        // Basic info
        dashboard.setEmployeeName(employee.getFirstName() + " " + employee.getLastName());
        dashboard.setEmployeeId(employee.getEpfNo());
        if (employee.getDesignation() != null) {
            dashboard.setDesignation(employee.getDesignation().getDesignation());
        }
        if (employee.getDepartment() != null) {
            dashboard.setDepartment(employee.getDepartment().getDptName());
        }

        // Today's attendance
        LocalDate today = LocalDate.now();
        Optional<Attendance> todayAttendance = attendanceRepository
                .findByEmpIdAndAttendanceDate(employeeId, today);

        if (todayAttendance.isPresent()) {
            Attendance att = todayAttendance.get();
            String status = att.getAttendance_status() != null
                    ? att.getAttendance_status().toUpperCase()
                    : "PRESENT";
            dashboard.setTodayStatus(status);

            if (att.getStartedAt() != null) {
                dashboard.setClockInTime(att.getStartedAt().format(DateTimeFormatter.ofPattern("HH:mm")));
            }
            if (att.getEndedAt() != null) {
                dashboard.setClockOutTime(att.getEndedAt().format(DateTimeFormatter.ofPattern("HH:mm")));
            }
            dashboard.setTotalHoursToday(att.getTotalTime() / 60.0);
        } else {
            dashboard.setTodayStatus("NOT_MARKED");
            dashboard.setTotalHoursToday(0);
        }

        // Leave balance summary
        List<CompanyLeave> companyLeaves = companyLeaveRepository.findByCmpId(employee.getCmpId());
        List<EmployeeLeave> approvedLeaves = employeeLeaveRepository
                .findByEmpIdAndLeaveStatus(employeeId, "APPROVED");

        int totalRemaining = 0;
        for (CompanyLeave cl : companyLeaves) {
            final String leaveType = cl.getLeaveType();
            int taken = approvedLeaves.stream()
                    .filter(l -> leaveType.equalsIgnoreCase(l.getLeaveType()))
                    .mapToInt(EmployeeLeave::getLeaveDays)
                    .sum();
            totalRemaining += Math.max(0, cl.getAmount() - taken);
        }
        dashboard.setLeaveBalanceTotal(totalRemaining);

        // Recent payslips (last 3)
        List<Payrole> payslips = payroleRepository.findEmployeeById(employeeId);
        List<SelfServiceDashboardDTO.RecentPayslip> recentPayslips = payslips.stream()
                .sorted(Comparator.comparing(Payrole::getYear).reversed()
                        .thenComparing(Payrole::getMonth, Comparator.reverseOrder()))
                .limit(3)
                .map(p -> new SelfServiceDashboardDTO.RecentPayslip(
                        p.getId(), p.getMonth(), p.getYear(), p.getNetSalary()))
                .collect(Collectors.toList());
        dashboard.setRecentPayslips(recentPayslips);

        // Upcoming leaves
        List<SelfServiceDashboardDTO.UpcomingLeave> upcomingLeaves = approvedLeaves.stream()
                .filter(l -> l.getLeaveStartDay() != null
                        && !l.getLeaveStartDay().isBefore(LocalDateTime.now()))
                .sorted(Comparator.comparing(EmployeeLeave::getLeaveStartDay))
                .limit(5)
                .map(l -> new SelfServiceDashboardDTO.UpcomingLeave(
                        l.getId(),
                        l.getLeaveType(),
                        l.getLeaveStartDay().toLocalDate().toString(),
                        l.getLeaveEndDay().toLocalDate().toString(),
                        l.getLeaveDays(),
                        l.getLeaveStatus()))
                .collect(Collectors.toList());
        dashboard.setUpcomingLeaves(upcomingLeaves);

        // Pending requests count
        long pendingMissingPunches = missingPunchRequestRepository
                .findByEmployeeIdOrderByCreatedAtDesc(employeeId).stream()
                .filter(r -> "PENDING".equals(r.getStatus()))
                .count();
        dashboard.setPendingRequests((int) pendingMissingPunches);

        return dashboard;
    }

    /**
     * Get self profile
     */
    @Transactional(readOnly = true)
    public EmployeeSelfProfileDTO getSelfProfile(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        EmployeeSelfProfileDTO dto = new EmployeeSelfProfileDTO();
        dto.setId(employee.getId());
        dto.setEpfNo(employee.getEpfNo());
        dto.setEmpNo(employee.getEmpNo());
        dto.setFirstName(employee.getFirstName());
        dto.setLastName(employee.getLastName());
        dto.setEmail(employee.getEmail());
        dto.setPhone(employee.getPhone());
        dto.setAddress(employee.getAddress());
        dto.setGender(employee.getGender());
        dto.setDob(employee.getDob());
        dto.setNic(employee.getNic());
        dto.setDateOfJoining(employee.getDateOfJoining());
        dto.setStatus(employee.getStatus());
        dto.setBasicSalary(String.valueOf(employee.getBasicSalary()));

        if (employee.getDepartment() != null) {
            dto.setDepartmentName(employee.getDepartment().getDptName());
        }
        if (employee.getDesignation() != null) {
            dto.setDesignationName(employee.getDesignation().getDesignation());
        }

        // Check profile image
        Optional<Documents> docs = documentRepository.findTopByEmpIdOrderByIdDesc(employeeId);
        dto.setHasProfileImage(docs.isPresent()
                && docs.get().getPhoto() != null
                && docs.get().getPhoto().length > 0);

        return dto;
    }

    /**
     * Update employee self profile (limited fields)
     */
    @Transactional
    public EmployeeSelfProfileDTO updateSelfProfile(Long employeeId, ProfileUpdateRequestDTO request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            employee.setPhone(request.getPhone().trim());
        }
        if (request.getAddress() != null && !request.getAddress().isBlank()) {
            employee.setAddress(request.getAddress().trim());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            Employee existing = employeeRepository.findByEmail(request.getEmail().trim());
            if (existing != null && existing.getId() != employeeId) {
                throw new IllegalArgumentException("Email is already in use by another employee");
            }
            employee.setEmail(request.getEmail().trim());
            employee.setUsername(request.getEmail().trim());
        }

        employeeRepository.save(employee);
        logger.info("Employee {} updated their profile", employeeId);

        return getSelfProfile(employeeId);
    }

    /**
     * Get leave balance summary
     */
    @Transactional(readOnly = true)
    public LeaveBalanceSummaryDTO getLeaveBalance(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        List<CompanyLeave> companyLeaves = companyLeaveRepository.findByCmpId(employee.getCmpId());

        List<EmployeeLeave> approvedLeaves = employeeLeaveRepository
                .findByEmpIdAndLeaveStatus(employeeId, "APPROVED");
        List<EmployeeLeave> pendingLeaves = employeeLeaveRepository
                .findByEmpIdAndLeaveStatus(employeeId, "PENDING");

        List<LeaveBalanceSummaryDTO.LeaveTypeBalance> balances = new ArrayList<>();

        for (CompanyLeave cl : companyLeaves) {
            final String leaveType = cl.getLeaveType();

            int taken = approvedLeaves.stream()
                    .filter(l -> leaveType.equalsIgnoreCase(l.getLeaveType()))
                    .mapToInt(EmployeeLeave::getLeaveDays)
                    .sum();

            int pending = pendingLeaves.stream()
                    .filter(l -> leaveType.equalsIgnoreCase(l.getLeaveType()))
                    .mapToInt(EmployeeLeave::getLeaveDays)
                    .sum();

            LeaveBalanceSummaryDTO.LeaveTypeBalance balance = new LeaveBalanceSummaryDTO.LeaveTypeBalance();
            balance.setLeaveType(cl.getLeaveType());
            balance.setEntitled(cl.getAmount());
            balance.setTaken(taken);
            balance.setPending(pending);
            balance.setRemaining(Math.max(0, cl.getAmount() - taken - pending));
            balances.add(balance);
        }

        LeaveBalanceSummaryDTO dto = new LeaveBalanceSummaryDTO();
        dto.setEmployeeId(employeeId);
        dto.setEmployeeName(employee.getFirstName() + " " + employee.getLastName());
        dto.setAsOfDate(LocalDate.now().toString());
        dto.setBalances(balances);

        return dto;
    }

    /**
     * Submit missing punch request
     */
    @Transactional
    public MissingPunchRequest submitMissingPunchRequest(Long employeeId, MissingPunchRequestDTO request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        if (request.getAttendanceDate().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot request missing punch for a future date");
        }

        if (request.getAttendanceDate().isBefore(LocalDate.now().minusDays(30))) {
            throw new IllegalArgumentException("Cannot request missing punch for dates older than 30 days");
        }

        if ("CLOCK_IN".equals(request.getPunchType()) || "BOTH".equals(request.getPunchType())) {
            if (request.getRequestedStartedAt() == null) {
                throw new IllegalArgumentException("Start time is required for CLOCK_IN or BOTH punch type");
            }
        }
        if ("CLOCK_OUT".equals(request.getPunchType()) || "BOTH".equals(request.getPunchType())) {
            if (request.getRequestedEndedAt() == null) {
                throw new IllegalArgumentException("End time is required for CLOCK_OUT or BOTH punch type");
            }
        }

        MissingPunchRequest entity = new MissingPunchRequest();
        entity.setEmployeeId(employeeId);
        entity.setAttendanceDate(request.getAttendanceDate());
        entity.setPunchType(request.getPunchType());
        entity.setRequestedStartedAt(request.getRequestedStartedAt());
        entity.setRequestedEndedAt(request.getRequestedEndedAt());
        entity.setReason(request.getReason());
        entity.setStatus("PENDING");

        MissingPunchRequest saved = missingPunchRequestRepository.save(entity);
        logger.info("Employee {} submitted missing punch request {}", employeeId, saved.getId());

        return saved;
    }

    /**
     * Get employee's missing punch requests
     */
    @Transactional(readOnly = true)
    public List<MissingPunchRequest> getMyMissingPunchRequests(Long employeeId) {
        return missingPunchRequestRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId);
    }

    /**
     * Cancel a pending missing punch request
     */
    @Transactional
    public void cancelMissingPunchRequest(Long employeeId, Long requestId) {
        MissingPunchRequest request = missingPunchRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        if (request.getEmployeeId() != employeeId) {
            throw new IllegalArgumentException("You can only cancel your own requests");
        }

        if (!"PENDING".equals(request.getStatus())) {
            throw new IllegalArgumentException("Only pending requests can be cancelled");
        }

        request.setStatus("CANCELLED");
        missingPunchRequestRepository.save(request);
        logger.info("Employee {} cancelled missing punch request {}", employeeId, requestId);
    }

    /**
     * Get employee's payslip list
     */
    @Transactional(readOnly = true)
    public List<Payrole> getMyPayslips(Long employeeId) {
        return payroleRepository.findEmployeeById(employeeId);
    }

    /**
     * Get employee's attendance history (for a specific month/year)
     */
    @Transactional(readOnly = true)
    public List<Attendance> getMyAttendanceHistory(Long employeeId, Integer month, Integer year) {
        List<Attendance> allAttendance = attendanceRepository.findByEmpId(employeeId);

        return allAttendance.stream()
                .filter(a -> a.getAttendanceDate() != null)
                .filter(a -> {
                    if (month != null && a.getAttendanceDate().getMonthValue() != month) return false;
                    if (year != null && a.getAttendanceDate().getYear() != year) return false;
                    return true;
                })
                .sorted(Comparator.comparing(Attendance::getAttendanceDate).reversed())
                .collect(Collectors.toList());
    }
}