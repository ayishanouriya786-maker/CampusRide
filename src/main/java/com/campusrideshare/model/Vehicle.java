package com.campusrideshare.model;

public abstract class Vehicle {
    private final String id;
    private final String name;
    private final String model;
    private final String type;
    private final double pricePerHour;
    private boolean available;

    public Vehicle(String id, String name, String model, String type, double pricePerHour) {
        this.id = id;
        this.name = name;
        this.model = model;
        this.type = type;
        this.pricePerHour = pricePerHour;
        this.available = true;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getModel() { return model; }
    public String getType() { return type; }
    public double getPricePerHour() { return pricePerHour; }
    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }

    public abstract double calculateRentalCost(int hours);

    public String getDescription() {
        return name + " " + model + " - " + type;
    }
}
