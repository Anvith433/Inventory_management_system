package com.retailstore.admin.repository;
import com.retailstore.customer.dto.CustomerDTO;
import com.retailstore.customer.dto.HighValueCustomerDTO;
import com.retailstore.customer.entity.Customer;
import com.retailstore.product.dto.ProductDTO;
import com.retailstore.shop.dto.RetailShopDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface AdminRepository extends JpaRepository<Customer, Integer> {

    // ---------------------------------------------------------------
    // 1) High Value Customers (JPQL)
    // ---------------------------------------------------------------
    @Query("""
            SELECT new com.retailstore.customer.dto.HighValueCustomerDTO(
                c.name,
                SUM(o.totalAmount)
            )
            FROM Customer c
            JOIN c.orders o
            GROUP BY c.customerId, c.name
            HAVING SUM(o.totalAmount) > :amount
            ORDER BY SUM(o.totalAmount) DESC
            """)
    List<HighValueCustomerDTO> findHighValueCustomers(@Param("amount") Double amount);

    // ---------------------------------------------------------------
    // 2) Above Average Priced Products (JPQL) - Fixed to 7-param ProductDTO
    // ---------------------------------------------------------------
    @Query("""
            SELECT new com.retailstore.product.dto.ProductDTO(
                p.productId,
                p.pname,
                p.category,
                p.price,
                p.stockQuantity,
                p.imageUrl,
                p.shop.shopId
            )
            FROM Product p
            WHERE p.price > (SELECT AVG(p2.price) FROM Product p2)
            """)
    List<ProductDTO> findAboveAverageProducts();

    // ---------------------------------------------------------------
    // 3) Above Average Spending Customers (Native Query + Default Method)
    // ---------------------------------------------------------------
    @Query(value = """
            SELECT t.customer_id, c.name
            FROM (
                SELECT o.customer_id, SUM(o.total_amount) AS total_spent
                FROM orders o
                GROUP BY o.customer_id
            ) t
            JOIN customer c ON c.customer_id = t.customer_id
            WHERE t.total_spent > (
                SELECT AVG(inner_sum.total_spent)
                FROM (
                    SELECT SUM(o2.total_amount) AS total_spent
                    FROM orders o2
                    GROUP BY o2.customer_id
                ) inner_sum
            )
            """, nativeQuery = true)
    List<Object[]> findAboveAverageCustomersRaw();

    default List<CustomerDTO> findAboveAverageCustomers() {
        return findAboveAverageCustomersRaw().stream()
                .map(r -> new CustomerDTO(
                        ((Number) r[0]).intValue(),   // customer_id
                        (String) r[1]                 // name
                ))
                .toList();
    }

    // ---------------------------------------------------------------
    // 4) Most Ordered Product (JPQL) - Direct OrderItem Join + 7-param DTO
    // ---------------------------------------------------------------
    @Query("""
            SELECT new com.retailstore.product.dto.ProductDTO(
                p.productId,
                p.pname,
                p.category,
                p.price,
                p.stockQuantity,
                p.imageUrl,
                p.shop.shopId
            )
            FROM OrderItem oi
            JOIN oi.product p
            GROUP BY p.productId, p.pname, p.category, p.price, p.stockQuantity, p.imageUrl, p.shop.shopId
            ORDER BY SUM(oi.quantity) DESC
            """)
    List<ProductDTO> findMostOrderedProduct();

    // ---------------------------------------------------------------
    // 5) High Value Shops (JPQL) - Starting from OrderItem directly
    // ---------------------------------------------------------------
    @Query("""
            SELECT new com.retailstore.shop.dto.RetailShopDTO(
                s.shopId,
                s.shopName,
                s.location,
                SUM(o.totalAmount)
            )
            FROM OrderItem oi
            JOIN oi.product p
            JOIN p.shop s
            JOIN oi.order o
            GROUP BY s.shopId, s.shopName, s.location
            HAVING SUM(o.totalAmount) > :minValue
            """)
    List<RetailShopDTO> findHighValueShops(@Param("minValue") Double minValue);
}