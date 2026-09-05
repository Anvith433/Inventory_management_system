package com.retailstore.order.repository;

import com.retailstore.order.entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Orders, Integer> {

    @Modifying
    @Query(value = "CALL apply_bulk_discount(:ord_id)", nativeQuery = true)
    void applyBulkDiscount(@Param("ord_id") int orderId);

    /**
     * Eagerly fetches OrderItems to avoid N+1 queries during DTO mapping.
     */
    @Query("SELECT DISTINCT o FROM Orders o LEFT JOIN FETCH o.orderItems WHERE o.customer.customerId = :customerId AND o.status = :status")
    Optional<Orders> findByCustomerCustomerIdAndStatus(@Param("customerId") int customerId, 
                                                       @Param("status") String status);

    /**
     * Eagerly fetches OrderItems and orders by date descending.
     */
    @Query("SELECT DISTINCT o FROM Orders o LEFT JOIN FETCH o.orderItems WHERE o.customer.customerId = :customerId AND o.status IN :statuses ORDER BY o.date DESC")
    List<Orders> findByCustomerCustomerIdAndStatusIn(@Param("customerId") int customerId, 
                                                     @Param("statuses") Collection<String> statuses);

    /**
     * Eagerly fetches OrderItems for orders that are NOT in active cart/abandoned status.
     */
    @Query("SELECT DISTINCT o FROM Orders o LEFT JOIN FETCH o.orderItems WHERE o.customer.customerId = :customerId AND o.status NOT IN :statuses ORDER BY o.date DESC")
    List<Orders> findByCustomerCustomerIdAndStatusNotIn(@Param("customerId") int customerId, 
                                                        @Param("statuses") Collection<String> statuses);

    /**
     * Domain method to retrieve all orders for a customer without N+1 fetch overhead.
     */
    @Query("SELECT DISTINCT o FROM Orders o LEFT JOIN FETCH o.orderItems WHERE o.customer.customerId = :customerId ORDER BY o.date DESC")
    List<Orders> findByCustomerCustomerId(@Param("customerId") int customerId);
}