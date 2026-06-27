package com.saasfinanceiro.finexp.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.saasfinanceiro.finexp.model.User;

public interface UserRepository extends JpaRepository<User,Long> {
    
}
