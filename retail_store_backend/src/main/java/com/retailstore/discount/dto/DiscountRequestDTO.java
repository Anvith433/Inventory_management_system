package com.retailstore.discount.dto;

import java.util.List;

public class DiscountRequestDTO {

    private List<Integer> productIds;
    private double totalAmount;

    //  REQUIRED no-args constructor
    public DiscountRequestDTO() {
    }

    // Getters and setters
    public List<Integer> getProductIds() {
        return productIds;
    }

    public void setProductIds(List<Integer> productIds) {
        this.productIds = productIds;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }
}
