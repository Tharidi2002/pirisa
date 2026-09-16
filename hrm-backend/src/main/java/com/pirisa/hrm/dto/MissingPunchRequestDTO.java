package com.pirisa.hrm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MissingPunchRequestDTO {

    @NotNull(message = "Attendance date is required")
    private LocalDate attendanceDate;

    @NotBlank(message = "Punch type is required")
    @Pattern(regexp = "CLOCK_IN|CLOCK_OUT|BOTH", message = "Punch type must be CLOCK_IN, CLOCK_OUT or BOTH")
    private String punchType;

    private LocalTime requestedStartedAt;

    private LocalTime requestedEndedAt;

    @NotBlank(message = "Reason is required")
    @Size(min = 10, max = 500, message = "Reason must be between 10 and 500 characters")
    private String reason;
}