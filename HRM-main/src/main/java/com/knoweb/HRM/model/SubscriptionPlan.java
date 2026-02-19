package com.knoweb.HRM.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "subscription_plan")
public class SubscriptionPlan implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plan_id")
    private Long id;

    @NotBlank(message = "Plan name is required")
    @Column(name = "plan_name", nullable = false, unique = true)
    private String planName;

    @Column(name = "description")
    private String description;

    @NotNull(message = "Monthly price is required")
    @DecimalMin(value = "0.00", message = "Monthly price must be non-negative")
    @Column(name = "monthly_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal monthlyPrice;

    @NotNull(message = "Annual price is required")
    @DecimalMin(value = "0.00", message = "Annual price must be non-negative")
    @Column(name = "annual_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal annualPrice;

    @NotNull(message = "Max employees is required")
    @Column(name = "max_employees", nullable = false)
    private Integer maxEmployees;

    @Column(name = "features")
    private String features;

    @Enumerated(EnumType.STRING)
    @Column(name = "plan_type", nullable = false)
    private PlanType planType = PlanType.MONTHLY;

    @Enumerated(EnumType.STRING)
    @Column(name = "plan_status", nullable = false)
    private PlanStatus planStatus = PlanStatus.ACTIVE;

    @Column(name = "trial_period_days")
    private Integer trialPeriodDays = 0;

    @Column(name = "stripe_price_id_monthly")
    private String stripePriceIdMonthly;

    @Column(name = "stripe_price_id_annual")
    private String stripePriceIdAnnual;

    @Column(name = "stripe_product_id")
    private String stripeProductId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum PlanType {
        MONTHLY,
        ANNUAL,
        CUSTOM
    }

    public enum PlanStatus {
        ACTIVE,
        INACTIVE,
        ARCHIVED
    }
}
