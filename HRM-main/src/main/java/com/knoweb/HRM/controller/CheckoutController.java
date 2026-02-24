package com.knoweb.HRM.controller;

import com.knoweb.HRM.model.Company;
import com.knoweb.HRM.repository.CompanyRepository;
import com.knoweb.HRM.service.PaymentService;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.PaymentIntent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/checkout")
@CrossOrigin(origins = "*")
public class CheckoutController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private CompanyRepository companyRepository;

    @PostMapping("/create-payment-intent")
    public ResponseEntity<?> createPaymentIntent(@RequestBody Map<String, Object> paymentInfo) {
        try {
            Long companyId = Long.valueOf(paymentInfo.get("companyId").toString());
            Long amount = Long.valueOf(paymentInfo.get("amount").toString());
            String currency = (String) paymentInfo.get("currency");

            Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

            String stripeCustomerId = company.getStripeCustomerId();

            if (stripeCustomerId == null) {
                Customer stripeCustomer = paymentService.createStripeCustomer(companyId);
                stripeCustomerId = stripeCustomer.getId();
                
                company.setStripeCustomerId(stripeCustomerId);
                companyRepository.save(company);
            }

            PaymentIntent paymentIntent = paymentService.createPaymentIntent(amount, currency, stripeCustomerId);

            Map<String, String> response = new HashMap<>();
            response.put("clientSecret", paymentIntent.getClientSecret());

            return ResponseEntity.ok(response);

        } catch (StripeException | NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
