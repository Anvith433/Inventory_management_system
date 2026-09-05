package com.retailstore.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponseDTO {

    private Integer customerId;
    private String name;
    private String email;
    private String street;
    private String city;
    private String pincode;
    private String role;
}