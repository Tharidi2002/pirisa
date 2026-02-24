package com.knoweb.HRM.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "company")
public class Company implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id") // Standard naming convention
    private long id;

    @Column(name = "cmp_name")
    private String cmpName;

    @Column(name = "cmp_address")
    private String cmpAddress;

    @Column(name = "cmp_phone")
    private String cmpPhone;

    @Column(unique = true, name ="cmp_email")
    private String cmpEmail;

    @Column(unique = true, name = "username")
    private String username;

    @Column(name = "cmp_password")
    private String cmpPassword;

    @Column(unique = true, name = "cmp_reg_no")
    private String cmpRegNo;

    @Column(unique = true, name = "vat_no")
    private String vatNo;

    @Column(unique = true, name = "tin_no")
    private String tinNo;

    @Column(name = "role")
    private String role = "CMPNY";

    @Column(name = "package_name")
    private String packageName;

    @Column(name = "company_status")
    private String companyStatus = "INACTIVE";

    @CreationTimestamp
    @Column(name = "joined_at", updatable = false)
    private LocalDateTime joinedAt;

    @Column(name = "stripe_customer_id")
    private String stripeCustomerId;

    // Relationships
    
    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<User> userList;

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Employee> employeeList;

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Department> departmentList;

    @OneToOne(mappedBy = "company", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private CompanyLeave companyLeave;

    @OneToOne(mappedBy = "company", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Allowance allowance;

    @OneToOne(mappedBy = "company", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private CompanyOTDetails companyOTDetails;
}
