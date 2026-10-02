package com.pirisa.hrm.model;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SecretSerializationTest {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void userSerializationNeverExposesPasswordHash() throws Exception {
        User user = new User();
        user.setUsername("test-user");
        user.setPassword("stored-hash");

        String json = objectMapper.writeValueAsString(user);
        User deserialized = objectMapper.readValue("{\"password\":\"incoming-password\"}", User.class);

        assertThat(json).contains("test-user").doesNotContain("password", "stored-hash");
        assertThat(deserialized.getPassword()).isEqualTo("incoming-password");
    }

    @Test
    void companySerializationNeverExposesPasswordHash() throws Exception {
        Company company = new Company();
        company.setUsername("test-company");
        company.setCmp_password("stored-hash");

        String json = objectMapper.writeValueAsString(company);
        Company deserialized = objectMapper.readValue(
                "{\"cmp_password\":\"incoming-password\"}", Company.class);

        assertThat(json).contains("test-company").doesNotContain("cmp_password", "stored-hash");
        assertThat(deserialized.getCmp_password()).isEqualTo("incoming-password");
    }
}
