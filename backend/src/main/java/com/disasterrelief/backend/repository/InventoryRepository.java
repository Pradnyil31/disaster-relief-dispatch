package com.disasterrelief.backend.repository;

import com.disasterrelief.backend.model.InventoryItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.disasterrelief.backend.model.ReliefItem;

@Repository
public interface InventoryRepository extends JpaRepository<InventoryItem, Long> {

    Page<InventoryItem> findByCategory(ReliefItem category, Pageable pageable);

    @Query("SELECT i FROM InventoryItem i WHERE i.quantity <= i.minimumThreshold")
    Page<InventoryItem> findLowStockItems(Pageable pageable);

    @Query("SELECT i FROM InventoryItem i WHERE i.category = :category AND i.quantity <= i.minimumThreshold")
    Page<InventoryItem> findLowStockItemsByCategory(@Param("category") ReliefItem category, Pageable pageable);

    @Query("SELECT i FROM InventoryItem i WHERE UPPER(i.name) = UPPER(:name)")
    java.util.Optional<InventoryItem> findByNameIgnoreCase(@Param("name") String name);
}