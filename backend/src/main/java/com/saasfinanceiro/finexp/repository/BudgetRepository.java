package com.saasfinanceiro.finexp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.saasfinanceiro.finexp.model.Budget;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    @Query("SELECT b FROM Budget b JOIN FETCH b.category c WHERE c.id = :categoryId")
    Optional<Budget> findByCategoryId(@Param("categoryId") Long categoryId);

    /** Budgets of a user, with their category loaded in the same query. */
    @Query("SELECT b FROM Budget b JOIN FETCH b.category c WHERE c.user.id = :userId ORDER BY c.name")
    List<Budget> findAllByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM Budget b WHERE b.category.id = :categoryId")
    int deleteByCategoryId(@Param("categoryId") Long categoryId);
}
