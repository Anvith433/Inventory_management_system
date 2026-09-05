package com.retailstore.payment.controller;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import com.retailstore.payment.dto.PaymentDTO;
import com.retailstore.payment.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = {
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "https://retail-store-frontends.vercel.app"
})
public class PaymentController 
{

    private final PaymentService paymentService;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentDTO> getPaymentByOrder(HttpServletRequest request,
                                                         @PathVariable Integer orderId) {
        PaymentDTO payment = paymentService.getPaymentByOrder(request, orderId);
        return ResponseEntity.ok(payment);
    }

    @PutMapping("/{paymentId}/status")
    public ResponseEntity<PaymentDTO> updatePaymentStatus(HttpServletRequest request,
                                                           @PathVariable Integer paymentId,
                                                           @RequestParam String status) {
        PaymentDTO payment = paymentService.updatePaymentStatus(request, paymentId, status);
        return ResponseEntity.ok(payment);
    }

    //  1. Create Razorpay Order
    @PostMapping("/create-order")
    public ResponseEntity<?> createRazorpayOrder(@RequestBody Map<String, Object> data) {
        try {
            double amount = Double.parseDouble(data.get("amount").toString());

            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", (int) (amount * 100)); // Converts Rupees to Paise
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

            Order order = razorpay.orders.create(orderRequest);

            Map<String, Object> response = new HashMap<>();
            response.put("razorpayOrderId", order.get("id"));
            response.put("amount", order.get("amount"));
            response.put("currency", order.get("currency"));
            response.put("keyId", razorpayKeyId);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to create Razorpay order: " + e.getMessage());
        }
    }

    // 🎯 2. Verify Razorpay Signature
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> data) {
        try {
            String razorpayOrderId = data.get("razorpay_order_id");
            String razorpayPaymentId = data.get("razorpay_payment_id");
            String razorpaySignature = data.get("razorpay_signature");

            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", razorpayOrderId);
            options.put("razorpay_payment_id", razorpayPaymentId);
            options.put("razorpay_signature", razorpaySignature);

            boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);

            if (isValid) {
                return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "Payment verified successfully"));
            } else {
                return ResponseEntity.badRequest().body("Invalid payment signature");
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Verification error: " + e.getMessage());
        }
    }
}