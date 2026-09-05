package com.retailstore.order.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequestDTO {

    @JsonProperty("payment_mode")
    private String paymentMode;

    @JsonProperty("delivery_mode")
    private String deliveryMode;
}