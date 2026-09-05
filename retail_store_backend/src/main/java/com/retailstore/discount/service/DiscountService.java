package com.retailstore.discount.service;

import com.retailstore.customer.entity.Customer;
import com.retailstore.discount.dto.DiscountRequestDTO;
import com.retailstore.discount.dto.DiscountResponseDTO;
import com.retailstore.discount.entity.Discount;
import com.retailstore.discount.repository.DiscountRepository;
import com.retailstore.order.entity.OrderItem;
import com.retailstore.order.entity.Orders;
import com.retailstore.order.repository.OrderItemRepository;
import com.retailstore.order.repository.OrderRepository;
import com.retailstore.security.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DiscountService {

    private final AuthService authService;
    private final OrderRepository orderRepository;
    private final DiscountRepository discountRepository;
    private final OrderItemRepository orderItemRepository;

    public DiscountService(AuthService authService,
                           OrderRepository orderRepository,
                           DiscountRepository discountRepository,
                           OrderItemRepository orderItemRepository) {
        this.authService = authService;
        this.orderRepository = orderRepository;
        this.discountRepository = discountRepository;
        this.orderItemRepository = orderItemRepository;
    }

    @Transactional
    public DiscountResponseDTO applyDiscount(HttpServletRequest request, DiscountRequestDTO discountRequest) {

        Customer customer = authService.getLoggedInCustomer(request);
        if (customer == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        List<Orders> carts = orderRepository.findByCustomerCustomerIdAndStatusIn(
                customer.getCustomerId(),
                List.of("Cart", "High_Value")
        );

        if (carts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No cart found");
        }

        Orders cart = carts.stream()
                .max(Comparator.comparing(Orders::getDate))
                .orElse(carts.get(0));

        Integer orderId = cart.getOrderId();

        List<OrderItem> items = orderItemRepository.findItemsByOrderId(orderId);

        if (items == null || items.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart has no items");
        }

       
        double rawTotal = 0.0;
        Map<Integer, Double> shopTotals = new HashMap<>();

        for (OrderItem item : items) {
            double line = item.getQuantity() * item.getProduct().getPrice();
            rawTotal += line;

            Integer shopId = item.getProduct().getShop().getShopId();
            shopTotals.put(shopId, shopTotals.getOrDefault(shopId, 0.0) + line);
        }

        cart.setTotalAmount(rawTotal);
        orderRepository.save(cart);

       
        orderRepository.applyBulkDiscount(orderId);

        Orders updatedCart = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cart missing after bulk processing"));

        double afterBulk = updatedCart.getTotalAmount();

       
        double bestFestivalDiscount = 0.0;

        for (Map.Entry<Integer, Double> entry : shopTotals.entrySet()) {
            Integer shopId = entry.getKey();
            double shopSubtotal = entry.getValue();

            List<Discount> list = discountRepository.findBestValidDiscount(shopId, LocalDate.now());

            if (list.isEmpty()) continue;

            Discount d = list.get(0);
            double discountAmt = shopSubtotal * (d.getPercentage() / 100.0);

            if (discountAmt > bestFestivalDiscount) {
                bestFestivalDiscount = discountAmt;
            }
        }

       
        double highValueDiscount = 0.0;
        if (afterBulk > 2500) {
            highValueDiscount = afterBulk * 0.10;
        }

       
        double bestOfferDiscount = Math.max(bestFestivalDiscount, highValueDiscount);

        
        double finalAmount = afterBulk - bestOfferDiscount;
        if (finalAmount < 0) finalAmount = 0;

        updatedCart.setTotalAmount(finalAmount);

       
        if (finalAmount > 2000) {
            updatedCart.setStatus("High_Value");
        } else {
            updatedCart.setStatus("Cart");
        }

        orderRepository.save(updatedCart);

       
        DiscountResponseDTO dto = new DiscountResponseDTO();
        dto.setFinalAmount(finalAmount);
        dto.setBulkDiscount(rawTotal - afterBulk);
        dto.setFestivalDiscount(bestFestivalDiscount);
        dto.setHighValueDiscount(highValueDiscount);
        dto.setBestOffer(bestOfferDiscount);

        return dto;
    }
}