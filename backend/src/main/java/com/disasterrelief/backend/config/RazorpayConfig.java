package com.disasterrelief.backend.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class RazorpayConfig {

    @Value("${razorpay.key:rzp_test_disasterReliefApp2026}")
    private String key;

    @Value("${razorpay.secret:disasterReliefSecretKey2026}")
    private String secret;
}