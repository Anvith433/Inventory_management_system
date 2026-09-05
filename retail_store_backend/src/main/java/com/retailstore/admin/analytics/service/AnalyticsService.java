package com.retailstore.admin.analytics.service;

import com.retailstore.admin.analytics.dto.DashboardSummaryDTO;
import com.retailstore.admin.analytics.dto.InventoryProductDTO;
import com.retailstore.admin.analytics.dto.ProductSalesDTO;
import com.retailstore.admin.analytics.dto.ShopAnalyticsDTO;
import com.retailstore.admin.analytics.dto.ShopDetailDTO;
import com.retailstore.admin.analytics.dto.ShopInventoryRow;
import com.retailstore.admin.analytics.dto.ShopSalesRow;
import com.retailstore.admin.analytics.repository.AnalyticsRepository;
import com.retailstore.product.repository.ProductRepository;
import com.retailstore.shop.entity.RetailShop;
import com.retailstore.shop.repository.RetailShopRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Computes every shop-performance and business-wide analytic for the admin dashboard from real data.
 *
 * A "finalized sale" is any order whose status is NOT one of {@link #EXCLUDED_STATUSES}. This mirrors
 * the app's own convention (see OrderService#getCustomerOrders) where active carts ("Cart",
 * "High_Value") and cleared carts ("Abandoned") are excluded and everything else (e.g. "Completed",
 * "Delivered") counts as a real purchase.
 */
@Service
public class AnalyticsService {

    /** Order statuses that are NOT finalized sales (active carts + abandoned carts). */
    public static final List<String> EXCLUDED_STATUSES = List.of("Cart", "High_Value", "Abandoned");

    /** Default "low stock" threshold; overridable per request. */
    public static final int DEFAULT_LOW_STOCK_THRESHOLD = 10;

    /** Default number of top-selling products returned. */
    private static final int DEFAULT_TOP_PRODUCTS = 10;

    private final AnalyticsRepository analyticsRepository;
    private final RetailShopRepository shopRepository;
    private final ProductRepository productRepository;

    public AnalyticsService(AnalyticsRepository analyticsRepository,
                            RetailShopRepository shopRepository,
                            ProductRepository productRepository) {
        this.analyticsRepository = analyticsRepository;
        this.shopRepository = shopRepository;
        this.productRepository = productRepository;
    }

