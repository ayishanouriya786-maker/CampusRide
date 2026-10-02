# CampusRide — Student Side

A Java OOP campus vehicle-sharing website built with Spring Boot.

## Requirements
- JDK 17+
- Maven 3.9+ (or use the Maven wrapper if you add one)
- VS Code + Extension Pack for Java (recommended)

## Run
1. Open this folder in VS Code.
2. Make sure Java 17 is installed.
3. Open a terminal in the project folder.
4. Run:

   mvn spring-boot:run

5. Open:

   http://localhost:8080

## Demo
Create a student account from the website. Vehicles are preloaded in memory.

## OOP concepts demonstrated
- Encapsulation: private fields + getters/setters
- Inheritance: Bicycle, Scooter and Bike extend Vehicle
- Polymorphism: each vehicle implements calculateRentalCost()
- Abstraction: Vehicle is abstract
- Exception handling: validation and rental errors
- Collections: Map and List
- REST API: Spring Boot controllers

## Important
This version stores data in memory, so registrations and rental history reset when the application restarts. It is intentionally simple to run for a college OOP demo. A MySQL/JPA version can be added later.
