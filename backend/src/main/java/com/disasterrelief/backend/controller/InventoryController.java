package com.disasterrelief.backend.controller;

import com.disasterrelief.backend.dto.request.InventoryRequest;
import com.disasterrelief.backend.dto.response.InventoryResponse;
import com.disasterrelief.backend.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @PostMapping
    public ResponseEntity<InventoryResponse> createItem(@Valid @RequestBody InventoryRequest request) {
        InventoryResponse response = inventoryService.createInventoryItem(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<InventoryResponse>> getAllItems(
            @RequestParam(required = false) com.disasterrelief.backend.model.ReliefItem category,
            @RequestParam(required = false) Boolean lowStock,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<InventoryResponse> response = inventoryService.getAllInventoryItems(category, lowStock, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventoryResponse> getItemById(@PathVariable Long id) {
        InventoryResponse response = inventoryService.getInventoryItemById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InventoryResponse> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody InventoryRequest request) {

        InventoryResponse response = inventoryService.updateInventoryItem(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        inventoryService.deleteInventoryItem(id);
        return ResponseEntity.noContent().build();
    }
}