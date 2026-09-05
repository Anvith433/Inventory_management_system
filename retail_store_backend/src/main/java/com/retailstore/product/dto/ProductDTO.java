package com.retailstore.product.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Integer productId;
    private String pname;
    private String category;
    private Double price;
    private Integer stockQuantity;
    private String imageUrl;
    private Integer shopId;
}