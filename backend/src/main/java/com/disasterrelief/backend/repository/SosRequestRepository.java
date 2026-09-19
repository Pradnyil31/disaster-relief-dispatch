package com.disasterrelief.backend.repository;

import com.disasterrelief.backend.model.RequestStatus;
import com.disasterrelief.backend.model.SosRequest;
import com.disasterrelief.backend.model.UrgencyLevel;
import com.disasterrelief.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SosRequestRepository extends JpaRepository<SosRequest, Long> {
    List<SosRequest> findByCitizenOrderByCreatedAtDesc(User citizen);
    Page<SosRequest> findByUrgencyLevel(UrgencyLevel urgencyLevel, Pageable pageable);
    Page<SosRequest> findByStatus(RequestStatus status, Pageable pageable);
    Page<SosRequest> findByUrgencyLevelAndStatus(UrgencyLevel urgencyLevel, RequestStatus status, Pageable pageable);
    
    Page<SosRequest> findByCitizen(User citizen, Pageable pageable);
    Page<SosRequest> findByCitizenAndUrgencyLevel(User citizen, UrgencyLevel urgencyLevel, Pageable pageable);
    Page<SosRequest> findByCitizenAndStatus(User citizen, RequestStatus status, Pageable pageable);
    Page<SosRequest> findByCitizenAndUrgencyLevelAndStatus(User citizen, UrgencyLevel urgencyLevel, RequestStatus status, Pageable pageable);
}