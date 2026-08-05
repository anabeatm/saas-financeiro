package com.saasfinanceiro.finexp.service;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.saasfinanceiro.finexp.dto.transaction.TransactionRequest;
import com.saasfinanceiro.finexp.dto.transaction.TransactionResponse;
import com.saasfinanceiro.finexp.exceptions.BusinessException;
import com.saasfinanceiro.finexp.exceptions.ResourceNotFoundException;
import com.saasfinanceiro.finexp.model.Category;
import com.saasfinanceiro.finexp.model.Transaction;
import com.saasfinanceiro.finexp.model.User;
import com.saasfinanceiro.finexp.model.Wallet;
import com.saasfinanceiro.finexp.model.WalletMember;
import com.saasfinanceiro.finexp.model.enums.WalletRole;
import com.saasfinanceiro.finexp.repository.CategoryRepository;
import com.saasfinanceiro.finexp.repository.TransactionRepository;
import com.saasfinanceiro.finexp.repository.WalletMemberRepository;
import com.saasfinanceiro.finexp.repository.WalletRepository;

@Service
public class TransactionService {

    @Autowired private TransactionRepository transactionRepository;
    @Autowired private WalletRepository walletRepository;
    @Autowired private WalletMemberRepository walletMemberRepository;
    @Autowired private CategoryRepository categoryRepository;

    private User getAuthenticatedUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private WalletMember validateWalletAccess(Long walletId, boolean requireWriteAccess) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));

        WalletMember member = walletMemberRepository.findByWalletAndUser(wallet, getAuthenticatedUser())
                .orElseThrow(() -> new AccessDeniedException("Access Denied: You are not a member of this wallet"));

        if (requireWriteAccess && member.getRole() == WalletRole.VIEWER) {
            throw new BusinessException("Forbidden: Viewers cannot modify transactions");
        }
        return member;
    }

    @Transactional
    public TransactionResponse create(Long walletId, TransactionRequest request) {
        WalletMember member = validateWalletAccess(walletId, true);
        
        Transaction transaction = new Transaction();
        transaction.setWallet(member.getWallet());
        transaction.setCreatedBy(getAuthenticatedUser());
        transaction.setType(request.type());
        transaction.setAmount(request.amount());
        transaction.setDescription(request.description());
        transaction.setDate(request.date());

        if (request.categoryId() != null) {
            Category category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            transaction.setCategory(category);
        }

        transaction = transactionRepository.save(transaction);

        Wallet wallet = member.getWallet();
        if (transaction.getType().name().equals("INCOME")) {
            wallet.setBalance(wallet.getBalance().add(transaction.getAmount()));
        } else {
            wallet.setBalance(wallet.getBalance().subtract(transaction.getAmount()));
        }
        walletRepository.save(wallet);

        return new TransactionResponse(transaction);
    }

    public Page<TransactionResponse> listAll(Long walletId, Pageable pageable) {
        validateWalletAccess(walletId, false);
        
        Page<Transaction> transactions = transactionRepository.findAllByWalletId(walletId, pageable);
        return transactions.map(TransactionResponse::new);
    }

    @Transactional
    public void delete(Long walletId, Long transactionId) {
        WalletMember member = validateWalletAccess(walletId, true);
        
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (!transaction.getWallet().getId().equals(walletId)) {
            throw new BusinessException("Transaction does not belong to this wallet");
        }

        Wallet wallet = member.getWallet();
        if (transaction.getType().name().equals("INCOME")) {
            wallet.setBalance(wallet.getBalance().subtract(transaction.getAmount()));
        } else {
            wallet.setBalance(wallet.getBalance().add(transaction.getAmount()));
        }
        walletRepository.save(wallet);

        transactionRepository.delete(transaction);
    }
}
