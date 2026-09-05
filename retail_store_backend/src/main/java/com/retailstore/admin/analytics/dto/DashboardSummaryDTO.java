package com.retailstore.admin.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Business-wide executive KPIs.
 *
 * totalRevenue / totalProductsSold / totalInventoryValue / totalStockUnits are the exact
 * sums of the per-shop figures, so the KPI row is internally consistent with the shop table
 * and the revenue-contribution chart.
 *
 * totalOrders = COUNT(DISTINCT order_id) over finalized-sale orders that contain >= 1 line item.
 * It can be lower than the sum of per-shop order counts because one order spanning multiple
 * shops is counted once here but once per shop in the shop table.
 *
 * averageOrderValue = totalRevenue / totalOrders (0 when totalOrders = 0).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDTO {

    private long totalShops;
    private long totalProducts;
    private long totalCustomers;
    private long totalOrders;

    private double totalRevenue;
    private double totalInventoryValue;
    private long totalStockUnits;
    private long totalProductsSold;

    private double averageOrderValue;

    private long lowStockCount;
    private long outOfStockCount;
    private int lowStockThreshold;
}
