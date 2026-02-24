package com.knoweb.HRM.controller;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.Invoice;
import com.stripe.model.PaymentIntent;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.knoweb.HRM.model.Company;
import com.knoweb.HRM.repository.CompanyRepository; // Import CompanyRepository
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/webhook")
public class StripeWebhookController {

    @Value("${stripe.webhook.secret}")
    private String endpointSecret;

    @Autowired
    private CompanyRepository companyRepository; // Inject CompanyRepository

    // Map Stripe price IDs to plan names
    private static final Map<String, String> PRICE_ID_TO_PLAN = new HashMap<>();
    static {
        PRICE_ID_TO_PLAN.put("price_1R9KD8LS4Zd4e05LS6JnMjWL", "BASIC");
        PRICE_ID_TO_PLAN.put("price_1R9MNyLS4Zd4e05LvI3rP6zU", "STANDARD");
        PRICE_ID_TO_PLAN.put("price_1R9Mc1LS4Zd4e05LftHWM8AB", "PREMIUM");
    }

    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeEvent(@RequestBody String payload, @RequestHeader("Stripe-Signature") String sigHeader) {
        Event event;

        try {
            event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
        } catch (SignatureVerificationException e) {
            System.err.println("Webhook signature verification failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Webhook signature verification failed.");
        }

        System.out.println("Received event type: " + event.getType());

        switch (event.getType()) {
            case "checkout.session.completed":
                Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
                if (session != null) {
                    handleCheckoutSessionCompleted(session);
                }
                break;
            case "invoice.payment_succeeded":
                Invoice invoicePaymentSucceeded = (Invoice) event.getDataObjectDeserializer().getObject().orElse(null);
                if (invoicePaymentSucceeded != null) {
                    updateCompanyStatusForSubscription(invoicePaymentSucceeded.getCustomer(), "ACTIVE", "invoice payment succeeded");
                }
                break;
            case "invoice.payment_failed":
                Invoice invoicePaymentFailed = (Invoice) event.getDataObjectDeserializer().getObject().orElse(null);
                if (invoicePaymentFailed != null) {
                    updateCompanyStatusForSubscription(invoicePaymentFailed.getCustomer(), "INACTIVE", "invoice payment failed");
                }
                break;
            case "customer.subscription.deleted":
                 // Handle subscription cancellation
                 // You might want to mark the company as INACTIVE or on a free plan
                break;
            default:
                System.out.println("Unhandled event type: " + event.getType());
        }

        return ResponseEntity.ok("Success");
    }

    private void handleCheckoutSessionCompleted(Session session) {
        Map<String, String> metadata = session.getMetadata();
        System.out.println("Checkout Session Metadata: " + metadata);

        String companyIdStr = metadata.get("companyId");
        String priceId = metadata.get("priceId");
        String stripeCustomerId = session.getCustomer();

        if (companyIdStr != null && priceId != null && stripeCustomerId != null) {
            try {
                long companyId = Long.parseLong(companyIdStr);
                Company company = companyRepository.findById(companyId).orElse(null);

                if (company != null) {
                    String planName = PRICE_ID_TO_PLAN.getOrDefault(priceId, "UNKNOWN");
                    company.setPackageName(planName); // Corrected method name
                    company.setCompanyStatus("ACTIVE"); // Corrected method name
                    company.setStripeCustomerId(stripeCustomerId); // Save Stripe customer ID

                    companyRepository.save(company); // Use repository to save

                    System.out.println("Updated company " + company.getId() +
                            " to plan " + planName + " with status ACTIVE and Stripe customer ID " + stripeCustomerId);
                } else {
                    System.err.println("Company not found for companyId: " + companyId);
                }
            } catch (NumberFormatException ex) {
                System.err.println("Invalid companyId format in metadata: " + companyIdStr);
            }
        } else {
            System.err.println("Missing companyId, priceId, or customerId in session data");
        }
    }

    private void updateCompanyStatusForSubscription(String customerId, String status, String reason) {
        if (customerId == null) {
            System.err.println("Cannot update company status: customerId is null. Reason: " + reason);
            return;
        }

        System.out.println("Attempting to update status for customer: " + customerId + " to " + status);
        Company company = companyRepository.findByStripeCustomerId(customerId);

        if (company != null) {
            company.setCompanyStatus(status); // Corrected method name
            companyRepository.save(company); // Use repository to save
            System.out.println("Updated company " + company.getId() + " status to " + status + " due to " + reason);
        } else {
            System.err.println("No company found for customer id: " + customerId);
        }
    }
}
