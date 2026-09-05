package com.retailstore.order.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDTO {

    private Integer itemNo;
    private Integer productId;
    private String productName;
    private Double price;
    private Integer quantity;
}