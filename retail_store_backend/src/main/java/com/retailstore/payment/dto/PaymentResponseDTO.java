package com.retailstore.payment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponseDTO {

    @JsonProperty("payment_id")
    private Integer paymentId;

    @JsonProperty("status")
    private String status;

    @JsonProperty("message")
    private String message;
}