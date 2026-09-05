package com.retailstore.shop.repository;
import com.retailstore.shop.entity.RetailShop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RetailShopRepository extends JpaRepository<RetailShop, Integer> {

    /**
     * Fetches all shops for a given location along with their products.
     * LEFT JOIN FETCH ensures shops with 0 products are still returned.
     */
    @Query("SELECT DISTINCT s FROM RetailShop s LEFT JOIN FETCH s.products WHERE LOWER(s.location) = LOWER(:location)")
    List<RetailShop> findByLocation(@Param("location") String location);

    /**
     * Calculates total inventory value for a specific shop.
     */
    @Query("SELECT COALESCE(SUM(p.price * p.stockQuantity), 0.0) FROM Product p WHERE p.shop.shopId = :shopId")
    Double getShopInventoryValue(@Param("shopId") int shopId);
}