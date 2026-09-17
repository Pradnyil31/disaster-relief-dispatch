package com.disasterrelief.backend.repository;

import com.disasterrelief.backend.model.DispatchTask;
import com.disasterrelief.backend.model.TaskStatus;
import com.disasterrelief.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DispatchTaskRepository extends JpaRepository<DispatchTask, Long> {
    List<DispatchTask> findByVolunteerOrderByAssignedAtDesc(User volunteer);
    List<DispatchTask> findByStatus(TaskStatus status);
    boolean existsBySosRequestId(Long sosRequestId);
    Optional<DispatchTask> findBySosRequestId(Long sosRequestId);
}