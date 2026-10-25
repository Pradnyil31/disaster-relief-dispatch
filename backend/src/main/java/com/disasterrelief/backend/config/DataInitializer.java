package com.disasterrelief.backend.config;

import com.disasterrelief.backend.model.InventoryItem;
import com.disasterrelief.backend.model.Role;
import com.disasterrelief.backend.model.User;
import com.disasterrelief.backend.model.VolunteerStatus;
import com.disasterrelief.backend.repository.InventoryRepository;
import com.disasterrelief.backend.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
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
                    .isActive(true)
                    .build();
            userRepository.save(admin2);
            log.info("Seeded Admin: patilpradnyil1@gmail.com");
        }
        if (!userRepository.existsByEmail("admin@example.com")) {
            User admin = User.builder()
                    .name("System Administrator")
                    .email("admin@example.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMINISTRATOR)
                    .phone("9999900000")
                    .isActive(true)
                    .build();
            userRepository.save(admin);
            log.info("Seeded Admin User: admin@example.com");
        }

        if (!userRepository.existsByEmail("volunteer@example.com")) {
            User volunteer = User.builder()
                    .name("Vikram Volunteer")
                    .email("volunteer@example.com")
                    .password(passwordEncoder.encode("volunteer123"))
                    .role(Role.VOLUNTEER)
                    .phone("9888811111")
                    .volunteerStatus(VolunteerStatus.AVAILABLE)
                    .isActive(true)
                    .build();
            userRepository.save(volunteer);
            log.info("Seeded Volunteer User: volunteer@example.com");
        }

        if (!userRepository.existsByEmail("citizen@example.com")) {
            User citizen = User.builder()
                    .name("Jane Citizen")
                    .email("citizen@example.com")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.CITIZEN)
                    .phone("9876543210")
                    .isActive(true)
                    .build();
            userRepository.save(citizen);
            log.info("Seeded Citizen User: citizen@example.com");
        }

        if (!userRepository.existsByEmail("donor@example.com")) {
            User donor = User.builder()
                    .name("Dave Donor")
                    .email("donor@example.com")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.DONOR)
                    .phone("9777712345")
                    .isActive(true)
                    .build();
            userRepository.save(donor);
            log.info("Seeded Donor User: donor@example.com");
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
