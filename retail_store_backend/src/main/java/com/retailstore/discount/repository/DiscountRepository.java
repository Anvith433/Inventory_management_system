package com.retailstore.discount.repository;

import com.retailstore.discount.entity.Discount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DiscountRepository extends JpaRepository<Discount, Integer> {

    @Query("""
        SELECT d FROM Discount d
        WHERE d.shop.shopId = :shopId
          AND d.validity >= :today
        ORDER BY d.percentage DESC
    """)
    List<Discount> findBestValidDiscount(@Param("shopId") Integer shopId,
                                         @Param("today") LocalDate today);

    /**
     * Derived query equivalent for fetching active discounts by shop ID.
     */
    List<Discount> findByShopShopIdAndValidityGreaterThanEqualOrderByPercentageDesc(Integer shopId, LocalDate today);
}