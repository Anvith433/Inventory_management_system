package com.retailstore.discount.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.retailstore.customer.entity.Customer;
import com.retailstore.product.entity.Product;
import com.retailstore.shop.entity.RetailShop;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "discount")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Discount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "discount_id")
    private Integer discountId;

    @Column(name = "percentage", nullable = false)
    private Integer percentage;

    @Column(name = "type")
    private String type;

    @Column(name = "validity")
    private LocalDate validity;

    @Column(name = "discount_name")
    private String discountName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", nullable = false)
    @JsonIgnore
    private RetailShop shop;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "discount_product",
        joinColumns = @JoinColumn(name = "discount_id"),
        inverseJoinColumns = @JoinColumn(name = "product_id")
    )
    @JsonIgnore
    private List<Product> products = new ArrayList<>();

    @ManyToMany(mappedBy = "discounts", fetch = FetchType.LAZY)
    @ToString.Exclude
    @JsonIgnore
    private List<Customer> customers = new ArrayList<>();
}