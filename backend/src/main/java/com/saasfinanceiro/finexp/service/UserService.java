package com.saasfinanceiro.finexp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.saasfinanceiro.finexp.dto.user.ChangePasswordRequest;
import com.saasfinanceiro.finexp.dto.user.UpdateProfileRequest;
import com.saasfinanceiro.finexp.dto.user.UserProfileResponse;
import com.saasfinanceiro.finexp.exceptions.BusinessException;
import com.saasfinanceiro.finexp.model.User;
import com.saasfinanceiro.finexp.repository.UserRepository;

/**
 * Operations on the authenticated user's own account. There is deliberately no
 * API to read, change or delete other users.
 */
@Service
public class UserService {
    @Autowired
    private UserRepository repository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    private User getAuthenticatedUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    public UserProfileResponse getProfile() {
        return toResponse(getAuthenticatedUser());
    }

    public UserProfileResponse updateProfile(UpdateProfileRequest request) {
        User user = getAuthenticatedUser();
        user.setName(request.name());
        return toResponse(repository.save(user));
    }

    public void changePassword(ChangePasswordRequest request) {
        User user = getAuthenticatedUser();

        if (!passwordEncoder.matches(request.oldPassword(), user.getPassword())) {
            throw new BusinessException("The current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        repository.save(user);
    }

    private UserProfileResponse toResponse(User user) {
        return new UserProfileResponse(user.getId(), user.getName(), user.getEmail());
    }
}
