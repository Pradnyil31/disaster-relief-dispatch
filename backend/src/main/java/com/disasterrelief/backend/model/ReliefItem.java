package com.disasterrelief.backend.model;

public enum ReliefItem {
    WATER_AND_HYDRATION("Water & Hydration", "WATER"),
    FOOD_AND_RATIONS("Food & Rations", "FOOD"),
    MEDICAL_SUPPLIES("Medical Supplies", "MEDICAL"),
    SHELTER_AND_BLANKETS("Shelter & Blankets", "SHELTER"),
    CLOTHING("Clothing", "CLOTHING"),
    FUEL_AND_ENERGY("Fuel & Energy", "FUEL"),
    RESCUE_EQUIPMENT("Rescue Equipment", "RESCUE"),
    COMMUNICATION_DEVICES("Communication Devices", "COMMUNICATION"),
    OTHER("Other", "OTHER");

    private final String displayName;
    private final String defaultCategory;

    ReliefItem(String displayName, String defaultCategory) {
        this.displayName = displayName;
        this.defaultCategory = defaultCategory;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDefaultCategory() {
        return defaultCategory;
    }
}
