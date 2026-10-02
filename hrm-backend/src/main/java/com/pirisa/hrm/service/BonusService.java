package com.pirisa.hrm.service;

import com.pirisa.hrm.model.Allowance;
import com.pirisa.hrm.model.Bonus;
import com.pirisa.hrm.repository.AllowanceRepository;
import com.pirisa.hrm.repository.BonusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BonusService {

    @Autowired
    private BonusRepository bonusRepository;

    public Bonus createBonus(Bonus bonus) {
        return bonusRepository.save(bonus);
    }


    public List<Bonus> getBonusByCompanyId(long cmpId) {
        return bonusRepository.findByCmpId(cmpId);
    }

    public Bonus updateBonus(Bonus bonus) {
        Optional<Bonus> existingBonus = bonusRepository.findById(bonus.getId());
        if (!existingBonus.isPresent()) {
            return null;
        }

        return bonusRepository.save(bonus);
    }

    public boolean deleteBonus(Long id) {
        if (!bonusRepository.existsById(id)) {
            return false;
        }
        bonusRepository.deleteById(id);
        return true;
    }
}
