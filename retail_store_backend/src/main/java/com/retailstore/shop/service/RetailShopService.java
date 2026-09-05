package com.retailstore.shop.service;

import com.retailstore.product.dto.ProductDTO;
import com.retailstore.shop.dto.RetailShopDTO;
import com.retailstore.shop.entity.RetailShop;
import com.retailstore.shop.repository.RetailShopRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RetailShopService {

    private final RetailShopRepository retailShopRepository;

    public RetailShopService(RetailShopRepository retailShopRepository) {
        this.retailShopRepository = retailShopRepository;
    }

    @Transactional(readOnly = true)
    public List<RetailShopDTO> getNearbyShops(String city) {
        if (city == null || city.isBlank()) {
            return List.of();
        }

        List<RetailShop> shops = retailShopRepository.findByLocation(city);

        return shops.stream().map(shop -> {
            List<ProductDTO> productDTOs = shop.getProducts()
                    .stream()
                    .map(p -> new ProductDTO(
                            p.getProductId(),
                            p.getPname(),
                            p.getCategory(),
                            p.getPrice(),
                            p.getStockQuantity(),
                            p.getImageUrl(),
                            shop.getShopId()
                    ))
                    .collect(Collectors.toList());

            RetailShopDTO dto = new RetailShopDTO();
            dto.setShopId(shop.getShopId());
            dto.setShopName(shop.getShopName());
            dto.setOwnerName(shop.getOwnerName());
            dto.setLocation(shop.getLocation());
            dto.setContact(shop.getContact());

            double inventoryValue = shop.getProducts()
                    .stream()
                    .mapToDouble(p -> p.getPrice() * p.getStockQuantity())
                    .sum();

            dto.setInventoryValue(inventoryValue);
            dto.setProducts(productDTOs);

            return dto;
        }).collect(Collectors.toList());
    }
}