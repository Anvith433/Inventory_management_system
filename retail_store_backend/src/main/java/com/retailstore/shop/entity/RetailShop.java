package com.retailstore.shop.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.retailstore.discount.entity.Discount;
import com.retailstore.product.entity.Product;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "retailshop")
@Getter
@Setter
public class RetailShop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "shop_id")
    private Integer shopId;

    @Column(name = "shop_name", nullable = false)
    private String shopName;

    @Column(name = "owner_name")
    private String ownerName;

    @Column(name = "location")
    private String location;

    @Column(name = "contact")
    private String contact;

    @OneToMany(mappedBy = "shop", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore // Prevents infinite recursion with Product
    private List<Product> products = new ArrayList<>();

    @OneToMany(mappedBy = "shop", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore // Prevents infinite recursion with Discount
    private List<Discount> discounts = new ArrayList<>();
}