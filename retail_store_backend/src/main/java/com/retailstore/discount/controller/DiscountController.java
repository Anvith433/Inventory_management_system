package com.retailstore.discount.controller;

import com.retailstore.discount.dto.DiscountRequestDTO;
import com.retailstore.discount.dto.DiscountResponseDTO;
import com.retailstore.discount.service.DiscountService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/discounts")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "https://retail-store-frontends.vercel.app"
})
public class DiscountController {

    private final DiscountService discountService;

    public DiscountController(DiscountService discountService) {
        this.discountService = discountService;
    }

    @PostMapping("/apply")
    public ResponseEntity<DiscountResponseDTO> applyDiscount(
            HttpServletRequest request,
            @Valid @RequestBody DiscountRequestDTO discountRequest) {

        DiscountResponseDTO response = discountService.applyDiscount(request, discountRequest);
        return ResponseEntity.ok(response);
    }
}