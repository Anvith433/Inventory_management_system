package com.retailstore.admin.service;

import com.retailstore.admin.repository.AdminRepository;
import com.retailstore.customer.dto.CustomerDTO;
import com.retailstore.customer.dto.HighValueCustomerDTO;
import com.retailstore.product.dto.ProductDTO;
import com.retailstore.shop.dto.RetailShopDTO;
import com.retailstore.shop.dto.ShopInventoryDTO;
import com.retailstore.shop.repository.RetailShopRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final RetailShopRepository shopRepository;

    public AdminService(AdminRepository adminRepository, RetailShopRepository shopRepository) {
        this.adminRepository = adminRepository;
        this.shopRepository = shopRepository;
    }

    public List<HighValueCustomerDTO> getHighValueCustomers(double amount) {
        return adminRepository.findHighValueCustomers(amount);
    }

    public List<ProductDTO> getAboveAverageProducts() {
        return adminRepository.findAboveAverageProducts();
    }

    public List<CustomerDTO> getAboveAverageCustomers() {
        return adminRepository.findAboveAverageCustomers();
    }

    public List<ProductDTO> getMostOrderedProduct() {
        return adminRepository.findMostOrderedProduct();
    }

    public List<RetailShopDTO> getHighValueShops(double minValue) {
        return adminRepository.findHighValueShops(minValue);
    }

    public List<ShopInventoryDTO> getShopInventoryValues() {
        return shopRepository.findAll().stream()
                .map(shop -> new ShopInventoryDTO(
                        shop.getShopId(),
                        shop.getShopName(),
                        shopRepository.getShopInventoryValue(shop.getShopId())
                ))
                .toList();
    }
}