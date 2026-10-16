package com.saasfinanceiro.finexp.controller;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.saasfinanceiro.finexp.dto.user.ChangePasswordRequest;
import com.saasfinanceiro.finexp.dto.user.MessageResponse;
import com.saasfinanceiro.finexp.dto.user.UpdateProfileRequest;
import com.saasfinanceiro.finexp.dto.user.UserProfileResponse;
import com.saasfinanceiro.finexp.service.UserService;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService service;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser() {
        return ResponseEntity.ok(service.getProfile());
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateCurrentUser(@RequestBody @Valid UpdateProfileRequest request) {
        return ResponseEntity.ok(service.updateProfile(request));
    }

    @PutMapping("/password")
    public ResponseEntity<MessageResponse> changePassword(@RequestBody @Valid ChangePasswordRequest request) {
        service.changePassword(request);
        return ResponseEntity.ok(new MessageResponse("Password changed successfully"));
    }
}
