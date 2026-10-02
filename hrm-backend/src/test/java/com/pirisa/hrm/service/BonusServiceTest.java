package com.pirisa.hrm.service;

import com.pirisa.hrm.model.Bonus;
import com.pirisa.hrm.repository.BonusRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BonusServiceTest {
    @Mock
    private BonusRepository bonusRepository;

    @InjectMocks
    private BonusService bonusService;

    @Test
    void updatingMissingBonusDoesNotSave() {
        Bonus bonus = new Bonus();
        bonus.setId(25L);
        when(bonusRepository.findById(25L)).thenReturn(Optional.empty());

        assertThat(bonusService.updateBonus(bonus)).isNull();
        verify(bonusRepository, never()).save(bonus);
    }
}
