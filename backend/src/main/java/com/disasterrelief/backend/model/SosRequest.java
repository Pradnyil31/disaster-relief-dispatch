package com.disasterrelief.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "sos_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SosRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "citizen_id", nullable = true)
    private User citizen;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UrgencyLevel urgencyLevel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status;

    private Double latitude;
    private Double longitude;

    @Column(name = "location_name")
    private String locationName;

    @ElementCollection
    @CollectionTable(name = "sos_required_supplies", joinColumns = @JoinColumn(name = "sos_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "supply")
    @OrderColumn(name = "supply_order")
    private List<ReliefItem> requiredSupplies;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestSource source;

    @Column(name = "citizen_phone")
    private String citizenPhone;

    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = RequestStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}