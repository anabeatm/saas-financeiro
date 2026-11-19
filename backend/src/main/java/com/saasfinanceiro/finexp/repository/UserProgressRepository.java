package com.saasfinanceiro.finexp.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.saasfinanceiro.finexp.model.UserProgress;

public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {

    Optional<UserProgress> findByUserId(Long userId);
}
