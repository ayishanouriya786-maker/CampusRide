package com.campusrideshare.controller;

import com.campusrideshare.model.*;
import com.campusrideshare.service.CampusRideService;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class StudentController {
    private final CampusRideService service;

    public StudentController(CampusRideService service) {
        this.service = service;
    }

    @GetMapping("/vehicles")
    public List<Vehicle> vehicles(
            @RequestParam(defaultValue = "all") String type,
            @RequestParam(defaultValue = "") String search) {
        return service.getVehicles(type, search);
    }

    @GetMapping("/vehicles/{id}")
    public Vehicle vehicle(@PathVariable String id) {
        return service.getVehicle(id);
    }

    @PostMapping("/register")
    public Student register(@RequestBody Map<String, String> body) {
        return service.register(body.get("name"), body.get("email"), body.get("password"));
    }

    @PostMapping("/login")
    public Student login(@RequestBody Map<String, String> body) {
        return service.login(body.get("email"), body.get("password"));
    }

    @PostMapping("/rent")
    public Rental rent(@RequestBody Map<String, Object> body) {
        String studentId = (String) body.get("studentId");
        String vehicleId = (String) body.get("vehicleId");
        int hours = ((Number) body.get("hours")).intValue();
        return service.rent(studentId, vehicleId, hours);
    }

    @PostMapping("/return/{rentalId}")
    public Rental returnVehicle(@PathVariable String rentalId,
                                @RequestParam String studentId) {
        return service.returnVehicle(rentalId, studentId);
    }

    @GetMapping("/rentals/{studentId}")
    public List<Rental> history(@PathVariable String studentId) {
        return service.history(studentId);
    }

    @GetMapping("/rentals/{studentId}/active")
    public Map<String, Object> active(@PathVariable String studentId) {
        return service.activeRental(studentId)
                .map(r -> Map.of("active", true, "rental", r))
                .orElse(Map.of("active", false));
    }
}
