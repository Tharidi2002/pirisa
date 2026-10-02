package com.pirisa.hrm.service;

import com.pirisa.hrm.model.Payrole;
import com.pirisa.hrm.repository.PayroleRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PayroleServiceTest {
    @Mock
    private PayroleRepository payroleRepository;

    @InjectMocks
    private PayroleService payroleService;

    @Test
    void loadsPayrollByEmployeeForeignKey() {
        Payrole payrole = new Payrole();
        payrole.setId(7L);
        payrole.setEmpId(42L);
        when(payroleRepository.findByEmpId(42L)).thenReturn(Collections.singletonList(payrole));

        assertThat(payroleService.getPayroleByEmployeeId(42L)).containsExactly(payrole);

        verify(payroleRepository).findByEmpId(42L);
    }
}
