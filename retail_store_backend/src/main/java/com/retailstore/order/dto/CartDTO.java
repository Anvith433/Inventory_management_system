// src/main/java/com/retailstore/dto/CartDTO.java
package com.retailstore.order.dto;

import lombok.Data;

import java.util.List;

@Data
public class CartDTO {
    private int order_id;
    private double total_amount;
    private List<OrderItemDTO> order_items;

    public CartDTO(int order_id, double total_amount, List<OrderItemDTO> order_items) {
        this.order_id = order_id;
        this.total_amount = total_amount;
        this.order_items = order_items;
    }
}