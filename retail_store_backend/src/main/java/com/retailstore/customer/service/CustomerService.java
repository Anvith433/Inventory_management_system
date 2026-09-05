package com.retailstore.customer.service;

import com.retailstore.customer.dto.CustomerDTO;
import com.retailstore.customer.dto.CustomerResponseDTO;
import com.retailstore.customer.entity.Customer;
import com.retailstore.customer.repository.CustomerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public CustomerResponseDTO getCustomerByEmail(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found with email: " + email));
        return mapToResponseDTO(customer);
    }

    public CustomerResponseDTO updateCustomerByEmail(String email, CustomerDTO dto) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found with email: " + email));

        if (dto.getName() != null && !dto.getName().isBlank()) {
            customer.setName(dto.getName());
        }
        if (dto.getStreet() != null) {
            customer.setStreet(dto.getStreet());
        }
        if (dto.getCity() != null) {
            customer.setCity(dto.getCity());
        }
        if (dto.getPincode() != null) {
            customer.setPincode(dto.getPincode());
        }

        Customer updatedCustomer = customerRepository.save(customer);
        return mapToResponseDTO(updatedCustomer);
    }

    private CustomerResponseDTO mapToResponseDTO(Customer customer) {
        return new CustomerResponseDTO(
                customer.getCustomerId(),
                customer.getName(),
                customer.getEmail(),
                customer.getStreet(),
                customer.getCity(),
                customer.getPincode(),
                customer.getRole()
        );
    }
}