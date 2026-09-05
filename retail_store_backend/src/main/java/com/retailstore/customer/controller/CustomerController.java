package com.retailstore.customer.controller;

import com.retailstore.customer.dto.CustomerDTO;
import com.retailstore.customer.dto.CustomerResponseDTO;
import com.retailstore.customer.service.CustomerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

   
    @GetMapping("/profile")
    public ResponseEntity<CustomerResponseDTO> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(customerService.getCustomerByEmail(userDetails.getUsername()));
    }

    
    @PutMapping("/profile")
    public ResponseEntity<CustomerResponseDTO> updateMyProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CustomerDTO dto) {
        return ResponseEntity.ok(customerService.updateCustomerByEmail(userDetails.getUsername(), dto));
    }
}