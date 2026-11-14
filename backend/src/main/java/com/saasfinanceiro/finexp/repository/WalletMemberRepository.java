package com.saasfinanceiro.finexp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.saasfinanceiro.finexp.model.User;
import com.saasfinanceiro.finexp.model.Wallet;
import com.saasfinanceiro.finexp.model.WalletMember;

public interface WalletMemberRepository extends JpaRepository<WalletMember, Long> {
    
    Optional<WalletMember> findByWalletAndUser(Wallet wallet, User user);

    List<WalletMember> findAllByUser(User user);

    @Query("SELECT m.user.id FROM WalletMember m WHERE m.wallet.id = :walletId")
    List<Long> findUserIdsByWalletId(@Param("walletId") Long walletId);
}
