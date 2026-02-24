package com.knoweb.HRM.service;

import com.knoweb.HRM.config.SecurityConfig;
import com.knoweb.HRM.dto.*;
import com.knoweb.HRM.model.Attendance;
import com.knoweb.HRM.model.Employee;
import com.knoweb.HRM.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private SecurityConfig securityConfig;

    public Employee createEmployee(Employee emp) {
        emp.setUsername(emp.getEmail());
        String tempPwd = new SecureRandom()
                .ints(12, 0, 36)
                .mapToObj(i -> "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                        .charAt(i))
                .map(Object::toString)
                .collect(Collectors.joining());

        emp.setPassword(passwordEncoder.encode(tempPwd));
        emp.setMustReset(true);

        Employee saved = employeeRepository.save(emp);

        String subject = "Your HRM Account Details";
        String body = String.format(
                "Hello %s,\n\n" +
                        "Your account has been created. Please log in with this temporary password:\n\n" +
                        "    %s\n\n" +
                        "For security, you will be prompted to choose a new password on first login.\n\n" +
                        "— The HRM Team",
                emp.getFirstName(), tempPwd
        );
        emailService.sendEmail(emp.getEmail(), subject, body);

        return saved;
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Employee getEmployeeById(long id) {
        return employeeRepository.findById(id).orElse(null);
    }

    public List<Employee> getEmployeesByCompanyId(long cmpId) {
        return employeeRepository.findByCompanyId(cmpId);
    }

    public void deleteEmployee(Long emp_id) {
        employeeRepository.deleteById(emp_id);
    }

    public List<AttendanceEmployeeDTO> getAttendanceByCompanyId(long cmpId) {
        List<Employee> employees = employeeRepository.findByCompanyId(cmpId);

        return employees.stream().map(employee -> new AttendanceEmployeeDTO(
                employee.getId(),
                employee.getEpfNo(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getBasicSalary(),
                employee.getEmail(),
                employee.getGender(),
                employee.getPhone(),
                employee.getAddress(),
                employee.getDateOfJoining(),
                employee.getNic(),
                employee.getDob(),
                employee.getStatus(),
                employee.getAttendanceList().stream().map(attendance -> new AttendanceDTO(
                        attendance.getId(),
                        attendance.getStartedAt(),
                        attendance.getEndedAt(),
                        attendance.getWorkingStatus(),
                        attendance.getAttendanceStatus(),
                        attendance.getTotalTime(),
                        attendance.getDayName()
                )).collect(Collectors.toList()),
                new EmpDetailsDepartmentDTO(
                        (employee.getDepartment() != null) ? employee.getDepartment().getId() : null,
                        (employee.getDepartment() != null) ? employee.getDepartment().getDptName() : null,
                        (employee.getDepartment() != null) ? employee.getDepartment().getDptCode() : null,
                        (employee.getDepartment() != null) ? employee.getDepartment().getDptDesc() : null
                ),
                new EmpDetailsDocumentsDTO(
                        (employee.getDocuments() != null) ? employee.getDocuments().getPhoto() : null
                )
        )).collect(Collectors.toList());
    }

    public List<PayroleEmployeeDTO> getPayroleByCompanyId(long cmpId) {
        List<Employee> employees = employeeRepository.findByCompanyId(cmpId);

        return employees.stream().map(employee -> new PayroleEmployeeDTO(
                employee.getId(),
                employee.getEpfNo(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getBasicSalary(),
                employee.getEmail(),
                employee.getGender(),
                employee.getPhone(),
                employee.getAddress(),
                employee.getDateOfJoining(),
                employee.getNic(),
                employee.getDob(),
                employee.getStatus(),
                employee.getPayroleList().stream().map(payrole -> new PayroleDTO(
                        payrole.getId(),
                        payrole.getYear(),
                        payrole.getMonth(),
                        payrole.getAllowance(),
                        payrole.getOvertimePay(),
                        payrole.getBonusPay(),
                        payrole.getAppit(),
                        payrole.getLoan(),
                        payrole.getOtherDeductions(),
                        payrole.getEpf8(),
                        payrole.getTotalEarnings(),
                        payrole.getTotalDeductions(),
                        payrole.getNetSalary(),
                        payrole.getBasicSalary()
                )).collect(Collectors.toList())
        )).collect(Collectors.toList());
    }

    public List<PayroleEmployeeDTO> getPayroleByEmployeeId(long empId) {
        Optional<Employee> employeeOpt = employeeRepository.findById(empId);
        List<Employee> employees = employeeOpt.map(Collections::singletonList).orElse(Collections.emptyList());

        return employees.stream().map(employee -> new PayroleEmployeeDTO(
                employee.getId(),
                employee.getEpfNo(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getBasicSalary(),
                employee.getEmail(),
                employee.getGender(),
                employee.getPhone(),
                employee.getAddress(),
                employee.getDateOfJoining(),
                employee.getNic(),
                employee.getDob(),
                employee.getStatus(),
                employee.getPayroleList().stream().map(payrole -> new PayroleDTO(
                        payrole.getId(),
                        payrole.getYear(),
                        payrole.getMonth(),
                        payrole.getAllowance(),
                        payrole.getOvertimePay(),
                        payrole.getBonusPay(),
                        payrole.getAppit(),
                        payrole.getLoan(),
                        payrole.getOtherDeductions(),
                        payrole.getEpf8(),
                        payrole.getTotalEarnings(),
                        payrole.getTotalDeductions(),
                        payrole.getNetSalary(),
                        payrole.getBasicSalary()
                )).collect(Collectors.toList())
        )).collect(Collectors.toList());
    }

    public List<EmpDetailsDTO> getEmpDetailsByCompanyId(long cmpId) {
        List<Employee> employees = employeeRepository.findByCompanyId(cmpId);
        return employees.stream().map(employee -> {
            List<EmpDetailsLeaveDTO> leaveList = employee.getEmployeeLeaves() != null
                    ? employee.getEmployeeLeaves().stream().map(leave -> new EmpDetailsLeaveDTO(
                    leave.getId(),
                    leave.getLeaveType(),
                    leave.getLeaveReason(),
                    leave.getLeaveStatus(),
                    leave.getLeaveStartDay(),
                    leave.getLeaveEndDay(),
                    leave.getLeaveDays()
            )).collect(Collectors.toList())
                    : Collections.emptyList();

            return new EmpDetailsDTO(
                    employee.getId(),
                    employee.getEpfNo(),
                    employee.getFirstName(),
                    employee.getLastName(),
                    employee.getBasicSalary(),
                    employee.getEmail(),
                    employee.getGender(),
                    employee.getPhone(),
                    employee.getAddress(),
                    employee.getDateOfJoining(),
                    employee.getNic(),
                    employee.getDob(),
                    employee.getStatus(),
                    new EmpDetailsDepartmentDTO(
                            employee.getDepartment() != null ? employee.getDepartment().getId() : null,
                            employee.getDepartment() != null ? employee.getDepartment().getDptName() : null,
                            employee.getDepartment() != null ? employee.getDepartment().getDptCode() : null,
                            employee.getDepartment() != null ? employee.getDepartment().getDptDesc() : null
                    ),
                    new EmpDetailsDesignationDTO(
                            employee.getDesignation() != null ? employee.getDesignation().getId() : null,
                            employee.getDesignation() != null ? employee.getDesignation().getDesignationName() : null
                    ),
                    new EmpDetailsDocumentsDTO(
                            employee.getDocuments() != null ? employee.getDocuments().getPhoto() : null
                    ),
                    leaveList
            );
        }).collect(Collectors.toList());
    }

    public List<EmpDetailsDTO> getEmpDetailsByEmpId(long empId) {
        Optional<Employee> employeeOpt = employeeRepository.findById(empId);
        List<Employee> employees = employeeOpt.map(Collections::singletonList).orElse(Collections.emptyList());

        return employees.stream().map(employee -> {
            List<EmpDetailsLeaveDTO> leaveList = employee.getEmployeeLeaves() != null
                    ? employee.getEmployeeLeaves().stream().map(leave -> new EmpDetailsLeaveDTO(
                    leave.getId(),
                    leave.getLeaveType(),
                    leave.getLeaveReason(),
                    leave.getLeaveStatus(),
                    leave.getLeaveStartDay(),
                    leave.getLeaveEndDay(),
                    leave.getLeaveDays()
            )).collect(Collectors.toList())
                    : Collections.emptyList();

            return new EmpDetailsDTO(
                    employee.getId(),
                    employee.getEpfNo(),
                    employee.getFirstName(),
                    employee.getLastName(),
                    employee.getBasicSalary(),
                    employee.getEmail(),
                    employee.getGender(),
                    employee.getPhone(),
                    employee.getAddress(),
                    employee.getDateOfJoining(),
                    employee.getNic(),
                    employee.getDob(),
                    employee.getStatus(),
                    new EmpDetailsDepartmentDTO(
                            employee.getDepartment() != null ? employee.getDepartment().getId() : null,
                            employee.getDepartment() != null ? employee.getDepartment().getDptName() : null,
                            employee.getDepartment() != null ? employee.getDepartment().getDptCode() : null,
                            employee.getDepartment() != null ? employee.getDepartment().getDptDesc() : null
                    ),
                    new EmpDetailsDesignationDTO(
                            employee.getDesignation() != null ? employee.getDesignation().getId() : null,
                            employee.getDesignation() != null ? employee.getDesignation().getDesignationName() : null
                    ),
                    new EmpDetailsDocumentsDTO(
                            employee.getDocuments() != null ? employee.getDocuments().getPhoto() : null
                    ),
                    leaveList
            );
        }).collect(Collectors.toList());
    }

    public List<EmpDetailsDTO> getPendingEmpDetailsByCompanyId(long cmpId) {
        List<Employee> employees = employeeRepository.findByCompanyId(cmpId);
        return employees.stream()
                .filter(employee -> employee.getEmployeeLeaves() != null &&
                        employee.getEmployeeLeaves().stream().anyMatch(leave -> "PENDING".equals(leave.getLeaveStatus())))
                .map(employee -> {
                    List<EmpDetailsLeaveDTO> leaveList = employee.getEmployeeLeaves().stream()
                            .filter(leave -> "PENDING".equals(leave.getLeaveStatus()))
                            .map(leave -> new EmpDetailsLeaveDTO(
                                    leave.getId(),
                                    leave.getLeaveType(),
                                    leave.getLeaveReason(),
                                    leave.getLeaveStatus(),
                                    leave.getLeaveStartDay(),
                                    leave.getLeaveEndDay(),
                                    leave.getLeaveDays()
                            ))
                            .collect(Collectors.toList());

                    return new EmpDetailsDTO(
                            employee.getId(),
                            employee.getEpfNo(),
                            employee.getFirstName(),
                            employee.getLastName(),
                            employee.getBasicSalary(),
                            employee.getEmail(),
                            employee.getGender(),
                            employee.getPhone(),
                            employee.getAddress(),
                            employee.getDateOfJoining(),
                            employee.getNic(),
                            employee.getDob(),
                            employee.getStatus(),
                            new EmpDetailsDepartmentDTO(
                                    employee.getDepartment() != null ? employee.getDepartment().getId() : null,
                                    employee.getDepartment() != null ? employee.getDepartment().getDptName() : null,
                                    employee.getDepartment() != null ? employee.getDepartment().getDptCode() : null,
                                    employee.getDepartment() != null ? employee.getDepartment().getDptDesc() : null
                            ),
                            new EmpDetailsDesignationDTO(
                                    employee.getDesignation() != null ? employee.getDesignation().getId() : null,
                                    employee.getDesignation() != null ? employee.getDesignation().getDesignationName() : null
                            ),
                            new EmpDetailsDocumentsDTO(
                                    employee.getDocuments() != null ? employee.getDocuments().getPhoto() : null
                            ),
                            leaveList
                    );
                }).collect(Collectors.toList());
    }

    public List<EmpDetailsDTO> getApprovedEmpDetailsByCompanyId(long cmpId) {
        List<Employee> employees = employeeRepository.findByCompanyId(cmpId);
        return employees.stream()
                .filter(employee -> employee.getEmployeeLeaves() != null &&
                        employee.getEmployeeLeaves().stream().anyMatch(leave -> "APPROVED".equals(leave.getLeaveStatus())))
                .map(employee -> {
                    List<EmpDetailsLeaveDTO> leaveList = employee.getEmployeeLeaves().stream()
                            .filter(leave -> "APPROVED".equals(leave.getLeaveStatus()))
                            .map(leave -> new EmpDetailsLeaveDTO(
                                    leave.getId(),
                                    leave.getLeaveType(),
                                    leave.getLeaveReason(),
                                    leave.getLeaveStatus(),
                                    leave.getLeaveStartDay(),
                                    leave.getLeaveEndDay(),
                                    leave.getLeaveDays()
                            ))
                            .collect(Collectors.toList());

                    return new EmpDetailsDTO(
                            employee.getId(),
                            employee.getEpfNo(),
                            employee.getFirstName(),
                            employee.getLastName(),
                            employee.getBasicSalary(),
                            employee.getEmail(),
                            employee.getGender(),
                            employee.getPhone(),
                            employee.getAddress(),
                            employee.getDateOfJoining(),
                            employee.getNic(),
                            employee.getDob(),
                            employee.getStatus(),
                            new EmpDetailsDepartmentDTO(
                                    employee.getDepartment() != null ? employee.getDepartment().getId() : null,
                                    employee.getDepartment() != null ? employee.getDepartment().getDptName() : null,
                                    employee.getDepartment() != null ? employee.getDepartment().getDptCode() : null,
                                    employee.getDepartment() != null ? employee.getDepartment().getDptDesc() : null
                            ),
                            new EmpDetailsDesignationDTO(
                                    employee.getDesignation() != null ? employee.getDesignation().getId() : null,
                                    employee.getDesignation() != null ? employee.getDesignation().getDesignationName() : null
                            ),
                            new EmpDetailsDocumentsDTO(
                                    employee.getDocuments() != null ? employee.getDocuments().getPhoto() : null
                            ),
                            leaveList
                    );
                }).collect(Collectors.toList());
    }

    public List<EmpDetailsDTO> getRejectedEmpDetailsByCompanyId(long cmpId) {
        List<Employee> employees = employeeRepository.findByCompanyId(cmpId);
        return employees.stream()
                .filter(employee -> employee.getEmployeeLeaves() != null &&
                        employee.getEmployeeLeaves().stream().anyMatch(leave -> "REJECTED".equals(leave.getLeaveStatus())))
                .map(employee -> {
                    List<EmpDetailsLeaveDTO> leaveList = employee.getEmployeeLeaves().stream()
                            .filter(leave -> "REJECTED".equals(leave.getLeaveStatus()))
                            .map(leave -> new EmpDetailsLeaveDTO(
                                    leave.getId(),
                                    leave.getLeaveType(),
                                    leave.getLeaveReason(),
                                    leave.getLeaveStatus(),
                                    leave.getLeaveStartDay(),
                                    leave.getLeaveEndDay(),
                                    leave.getLeaveDays()
                            ))
                            .collect(Collectors.toList());

                    return new EmpDetailsDTO(
                            employee.getId(),
                            employee.getEpfNo(),
                            employee.getFirstName(),
                            employee.getLastName(),
                            employee.getBasicSalary(),
                            employee.getEmail(),
                            employee.getGender(),
                            employee.getPhone(),
                            employee.getAddress(),
                            employee.getDateOfJoining(),
                            employee.getNic(),
                            employee.getDob(),
                            employee.getStatus(),
                            new EmpDetailsDepartmentDTO(
                                    employee.getDepartment() != null ? employee.getDepartment().getId() : null,
                                    employee.getDepartment() != null ? employee.getDepartment().getDptName() : null,
                                    employee.getDepartment() != null ? employee.getDepartment().getDptCode() : null,
                                    employee.getDepartment() != null ? employee.getDepartment().getDptDesc() : null
                            ),
                            new EmpDetailsDesignationDTO(
                                    employee.getDesignation() != null ? employee.getDesignation().getId() : null,
                                    employee.getDesignation() != null ? employee.getDesignation().getDesignationName() : null
                            ),
                            new EmpDetailsDocumentsDTO(
                                    employee.getDocuments() != null ? employee.getDocuments().getPhoto() : null
                            ),
                            leaveList
                    );
                }).collect(Collectors.toList());
    }

    public List<AttendanceEmployeeDTO> getLastAttendanceByCompanyId(long cmpId) {
        List<Employee> employees = employeeRepository.findByCompanyId(cmpId);

        return employees.stream().map(employee -> {
            Attendance latestAttendance = employee.getAttendanceList().stream()
                    .max(Comparator.comparing(Attendance::getStartedAt))
                    .orElse(null);

            List<AttendanceDTO> latestAttendanceList = new ArrayList<>();
            if (latestAttendance != null) {
                latestAttendanceList.add(new AttendanceDTO(
                        latestAttendance.getId(),
                        latestAttendance.getStartedAt(),
                        latestAttendance.getEndedAt(),
                        latestAttendance.getWorkingStatus(),
                        latestAttendance.getAttendanceStatus(),
                        latestAttendance.getTotalTime(),
                        latestAttendance.getDayName()
                ));
            }
            EmpDetailsDepartmentDTO departmentDTO = (employee.getDepartment() != null) ?
                    new EmpDetailsDepartmentDTO(
                            employee.getDepartment().getId(),
                            employee.getDepartment().getDptName(),
                            employee.getDepartment().getDptCode(),
                            employee.getDepartment().getDptDesc()
                    ) : null;

            EmpDetailsDocumentsDTO documentDTO = (employee.getDocuments() != null) ?
                    new EmpDetailsDocumentsDTO(
                            employee.getDocuments().getPhoto()) : null;

            return new AttendanceEmployeeDTO(
                    employee.getId(),
                    employee.getEpfNo(),
                    employee.getFirstName(),
                    employee.getLastName(),
                    employee.getBasicSalary(),
                    employee.getEmail(),
                    employee.getGender(),
                    employee.getPhone(),
                    employee.getAddress(),
                    employee.getDateOfJoining(),
                    employee.getNic(),
                    employee.getDob(),
                    employee.getStatus(),
                    latestAttendanceList,
                    departmentDTO,
                    documentDTO
            );
        }).collect(Collectors.toList());
    }

    public List<EmpDetailsDTO> getApprovedEmpDetailsByCompanyIdAndDate(long cmpId, LocalDate date) {
        List<Employee> employees = employeeRepository.findByCompanyId(cmpId);

        return employees.stream()
                .filter(employee -> employee.getEmployeeLeaves() != null &&
                        employee.getEmployeeLeaves().stream().anyMatch(leave ->
                                leave.getLeaveStartDay() != null && leave.getLeaveEndDay() != null &&
                                        !date.isBefore(leave.getLeaveStartDay().toLocalDate()) &&
                                        !date.isAfter(leave.getLeaveEndDay().toLocalDate()) &&
                                        "APPROVED".equalsIgnoreCase(leave.getLeaveStatus())))
                .map(employee -> {
                    List<EmpDetailsLeaveDTO> leaveList = employee.getEmployeeLeaves().stream()
                            .filter(leave -> leave.getLeaveStartDay() != null && leave.getLeaveEndDay() != null &&
                                    !date.isBefore(leave.getLeaveStartDay().toLocalDate()) &&
                                    !date.isAfter(leave.getLeaveEndDay().toLocalDate()) &&
                                    "APPROVED".equalsIgnoreCase(leave.getLeaveStatus()))
                            .map(leave -> new EmpDetailsLeaveDTO(
                                    leave.getId(),
                                    leave.getLeaveType(),
                                    leave.getLeaveReason(),
                                    leave.getLeaveStatus(),
                                    leave.getLeaveStartDay(),
                                    leave.getLeaveEndDay(),
                                    leave.getLeaveDays()
                            ))
                            .collect(Collectors.toList());

                    return new EmpDetailsDTO(
                            employee.getId(),
                            employee.getEpfNo(),
                            employee.getFirstName(),
                            employee.getLastName(),
                            employee.getBasicSalary(),
                            employee.getEmail(),
                            employee.getGender(),
                            employee.getPhone(),
                            employee.getAddress(),
                            employee.getDateOfJoining(),
                            employee.getNic(),
                            employee.getDob(),
                            employee.getStatus(),
                            new EmpDetailsDepartmentDTO(
                                    employee.getDepartment() != null ? employee.getDepartment().getId() : null,
                                    employee.getDepartment() != null ? employee.getDepartment().getDptName() : null,
                                    employee.getDepartment() != null ? employee.getDepartment().getDptCode() : null,
                                    employee.getDepartment() != null ? employee.getDepartment().getDptDesc() : null
                            ),
                            new EmpDetailsDesignationDTO(
                                    employee.getDesignation() != null ? employee.getDesignation().getId() : null,
                                    employee.getDesignation() != null ? employee.getDesignation().getDesignationName() : null
                            ),
                            new EmpDetailsDocumentsDTO(
                                    employee.getDocuments() != null ? employee.getDocuments().getPhoto() : null
                            ),
                            leaveList
                    );
                }).collect(Collectors.toList());
    }

    public Employee updateEmployee(Long emp_id, Employee updateEmployee) {
        Employee employee = getEmployeeById(emp_id);
        if (employee != null) {
            employee.setEpfNo(updateEmployee.getEpfNo());
            employee.setFirstName(updateEmployee.getFirstName());
            employee.setLastName(updateEmployee.getLastName());
            employee.setBasicSalary(updateEmployee.getBasicSalary());
            employee.setEmail(updateEmployee.getEmail());
            employee.setGender(updateEmployee.getGender());
            employee.setDob(updateEmployee.getDob());
            employee.setPhone(updateEmployee.getPhone());
            employee.setAddress(updateEmployee.getAddress());
            employee.setDateOfJoining(updateEmployee.getDateOfJoining());
            employee.setNic(updateEmployee.getNic());
            employee.setStatus(updateEmployee.getStatus());
            return employeeRepository.save(employee);
        }
        return null;
    }

    public List<AttendanceEmployeeDTO> getAttendanceByCompanyIdAndMonth(long cmpId, int month) {
        return employeeRepository.findByCompanyId(cmpId).stream()
                .map(employee -> {
                    List<AttendanceDTO> filtered = employee.getAttendanceList().stream()
                            .filter(atd -> atd.getStartedAt().getMonthValue() == month)
                            .map(atd -> new AttendanceDTO(
                                    atd.getId(),
                                    atd.getStartedAt(),
                                    atd.getEndedAt(),
                                    atd.getWorkingStatus(),
                                    atd.getAttendanceStatus(),
                                    atd.getTotalTime(),
                                    atd.getDayName()
                            ))
                            .collect(Collectors.toList());

                    return new AttendanceEmployeeDTO(
                            employee.getId(),
                            employee.getEpfNo(),
                            employee.getFirstName(),
                            employee.getLastName(),
                            employee.getBasicSalary(),
                            employee.getEmail(),
                            employee.getGender(),
                            employee.getPhone(),
                            employee.getAddress(),
                            employee.getDateOfJoining(),
                            employee.getNic(),
                            employee.getDob(),
                            employee.getStatus(),
                            filtered,
                            new EmpDetailsDepartmentDTO(
                                    Optional.ofNullable(employee.getDepartment()).map(d -> d.getId()).orElse(null),
                                    Optional.ofNullable(employee.getDepartment()).map(d -> d.getDptName()).orElse(null),
                                    Optional.ofNullable(employee.getDepartment()).map(d -> d.getDptCode()).orElse(null),
                                    Optional.ofNullable(employee.getDepartment()).map(d -> d.getDptDesc()).orElse(null)
                            ),
                            new EmpDetailsDocumentsDTO(
                                    Optional.ofNullable(employee.getDocuments()).map(d -> d.getPhoto()).orElse(null)
                            )
                    );
                })
                .filter(dto -> !dto.getAttendanceList().isEmpty())
                .collect(Collectors.toList());
    }

    public Employee changeEmployeePassword(Long empId, String oldPassword, String newPassword) {
        Optional<Employee> employeeOptional = employeeRepository.findById(empId);
        if (!employeeOptional.isPresent()) {
            return null;
        }
        Employee employee = employeeOptional.get();
        if (!passwordEncoder.matches(oldPassword, employee.getPassword())) {
            throw new IllegalArgumentException("Old password is incorrect");
        }
        String hashedPassword = passwordEncoder.encode(newPassword);
        employee.setPassword(hashedPassword);
        return employeeRepository.save(employee);
    }

    public String forgotPassword(String email) {
        Employee employee = employeeRepository.findByEmail(email);
        if (employee == null) {
            throw new IllegalArgumentException("No Employee found with the provided email");
        }
        String randomPassword = UUID.randomUUID().toString().substring(0, 8);
        String hashedPassword = passwordEncoder.encode(randomPassword);
        employee.setPassword(hashedPassword);

        employeeRepository.save(employee);

        return randomPassword;
    }
}
