package com.retailstore.product.service;

import com.retailstore.product.dto.ProductDTO;
import com.retailstore.product.entity.Product;
import com.retailstore.product.repository.ProductRepository;
import com.retailstore.shop.entity.RetailShop;
import com.retailstore.shop.repository.RetailShopRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final RetailShopRepository retailShopRepository;

    public ProductService(ProductRepository productRepository, RetailShopRepository retailShopRepository) {
        this.productRepository = productRepository;
        this.retailShopRepository = retailShopRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductDTO addProduct(ProductDTO dto) {
        if (dto.getShopId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Shop ID must be provided");
        }

        Product product = new Product();
        product.setPname(dto.getPname());
        product.setPrice(dto.getPrice());
        product.setStockQuantity(dto.getStockQuantity());
        product.setImageUrl(dto.getImageUrl());

        RetailShop shop = retailShopRepository.findById(dto.getShopId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shop not found with ID: " + dto.getShopId()));
        product.setShop(shop);

        Product saved = productRepository.save(product);
        return convertToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> getProductsByShopId(Integer shopId) {
        List<Product> products = productRepository.findByShopId(shopId);
        return products.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private ProductDTO convertToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setProductId(product.getProductId());
        dto.setPname(product.getPname());
        dto.setPrice(product.getPrice());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setImageUrl(product.getImageUrl());
        dto.setShopId(product.getShop() != null ? product.getShop().getShopId() : null);
        return dto;
    }
}