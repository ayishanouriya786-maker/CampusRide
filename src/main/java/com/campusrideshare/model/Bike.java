package com.campusrideshare.model;

public class Bike extends Vehicle {
    public Bike(String id, String name, String model, double pricePerHour) {
        super(id, name, model, "Bike", pricePerHour);
    }

    @Override
    public double calculateRentalCost(int hours) {
        double base = getPricePerHour() * hours;
        return hours >= 5 ? base * 0.90 : base;
    }
}
