package com.saasfinanceiro.finexp.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.saasfinanceiro.finexp.model.User;

// NOTE: OPTIONAL é um conteiner que pode ou não conter um valor, ele evita o NullPointerException do java

public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
    
}
