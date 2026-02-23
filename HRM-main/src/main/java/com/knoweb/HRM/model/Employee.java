package com.knoweb.HRM.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "employee")
public class Employee implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "emp_id")
    private long id;

    private String epf_no;

    private String emp_no;

    private String first_name;

    private String last_name;

    private float basic_salary;

    @Column(unique = true)
    private String email;

    @Column(unique = true, nullable = false)
    private String username;

    private String gender;

    private String DOB;

    private String phone;

    private String address;

    private String NIC;

    private String date_of_joining;

    private String status="ACTIVE";

    private String role="EMPLOYEE";

    @Column(name = "cmp_id")
    private long cmpId;

    @Column(name = "dpt_id")
    private long dptId;

    @Column(name = "designation_id")
    private long designationId;

    @Column(nullable = false)
    @JsonIgnore                       // never serialize the hash back to clients
    private String password;          // stores the BCrypt (or Argon2) hash

    @Column(nullable = false)
    @JsonIgnore
    private boolean mustReset = true; // forces first-login reset

    @OneToMany(targetEntity = Attendance.class, cascade = CascadeType.ALL)
    @JoinColumn(name = "emp_id", referencedColumnName = "emp_id")
    private List<Attendance> attendanceList;

    @OneToMany(targetEntity = Payrole.class, cascade = CascadeType.ALL)
    @JoinColumn(name = "emp_id", referencedColumnName = "emp_id")
    private List<Payrole> payroleList;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "dpt_id", referencedColumnName = "dpt_id", insertable = false, updatable = false)
    private Department department;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "designation_id", referencedColumnName = "designation_id", insertable = false, updatable = false)
    private Designation designation;

    @OneToOne(cascade = CascadeType.ALL , fetch = FetchType.EAGER)
    @JoinColumn(name = "emp_id", referencedColumnName = "emp_id", insertable = false, updatable = false)
    private Documents documents;

    @OneToMany(targetEntity = EmployeeLeave.class, cascade = CascadeType.ALL)
    @JoinColumn(name = "emp_id", referencedColumnName = "emp_id")
    private List<EmployeeLeave> employeeLeaves;

}
