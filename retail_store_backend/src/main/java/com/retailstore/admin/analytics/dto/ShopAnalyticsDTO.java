package com.retailstore.admin.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Complete per-shop performance record. Every field is computed and set by AnalyticsService
 * (NULLs from aggregation are coalesced to 0), so primitives are used for clean JSON output.
 *
 * Formulas (see AnalyticsService for the authoritative implementation):
 *   revenue                 = SUM(orderItem.price * orderItem.quantity)  [finalized-sale orders]
 *   orderCount              = COUNT(DISTINCT order_id)                    [finalized-sale orders]
 *   productsSold            = SUM(orderItem.quantity)                     [finalized-sale orders]
 *   productCount            = COUNT(product)
 *   stockUnits              = SUM(product.stockQuantity)
 *   inventoryValue          = SUM(product.price * product.stockQuantity)
 *   averageOrderValue       = revenue / orderCount                        (0 when orderCount = 0)
 *   revenueContributionPct  = revenue / totalRevenue * 100                (0 when totalRevenue = 0)
 *   revenueToInventoryRatio = revenue / inventoryValue                    (0 when inventoryValue = 0)
 *   performanceScore        = 100 * (0.5*rev/maxRev + 0.3*orders/maxOrders + 0.2*sold/maxSold)
 *   performanceTier         = HIGH (>=66) | MEDIUM (33..65) | LOW (<33)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ShopAnalyticsDTO {

    private Integer shopId;
    private String shopName;
    private String ownerName;
    private String location;

    private double revenue;
    private long orderCount;
    private long productsSold;
    private long productCount;
    private long stockUnits;
    private double inventoryValue;

    private double averageOrderValue;
    private double revenueContributionPct;
    private double revenueToInventoryRatio;

    private double performanceScore;
    private String performanceTier;

    private String topProductName;
    private long topProductUnits;
}
