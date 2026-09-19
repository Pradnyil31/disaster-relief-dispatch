package com.disasterrelief.backend.config;

import com.disasterrelief.backend.model.InventoryItem;
import com.disasterrelief.backend.model.Role;
import com.disasterrelief.backend.model.User;
import com.disasterrelief.backend.model.VolunteerStatus;
import com.disasterrelief.backend.repository.InventoryRepository;
import com.disasterrelief.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final InventoryRepository inventoryRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           InventoryRepository inventoryRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.inventoryRepository = inventoryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("patilpradnyil1@gmail.com")) {
            User admin2 = User.builder()
                    .name("Pradnyil Patil")
                    .email("patilpradnyil1@gmail.com")
                    .password(passwordEncoder.encode("Pradnyil@31"))
                    .role(Role.ADMINISTRATOR)
                    .phone("9960250153")
                    .build();
            userRepository.save(admin2);
            System.out.println(">>> SEEDED ADMIN: patilpradnyil1@gmail.com / Pradnyil@31");
        }
        if (!userRepository.existsByEmail("admin@example.com")) {
            User admin = User.builder()
                    .name("System Administrator")
                    .email("admin@example.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMINISTRATOR)
                    .phone("9999900000")
                    .build();
            userRepository.save(admin);
            System.out.println(">>> SEEDED ADMIN USER: admin@example.com / admin123");
        }

        if (!userRepository.existsByEmail("volunteer@example.com")) {
            User volunteer = User.builder()
                    .name("Vikram Volunteer")
                    .email("volunteer@example.com")
                    .password(passwordEncoder.encode("volunteer123"))
                    .role(Role.VOLUNTEER)
                    .phone("9888811111")
                    .volunteerStatus(VolunteerStatus.AVAILABLE)
                    .build();
            userRepository.save(volunteer);
            System.out.println(">>> SEEDED VOLUNTEER USER: volunteer@example.com / volunteer123");
        }

        if (!userRepository.existsByEmail("neha@example.com")) {
            User v2 = User.builder()
                    .name("Neha Sharma")
                    .email("neha@example.com")
                    .password(passwordEncoder.encode("volunteer123"))
                    .role(Role.VOLUNTEER)
                    .phone("9833344556")
                    .volunteerStatus(VolunteerStatus.AVAILABLE)
                    .build();
            userRepository.save(v2);
        }

        if (inventoryRepository.count() == 0) {
            inventoryRepository.save(InventoryItem.builder()
                    .name("BOTTLED WATER")
                    .category(com.disasterrelief.backend.model.ReliefItem.WATER_AND_HYDRATION)
                    .quantity(150)
                    .minimumThreshold(20)
                    .build());

            inventoryRepository.save(InventoryItem.builder()
                    .name("CANNED BEANS")
                    .category(com.disasterrelief.backend.model.ReliefItem.FOOD_AND_RATIONS)
                    .quantity(500)
                    .minimumThreshold(50)
                    .build());

            inventoryRepository.save(InventoryItem.builder()
                    .name("PARACETAMOL")
                    .category(com.disasterrelief.backend.model.ReliefItem.MEDICAL_SUPPLIES)
                    .quantity(80)
                    .minimumThreshold(10)
                    .build());
        }
    }
}
