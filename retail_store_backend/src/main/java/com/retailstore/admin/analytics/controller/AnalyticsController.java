package com.retailstore.admin.analytics.controller;

import com.retailstore.admin.analytics.dto.DashboardSummaryDTO;
import com.retailstore.admin.analytics.dto.InventoryProductDTO;
import com.retailstore.admin.analytics.dto.ProductSalesDTO;
import com.retailstore.admin.analytics.dto.ShopAnalyticsDTO;
import com.retailstore.admin.analytics.dto.ShopDetailDTO;
import com.retailstore.admin.analytics.service.AnalyticsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

/**
 * Read-only admin analytics API for the shop business-intelligence dashboard.
 *
 * Lives under /api/admin/** so it inherits the existing SecurityConfig rule requiring
 * ADMIN / ROLE_ADMIN authority — no endpoint here is public. The @CrossOrigin origins mirror
 * the existing AdminController so the same frontends can reach it.
 *
 * All optional date params are ISO-8601 (yyyy-MM-dd); omitting them means "all time".
 */
@RestController
@RequestMapping("/api/admin/analytics")
@CrossOrigin(origins = {
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "https://retail-store-frontends.vercel.app"
})
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    /** Business-wide executive KPIs. */
    @GetMapping("/summary")
    public DashboardSummaryDTO getSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Integer lowStockThreshold) {
        return analyticsService.getSummary(from, to, lowStockThreshold);
    }

    /** Full per-shop performance table (one row per shop, sorted by revenue DESC). */
    @GetMapping("/shops")
    public List<ShopAnalyticsDTO> getShops(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return analyticsService.getShopAnalytics(from, to);
    }

    /** Drill-down for a single shop: headline analytics + top products + inventory breakdown. */
    @GetMapping("/shops/{shopId}")
    public ShopDetailDTO getShopDetail(
            @PathVariable Integer shopId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Integer lowStockThreshold) {
        return analyticsService.getShopDetail(shopId, from, to, lowStockThreshold);
    }

    /** Top-selling products across all shops (by units sold). */
    @GetMapping("/top-products")
    public List<ProductSalesDTO> getTopProducts(
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return analyticsService.getTopProducts(limit, from, to);
    }

    /** Products at or below the low-stock threshold (default 10), still in stock. */
    @GetMapping("/inventory/low-stock")
    public List<InventoryProductDTO> getLowStock(@RequestParam(required = false) Integer threshold) {
        return analyticsService.getLowStock(threshold);
    }

    /** Products with zero (or negative) stock. */
    @GetMapping("/inventory/out-of-stock")
    public List<InventoryProductDTO> getOutOfStock() {
        return analyticsService.getOutOfStock();
    }
}
