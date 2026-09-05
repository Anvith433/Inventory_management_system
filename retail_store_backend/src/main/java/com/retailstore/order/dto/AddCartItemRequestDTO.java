package com.retailstore.order.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Positive;

public class AddCartItemRequestDTO {

    @JsonProperty("productId")
    @JsonAlias("product_id") // Accepts both "productId" and "product_id"!
    @Positive(message = "Product ID must be a positive integer")
    private int productId;

    @Positive(message = "Quantity must be a positive integer")
    private int quantity;

    public AddCartItemRequestDTO() {}

    public AddCartItemRequestDTO(int productId, int quantity) {
        this.productId = productId;
        this.quantity = quantity;
    }

    public int getProductId() {
        return productId;
    }

    public void setProductId(int productId) {
        this.productId = productId;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}