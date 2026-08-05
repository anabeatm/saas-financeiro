package com.saasfinanceiro.finexp.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.saasfinanceiro.finexp.model.User;
import com.saasfinanceiro.finexp.model.Wallet;
import com.saasfinanceiro.finexp.model.WalletMember;

public interface WalletMemberRepository extends JpaRepository<WalletMember, Long> {
    
    Optional<WalletMember> findByWalletAndUser(Wallet wallet, User user);
}
