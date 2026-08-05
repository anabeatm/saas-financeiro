package com.saasfinanceiro.finexp.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.saasfinanceiro.finexp.dto.wallet.AddMemberRequest;
import com.saasfinanceiro.finexp.dto.wallet.MemberResponse;
import com.saasfinanceiro.finexp.dto.wallet.UpdateMemberRoleRequest;
import com.saasfinanceiro.finexp.service.WalletMemberService;

@RestController
@RequestMapping("/api/wallets/{walletId}/members")
public class WalletMemberController {

    @Autowired
    private WalletMemberService service;

    @GetMapping
    public ResponseEntity<List<MemberResponse>> listMembers(@PathVariable Long walletId) {
        return ResponseEntity.ok(service.listMembers(walletId));
    }

    @PostMapping
    public ResponseEntity<MemberResponse> addMember(
            @PathVariable Long walletId, 
            @RequestBody @Valid AddMemberRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.addMember(walletId, request));
    }

    @PatchMapping("/{userId}")
    public ResponseEntity<MemberResponse> updateRole(
            @PathVariable Long walletId,
            @PathVariable Long userId,
            @RequestBody @Valid UpdateMemberRoleRequest request) {
        return ResponseEntity.ok(service.updateRole(walletId, userId, request));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long walletId,
            @PathVariable Long userId) {
        service.removeMember(walletId, userId);
        return ResponseEntity.noContent().build();
    }
}
