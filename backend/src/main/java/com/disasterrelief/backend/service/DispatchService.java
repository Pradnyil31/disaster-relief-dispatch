package com.disasterrelief.backend.service;

import com.disasterrelief.backend.dto.request.DispatchRequest;
import com.disasterrelief.backend.dto.request.DispatchStatusUpdateRequest;
import com.disasterrelief.backend.dto.response.DispatchResponse;
import com.disasterrelief.backend.exception.BusinessRuleException;
import com.disasterrelief.backend.exception.ResourceNotFoundException;
import com.disasterrelief.backend.model.*;
import com.disasterrelief.backend.repository.DispatchTaskRepository;
import com.disasterrelief.backend.repository.SosRequestRepository;
import com.disasterrelief.backend.repository.TaskStatusLogRepository;
import com.disasterrelief.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DispatchService {

    private final DispatchTaskRepository dispatchTaskRepository;
    private final SosRequestRepository sosRequestRepository;
    private final UserRepository userRepository;
    private final TaskStatusLogRepository taskStatusLogRepository;
    private final InventoryService inventoryService;

    public DispatchService(DispatchTaskRepository dispatchTaskRepository,
                           SosRequestRepository sosRequestRepository,
                           UserRepository userRepository,
                           TaskStatusLogRepository taskStatusLogRepository,
                           InventoryService inventoryService) {
        this.dispatchTaskRepository = dispatchTaskRepository;
        this.sosRequestRepository = sosRequestRepository;
        this.userRepository = userRepository;
        this.taskStatusLogRepository = taskStatusLogRepository;
        this.inventoryService = inventoryService;
    }

    @Transactional
    public DispatchResponse createDispatchTask(DispatchRequest request, User admin) {
        SosRequest sosRequest = sosRequestRepository.findById(request.getSosRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("SOS Request not found with id: " + request.getSosRequestId()));

        if (dispatchTaskRepository.existsBySosRequestId(sosRequest.getId())) {
            throw new BusinessRuleException("A dispatch task has already been created for this SOS Request");
        }

        if (sosRequest.getStatus() == RequestStatus.CLOSED || sosRequest.getStatus() == RequestStatus.DELIVERED) {
            throw new BusinessRuleException("Cannot assign volunteer to a CLOSED or DELIVERED SOS Request");
        }

        User volunteer = userRepository.findById(request.getVolunteerId())
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer user not found with id: " + request.getVolunteerId()));

        if (volunteer.getRole() != Role.VOLUNTEER) {
            throw new BusinessRuleException("User with id " + request.getVolunteerId() + " does not have the VOLUNTEER role");
        }

        // Deduct inventory if specified
        if (request.getInventoryItemId() != null && request.getQuantityDeducted() != null && request.getQuantityDeducted() > 0) {
            inventoryService.deductStock(request.getInventoryItemId(), request.getQuantityDeducted());
        }

        DispatchTask task = DispatchTask.builder()
                .sosRequest(sosRequest)
                .volunteer(volunteer)
                .status(TaskStatus.ASSIGNED)
                .notes(request.getNotes())
                .build();

        DispatchTask savedTask = dispatchTaskRepository.save(task);

        // Update SOS request status
        sosRequest.setStatus(RequestStatus.ASSIGNED);
        sosRequestRepository.save(sosRequest);

        // Audit Log
        TaskStatusLog statusLog = TaskStatusLog.builder()
                .dispatchTask(savedTask)
                .oldStatus(null)
                .newStatus(TaskStatus.ASSIGNED)
                .changedBy(admin)
                .build();
        taskStatusLogRepository.save(statusLog);

        return mapToResponse(savedTask);
    }

    @Transactional
    public DispatchResponse updateTaskStatus(Long taskId, User actor, DispatchStatusUpdateRequest request) {
        DispatchTask task = dispatchTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispatch task not found with id: " + taskId));

        TaskStatus currentStatus = task.getStatus();
        TaskStatus targetStatus = request.getStatus();

        // Enforce sequential status progression: ASSIGNED -> EN_ROUTE -> DELIVERED
        validateSequentialStatus(currentStatus, targetStatus);

        task.setStatus(targetStatus);
        if (request.getNotes() != null && !request.getNotes().isBlank()) {
            task.setNotes(request.getNotes());
        }

        if (targetStatus == TaskStatus.DELIVERED) {
            task.setDeliveredAt(LocalDateTime.now());
            task.getSosRequest().setStatus(RequestStatus.DELIVERED);
        } else if (targetStatus == TaskStatus.EN_ROUTE) {
            task.getSosRequest().setStatus(RequestStatus.EN_ROUTE);
        }

        sosRequestRepository.save(task.getSosRequest());
        DispatchTask updatedTask = dispatchTaskRepository.save(task);

        // Audit Log
        TaskStatusLog statusLog = TaskStatusLog.builder()
                .dispatchTask(updatedTask)
                .oldStatus(currentStatus)
                .newStatus(targetStatus)
                .changedBy(actor)
                .build();
        taskStatusLogRepository.save(statusLog);

        return mapToResponse(updatedTask);
    }

    @Transactional(readOnly = true)
    public List<DispatchResponse> getAllDispatchTasks() {
        return dispatchTaskRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DispatchResponse> getVolunteerDispatchTasks(User volunteer) {
        return dispatchTaskRepository.findByVolunteerOrderByAssignedAtDesc(volunteer).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DispatchResponse getDispatchTaskById(Long taskId) {
        DispatchTask task = dispatchTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispatch task not found with id: " + taskId));
        return mapToResponse(task);
    }

    private void validateSequentialStatus(TaskStatus current, TaskStatus target) {
        if (current == TaskStatus.ASSIGNED && target != TaskStatus.EN_ROUTE) {
            throw new BusinessRuleException("Illegal status transition from ASSIGNED to " + target + ". Must transition to EN_ROUTE next.");
        }
        if (current == TaskStatus.EN_ROUTE && target != TaskStatus.DELIVERED) {
            throw new BusinessRuleException("Illegal status transition from EN_ROUTE to " + target + ". Must transition to DELIVERED next.");
        }
        if (current == TaskStatus.DELIVERED) {
            throw new BusinessRuleException("Dispatch task is already DELIVERED and cannot change status.");
        }
    }

    private DispatchResponse mapToResponse(DispatchTask task) {
        SosRequest sos = task.getSosRequest();
        User citizen = sos != null ? sos.getCitizen() : null;
        User volunteer = task.getVolunteer();

        return DispatchResponse.builder()
                .id(task.getId())
                .sosRequestId(sos != null ? sos.getId() : null)
                .citizenName(citizen != null ? citizen.getName() : "SMS Requester")
                .locationAddress(sos != null ? sos.getLocationAddress() : null)
                .urgencyLevel(sos != null ? sos.getUrgencyLevel() : null)
                .volunteerId(volunteer != null ? volunteer.getId() : null)
                .volunteerName(volunteer != null ? volunteer.getName() : null)
                .status(task.getStatus())
                .notes(task.getNotes())
                .assignedAt(task.getAssignedAt())
                .deliveredAt(task.getDeliveredAt())
                .build();
    }
}