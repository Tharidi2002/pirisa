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
@Table(name = "generated_documents")
public class GeneratedDocument extends BaseEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "template_id")
    private Long templateId;

    @Column(name = "document_type", length = 100)
    private String documentType;

    @Column(name = "file_name", length = 300)
    private String fileName;

    @Lob
    @Column(name = "file_data", columnDefinition = "LONGBLOB")
    private byte[] fileData;

    @Column(name = "generated_by")
    private Long generatedBy;
}