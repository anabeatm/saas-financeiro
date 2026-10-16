package com.saasfinanceiro.finexp.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.saasfinanceiro.finexp.model.User;
import com.saasfinanceiro.finexp.model.Wallet;

public interface WalletRepository extends JpaRepository<Wallet, Long> {
    
    @Query("SELECT w FROM Wallet w JOIN w.members m WHERE m.user = :user")
    List<Wallet> findAllWalletsByMember(@Param("user") User user);

    // Atomic in the database, so concurrent transactions cannot overwrite each other's balance change.
    @Modifying
    @Query("UPDATE Wallet w SET w.balance = w.balance + :delta WHERE w.id = :walletId")
    int adjustBalance(@Param("walletId") Long walletId, @Param("delta") BigDecimal delta);
}
