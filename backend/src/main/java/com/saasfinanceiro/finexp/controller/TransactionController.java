package com.saasfinanceiro.finexp.controller;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.saasfinanceiro.finexp.dto.transaction.TransactionRequest;
import com.saasfinanceiro.finexp.dto.transaction.TransactionResponse;
import com.saasfinanceiro.finexp.service.TransactionService;

@RestController
@RequestMapping("/api/wallets/{walletId}/transactions")
public class TransactionController {

    @Autowired
    private TransactionService service;

    @GetMapping
    public ResponseEntity<Page<TransactionResponse>> listAll(
            @PathVariable Long walletId, 
            Pageable pageable) {
        return ResponseEntity.ok(service.listAll(walletId, pageable));
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> create(
            @PathVariable Long walletId, 
            @RequestBody @Valid TransactionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(walletId, request));
    }

    @DeleteMapping("/{transactionId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long walletId, 
            @PathVariable Long transactionId) {
        service.delete(walletId, transactionId);
        return ResponseEntity.noContent().build();
    }
}
