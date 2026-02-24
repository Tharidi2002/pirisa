package com.knoweb.HRM.service;

import com.knoweb.HRM.exception.ResourceNotFoundException;
import com.knoweb.HRM.model.Company;
import com.knoweb.HRM.repository.CompanyRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.Invoice;
import com.stripe.model.PaymentIntent;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.InvoiceListParams;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentService {

    @Value("${STRIPE_SECRET_KEY}")
    private String secretKey;

    @Autowired
    private CompanyRepository companyRepository;

    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
    }

    public Customer createStripeCustomer(Long companyId) throws StripeException {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", companyId));

        CustomerCreateParams params = CustomerCreateParams.builder()
                .setName(company.getCmpName()) // Corrected method call
                .setEmail(company.getCmpEmail())
                .build();

        return Customer.create(params);
    }

    public PaymentIntent createPaymentIntent(Long amount, String currency, String customerId) throws StripeException {
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amount)
                .setCurrency(currency)
                .setCustomer(customerId)
                .setAutomaticPaymentMethods(
                    PaymentIntentCreateParams.AutomaticPaymentMethods.builder().setEnabled(true).build()
                )
                .build();

        return PaymentIntent.create(params);
    }

    public Map<String, Object> getUpcomingInvoice(String customerId) throws StripeException {
        InvoiceListParams params = InvoiceListParams.builder()
                .setCustomer(customerId)
                .setStatus(InvoiceListParams.Status.OPEN)
                .build();

        Invoice invoice = Invoice.list(params).getData().stream().findFirst().orElse(null);
        Map<String, Object> upcomingInvoice = new HashMap<>();
        if (invoice != null) {
            upcomingInvoice.put("amount_due", invoice.getAmountDue());
            upcomingInvoice.put("due_date", invoice.getDueDate());
        }

        return upcomingInvoice;
    }

    public String getPublishableKey() {
        return Stripe.getPublishableKey();
    }
}
