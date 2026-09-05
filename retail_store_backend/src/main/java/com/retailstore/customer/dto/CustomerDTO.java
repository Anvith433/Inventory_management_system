package com.retailstore.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDTO {

    private Integer customerId;
    private String name;
    private String street;
    private String city;
    private String pincode;

    // Projection Constructor for JPQL/Native queries
    public CustomerDTO(Integer customerId, String name) {
        this.customerId = customerId;
        this.name = name;
    }
}