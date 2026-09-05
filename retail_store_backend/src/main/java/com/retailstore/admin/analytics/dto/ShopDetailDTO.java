package com.retailstore.admin.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Drill-down payload for a single shop: its headline analytics plus its best-selling products
 * and an inventory breakdown (low / out-of-stock lists + a normal-stock count).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ShopDetailDTO {

    private ShopAnalyticsDTO shop;
    private List<ProductSalesDTO> topProducts;
    private List<InventoryProductDTO> lowStock;
    private List<InventoryProductDTO> outOfStock;
    private long normalStockCount;
    private int lowStockThreshold;
}
