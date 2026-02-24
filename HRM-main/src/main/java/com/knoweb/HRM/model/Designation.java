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
@Table(name = "designation")
public class Designation implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "designation_id")
    private long id;

    @Column(name = "designation")
    private String designationName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dpt_id")
    @JsonIgnore
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cmp_id")
    @JsonIgnore
    private Company company;

    @OneToMany(mappedBy = "designation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Employee> employeeList;

}
