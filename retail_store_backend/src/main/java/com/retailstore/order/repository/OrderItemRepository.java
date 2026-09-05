package com.retailstore.order.repository;

import com.retailstore.order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {

    /**
     * Eagerly fetches Product to prevent N+1 query overhead during DTO mapping.
     */
    @Query("SELECT oi FROM OrderItem oi LEFT JOIN FETCH oi.product WHERE oi.order.orderId = :orderId")
    List<OrderItem> findItemsByOrderId(@Param("orderId") int orderId);

    /**
     * Derived query method providing equivalent performance.
     */
    List<OrderItem> findByOrderOrderId(Integer orderId);
}