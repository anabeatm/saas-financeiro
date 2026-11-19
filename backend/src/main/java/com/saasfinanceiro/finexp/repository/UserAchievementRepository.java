package com.saasfinanceiro.finexp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.saasfinanceiro.finexp.model.UserAchievement;
import com.saasfinanceiro.finexp.model.enums.AchievementCode;

public interface UserAchievementRepository extends JpaRepository<UserAchievement, Long> {

    boolean existsByUserIdAndCode(Long userId, AchievementCode code);

    List<UserAchievement> findAllByUserId(Long userId);
}
