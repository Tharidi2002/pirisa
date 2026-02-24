package com.knoweb.HRM.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.io.Serializable;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "employee")
public class Employee implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "emp_id")
    private long id;

    @Column(name = "epf_no")
    private String epfNo;

    @Column(name = "emp_no")
    private String empNo;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "basic_salary")
    private float basicSalary;

    @Column(unique = true)
    private String email;

    @Column(unique = true, nullable = false)
    private String username;

    private String gender;

    @Column(name = "DOB")
    private String dob;

    private String phone;

    private String address;

    @Column(name = "NIC")
    private String nic;

    @Column(name = "date_of_joining")
    private String dateOfJoining;

    private String status = "ACTIVE";

    private String role = "EMPLOYEE";

    @Column(nullable = false)
    @JsonIgnore
    private String password;

    @Column(name = "must_reset", nullable = false)
    @JsonIgnore
    private boolean mustReset = true;

    // --- Relationships ---

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cmp_id")
    @JsonIgnore
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dpt_id")
    @JsonIgnore
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "designation_id")
    @JsonIgnore
    private Designation designation;

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Attendance> attendanceList;

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Payrole> payroleList;

    @OneToOne(mappedBy = "employee", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private Documents documents;

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<EmployeeLeave> employeeLeaves;
}
