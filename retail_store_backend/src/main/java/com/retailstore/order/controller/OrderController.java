package com.retailstore.order.controller;

import com.retailstore.order.dto.AddCartItemRequestDTO;
import com.retailstore.order.dto.CheckoutRequestDTO;
import com.retailstore.order.dto.CheckoutResponseDTO;
import com.retailstore.order.dto.OrderResponseDTO;
import com.retailstore.order.service.OrderService;

import jakarta.persistence.NonUniqueResultException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(
    origins = {
        "http://localhost:5173", 
        "http://localhost:3000", 
        "https://retail-store-frontends.vercel.app"
    },
    allowedHeaders = "*",
    methods = {
        RequestMethod.GET, 
        RequestMethod.POST, 
        RequestMethod.PUT, 
        RequestMethod.DELETE, 
        RequestMethod.OPTIONS
    }
)
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // ---------------- GET CUSTOMER ORDER HISTORY ----------------
    @GetMapping
    public ResponseEntity<List<OrderResponseDTO>> getMyOrders(HttpServletRequest request) {
        try {
            return ResponseEntity.ok(orderService.getCustomerOrders(request));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ---------------- GET CART ----------------
    @GetMapping("/cart")
    public ResponseEntity<OrderResponseDTO> getCart(HttpServletRequest request) {
        try {
            return ResponseEntity.ok(orderService.getCart(request));
        } catch (Exception e) {
            return handleOrderResponseException(e);
        }
    }

    // ---------------- ADD TO CART ----------------
    @PostMapping("/cart")
    public ResponseEntity<OrderResponseDTO> addCartItem(
            HttpServletRequest request,
            @Valid @RequestBody AddCartItemRequestDTO itemRequest
    ) {
        try {
            return ResponseEntity.ok(orderService.addCartItem(request, itemRequest));
        } catch (Exception e) {
            return handleOrderResponseException(e);
        }
    }

    // ---------------- REMOVE CART ITEM ----------------
    @DeleteMapping("/cart/item/{productId}")
    public ResponseEntity<OrderResponseDTO> removeCartItem(
            HttpServletRequest request,
            @PathVariable int productId
    ) {
        try {
            return ResponseEntity.ok(orderService.removeCartItem(request, productId));
        } catch (Exception e) {
            return handleOrderResponseException(e);
        }
    }

    // ---------------- CHECKOUT ----------------
    @PostMapping("/checkout")
    public ResponseEntity<CheckoutResponseDTO> checkout(
            HttpServletRequest request,
            @Valid @RequestBody CheckoutRequestDTO checkoutRequest
    ) {
        try {
            return ResponseEntity.ok(orderService.checkout(request, checkoutRequest));
        } catch (ResponseStatusException e) {
            CheckoutResponseDTO error = new CheckoutResponseDTO();
            error.setMessage(e.getReason());
            return ResponseEntity.status(e.getStatusCode()).body(error);
        } catch (NonUniqueResultException e) {
            CheckoutResponseDTO error = new CheckoutResponseDTO();
            error.setMessage("Multiple carts found for user");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        } catch (Exception e) {
            e.printStackTrace();
            CheckoutResponseDTO error = new CheckoutResponseDTO();
            error.setMessage("Unexpected error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ---------------- CLEAR CART ----------------
    @DeleteMapping("/cart")
    public ResponseEntity<String> clearCart(HttpServletRequest request) {
        try {
            orderService.clearCart(request);
            return ResponseEntity.ok("Cart cleared successfully");
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        } catch (NonUniqueResultException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Multiple carts found for user");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unexpected error: " + e.getMessage());
        }
    }

    // Helper handler to construct structured error responses
    private ResponseEntity<OrderResponseDTO> handleOrderResponseException(Exception e) {
        OrderResponseDTO error = new OrderResponseDTO();
        if (e instanceof ResponseStatusException rse) {
            error.setMessage(rse.getReason());
            return ResponseEntity.status(rse.getStatusCode()).body(error);
        } else if (e instanceof NonUniqueResultException) {
            error.setMessage("Multiple carts found for user");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        } else {
            e.printStackTrace();
            error.setMessage("Unexpected error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}