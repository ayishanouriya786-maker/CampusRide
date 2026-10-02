package com.campusrideshare.model;

public class Scooter extends Vehicle {
    public Scooter(String id, String name, String model, double pricePerHour) {
        super(id, name, model, "Scooter", pricePerHour);
    }

    @Override
    public double calculateRentalCost(int hours) {
        return getPricePerHour() * hours;
    }
}
