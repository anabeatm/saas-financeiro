package com.saasfinanceiro.finexp.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.saasfinanceiro.finexp.model.XpEvent;
import com.saasfinanceiro.finexp.model.enums.XpEventType;

public interface XpEventRepository extends JpaRepository<XpEvent, Long> {

    boolean existsByUserIdAndSourceKey(Long userId, String sourceKey);

    Optional<XpEvent> findByUserIdAndSourceKey(Long userId, String sourceKey);

    long countByUserIdAndTypeAndCreatedAtGreaterThanEqual(Long userId, XpEventType type, Instant from);

    long countByUserIdAndTypeAndSourceKeyStartingWith(Long userId, XpEventType type, String prefix);

    @Query("SELECT COALESCE(SUM(e.xp), 0) FROM XpEvent e WHERE e.user.id = :userId")
    long sumXpByUserId(@Param("userId") Long userId);

    List<XpEvent> findTop10ByUserIdOrderByCreatedAtDescIdDesc(Long userId);
}
