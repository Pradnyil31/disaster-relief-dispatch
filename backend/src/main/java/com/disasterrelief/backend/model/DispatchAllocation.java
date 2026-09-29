package com.disasterrelief.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dispatch_allocations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DispatchAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dispatch_task_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private DispatchTask dispatchTask;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_item_id", nullable = false)
    private InventoryItem inventoryItem;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;
}