    // =====================================================================
    // SHOP ANALYTICS (one row per shop, including shops with no sales/products)
    // =====================================================================
    @Transactional(readOnly = true)
    public List<ShopAnalyticsDTO> getShopAnalytics(LocalDate from, LocalDate to) {
        List<RetailShop> shops = shopRepository.findAll();

        Map<Integer, ShopSalesRow> salesByShop = analyticsRepository.findShopSales(EXCLUDED_STATUSES, from, to)
                .stream().collect(Collectors.toMap(ShopSalesRow::getShopId, Function.identity(), (a, b) -> a));

        Map<Integer, ShopInventoryRow> invByShop = analyticsRepository.findShopInventory()
                .stream().collect(Collectors.toMap(ShopInventoryRow::getShopId, Function.identity(), (a, b) -> a));

        // Best-selling product per shop: product sales are sorted by quantity DESC, so the first
        // occurrence of each shopId is that shop's top seller.
        Map<Integer, ProductSalesDTO> bestByShop = new HashMap<>();
        for (ProductSalesDTO ps : analyticsRepository.findProductSales(EXCLUDED_STATUSES, from, to)) {
            if (ps.getShopId() != null) {
                bestByShop.putIfAbsent(ps.getShopId(), ps);
            }
        }

        // First pass: base metrics + totals/maxima needed for derived metrics.
        List<ShopAnalyticsDTO> result = new ArrayList<>();
        double totalRevenue = 0.0;
        double maxRev = 0.0;
        long maxOrders = 0L;
        long maxSold = 0L;

        for (RetailShop shop : shops) {
            Integer id = shop.getShopId();
            ShopSalesRow sales = salesByShop.get(id);
            ShopInventoryRow inv = invByShop.get(id);

            double revenue = sales != null && sales.getRevenue() != null ? sales.getRevenue() : 0.0;
            long orderCount = sales != null && sales.getOrderCount() != null ? sales.getOrderCount() : 0L;
            long productsSold = sales != null && sales.getProductsSold() != null ? sales.getProductsSold() : 0L;

            long productCount = inv != null && inv.getProductCount() != null ? inv.getProductCount() : 0L;
            long stockUnits = inv != null && inv.getStockUnits() != null ? inv.getStockUnits() : 0L;
            double inventoryValue = inv != null && inv.getInventoryValue() != null ? inv.getInventoryValue() : 0.0;

            ShopAnalyticsDTO dto = new ShopAnalyticsDTO();
            dto.setShopId(id);
            dto.setShopName(shop.getShopName());
            dto.setOwnerName(shop.getOwnerName());
            dto.setLocation(shop.getLocation());
            dto.setRevenue(round2(revenue));
            dto.setOrderCount(orderCount);
            dto.setProductsSold(productsSold);
            dto.setProductCount(productCount);
            dto.setStockUnits(stockUnits);
            dto.setInventoryValue(round2(inventoryValue));
            dto.setAverageOrderValue(orderCount > 0 ? round2(revenue / orderCount) : 0.0);
            dto.setRevenueToInventoryRatio(inventoryValue > 0 ? round2(revenue / inventoryValue) : 0.0);

            ProductSalesDTO best = bestByShop.get(id);
            if (best != null) {
                dto.setTopProductName(best.getPname());
                dto.setTopProductUnits(best.getQuantitySold() != null ? best.getQuantitySold() : 0L);
            } else {
                dto.setTopProductName(null);
                dto.setTopProductUnits(0L);
            }

            result.add(dto);

            totalRevenue += revenue;
            maxRev = Math.max(maxRev, revenue);
            maxOrders = Math.max(maxOrders, orderCount);
            maxSold = Math.max(maxSold, productsSold);
        }

        // Second pass: revenue-share % and normalized performance score/tier.
        for (ShopAnalyticsDTO dto : result) {
            dto.setRevenueContributionPct(
                    totalRevenue > 0 ? round2(dto.getRevenue() / totalRevenue * 100.0) : 0.0);

            double rNorm = maxRev > 0 ? dto.getRevenue() / maxRev : 0.0;
            double oNorm = maxOrders > 0 ? (double) dto.getOrderCount() / maxOrders : 0.0;
            double sNorm = maxSold > 0 ? (double) dto.getProductsSold() / maxSold : 0.0;
            double score = 100.0 * (0.5 * rNorm + 0.3 * oNorm + 0.2 * sNorm);
            dto.setPerformanceScore(round2(score));
            dto.setPerformanceTier(score >= 66 ? "HIGH" : score >= 33 ? "MEDIUM" : "LOW");
        }

        result.sort(Comparator.comparingDouble(ShopAnalyticsDTO::getRevenue).reversed());
        return result;
    }

