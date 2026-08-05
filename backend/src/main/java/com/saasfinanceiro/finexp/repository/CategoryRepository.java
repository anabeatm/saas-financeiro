package com.saasfinanceiro.finexp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.saasfinanceiro.finexp.model.Category;
import com.saasfinanceiro.finexp.model.User;
import com.saasfinanceiro.finexp.model.enums.TransactionType;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    List<Category> findAllByUser(User user);
    
    List<Category> findAllByUserAndType(User user, TransactionType type);
}
