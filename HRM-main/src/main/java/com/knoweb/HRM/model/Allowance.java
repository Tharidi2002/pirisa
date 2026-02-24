package com.knoweb.HRM.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "allowance")
public class Allowance implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "allowance_id")
    private long id;

    private String allowanceName;

    private String epfEligibleStatus;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cmp_id")
    @JsonIgnore
    private Company company;
}
