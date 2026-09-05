package com.retailstore.admin.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Per-product sales analytics, attributed to the product's shop.
 * Returned directly from a JPQL constructor projection (grouped by product + shop),
 * so the SUM parameter types are wrappers (Long / Double).
 *
 * quantitySold = SUM(orderItem.quantity) over finalized-sale orders.
 * revenueGenerated = SUM(orderItem.price * orderItem.quantity) over finalized-sale orders.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductSalesDTO {

    private Integer productId;
    private String pname;
    private Integer shopId;
    private String shopName;
    private Long quantitySold;
    private Double revenueGenerated;
}
