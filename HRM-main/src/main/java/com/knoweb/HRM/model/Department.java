package com.knoweb.HRM.model;

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
@Table(name = "department")
public class Department implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dpt_id")
    private long id;

    private String dpt_name;

    private String dpt_code;

    private String dpt_desc;

    @Column(name = "cmp_id")
    private long cmpId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cmp_id", referencedColumnName = "cmp_id", insertable = false, updatable = false)
    private Company company;

    @OneToMany(targetEntity = Designation.class, cascade = CascadeType.ALL)
    @JoinColumn(name = "dpt_id", referencedColumnName = "dpt_id")
    private List<Designation> designationList;

}
