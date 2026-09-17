package com.disasterrelief.backend.service;

import com.disasterrelief.backend.model.UrgencyLevel;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class SmsParserService {

    public UrgencyLevel parseUrgency(String body) {
        if (body == null) {
            return UrgencyLevel.LOW;
        }
        String text = body.toLowerCase(Locale.ROOT);
        if (text.contains("critical") || text.contains("urgent") || text.contains("emergency") ||
                text.contains("trapped") || text.contains("sos") || text.contains("immediately")) {
            return UrgencyLevel.HIGH;
        }
        if (text.contains("food") || text.contains("water") || text.contains("medicine") ||
                text.contains("shelter") || text.contains("help")) {
            return UrgencyLevel.MEDIUM;
        }
        return UrgencyLevel.LOW;
    }
}