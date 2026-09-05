package com.retailstore.security.controller;

import com.retailstore.security.dto.LoginRequestDTO;
import com.retailstore.security.dto.LoginResponseDTO;
import com.retailstore.security.dto.RegisterRequestDTO;
import com.retailstore.security.service.AuthService;
import com.retailstore.customer.entity.Customer;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
    "http://localhost:3000", 
    "http://localhost:3001", 
    "http://localhost:5173", 
    "https://retail-store-frontends.vercel.app"
})
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequestDTO request) {
        try {
            return ResponseEntity.ok(authService.register(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        try {
            LoginResponseDTO response = authService.loginWithDetails(loginRequest);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication failed: " + e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        try {
            Customer customer = authService.getLoggedInCustomer(request);
            if (customer == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("customer_id", customer.getCustomerId());
            response.put("name", customer.getName());
            response.put("email", customer.getEmail());
            response.put("street", customer.getStreet());
            response.put("city", customer.getCity());
            response.put("pincode", customer.getPincode());
            response.put("role", customer.getRole());
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }
    }
}