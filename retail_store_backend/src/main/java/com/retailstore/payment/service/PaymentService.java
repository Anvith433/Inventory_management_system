package com.retailstore.payment.service;

import com.retailstore.customer.entity.Customer;
import com.retailstore.order.entity.Orders;
import com.retailstore.order.repository.OrderRepository;
import com.retailstore.payment.dto.PaymentDTO;
import com.retailstore.payment.entity.Payment;
import com.retailstore.payment.repository.PaymentRepository;
import com.retailstore.security.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final AuthService authService;

    public PaymentService(PaymentRepository paymentRepository,
                          OrderRepository orderRepository,
                          AuthService authService) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.authService = authService;
    }

    public PaymentDTO getPaymentByOrder(HttpServletRequest request, Integer orderId) {
        Customer customer = authService.getLoggedInCustomer(request);
        if (customer == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized access");
        }

        Orders order = orderRepository.findById(orderId)
                .filter(o -> o.getCustomer().getCustomerId().equals(customer.getCustomerId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found or unauthorized"));

        Payment payment = paymentRepository.findByOrder_OrderId(order.getOrderId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment details not found for this order"));

        return mapToDTO(payment);
    }

    @Transactional
    public PaymentDTO updatePaymentStatus(HttpServletRequest request, Integer paymentId, String status) {
        Customer customer = authService.getLoggedInCustomer(request);
        if (customer == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized access");
        }

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment record not found"));

        orderRepository.findById(payment.getOrder().getOrderId())
                .filter(order -> order.getCustomer().getCustomerId().equals(customer.getCustomerId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized access to order payment"));

        payment.setStatus(status);
        Payment savedPayment = paymentRepository.save(payment);

        return mapToDTO(savedPayment);
    }

    private PaymentDTO mapToDTO(Payment payment) {
        PaymentDTO dto = new PaymentDTO();
        dto.setPaymentId(payment.getPaymentId());
        dto.setOrderId(payment.getOrder() != null ? payment.getOrder().getOrderId() : null);
        dto.setStatus(payment.getStatus());
        dto.setTransactionDate(payment.getTransactionDate());
        dto.setMethod(payment.getMethod());
        return dto;
    }
}