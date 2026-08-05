package com.saasfinanceiro.finexp.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.saasfinanceiro.finexp.dto.wallet.AddMemberRequest;
import com.saasfinanceiro.finexp.dto.wallet.MemberResponse;
import com.saasfinanceiro.finexp.dto.wallet.UpdateMemberRoleRequest;
import com.saasfinanceiro.finexp.exceptions.BusinessException;
import com.saasfinanceiro.finexp.exceptions.ResourceNotFoundException;
import com.saasfinanceiro.finexp.model.User;
import com.saasfinanceiro.finexp.model.Wallet;
import com.saasfinanceiro.finexp.model.WalletMember;
import com.saasfinanceiro.finexp.model.enums.WalletRole;
import com.saasfinanceiro.finexp.repository.UserRepository;
import com.saasfinanceiro.finexp.repository.WalletMemberRepository;
import com.saasfinanceiro.finexp.repository.WalletRepository;

@Service
public class WalletMemberService {

    @Autowired private WalletMemberRepository walletMemberRepository;
    @Autowired private WalletRepository walletRepository;
    @Autowired private UserRepository userRepository;

    private User getAuthenticatedUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private Wallet validateOwnerAccess(Long walletId) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));

        WalletMember member = walletMemberRepository.findByWalletAndUser(wallet, getAuthenticatedUser())
                .orElseThrow(() -> new AccessDeniedException("Access Denied"));

        if (member.getRole() != WalletRole.OWNER) {
            throw new BusinessException("Forbidden: Only the OWNER can manage members");
        }
        return wallet;
    }

    public List<MemberResponse> listMembers(Long walletId) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));
        
        walletMemberRepository.findByWalletAndUser(wallet, getAuthenticatedUser())
                .orElseThrow(() -> new AccessDeniedException("Access Denied"));

        return wallet.getMembers().stream().map(MemberResponse::new).collect(Collectors.toList());
    }

    public MemberResponse addMember(Long walletId, AddMemberRequest request) {
        Wallet wallet = validateOwnerAccess(walletId);

        User newMemberUser = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("User email not found")); // 404

        if (walletMemberRepository.findByWalletAndUser(wallet, newMemberUser).isPresent()) {
            throw new BusinessException("User is already a member of this wallet"); // 409
        }

        WalletMember newMember = new WalletMember();
        newMember.setWallet(wallet);
        newMember.setUser(newMemberUser);
        newMember.setRole(request.role());

        newMember = walletMemberRepository.save(newMember);
        return new MemberResponse(newMember);
    }

    public MemberResponse updateRole(Long walletId, Long userId, UpdateMemberRoleRequest request) {
        Wallet wallet = validateOwnerAccess(walletId);

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        WalletMember targetMember = walletMemberRepository.findByWalletAndUser(wallet, targetUser)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found in this wallet"));

        if (targetMember.getRole() == WalletRole.OWNER) {
            throw new BusinessException("Cannot change the role of the wallet OWNER");
        }

        targetMember.setRole(request.role());
        targetMember = walletMemberRepository.save(targetMember);
        
        return new MemberResponse(targetMember);
    }

    public void removeMember(Long walletId, Long userId) {
        Wallet wallet = validateOwnerAccess(walletId);

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        WalletMember targetMember = walletMemberRepository.findByWalletAndUser(wallet, targetUser)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found in this wallet"));

        if (targetMember.getRole() == WalletRole.OWNER) {
            throw new BusinessException("Cannot remove the wallet OWNER");
        }

        walletMemberRepository.delete(targetMember);
    }
}
