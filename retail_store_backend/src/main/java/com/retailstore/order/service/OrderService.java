package com.retailstore.order.service;

import com.retailstore.customer.entity.Customer;
import com.retailstore.order.dto.AddCartItemRequestDTO;
import com.retailstore.order.dto.CheckoutRequestDTO;
import com.retailstore.order.dto.CheckoutResponseDTO;
import com.retailstore.order.dto.OrderItemDTO;
import com.retailstore.order.dto.OrderResponseDTO;
import com.retailstore.order.entity.OrderItem;
import com.retailstore.order.entity.Orders;
import com.retailstore.order.repository.OrderItemRepository;
import com.retailstore.order.repository.OrderRepository;
import com.retailstore.product.entity.Product;
import com.retailstore.product.repository.ProductRepository;
import com.retailstore.security.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final AuthService authService;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    public OrderService(AuthService authService,
                        ProductRepository productRepository,
                        OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository) {
        this.authService = authService;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
    }

    // -------------------------------------------------------
    // GET CUSTOMER ORDER HISTORY (NEW)
    // -------------------------------------------------------
    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getCustomerOrders(HttpServletRequest request) {
        Customer customer = getAuthenticatedCustomer(request);

        // Fetches completed orders for this customer (excluding active carts/abandoned ones)
        List<Orders> completedOrders = orderRepository.findByCustomerCustomerIdAndStatusNotIn(
                customer.getCustomerId(),
                List.of("Cart", "High_Value", "Abandoned")
        );

        return completedOrders.stream()
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing((Orders c) -> c.getDate() != null ? c.getDate() : LocalDate.MIN).reversed())
                .map(this::mapToOrderResponseDTO)
                .collect(Collectors.toList());
    }

    // -------------------------------------------------------
    // ADD ITEM TO CART
    // -------------------------------------------------------
    @Transactional
    public OrderResponseDTO addCartItem(HttpServletRequest request, AddCartItemRequestDTO itemRequest) {
        Customer customer = getAuthenticatedCustomer(request);

        Product product = productRepository.findById(itemRequest.getProductId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        List<Orders> carts = orderRepository.findByCustomerCustomerIdAndStatusIn(
                customer.getCustomerId(),
                List.of("Cart", "High_Value")
        );

        Orders cart;
        if (carts.isEmpty()) {
            cart = new Orders();
            cart.setCustomer(customer);
            cart.setStatus("Cart");
            cart.setDate(LocalDate.now());
            cart.setTotalAmount(0.0);
            cart.setOrderItems(new ArrayList<>());
            cart = orderRepository.save(cart);
        } else {
            cart = getLatestCart(carts);
        }

        if (cart.getOrderItems() == null) {
            cart.setOrderItems(new ArrayList<>());
        }

        OrderItem existing = cart.getOrderItems()
                .stream()
                .filter(i -> i != null && i.getProduct() != null && Objects.equals(i.getProduct().getProductId(), product.getProductId()))
                .findFirst()
                .orElse(null);

        double productPrice = product.getPrice() != null ? product.getPrice() : 0.0;
        int qtyToAdd = itemRequest.getQuantity() > 0 ? itemRequest.getQuantity() : 1;

        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + qtyToAdd);
        } else {
            OrderItem item = new OrderItem();
            item.setOrder(cart);
            item.setProduct(product);
            item.setPrice(productPrice);
            item.setQuantity(qtyToAdd);
            cart.getOrderItems().add(item);
        }

        double currentTotal = cart.getTotalAmount() != null ? cart.getTotalAmount() : 0.0;
        cart.setTotalAmount(currentTotal + (productPrice * qtyToAdd));
        updateCartStatusBasedOnTotal(cart);
        Orders savedCart = orderRepository.save(cart);

        return mapToOrderResponseDTO(savedCart);
    }

    // -------------------------------------------------------
    // GET CART
    // -------------------------------------------------------
    @Transactional(readOnly = true)
    public OrderResponseDTO getCart(HttpServletRequest request) {
        Customer customer = getAuthenticatedCustomer(request);

        List<Orders> carts = orderRepository.findByCustomerCustomerIdAndStatusIn(
                customer.getCustomerId(),
                List.of("Cart", "High_Value")
        );

        OrderResponseDTO response = new OrderResponseDTO();

        if (carts.isEmpty()) {
            response.setOrderItems(new ArrayList<>());
            response.setTotalAmount(0.0);
            response.setStatus("Cart");
            return response;
        }

        Orders cart = getLatestCart(carts);
        return mapToOrderResponseDTO(cart);
    }

    // -------------------------------------------------------
    // REMOVE ITEM FROM CART
    // -------------------------------------------------------
    @Transactional
    public OrderResponseDTO removeCartItem(HttpServletRequest request, int productId) {
        Customer customer = getAuthenticatedCustomer(request);

        List<Orders> carts = orderRepository.findByCustomerCustomerIdAndStatusIn(
                customer.getCustomerId(),
                List.of("Cart", "High_Value")
        );

        if (carts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No cart found");
        }

        Orders cart = getLatestCart(carts);
        if (cart.getOrderItems() == null) {
            return mapToOrderResponseDTO(cart);
        }

        OrderItem item = cart.getOrderItems()
                .stream()
                .filter(i -> i != null && i.getProduct() != null && i.getProduct().getProductId() == productId)
                .findFirst()
                .orElse(null);

        if (item == null) {
            return mapToOrderResponseDTO(cart);
        }

        int newQty = item.getQuantity() - 1;
        double itemPrice = item.getPrice() != null ? item.getPrice() : 0.0;
        double currentTotal = cart.getTotalAmount() != null ? cart.getTotalAmount() : 0.0;

        if (newQty <= 0) {
            cart.setTotalAmount(Math.max(0.0, currentTotal - (itemPrice * item.getQuantity())));
            cart.getOrderItems().remove(item);
            orderItemRepository.delete(item);
        } else {
            item.setQuantity(newQty);
            cart.setTotalAmount(Math.max(0.0, currentTotal - itemPrice));
        }

        updateCartStatusBasedOnTotal(cart);
        Orders savedCart = orderRepository.save(cart);

        return mapToOrderResponseDTO(savedCart);
    }

    // -------------------------------------------------------
    // CHECKOUT (FINAL)
    // -------------------------------------------------------
    @Transactional
    public CheckoutResponseDTO checkout(HttpServletRequest request, CheckoutRequestDTO checkoutRequest) {
        Customer customer = getAuthenticatedCustomer(request);

        List<Orders> carts = orderRepository.findByCustomerCustomerIdAndStatusIn(
                customer.getCustomerId(),
                List.of("Cart", "High_Value")
        );

        if (carts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No cart available");
        }

        Orders cart = getLatestCart(carts);

        if (cart.getOrderItems() == null || cart.getOrderItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }

        for (OrderItem item : cart.getOrderItems()) {
            Product p = productRepository.findById(item.getProduct().getProductId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

            int stock = p.getStockQuantity() != null ? p.getStockQuantity() : 0;
            if (stock < item.getQuantity()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient stock for " + p.getPname());
            }

            p.setStockQuantity(stock - item.getQuantity());
        }

        cart.setStatus("Completed");
        cart.setDate(LocalDate.now());
        orderRepository.save(cart);

        CheckoutResponseDTO response = new CheckoutResponseDTO();
        response.setOrderId(cart.getOrderId());
        response.setTotalAmount(cart.getTotalAmount() != null ? cart.getTotalAmount() : 0.0);
        response.setStatus(cart.getStatus());
        response.setMessage("Checkout successful");

        return response;
    }

    // -------------------------------------------------------
    // CLEAR CART (Back & Cancel)
    // -------------------------------------------------------
    @Transactional
    public void clearCart(HttpServletRequest request) {
        Customer customer = getAuthenticatedCustomer(request);

        List<Orders> carts = orderRepository.findByCustomerCustomerIdAndStatusIn(
                customer.getCustomerId(),
                List.of("Cart", "High_Value")
        );

        if (carts.isEmpty()) {
            return;
        }

        for (Orders cart : carts) {
            if (cart.getOrderItems() != null) {
                cart.getOrderItems().clear();
            }
            cart.setStatus("Abandoned");
            cart.setTotalAmount(0.0);
            cart.setDate(LocalDate.now());
            orderRepository.save(cart);
        }
    }

    // -------------------------------------------------------
    // HELPER METHODS
    // -------------------------------------------------------
    private Orders getLatestCart(List<Orders> carts) {
        return carts.stream()
                .filter(Objects::nonNull)
                .max(Comparator.comparing(c -> c.getDate() != null ? c.getDate() : LocalDate.MIN))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart not found"));
    }

    private void updateCartStatusBasedOnTotal(Orders cart) {
        double total = cart.getTotalAmount() != null ? cart.getTotalAmount() : 0.0;
        if (total >= 2000) {
            cart.setStatus("High_Value");
        } else {
            cart.setStatus("Cart");
        }
    }

    private OrderResponseDTO mapToOrderResponseDTO(Orders cart) {
        OrderResponseDTO response = new OrderResponseDTO();
        response.setOrderId(cart.getOrderId());
        response.setTotalAmount(cart.getTotalAmount() != null ? cart.getTotalAmount() : 0.0);
        response.setStatus(cart.getStatus());

        List<OrderItemDTO> itemDTOs = cart.getOrderItems() != null ?
                cart.getOrderItems().stream()
                        .filter(Objects::nonNull)
                        .map(item -> new OrderItemDTO(
                                item.getItemNo(),
                                item.getProduct() != null ? item.getProduct().getProductId() : 0,
                                item.getProduct() != null ? item.getProduct().getPname() : "",
                                item.getPrice() != null ? item.getPrice() : 0.0,
                                item.getQuantity()
                        ))
                        .collect(Collectors.toList()) : new ArrayList<>();

        response.setOrderItems(itemDTOs);
        return response;
    }

    private Customer getAuthenticatedCustomer(HttpServletRequest request) {
        Customer c = authService.getLoggedInCustomer(request);
        if (c == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return c;
    }
}