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
@Table(name = "department")
public class Department implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dpt_id")
    private long id;

    @Column(name = "dpt_name")
    private String dptName;

    @Column(name = "dpt_code")
    private String dptCode;

    @Column(name = "dpt_desc")
    private String dptDesc;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cmp_id")
    @JsonIgnore
    private Company company;

    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Designation> designationList;

    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Employee> employeeList;
}
