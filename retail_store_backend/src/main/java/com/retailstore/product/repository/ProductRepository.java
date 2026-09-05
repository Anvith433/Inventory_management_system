package com.retailstore.product.repository;
import com.retailstore.product.dto.ProductDTO;
import com.retailstore.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    @Query("SELECT p FROM Product p WHERE p.shop.shopId = :shopId")
    List<Product> findByShopId(@Param("shopId") Integer shopId);

    List<Product> findByShopShopId(Integer shopId);

    /**
     * JPQL projection matching the 7-parameter ProductDTO constructor:
     * (productId, pname, category, price, stockQuantity, imageUrl, shopId)
     */
    @Query("SELECT new com.retailstore.product.dto.ProductDTO(" +
           "p.productId, p.pname, p.category, p.price, p.stockQuantity, p.imageUrl, p.shop.shopId) " +
           "FROM Product p WHERE p.shop.shopId = :shopId")
    List<ProductDTO> findProductDTOsByShopId(@Param("shopId") Integer shopId);
}