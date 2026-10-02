package com.campusrideshare.service;

import com.campusrideshare.model.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class CampusRideService {
    private final Map<String, Vehicle> vehicles = new LinkedHashMap<>();
    private final Map<String, Student> students = new LinkedHashMap<>();
    private final List<Rental> rentals = new ArrayList<>();
    private final AtomicInteger studentSequence = new AtomicInteger(1001);
    private final AtomicInteger rentalSequence = new AtomicInteger(5001);

    public CampusRideService() {
        addVehicle(new Bicycle("CY101", "Urban Glide", "City 2.0", 20));
        addVehicle(new Bicycle("CY102", "Campus Cruiser", "C1", 25));
        addVehicle(new Scooter("SC201", "Volt X", "Electric 2026", 45));
        addVehicle(new Scooter("SC202", "Volt Mini", "Urban E", 40));
        addVehicle(new Bike("BK301", "Street Runner", "160R", 70));
        addVehicle(new Bike("BK302", "Campus Beast", "200", 85));
    }

    private void addVehicle(Vehicle v) { vehicles.put(v.getId(), v); }

    public List<Vehicle> getVehicles(String type, String search) {
        String t = type == null ? "all" : type.toLowerCase();
        String s = search == null ? "" : search.toLowerCase().trim();

        return vehicles.values().stream()
                .filter(v -> t.equals("all") || v.getType().toLowerCase().equals(t))
                .filter(v -> s.isBlank()
                        || v.getName().toLowerCase().contains(s)
                        || v.getModel().toLowerCase().contains(s)
                        || v.getId().toLowerCase().contains(s))
                .collect(Collectors.toList());
    }

    public Vehicle getVehicle(String id) {
        Vehicle v = vehicles.get(id);
        if (v == null) throw new IllegalArgumentException("Vehicle not found");
        return v;
    }

    public Student register(String name, String email, String password) {
        if (name == null || name.isBlank() || email == null || email.isBlank()
                || password == null || password.length() < 4) {
            throw new IllegalArgumentException("Enter valid details. Password must have at least 4 characters.");
        }
        if (students.values().stream().anyMatch(s -> s.getEmail().equalsIgnoreCase(email))) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }
        Student student = new Student("STU" + studentSequence.getAndIncrement(),
                name.trim(), email.trim().toLowerCase(), password);
        students.put(student.getId(), student);
        return student;
    }

    public Student login(String email, String password) {
        return students.values().stream()
                .filter(s -> s.getEmail().equalsIgnoreCase(email))
                .findFirst()
                .filter(s -> s.passwordMatches(password))
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));
    }

    public synchronized Rental rent(String studentId, String vehicleId, int hours) {
        if (hours < 1 || hours > 24) throw new IllegalArgumentException("Rental duration must be 1–24 hours.");
        Vehicle v = getVehicle(vehicleId);
        if (!v.isAvailable()) throw new IllegalStateException("This vehicle is currently unavailable.");

        boolean active = rentals.stream().anyMatch(r -> r.getStudentId().equals(studentId)
                && r.getStatus().equals("ACTIVE"));
        if (active) throw new IllegalStateException("You already have an active rental. Return it first.");

        double amount = v.calculateRentalCost(hours);
        Rental rental = new Rental("RNT" + rentalSequence.getAndIncrement(),
                studentId, vehicleId, v.getName(), hours, amount);
        rentals.add(rental);
        v.setAvailable(false);
        return rental;
    }

    public synchronized Rental returnVehicle(String rentalId, String studentId) {
        Rental r = rentals.stream()
                .filter(x -> x.getId().equals(rentalId) && x.getStudentId().equals(studentId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Rental not found."));
        if (!r.getStatus().equals("ACTIVE")) throw new IllegalStateException("Rental is already completed.");

        r.complete();
        getVehicle(r.getVehicleId()).setAvailable(true);
        return r;
    }

    public List<Rental> history(String studentId) {
        return rentals.stream()
                .filter(r -> r.getStudentId().equals(studentId))
                .sorted(Comparator.comparing(Rental::getStartTime).reversed())
                .collect(Collectors.toList());
    }

    public Optional<Rental> activeRental(String studentId) {
        return rentals.stream()
                .filter(r -> r.getStudentId().equals(studentId) && r.getStatus().equals("ACTIVE"))
                .findFirst();
    }
}
