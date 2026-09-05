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
public class CheckoutResponseDTO 
{
    private Integer orderId;   
    private Double totalAmount;
    private String status;
    private String message;
}