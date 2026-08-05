package com.saasfinanceiro.finexp.dto.wallet;

import java.time.LocalDateTime;

import com.saasfinanceiro.finexp.model.WalletMember;
import com.saasfinanceiro.finexp.model.enums.WalletRole;

public record MemberResponse(
    Long id,
    Long userId,
    String name,
    String email,
    WalletRole role,
    LocalDateTime joinedAt
) {
    public MemberResponse(WalletMember member) {
        this(
            member.getId(),
            member.getUser().getId(),
            member.getUser().getName(),
            member.getUser().getEmail(),
            member.getRole(),
            member.getJoinedAt()
        );
    }
}
