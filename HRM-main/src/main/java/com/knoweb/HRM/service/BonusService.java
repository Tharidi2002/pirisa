package com.knoweb.HRM.service;

import com.knoweb.HRM.model.Allowance;
import com.knoweb.HRM.model.Bonus;
import com.knoweb.HRM.repository.AllowanceRepository;
import com.knoweb.HRM.repository.BonusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BonusService {

    @Autowired
    private BonusRepository bonusRepository;

    public Bonus createBonus(Bonus bonus) {
        return bonusRepository.save(bonus);
    }


    public List<Bonus> getBonusByCompanyId(long companyId) {
        return bonusRepository.findByCompanyId(companyId);
    }
}
