package com.saasfinanceiro.finexp.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.saasfinanceiro.finexp.model.User;

// NOTE: Optional can hold a value or be empty, which helps avoid NullPointerException.

public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
    
}
