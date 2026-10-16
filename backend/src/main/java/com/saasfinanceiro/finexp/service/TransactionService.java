package com.saasfinanceiro.finexp.service;

import java.math.BigDecimal;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.saasfinanceiro.finexp.dto.transaction.TransactionFilter;
import com.saasfinanceiro.finexp.dto.transaction.TransactionRequest;
import com.saasfinanceiro.finexp.dto.transaction.TransactionResponse;
import com.saasfinanceiro.finexp.exceptions.BadRequestException;
import com.saasfinanceiro.finexp.exceptions.BusinessException;
import com.saasfinanceiro.finexp.exceptions.ResourceNotFoundException;
import com.saasfinanceiro.finexp.model.Category;
import com.saasfinanceiro.finexp.model.Transaction;
import com.saasfinanceiro.finexp.model.User;
import com.saasfinanceiro.finexp.model.Wallet;
import com.saasfinanceiro.finexp.model.WalletMember;
import com.saasfinanceiro.finexp.model.enums.TransactionType;
import com.saasfinanceiro.finexp.model.enums.WalletRole;
import com.saasfinanceiro.finexp.repository.CategoryRepository;
import com.saasfinanceiro.finexp.repository.TransactionRepository;
import com.saasfinanceiro.finexp.repository.TransactionSpecifications;
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
            throw new AccessDeniedException("Viewers cannot modify transactions");
        }
        return member;
    }

    private Category resolveCategory(Long categoryId, TransactionType type) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        // Categories are private to their owner; report others as missing to avoid leaking their existence.
        if (!category.getUser().getId().equals(getAuthenticatedUser().getId())) {
            throw new ResourceNotFoundException("Category not found");
        }
        if (category.getType() != type) {
            throw new BusinessException("Category type does not match the transaction type");
        }
        return category;
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
            transaction.setCategory(resolveCategory(request.categoryId(), request.type()));
        }

        transaction = transactionRepository.save(transaction);
        walletRepository.adjustBalance(walletId, effectOf(transaction.getType(), transaction.getAmount()));

        return new TransactionResponse(transaction);
    }

    @Transactional
    public TransactionResponse update(Long walletId, Long transactionId, TransactionRequest request) {
        validateWalletAccess(walletId, true);

        Transaction transaction = findInWallet(walletId, transactionId);

        BigDecimal oldEffect = effectOf(transaction.getType(), transaction.getAmount());
        BigDecimal newEffect = effectOf(request.type(), request.amount());

        Category category = request.categoryId() != null
                ? resolveCategory(request.categoryId(), request.type())
                : null;

        transaction.setType(request.type());
        transaction.setAmount(request.amount());
        transaction.setDescription(request.description());
        transaction.setDate(request.date());
        transaction.setCategory(category);
        transaction = transactionRepository.save(transaction);

        walletRepository.adjustBalance(walletId, newEffect.subtract(oldEffect));

        return new TransactionResponse(transaction);
    }

    public Page<TransactionResponse> listAll(Long walletId, TransactionFilter filter, Pageable pageable) {
        validateWalletAccess(walletId, false);

        if (filter.startDate() != null && filter.endDate() != null && filter.startDate().isAfter(filter.endDate())) {
            throw new BadRequestException("startDate must not be after endDate");
        }

        Page<Transaction> transactions = transactionRepository
                .findAll(TransactionSpecifications.matching(walletId, filter), pageable);
        return transactions.map(TransactionResponse::new);
    }

    public TransactionResponse getById(Long walletId, Long transactionId) {
        validateWalletAccess(walletId, false);
        return new TransactionResponse(findInWallet(walletId, transactionId));
    }

    @Transactional
    public void delete(Long walletId, Long transactionId) {
        validateWalletAccess(walletId, true);

        Transaction transaction = findInWallet(walletId, transactionId);

        walletRepository.adjustBalance(walletId,
                effectOf(transaction.getType(), transaction.getAmount()).negate());

        transactionRepository.delete(transaction);
    }

    private Transaction findInWallet(Long walletId, Long transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (!transaction.getWallet().getId().equals(walletId)) {
            throw new ResourceNotFoundException("Transaction not found");
        }
        return transaction;
    }

    // Signed impact of a transaction on the wallet balance.
    private BigDecimal effectOf(TransactionType type, BigDecimal amount) {
        return type == TransactionType.INCOME ? amount : amount.negate();
    }
}
