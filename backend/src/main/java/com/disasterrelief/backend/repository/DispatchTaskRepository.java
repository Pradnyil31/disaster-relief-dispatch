package com.disasterrelief.backend.repository;

import com.disasterrelief.backend.model.DispatchTask;
import com.disasterrelief.backend.model.TaskStatus;
import com.disasterrelief.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

@Repository
public interface DispatchTaskRepository extends JpaRepository<DispatchTask, Long> {
    List<DispatchTask> findByVolunteerOrderByAssignedAtDesc(User volunteer);
    List<DispatchTask> findByStatus(TaskStatus status);
    
    Page<DispatchTask> findByVolunteer(User volunteer, Pageable pageable);
    Page<DispatchTask> findByVolunteerAndStatus(User volunteer, TaskStatus status, Pageable pageable);
    Page<DispatchTask> findByStatus(TaskStatus status, Pageable pageable);
    
    boolean existsBySosRequestId(Long sosRequestId);
    Optional<DispatchTask> findBySosRequestId(Long sosRequestId);

    int countByVolunteerAndStatusNot(User volunteer, TaskStatus status);
}