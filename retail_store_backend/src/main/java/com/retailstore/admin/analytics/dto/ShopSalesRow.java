package com.retailstore.admin.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Internal JPQL constructor-projection row for per-shop SALES aggregation.
 * Sourced from OrderItem -> Product -> RetailShop, restricted to finalized-sale orders.
 *
 * Wrapper types are intentional: SUM(...) yields NULL for groups with no matching
 * order items, and COUNT(...) yields Long. The service coalesces NULLs to 0.
 */
@Getter
@AllArgsConstructor
public class ShopSalesRow {

    private final Integer shopId;
    /** SUM(orderItem.price * orderItem.quantity) — line revenue, never Orders.total_amount. */
    private final Double revenue;
    /** COUNT(DISTINCT order_id) — a multi-shop order is counted once per shop. */
    private final Long orderCount;
    /** SUM(orderItem.quantity) — total units sold. */
    private final Long productsSold;
}
