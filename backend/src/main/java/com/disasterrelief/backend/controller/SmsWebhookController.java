package com.disasterrelief.backend.controller;

import com.disasterrelief.backend.model.Role;
import com.disasterrelief.backend.model.SosRequest;
import com.disasterrelief.backend.model.RequestStatus;
import com.disasterrelief.backend.model.RequestSource;
import com.disasterrelief.backend.model.UrgencyLevel;
import com.disasterrelief.backend.model.User;
import com.disasterrelief.backend.repository.SosRequestRepository;
import com.disasterrelief.backend.repository.UserRepository;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sos/webhook")
public class SmsWebhookController {

    private final UserRepository userRepository;
    private final SosRequestRepository sosRequestRepository;
    private final PasswordEncoder passwordEncoder;

    public SmsWebhookController(UserRepository userRepository, SosRequestRepository sosRequestRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.sosRequestRepository = sosRequestRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping(value = "/sms", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE, produces = MediaType.APPLICATION_XML_VALUE)
    public String handleIncomingSms(
            @RequestParam("From") String fromPhone,
            @RequestParam("Body") String body) {

        // 1. Normalize the phone number (remove +91, keep last 10 digits if possible)
        String normalizedPhone = fromPhone.replaceAll("[^0-9]", "");
        if (normalizedPhone.length() > 10) {
            normalizedPhone = normalizedPhone.substring(normalizedPhone.length() - 10);
        }

        // 2. Find or Create Citizen
        Optional<User> existingUser = userRepository.findByPhone(normalizedPhone);
        User citizen;
        
        if (existingUser.isPresent()) {
            citizen = existingUser.get();
        } else {
            // Auto-create a minimal citizen account for the offline user
            citizen = User.builder()
                    .name("Offline Citizen")
                    .phone(normalizedPhone)
                    .email("sms_" + normalizedPhone + "@offline.local")
                    .password(passwordEncoder.encode(UUID.randomUUID().toString())) // random unguessable password
                    .role(Role.CITIZEN)
                    .build();
            citizen = userRepository.save(citizen);
        }

        // 3. Create the SOS Request
        SosRequest sosRequest = SosRequest.builder()
                .citizen(citizen)
                .latitude(0.0)
                .longitude(0.0)
                .locationName("Offline SMS - Location Unknown")
                .urgencyLevel(UrgencyLevel.HIGH) // Default to high for offline SMS
                .status(RequestStatus.PENDING)
                .notes("SMS BODY: " + body) // Save the exact SMS message for the dispatcher to read
                .source(RequestSource.SMS)
                .citizenPhone(normalizedPhone)
                .build();
        
        sosRequestRepository.save(sosRequest);

        // 4. Return TwiML XML Response
        String responseMessage = "SOS Received. If you haven't included your address, please reply with your location. Help is on the way.";
        return "<Response><Message>" + responseMessage + "</Message></Response>";
    }
}
