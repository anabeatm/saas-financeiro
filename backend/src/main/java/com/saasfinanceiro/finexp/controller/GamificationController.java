package com.saasfinanceiro.finexp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.saasfinanceiro.finexp.dto.gamification.GamificationProfileResponse;
import com.saasfinanceiro.finexp.gamification.GamificationService;
import com.saasfinanceiro.finexp.model.User;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/gamification")
@Tag(name = "Gamification", description = "XP, levels, activity streak and achievements")
public class GamificationController {

    private final GamificationService service;

    public GamificationController(GamificationService service) {
        this.service = service;
    }

    @GetMapping("/me")
    @Operation(summary = "Progress of the signed-in user",
            description = "Also rewards the months that ended since the last visit (budgets met and savings).")
    public ResponseEntity<GamificationProfileResponse> me(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.getProfile(user));
    }

    @PostMapping("/check-in")
    @Operation(summary = "Check in a no-spending day",
            description = "Keeps the streak on days without expenses. 409 if already checked in today or an "
                    + "expense was logged today.")
    public ResponseEntity<GamificationProfileResponse> checkIn(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.checkIn(user));
    }
}
