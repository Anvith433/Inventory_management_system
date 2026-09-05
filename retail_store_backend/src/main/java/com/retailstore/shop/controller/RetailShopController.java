package com.retailstore.shop.controller;

import com.retailstore.security.service.AuthService;
import com.retailstore.customer.entity.Customer;
import com.retailstore.shop.dto.RetailShopDTO;
import com.retailstore.shop.service.RetailShopService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/shops")
@CrossOrigin(origins = {
    "http://localhost:3000", 
    "http://localhost:3001", 
    "http://localhost:5173", 
    "https://retail-store-frontends.vercel.app"
})
public class RetailShopController {

    private final AuthService authService;
    private final RetailShopService retailShopService;

    // Constructor injection replaces @Autowired
    public RetailShopController(AuthService authService, RetailShopService retailShopService) {
        this.authService = authService;
        this.retailShopService = retailShopService;
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<RetailShopDTO>> getNearbyShops(HttpServletRequest request) {

        Customer customer = authService.getLoggedInCustomer(request);
        if (customer == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        String city = customer.getCity(); // from DB

        List<RetailShopDTO> shops = retailShopService.getNearbyShops(city);

        return ResponseEntity.ok(shops);
    }
}