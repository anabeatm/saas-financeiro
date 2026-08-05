package com.saasfinanceiro.finexp.service;

import java.util.List;
import java.util.stream.Collectors;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.saasfinanceiro.finexp.dto.wallet.WalletRequest;
import com.saasfinanceiro.finexp.dto.wallet.WalletResponse;
import com.saasfinanceiro.finexp.model.User;
import com.saasfinanceiro.finexp.model.Wallet;
import com.saasfinanceiro.finexp.model.WalletMember;
import com.saasfinanceiro.finexp.model.enums.WalletRole;
import com.saasfinanceiro.finexp.repository.WalletMemberRepository;
import com.saasfinanceiro.finexp.repository.WalletRepository;

@Service
public class WalletService {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private WalletMemberRepository walletMemberRepository;

    private User getAuthenticatedUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @Transactional
    public WalletResponse create(WalletRequest request) {
        User currentUser = getAuthenticatedUser();

        Wallet wallet = new Wallet();
        wallet.setName(request.name());
        wallet.setDescription(request.description());
        wallet.setOwner(currentUser);
        wallet = walletRepository.save(wallet);

        WalletMember member = new WalletMember();
        member.setWallet(wallet);
        member.setUser(currentUser);
        member.setRole(WalletRole.OWNER);
        walletMemberRepository.save(member);

        return new WalletResponse(wallet);
    }

    public List<WalletResponse> listAll() {
        User currentUser = getAuthenticatedUser();

        List<Wallet> wallets = walletRepository.findAllWalletsByMember(currentUser);
        
        return wallets.stream().map(WalletResponse::new).collect(Collectors.toList());
    }

    public WalletResponse searchId(Long id) {
        Wallet wallet = walletRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        walletMemberRepository.findByWalletAndUser(wallet, getAuthenticatedUser())
                .orElseThrow(() -> new RuntimeException("Access Denied: You are not a member of this wallet"));

        return new WalletResponse(wallet);
    }

    @Transactional
    public WalletResponse update(Long id, WalletRequest request) {
        Wallet wallet = walletRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        WalletMember member = walletMemberRepository.findByWalletAndUser(wallet, getAuthenticatedUser())
                .orElseThrow(() -> new RuntimeException("Access Denied"));

        if (member.getRole() != WalletRole.OWNER) {
            throw new RuntimeException("Forbidden: Only the OWNER can edit this wallet");
        }

        wallet.setName(request.name());
        wallet.setDescription(request.description());
        wallet = walletRepository.save(wallet);

        return new WalletResponse(wallet);
    }

    @Transactional
    public void delete(Long id) {
        Wallet wallet = walletRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        WalletMember member = walletMemberRepository.findByWalletAndUser(wallet, getAuthenticatedUser())
                .orElseThrow(() -> new RuntimeException("Access Denied"));

        if (member.getRole() != WalletRole.OWNER) {
            throw new RuntimeException("Forbidden: Only the OWNER can delete this wallet");
        }

        walletRepository.delete(wallet);
    }
}
