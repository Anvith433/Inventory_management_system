package com.retailstore.shop.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ShopInventoryDTO {

    @JsonProperty("shop_id")
    private Integer shopId;

    @JsonProperty("shop_name")
    private String shopName;

    @JsonProperty("inventory_value")
    private Double inventoryValue;
}