package com.disasterrelief.backend.service;

import com.disasterrelief.backend.config.RazorpayConfig;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class PaymentGatewayService {

    private final RazorpayConfig razorpayConfig;

    public PaymentGatewayService(RazorpayConfig razorpayConfig) {
        this.razorpayConfig = razorpayConfig;
    }

    public String createRazorpayOrderId(Double amount) {
        return "order_rzp_test_" + UUID.randomUUID().toString().substring(0, 8);
    }

    public String generateTransactionId() {
        return "pay_test_" + UUID.randomUUID().toString().substring(0, 10);
    }
}