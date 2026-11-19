package com.saasfinanceiro.finexp.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.saasfinanceiro.finexp.model.Transaction;
import com.saasfinanceiro.finexp.model.enums.TransactionType;

public interface TransactionRepository
        extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {

    boolean existsByCategoryId(Long categoryId);

    List<Transaction> findAllByWalletIdAndDateBetween(Long walletId, LocalDate startDate, LocalDate endDate);

    /** Transactions of a period in statement order, with category and author loaded in the same query. */
    @Query("""
            SELECT t FROM Transaction t
            LEFT JOIN FETCH t.category
            JOIN FETCH t.createdBy
            WHERE t.wallet.id = :walletId AND t.date BETWEEN :startDate AND :endDate
            ORDER BY t.date ASC, t.id ASC
            """)
    List<Transaction> findStatementEntries(@Param("walletId") Long walletId,
            @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    /**
     * Sum of incomes minus expenses dated before {@code date}, i.e. the wallet balance when the period starts.
     * Returns null when there is no such transaction.
     */
    @Query("""
            SELECT SUM(CASE WHEN t.type = :income THEN t.amount ELSE -t.amount END)
            FROM Transaction t
            WHERE t.wallet.id = :walletId AND t.date < :date
            """)
    BigDecimal sumSignedAmountBefore(@Param("walletId") Long walletId, @Param("date") LocalDate date,
            @Param("income") TransactionType income);

    boolean existsByCreatedByIdAndTypeAndCreatedAtGreaterThanEqual(Long userId, TransactionType type,
            LocalDateTime from);

    /** Total of a type per category of a user (categories are private, so this spans every wallet). */
    @Query("""
            SELECT t.category.id AS categoryId, SUM(t.amount) AS total
            FROM Transaction t
            WHERE t.category.user.id = :userId AND t.type = :type AND t.date BETWEEN :startDate AND :endDate
            GROUP BY t.category.id
            """)
    List<CategoryTotal> sumByCategory(@Param("userId") Long userId, @Param("type") TransactionType type,
            @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("""
            SELECT COALESCE(SUM(t.amount), 0)
            FROM Transaction t
            WHERE t.category.id = :categoryId AND t.type = :type AND t.date BETWEEN :startDate AND :endDate
            """)
    BigDecimal sumByCategoryId(@Param("categoryId") Long categoryId, @Param("type") TransactionType type,
            @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    /** Incomes and expenses a user created in a period, in any wallet. */
    @Query("""
            SELECT t.type AS type, SUM(t.amount) AS total
            FROM Transaction t
            WHERE t.createdBy.id = :userId AND t.date BETWEEN :startDate AND :endDate
            GROUP BY t.type
            """)
    List<TypeTotal> sumByTypeCreatedBy(@Param("userId") Long userId, @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    interface CategoryTotal {
        Long getCategoryId();

        BigDecimal getTotal();
    }

    interface TypeTotal {
        TransactionType getType();

        BigDecimal getTotal();
    }
}
