package com.retailstore.product.controller;

import com.retailstore.product.dto.ProductDTO;
import com.retailstore.product.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = {
    "http://localhost:3000", 
    "http://localhost:3001", 
    "http://localhost:5173", 
    "https://retail-store-frontends.vercel.app"
})
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @PostMapping
    public ResponseEntity<ProductDTO> addProduct(@Valid @RequestBody ProductDTO productDTO) {
        ProductDTO saved = productService.addProduct(productDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/shop/{shopId}")
    public ResponseEntity<List<ProductDTO>> getProductsByShop(@PathVariable Integer shopId) {
        return ResponseEntity.ok(productService.getProductsByShopId(shopId));
    }
}