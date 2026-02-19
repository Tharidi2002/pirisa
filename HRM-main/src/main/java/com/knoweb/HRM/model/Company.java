package com.knoweb.HRM.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "company")
public class Company implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cmp_id")
    private long id;

    private String cmp_name;

    private String cmp_address;

    private String cmp_phone;

    @Column(unique = true, name ="cmp_email")
    private String cmpEmail;

    @Column(unique = true, name = "username")
    private String username;

    private String cmp_password;

    @Column(unique = true)
    private String cmp_reg_no;

    @Column(unique = true)
    private String vat_no;

    @Column(unique = true)
    private String tin_no;

    private String role = "CMPNY";

    private String package_name;

    private String company_status = "INACTIVE";

    @CreationTimestamp
    @Column(name = "joined_at", updatable = false)
    private LocalDateTime joinedAt;

    private String stripeCustomerId;

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<User> userList;

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Employee> eployeeList;

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Department> departmentList;

    @OneToOne(mappedBy = "company", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private CompanyLeave companyLeave;

    @OneToOne(mappedBy = "company", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Allowance allowance;

    @OneToOne(mappedBy = "company", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private CompanyOTDetails companyOTDetails;
}
