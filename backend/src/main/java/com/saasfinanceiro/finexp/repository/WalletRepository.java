package com.saasfinanceiro.finexp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.saasfinanceiro.finexp.model.User;
import com.saasfinanceiro.finexp.model.Wallet;

public interface WalletRepository extends JpaRepository<Wallet, Long> {
    
    @Query("SELECT w FROM Wallet w JOIN w.members m WHERE m.user = :user")
    List<Wallet> findAllWalletsByMember(@Param("user") User user);
}
