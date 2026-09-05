package com.retailstore.shop.dto;

import com.retailstore.product.dto.ProductDTO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RetailShopDTO {

    private Integer shopId;
    private String shopName;
    private String ownerName;
    private String location;
    private String contact;
    private double inventoryValue;
    private List<ProductDTO> products;

    // JPQL Constructor projection matching JPQL queries
    public RetailShopDTO(Integer shopId, String shopName, String location, double inventoryValue) {
        this.shopId = shopId;
        this.shopName = shopName;
        this.location = location;
        this.inventoryValue = inventoryValue;
    }
}