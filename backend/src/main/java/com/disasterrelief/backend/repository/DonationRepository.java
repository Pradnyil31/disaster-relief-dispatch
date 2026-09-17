package com.disasterrelief.backend.repository;

import com.disasterrelief.backend.model.Donation;
import com.disasterrelief.backend.model.DonationStatus;
import com.disasterrelief.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {
    List<Donation> findByDonorOrderByCreatedAtDesc(User donor);
    List<Donation> findByStatusOrderByCreatedAtDesc(DonationStatus status);
}