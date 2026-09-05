package com.retailstore.admin.controller;
import com.retailstore.admin.repository.AdminRepository;
import com.retailstore.customer.dto.CustomerDTO;
import com.retailstore.customer.dto.HighValueCustomerDTO;
import com.retailstore.product.dto.ProductDTO;
import com.retailstore.shop.dto.RetailShopDTO;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "https://retail-store-frontends.vercel.app"
})
public class AdminController {

    private final AdminRepository adminRepository;

    public AdminController(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    @GetMapping("/customers/high-value")
    public List<HighValueCustomerDTO> getHighValueCustomers(@RequestParam double amount) {
        return adminRepository.findHighValueCustomers(amount);
    }

    @GetMapping("/products/above-average")
    public List<ProductDTO> getAboveAverageProducts() {
        return adminRepository.findAboveAverageProducts();
    }

    @GetMapping("/analytics/above-average-customers")
    public List<CustomerDTO> getAboveAverageCustomers() {
        return adminRepository.findAboveAverageCustomers();
    }

    @GetMapping("/most-ordered-product")
    public List<ProductDTO> getMostOrderedProduct() {
        return adminRepository.findMostOrderedProduct();
    }

    @GetMapping("/shops/high-value")
    public List<RetailShopDTO> getHighValueShops(@RequestParam double minValue) {
        return adminRepository.findHighValueShops(minValue);
    }
}