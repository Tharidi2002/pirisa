package com.pirisa.hrm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Email;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateRequestDTO {

    @Size(max = 20, message = "Phone number too long")
    @Pattern(regexp = "^[0-9+\\-\\s]*$", message = "Invalid phone number format")
    private String phone;

    @Size(max = 500, message = "Address too long")
    private String address;

    @Email(message = "Invalid email format")
    private String email;
}