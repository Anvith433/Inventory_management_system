package com.retailstore.admin.analytics.repository;

import com.retailstore.admin.analytics.dto.InventoryProductDTO;
import com.retailstore.admin.analytics.dto.ProductSalesDTO;
import com.retailstore.admin.analytics.dto.ShopInventoryRow;
import com.retailstore.admin.analytics.dto.ShopSalesRow;
import com.retailstore.order.entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Aggregation queries for the admin analytics dashboard.
 *
 * DATA-ACCURACY NOTES:
 *  - A shop is linked to sales only through OrderItem -> Product -> RetailShop (Orders has no shop_id).
 *  - Revenue is ALWAYS the order-item line total SUM(oi.price * oi.quantity), never Orders.total_amount
 *    (that is a per-order, post-discount figure that cannot be split across shops).
 *  - "Finalized sale" orders are those whose status is NOT one of the active-cart / abandoned states.
 *    Callers pass that excluded-status list (matching OrderService's own convention).
 *  - Order counts use COUNT(DISTINCT o.orderId) so multiple line items in one order never inflate it.
 *
 * The domain type is Orders only because a JPA repository needs a root entity; the @Query methods
 * below query whichever entities they name.
 */
@Repository
public interface AnalyticsRepository extends JpaRepository<Orders, Integer> {

    // ---------------------------------------------------------------------
    // Per-shop SALES aggregation (OrderItem -> Product -> RetailShop)
    // ---------------------------------------------------------------------
    @Query("""
            SELECT new com.retailstore.admin.analytics.dto.ShopSalesRow(
                s.shopId,
                SUM(oi.price * oi.quantity),
                COUNT(DISTINCT o.orderId),
                SUM(oi.quantity))
            FROM OrderItem oi
            JOIN oi.order o
            JOIN oi.product p
            JOIN p.shop s
            WHERE o.status NOT IN :excluded
              AND (:from IS NULL OR o.date >= :from)
              AND (:to IS NULL OR o.date <= :to)
            GROUP BY s.shopId
            """)
    List<ShopSalesRow> findShopSales(@Param("excluded") List<String> excluded,
                                     @Param("from") LocalDate from,
                                     @Param("to") LocalDate to);

    // ---------------------------------------------------------------------
    // Per-shop INVENTORY aggregation (LEFT JOIN keeps shops with 0 products)
    // ---------------------------------------------------------------------
    @Query("""
            SELECT new com.retailstore.admin.analytics.dto.ShopInventoryRow(
                s.shopId,
                COUNT(p.productId),
                SUM(p.stockQuantity),
                SUM(p.price * p.stockQuantity))
            FROM RetailShop s
            LEFT JOIN s.products p
            GROUP BY s.shopId
            """)
    List<ShopInventoryRow> findShopInventory();

    // ---------------------------------------------------------------------
    // Per-product sales, attributed to the product's shop (sorted best-first)
    // ---------------------------------------------------------------------
    @Query("""
            SELECT new com.retailstore.admin.analytics.dto.ProductSalesDTO(
                p.productId,
                p.pname,
                s.shopId,
                s.shopName,
                SUM(oi.quantity),
                SUM(oi.price * oi.quantity))
            FROM OrderItem oi
            JOIN oi.order o
            JOIN oi.product p
            JOIN p.shop s
            WHERE o.status NOT IN :excluded
              AND (:from IS NULL OR o.date >= :from)
              AND (:to IS NULL OR o.date <= :to)
            GROUP BY p.productId, p.pname, s.shopId, s.shopName
            ORDER BY SUM(oi.quantity) DESC
            """)
    List<ProductSalesDTO> findProductSales(@Param("excluded") List<String> excluded,
                                           @Param("from") LocalDate from,
                                           @Param("to") LocalDate to);

    // ---------------------------------------------------------------------
    // Inventory product listings
    // ---------------------------------------------------------------------
    @Query("""
            SELECT new com.retailstore.admin.analytics.dto.InventoryProductDTO(
                p.productId, p.pname, s.shopId, s.shopName,
                p.price, p.stockQuantity, p.price * p.stockQuantity)
            FROM Product p
            LEFT JOIN p.shop s
            WHERE p.stockQuantity > 0 AND p.stockQuantity <= :threshold
            ORDER BY p.stockQuantity ASC
            """)
    List<InventoryProductDTO> findLowStock(@Param("threshold") int threshold);

    @Query("""
            SELECT new com.retailstore.admin.analytics.dto.InventoryProductDTO(
                p.productId, p.pname, s.shopId, s.shopName,
                p.price, p.stockQuantity, p.price * p.stockQuantity)
            FROM Product p
            LEFT JOIN p.shop s
            WHERE p.stockQuantity <= 0
            ORDER BY p.pname ASC
            """)
    List<InventoryProductDTO> findOutOfStock();

    @Query("""
            SELECT new com.retailstore.admin.analytics.dto.InventoryProductDTO(
                p.productId, p.pname, s.shopId, s.shopName,
                p.price, p.stockQuantity, p.price * p.stockQuantity)
            FROM Product p
            JOIN p.shop s
            WHERE s.shopId = :shopId
            ORDER BY p.stockQuantity ASC
            """)
    List<InventoryProductDTO> findShopInventoryProducts(@Param("shopId") Integer shopId);

    // ---------------------------------------------------------------------
    // Scalar KPI helpers
    // ---------------------------------------------------------------------
    @Query("""
            SELECT COUNT(DISTINCT o.orderId)
            FROM OrderItem oi
            JOIN oi.order o
            WHERE o.status NOT IN :excluded
              AND (:from IS NULL OR o.date >= :from)
              AND (:to IS NULL OR o.date <= :to)
            """)
    long countDistinctSaleOrders(@Param("excluded") List<String> excluded,
                                 @Param("from") LocalDate from,
                                 @Param("to") LocalDate to);

    @Query("SELECT COUNT(c) FROM Customer c WHERE c.role IS NULL OR c.role <> 'ROLE_ADMIN'")
    long countNonAdminCustomers();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.stockQuantity > 0 AND p.stockQuantity <= :threshold")
    long countLowStock(@Param("threshold") int threshold);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.stockQuantity <= 0")
    long countOutOfStock();
}
