package com.pirisa.hrm.service;

import com.pirisa.hrm.config.SecurityConfig;
import com.pirisa.hrm.dto.*;
import com.pirisa.hrm.model.Attendance;
import com.pirisa.hrm.model.Company;
import com.pirisa.hrm.model.Employee;
import com.pirisa.hrm.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EmployeeService {


    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

//    public Employee createEmployee(Employee employee) {
//        return employeeRepository.save(employee);
//    }




    public Employee createEmployee(Employee emp) {
        emp.setUsername(emp.getEmail());

        if (emp.getEmpNo() == null || emp.getEmpNo().isEmpty()) {
            String empNo = "EMP" + String.format("%04d", employeeRepository.count() + 1);
            emp.setEmpNo(empNo);
        }

        String epfNo = "EPF" + String.format("%04d", employeeRepository.count() + 1);
        emp.setEpfNo(epfNo);

        // 1) Generate a secure random temporary password (12 chars alphanumeric)
        String tempPwd = new SecureRandom()
                .ints(12, 0, 36)
                .mapToObj(i -> "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                        .charAt(i))
                .map(Object::toString)
                .collect(Collectors.joining());

        // 2) Hash & set on entity
        emp.setPassword(passwordEncoder.encode(tempPwd));
        emp.setMustReset(true);

        // 3) Save to DB
        Employee saved = employeeRepository.save(emp);

        // 4) Email the temporary password
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
        Optional<Employee> optionalUser = employeeRepository.findById(id);
        return optionalUser.orElse(null);
    }

    public List<Employee> getEmployeesByCompanyId(long cmpId) {
        return employeeRepository.findByCmpId(cmpId);
    }


    public void deleteEmployee(Long emp_id) {
        employeeRepository.deleteEmployee(emp_id);
    }

        @Transactional(readOnly = true)
        public List<AttendanceEmployeeDTO> getAttendanceByCompanyId(long cmpId) {
        List<Employee> employees = employeeRepository.findByCmpId(cmpId);

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
                        attendance.getAttendanceDate(),
                        attendance.getStartedAt(),
                        attendance.getEndedAt(),
                        attendance.getWorking_status(),
                        attendance.getAttendance_status(),
                        attendance.getTotalTime(),
                        attendance.getDayName()

                )).collect(Collectors.toList()),
                new EmpDetailsDepartmentDTO(
                        (employee.getDepartment() != null) ? employee.getDepartment().getId(): null,
                        (employee.getDepartment() != null) ? employee.getDepartment().getDptName(): null,
                        (employee.getDepartment() != null) ? employee.getDepartment().getDptCode(): null,
                        (employee.getDepartment() != null) ? employee.getDepartment().getDptDesc(): null
                ),
                new EmpDetailsDocumentsDTO(
                        (employee.getDocuments() != null) ? employee.getDocuments().getPhoto() : null
                )
        )).collect(Collectors.toList());
    }


        @Transactional(readOnly = true)
        public List<PayroleEmployeeDTO> getPayroleByCompanyId(long cmpId) {
        List<Employee> employees = employeeRepository.findByCmpId(cmpId);

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


        @Transactional(readOnly = true)
        public List<PayroleEmployeeDTO> getPayroleByEmployeeId(long empId) {
        List<Employee> employees = employeeRepository.findEmployeeById(empId);

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



        @Transactional(readOnly = true)
        public List<EmpDetailsDTO> getEmpDetailsByCompanyId(long cmpId) {
        List<Employee> employees = employeeRepository.findByCmpId(cmpId);
        return employees.stream().map(employee -> {
            // Map the leave list if available, else return an empty list
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
                            employee.getDesignation() != null ? employee.getDesignation().getDesignation() : null
                    ),
                    new EmpDetailsDocumentsDTO(
                            employee.getDocuments() != null ? employee.getDocuments().getPhoto() : null
                    ),
                    leaveList
            );
        }).collect(Collectors.toList());
    }





        @Transactional(readOnly = true)
        public List<EmpDetailsDTO> getEmpDetailsByEmpId(long empId) {
        List<Employee> employees = employeeRepository.findEmployeeById(empId);
        return employees.stream().map(employee -> {
            // Map the leave list if available, else return an empty list
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
                            employee.getDesignation() != null ? employee.getDesignation().getDesignation() : null
                    ),
                    new EmpDetailsDocumentsDTO(
                            employee.getDocuments() != null ? employee.getDocuments().getPhoto() : null
                    ),
                    leaveList
            );
        }).collect(Collectors.toList());
    }






        @Transactional(readOnly = true)
        public List<EmpDetailsDTO> getPendingEmpDetailsByCompanyId(long cmpId) {
        List<Employee> employees = employeeRepository.findByCmpId(cmpId);
        return employees.stream()
                // Filter to include only employees with at least one PENDING leave
                .filter(employee -> employee.getEmployeeLeaves() != null &&
                        employee.getEmployeeLeaves().stream().anyMatch(leave -> "PENDING".equals(leave.getLeaveStatus())))
                .map(employee -> {
                    // Map only the PENDING leave records
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
                                    employee.getDesignation() != null ? employee.getDesignation().getDesignation() : null
                            ),
                            new EmpDetailsDocumentsDTO(
                                    employee.getDocuments() != null ? employee.getDocuments().getPhoto() : null
                            ),
                            leaveList
                    );
                }).collect(Collectors.toList());
    }


        @Transactional(readOnly = true)
        public List<EmpDetailsDTO> getApprovedEmpDetailsByCompanyId(long cmpId) {
        List<Employee> employees = employeeRepository.findByCmpId(cmpId);
        return employees.stream()
                // Filter to include only employees with at least one APPROVED leave
                .filter(employee -> employee.getEmployeeLeaves() != null &&
                        employee.getEmployeeLeaves().stream().anyMatch(leave -> "APPROVED".equals(leave.getLeaveStatus())))
                .map(employee -> {
                    // Map only the APPROVED leave records
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
                                    employee.getDesignation() != null ? employee.getDesignation().getDesignation() : null
                            ),
                            new EmpDetailsDocumentsDTO(
                                    employee.getDocuments() != null ? employee.getDocuments().getPhoto() : null
                            ),
                            leaveList
                    );
                }).collect(Collectors.toList());
    }



        @Transactional(readOnly = true)
        public List<EmpDetailsDTO> getRejectedEmpDetailsByCompanyId(long cmpId) {
        List<Employee> employees = employeeRepository.findByCmpId(cmpId);
        return employees.stream()
                // Filter to include only employees with at least one REJECTED leave
                .filter(employee -> employee.getEmployeeLeaves() != null &&
                        employee.getEmployeeLeaves().stream().anyMatch(leave -> "REJECTED".equals(leave.getLeaveStatus())))
                .map(employee -> {
                    // Map only the REJECTED leave records
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
                                    employee.getDesignation() != null ? employee.getDesignation().getDesignation() : null
                            ),
                            new EmpDetailsDocumentsDTO(
                                    employee.getDocuments() != null ? employee.getDocuments().getPhoto() : null
                            ),
                            leaveList
                    );
                }).collect(Collectors.toList());
    }






        @Transactional(readOnly = true)
        public List<AttendanceEmployeeDTO> getLastAttendanceByCompanyId(long cmpId) {
        List<Employee> employees = employeeRepository.findByCmpId(cmpId);

        return employees.stream().map(employee -> {
            // Get latest attendance (with null safety)
            Attendance latestAttendance = null;
            try {
                if (employee.getAttendanceList() != null && !employee.getAttendanceList().isEmpty()) {
                    latestAttendance = employee.getAttendanceList().stream()
                            .filter(a -> a.getAttendanceDate() != null || a.getStartedAt() != null)
                            .max(Comparator.comparing(a -> {
                                if (a.getAttendanceDate() != null) return a.getAttendanceDate();
                                if (a.getStartedAt() != null) return a.getStartedAt().toLocalDate();
                                return java.time.LocalDate.MIN;
                            }))
                            .orElse(null);
                }
            } catch (Exception e) {
                // Silent fail - attendance list couldn't be loaded
                latestAttendance = null;
            }

            List<AttendanceDTO> latestAttendanceList = new ArrayList<>();
            if (latestAttendance != null) {
                try {
                    latestAttendanceList.add(new AttendanceDTO(
                            latestAttendance.getId(),
                            latestAttendance.getAttendanceDate(),
                            latestAttendance.getStartedAt(),
                            latestAttendance.getEndedAt(),
                            latestAttendance.getWorking_status(),
                            latestAttendance.getAttendance_status(),
                            latestAttendance.getTotalTime(),
                            latestAttendance.getDayName()
                    ));
                } catch (Exception e) {
                    // Silent fail
                }
            }

            // Department DTO
            EmpDetailsDepartmentDTO departmentDTO = null;
            try {
                if (employee.getDepartment() != null) {
                    departmentDTO = new EmpDetailsDepartmentDTO(
                            employee.getDepartment().getId(),
                            employee.getDepartment().getDptName(),
                            employee.getDepartment().getDptCode(),
                            employee.getDepartment().getDptDesc()
                    );
                }
            } catch (Exception e) {
                departmentDTO = null;
            }

            // Documents DTO - SIMPLIFIED (no ServletUriComponentsBuilder)
            EmpDetailsDocumentsDTO documentDTO = null;
            try {
                if (employee.getDocuments() != null) {
                    // Just pass the photo bytes, no URL
                    documentDTO = new EmpDetailsDocumentsDTO(employee.getDocuments().getPhoto());
                }
            } catch (Exception e) {
                documentDTO = null;
            }

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




        @Transactional(readOnly = true)
        public List<EmpDetailsDTO> getApprovedEmpDetailsByCompanyIdAndDate(long cmpId, LocalDate date) {
        List<Employee> employees = employeeRepository.findByCmpId(cmpId);

        return employees.stream()
                // Filter only employees that have at least one APPROVED leave record covering the provided date
                .filter(employee -> employee.getEmployeeLeaves() != null &&
                        employee.getEmployeeLeaves().stream().anyMatch(leave ->
                                leave.getLeaveStartDay() != null && leave.getLeaveEndDay() != null &&
                                        !date.isBefore(leave.getLeaveStartDay().toLocalDate()) &&
                                        !date.isAfter(leave.getLeaveEndDay().toLocalDate()) &&
                                        "APPROVED".equalsIgnoreCase(leave.getLeaveStatus())))
                .map(employee -> {
                    // Filter only the leave records that are APPROVED and where the date falls between leaveStartDay and leaveEndDay
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
                                    employee.getDesignation() != null ? employee.getDesignation().getDesignation() : null
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
        if (employee == null) {
            throw new IllegalArgumentException("Employee not found with id: " + emp_id);
        }
        
        try {
            // Validate required fields
            if (updateEmployee.getFirstName() != null && !updateEmployee.getFirstName().trim().isEmpty()) {
                employee.setFirstName(updateEmployee.getFirstName().trim());
            }
            if (updateEmployee.getLastName() != null && !updateEmployee.getLastName().trim().isEmpty()) {
                employee.setLastName(updateEmployee.getLastName().trim());
            }
            if (updateEmployee.getEmail() != null && !updateEmployee.getEmail().trim().isEmpty()) {
                employee.setEmail(updateEmployee.getEmail().trim());
                employee.setUsername(updateEmployee.getEmail().trim());
            }
            if (updateEmployee.getPhone() != null) employee.setPhone(updateEmployee.getPhone());
            if (updateEmployee.getAddress() != null) employee.setAddress(updateEmployee.getAddress());
            if (updateEmployee.getGender() != null) employee.setGender(updateEmployee.getGender());
            if (updateEmployee.getDob() != null) employee.setDob(updateEmployee.getDob());
            if (updateEmployee.getNic() != null) employee.setNic(updateEmployee.getNic());
            if (updateEmployee.getDateOfJoining() != null) employee.setDateOfJoining(updateEmployee.getDateOfJoining());
            
            // Update salary if provided (not null and >= 0)
            if (updateEmployee.getBasicSalary() > 0) {
                employee.setBasicSalary(updateEmployee.getBasicSalary());
            } else if (updateEmployee.getBasicSalary() == 0 && updateEmployee.getEmpNo() != null) {
                // If frontend explicitly sends 0, only keep existing if current is > 0
                // This prevents accidental salary reset
                System.out.println("Keeping existing basicSalary: " + employee.getBasicSalary());
            }
            
            if (updateEmployee.getStatus() != null && !updateEmployee.getStatus().trim().isEmpty()) {
                employee.setStatus(updateEmployee.getStatus());
            }
            if (updateEmployee.getCmpId() > 0) employee.setCmpId(updateEmployee.getCmpId());
            if (updateEmployee.getDptId() > 0) employee.setDptId(updateEmployee.getDptId());
            if (updateEmployee.getDesignationId() > 0) employee.setDesignationId(updateEmployee.getDesignationId());
            
            // Handle empNo and epfNo carefully (only if changed)
            if (updateEmployee.getEmpNo() != null && !updateEmployee.getEmpNo().trim().isEmpty()) {
                employee.setEmpNo(updateEmployee.getEmpNo().trim());
            }
            if (updateEmployee.getEpfNo() != null && !updateEmployee.getEpfNo().trim().isEmpty()) {
                // EPF is updateable = false, so don't update unless necessary
                // employee.setEpfNo(updateEmployee.getEpfNo().trim());
            }
            
            return employeeRepository.save(employee);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new RuntimeException("Update failed: Duplicate values detected for unique fields (Email, EmpNo, EPF No, NIC). Please check your input.");
        } catch (Exception e) {
            throw new RuntimeException("Update failed: " + e.getMessage());
        }
    }


        @Transactional(readOnly = true)
        public List<AttendanceEmployeeDTO> getAttendanceByCompanyIdAndMonth(long cmpId, int month) {
        return employeeRepository.findByCmpId(cmpId).stream()
                .map(employee -> {
                    // Filter only this month's attendances
                    List<AttendanceDTO> filtered = employee.getAttendanceList().stream()
                            .filter(atd -> {
                                if (atd.getAttendanceDate() != null) {
                                    return atd.getAttendanceDate().getMonthValue() == month;
                                }
                                return atd.getStartedAt() != null && atd.getStartedAt().getMonthValue() == month;
                            })
                            .map(atd -> new AttendanceDTO(
                                    atd.getId(),
                                    atd.getAttendanceDate(),
                                    atd.getStartedAt(),
                                    atd.getEndedAt(),
                                    atd.getWorking_status(),
                                    atd.getAttendance_status(),
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
                            // dept DTO
                            new EmpDetailsDepartmentDTO(
                                    Optional.ofNullable(employee.getDepartment())
                                            .map(d -> d.getId()).orElse(null),
                                    Optional.ofNullable(employee.getDepartment())
                                            .map(d -> d.getDptName()).orElse(null),
                                    Optional.ofNullable(employee.getDepartment())
                                            .map(d -> d.getDptCode()).orElse(null),
                                    Optional.ofNullable(employee.getDepartment())
                                            .map(d -> d.getDptDesc()).orElse(null)
                            ),
                            // documents DTO
                            new EmpDetailsDocumentsDTO(
                                    Optional.ofNullable(employee.getDocuments())
                                            .map(d -> d.getPhoto()).orElse(null)
                            )
                    );
                })
                // drop employees with no attendance in that month
                .filter(dto -> !dto.getAttendanceList().isEmpty())
                .collect(Collectors.toList());
    }



    public Employee changeEmployeePassword(Long empId, String oldPassword, String newPassword) {
        Optional<Employee> employeeOptional = employeeRepository.findById(empId);
        if (!employeeOptional.isPresent()) {
            return null;
        }
        Employee employee = employeeOptional.get();
        // Verify if the provided old password matches the stored password.
        if (!passwordEncoder.matches(oldPassword, employee.getPassword())) {
            throw new IllegalArgumentException("Old password is incorrect");
        }
        // Encrypt the new password using BCrypt and update the company.
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
