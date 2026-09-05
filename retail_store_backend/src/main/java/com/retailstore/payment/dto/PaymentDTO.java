package com.retailstore.payment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDTO {

    @JsonProperty("payment_id")
    private Integer paymentId;

    @JsonProperty("order_id")
    private Integer orderId;

    @JsonProperty("status")
    private String status;

    @JsonProperty("transaction_date")
    private LocalDate transactionDate;

    @JsonProperty("method")
    private String method;
}