package com.disasterrelief.backend.repository;

import com.disasterrelief.backend.model.DispatchTask;
import com.disasterrelief.backend.model.TaskStatusLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskStatusLogRepository extends JpaRepository<TaskStatusLog, Long> {
    List<TaskStatusLog> findByDispatchTaskOrderByChangedAtDesc(DispatchTask task);
}