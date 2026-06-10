package com.knoweb.HRM.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;

@Entity
@Table(name = "department")
@Getter
@Setter
@NoArgsConstructor
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dpt_id")
    private Long id;

    @NotBlank
    @Column(name = "dpt_name", nullable = false)
    private String dptName;

    @Column(name = "dpt_desc")
    private String dptDesc;

    @NotBlank
    @Column(name = "dpt_code", nullable = false)
    private String dptCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cmp_id")
    @JsonBackReference
    private Company company;

    public Department(String dptName, String dptDesc, String dptCode, Company company) {
        this.dptName = dptName;
        this.dptDesc = dptDesc;
        this.dptCode = dptCode;
        this.company = company;
    }
}
