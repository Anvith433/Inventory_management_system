package com.retailstore.admin.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A single product row for inventory views (low-stock / out-of-stock / shop stock breakdown).
 * inventoryValue = price * stockQuantity for this product.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InventoryProductDTO {

    private Integer productId;
    private String pname;
    private Integer shopId;
    private String shopName;
    private Double price;
    private Integer stockQuantity;
    private Double inventoryValue;
}