    // =====================================================================
    // EXECUTIVE SUMMARY (KPIs)
    // =====================================================================
    @Transactional(readOnly = true)
    public DashboardSummaryDTO getSummary(LocalDate from, LocalDate to, Integer lowStockThreshold) {
        int threshold = normalizeThreshold(lowStockThreshold);
        List<ShopAnalyticsDTO> shops = getShopAnalytics(from, to);

        double totalRevenue = round2(shops.stream().mapToDouble(ShopAnalyticsDTO::getRevenue).sum());
        double totalInventoryValue = round2(shops.stream().mapToDouble(ShopAnalyticsDTO::getInventoryValue).sum());
        long totalProductsSold = shops.stream().mapToLong(ShopAnalyticsDTO::getProductsSold).sum();
        long totalStockUnits = shops.stream().mapToLong(ShopAnalyticsDTO::getStockUnits).sum();

        long totalOrders = analyticsRepository.countDistinctSaleOrders(EXCLUDED_STATUSES, from, to);

        DashboardSummaryDTO dto = new DashboardSummaryDTO();
        dto.setTotalShops(shops.size());
        dto.setTotalProducts(productRepository.count());
        dto.setTotalCustomers(analyticsRepository.countNonAdminCustomers());
        dto.setTotalOrders(totalOrders);
        dto.setTotalRevenue(totalRevenue);
        dto.setTotalInventoryValue(totalInventoryValue);
        dto.setTotalStockUnits(totalStockUnits);
        dto.setTotalProductsSold(totalProductsSold);
        dto.setAverageOrderValue(totalOrders > 0 ? round2(totalRevenue / totalOrders) : 0.0);
        dto.setLowStockCount(analyticsRepository.countLowStock(threshold));
        dto.setOutOfStockCount(analyticsRepository.countOutOfStock());
        dto.setLowStockThreshold(threshold);
        return dto;
    }

    // =====================================================================
    // TOP SELLING PRODUCTS
    // =====================================================================
    @Transactional(readOnly = true)
    public List<ProductSalesDTO> getTopProducts(Integer limit, LocalDate from, LocalDate to) {
        int lim = limit != null && limit > 0 ? limit : DEFAULT_TOP_PRODUCTS;
        return analyticsRepository.findProductSales(EXCLUDED_STATUSES, from, to)
                .stream().limit(lim).collect(Collectors.toList());
    }

    // =====================================================================
    // INVENTORY (low / out of stock)
    // =====================================================================
    @Transactional(readOnly = true)
    public List<InventoryProductDTO> getLowStock(Integer threshold) {
        return analyticsRepository.findLowStock(normalizeThreshold(threshold));
    }

    @Transactional(readOnly = true)
    public List<InventoryProductDTO> getOutOfStock() {
        return analyticsRepository.findOutOfStock();
    }

    // =====================================================================
    // SHOP DRILL-DOWN
    // =====================================================================
    @Transactional(readOnly = true)
    public ShopDetailDTO getShopDetail(Integer shopId, LocalDate from, LocalDate to, Integer lowStockThreshold) {
        int threshold = normalizeThreshold(lowStockThreshold);

        ShopAnalyticsDTO shop = getShopAnalytics(from, to).stream()
                .filter(s -> Objects.equals(s.getShopId(), shopId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shop not found: " + shopId));

        List<ProductSalesDTO> topProducts = analyticsRepository.findProductSales(EXCLUDED_STATUSES, from, to)
                .stream()
                .filter(ps -> Objects.equals(ps.getShopId(), shopId))
                .limit(DEFAULT_TOP_PRODUCTS)
                .collect(Collectors.toList());

        List<InventoryProductDTO> allProducts = analyticsRepository.findShopInventoryProducts(shopId);
        List<InventoryProductDTO> low = allProducts.stream()
                .filter(p -> p.getStockQuantity() != null && p.getStockQuantity() > 0 && p.getStockQuantity() <= threshold)
                .collect(Collectors.toList());
        List<InventoryProductDTO> out = allProducts.stream()
                .filter(p -> p.getStockQuantity() != null && p.getStockQuantity() <= 0)
                .collect(Collectors.toList());
        long normal = allProducts.stream()
                .filter(p -> p.getStockQuantity() != null && p.getStockQuantity() > threshold)
                .count();

        ShopDetailDTO detail = new ShopDetailDTO();
        detail.setShop(shop);
        detail.setTopProducts(topProducts);
        detail.setLowStock(low);
        detail.setOutOfStock(out);
        detail.setNormalStockCount(normal);
        detail.setLowStockThreshold(threshold);
        return detail;
    }

    // =====================================================================
    // Helpers
    // =====================================================================
    private int normalizeThreshold(Integer threshold) {
        return threshold != null && threshold >= 0 ? threshold : DEFAULT_LOW_STOCK_THRESHOLD;
    }

    private static double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
