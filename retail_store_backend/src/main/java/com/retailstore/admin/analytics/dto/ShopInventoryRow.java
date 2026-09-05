package com.retailstore.admin.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Internal JPQL constructor-projection row for per-shop INVENTORY aggregation.
 * Uses RetailShop LEFT JOIN products so shops with zero products are still returned
 * (productCount = 0, stockUnits / inventoryValue = NULL -> coalesced to 0 in the service).
 */
@Getter
@AllArgsConstructor
public class ShopInventoryRow {

    private final Integer shopId;
    /** COUNT(product) for the shop. */
    private final Long productCount;
    /** SUM(product.stockQuantity). */
    private final Long stockUnits;
    /** SUM(product.price * product.stockQuantity). */
    private final Double inventoryValue;
}
