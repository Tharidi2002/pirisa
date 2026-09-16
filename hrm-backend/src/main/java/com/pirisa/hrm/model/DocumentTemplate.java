package com.pirisa.hrm.model;

import com.pirisa.hrm.model.common.BaseEntity;
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
@Table(name = "document_templates")
public class DocumentTemplate extends BaseEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "template_type", nullable = false, length = 100)
    private String templateType; // EMPLOYMENT_LETTER, SALARY_CERTIFICATE, EXPERIENCE_LETTER, WARNING_LETTER

    @Column(name = "template_content", nullable = false, columnDefinition = "LONGTEXT")
    private String templateContent;

    @Column(name = "is_active")
    private Boolean isActive = true;
}