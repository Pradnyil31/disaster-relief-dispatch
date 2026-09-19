package com.disasterrelief.backend.service;

import com.disasterrelief.backend.dto.request.InventoryRequest;
import com.disasterrelief.backend.dto.response.InventoryResponse;
import com.disasterrelief.backend.exception.BusinessRuleException;
import com.disasterrelief.backend.exception.ResourceNotFoundException;
import com.disasterrelief.backend.model.InventoryItem;
import com.disasterrelief.backend.repository.InventoryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    public InventoryService(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    @Transactional
    public InventoryResponse createInventoryItem(InventoryRequest request) {
        String cleanName = request.getName().trim().toUpperCase();
        
        java.util.Optional<InventoryItem> existing = inventoryRepository.findByNameIgnoreCase(cleanName);
        if (existing.isPresent()) {
            InventoryItem item = existing.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            // Optionally update threshold or category if needed
            return mapToResponse(inventoryRepository.save(item));
        }

        InventoryItem item = InventoryItem.builder()
                .name(cleanName)
                .category(request.getCategory())
                .quantity(request.getQuantity())
                .minimumThreshold(request.getMinimumThreshold())
                .build();

        InventoryItem saved = inventoryRepository.save(item);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<InventoryResponse> getAllInventoryItems(com.disasterrelief.backend.model.ReliefItem category, Boolean lowStock, Pageable pageable) {
        Page<InventoryItem> page;
        boolean filterCategory = category != null;
        boolean filterLowStock = Boolean.TRUE.equals(lowStock);

        if (filterCategory && filterLowStock) {
            page = inventoryRepository.findLowStockItemsByCategory(category, pageable);
        } else if (filterCategory) {
            page = inventoryRepository.findByCategory(category, pageable);
        } else if (filterLowStock) {
            page = inventoryRepository.findLowStockItems(pageable);
        } else {
            page = inventoryRepository.findAll(pageable);
        }
        return page.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public InventoryResponse getInventoryItemById(Long id) {
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));
        return mapToResponse(item);
    }

    @Transactional
    public InventoryResponse updateInventoryItem(Long id, InventoryRequest request) {
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));

        if (request.getName() != null) {
            item.setName(request.getName().trim().toUpperCase());
        }
        if (request.getCategory() != null) {
            item.setCategory(request.getCategory());
        }
        item.setQuantity(request.getQuantity());
        item.setMinimumThreshold(request.getMinimumThreshold());

        InventoryItem updated = inventoryRepository.save(item);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteInventoryItem(Long id) {
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));
        inventoryRepository.delete(item);
    }

    @Transactional
    public void deductStock(Long id, int amount) {
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));

        if (item.getQuantity() < amount) {
            throw new BusinessRuleException("Insufficient inventory for item: " + item.getName() +
                    " (Available: " + item.getQuantity() + ", Required: " + amount + ")");
        }

        item.setQuantity(item.getQuantity() - amount);
        inventoryRepository.save(item);
    }

    private InventoryResponse mapToResponse(InventoryItem item) {
        return InventoryResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .category(item.getCategory())
                .quantity(item.getQuantity())
                .minimumThreshold(item.getMinimumThreshold())
                .lowStock(item.getQuantity() <= item.getMinimumThreshold())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}