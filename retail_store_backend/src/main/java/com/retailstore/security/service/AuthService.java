package com.retailstore.security.service;
import com.retailstore.security.dto.LoginRequestDTO;
import com.retailstore.security.dto.LoginResponseDTO;
import com.retailstore.security.dto.RegisterRequestDTO;
import com.retailstore.customer.entity.Customer;
import com.retailstore.customer.entity.Phone;
import com.retailstore.customer.repository.CustomerRepository;
import com.retailstore.customer.repository.PhoneRepository;
import com.retailstore.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private final CustomerRepository customerRepository;
    private final PhoneRepository phoneRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthService(CustomerRepository customerRepository,
                       PhoneRepository phoneRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       AuthenticationManager authenticationManager) {
        this.customerRepository = customerRepository;
        this.phoneRepository = phoneRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public Map<String, Object> register(RegisterRequestDTO request) {
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }
        if (request.getPassword().length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters");
        }

        Customer customer = new Customer();
        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setStreet(request.getStreet());
        customer.setCity(request.getCity());
        customer.setPincode(request.getPincode());
        customer.setPassword(passwordEncoder.encode(request.getPassword()));
        customer.setRole("ROLE_USER");

        Customer saved = customerRepository.save(customer);

        if (request.getPhoneNo() != null && !request.getPhoneNo().isEmpty()) {
            Phone phone = new Phone();
            phone.setPhoneNo(request.getPhoneNo());
            phone.setCustomer(saved);
            phoneRepository.save(phone);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("customer_id", saved.getCustomerId());
        response.put("name", saved.getName());
        response.put("email", saved.getEmail());
        response.put("street", saved.getStreet());
        response.put("city", saved.getCity());
        response.put("pincode", saved.getPincode());
        response.put("phone_no", request.getPhoneNo());
        response.put("role", saved.getRole());
        return response;
    }

    @Transactional(readOnly = true)
    public LoginResponseDTO loginWithDetails(LoginRequestDTO loginRequest) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            Customer customer = customerRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String token = tokenProvider.generateToken(auth);

            return new LoginResponseDTO(
                    customer.getCustomerId(),
                    customer.getName(),
                    customer.getEmail(),
                    token,
                    customer.getRole()
            );

        } catch (Exception e) {
            throw new RuntimeException("Invalid email or password");
        }
    }

    @Transactional(readOnly = true)
    public Customer getLoggedInCustomer(HttpServletRequest request) {
        String token = tokenProvider.resolveToken(request);
        if (token == null || !tokenProvider.validateToken(token)) {
            return null;
        }
        String email = tokenProvider.getUsernameFromToken(token);
        return customerRepository.findByEmail(email).orElse(null);
    }
}