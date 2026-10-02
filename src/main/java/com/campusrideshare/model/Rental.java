package com.campusrideshare.model;

import java.time.LocalDateTime;

public class Rental {
    private final String id;
    private final String studentId;
    private final String vehicleId;
    private final String vehicleName;
    private final int hours;
    private final double amount;
    private final LocalDateTime startTime;
    private LocalDateTime returnTime;
    private String status;

    public Rental(String id, String studentId, String vehicleId, String vehicleName,
                  int hours, double amount) {
        this.id = id;
        this.studentId = studentId;
        this.vehicleId = vehicleId;
        this.vehicleName = vehicleName;
        this.hours = hours;
        this.amount = amount;
        this.startTime = LocalDateTime.now();
        this.status = "ACTIVE";
    }

    public String getId() { return id; }
    public String getStudentId() { return studentId; }
    public String getVehicleId() { return vehicleId; }
    public String getVehicleName() { return vehicleName; }
    public int getHours() { return hours; }
    public double getAmount() { return amount; }
    public LocalDateTime getStartTime() { return startTime; }
    public LocalDateTime getReturnTime() { return returnTime; }
    public String getStatus() { return status; }

    public void complete() {
        this.status = "COMPLETED";
        this.returnTime = LocalDateTime.now();
    }
}
