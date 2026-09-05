package com.retailstore.order.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDTO {

    @JsonProperty("order_id")
    private Integer orderId;

    @JsonProperty("order_date")
    private LocalDate orderDate;

    @JsonProperty("status")
    private String status;

    @JsonProperty("total_amount")
    private Double totalAmount;

    @JsonProperty("payment_mode")
    private String paymentMode;

    @JsonProperty("delivery_mode")
    private String deliveryMode;

    @JsonProperty("order_items")
    private List<OrderItemDTO> orderItems;

    @JsonProperty("message")
    private String message;
}