package com.campusrideshare.model;

public class Bicycle extends Vehicle {
    public Bicycle(String id, String name, String model, double pricePerHour) {
        super(id, name, model, "Bicycle", pricePerHour);
    }

    @Override
    public double calculateRentalCost(int hours) {
        return getPricePerHour() * hours;
    }
}
