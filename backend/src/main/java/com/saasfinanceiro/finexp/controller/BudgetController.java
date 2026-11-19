package com.saasfinanceiro.finexp.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.saasfinanceiro.finexp.dto.budget.BudgetRequest;
import com.saasfinanceiro.finexp.dto.budget.BudgetResponse;
import com.saasfinanceiro.finexp.gamification.BudgetService;
import com.saasfinanceiro.finexp.model.User;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/budgets")
@Tag(name = "Budgets", description = "Monthly spending limits per expense category")
public class BudgetController {

    private final BudgetService service;

    public BudgetController(BudgetService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Budgets with the spending of a month", description = "month: yyyy-MM, current month by default")
    public ResponseEntity<List<BudgetResponse>> list(@AuthenticationPrincipal User user,
            @RequestParam(required = false) String month) {
        return ResponseEntity.ok(service.list(user, month));
    }

    @PutMapping("/{categoryId}")
    @Operation(summary = "Create or change the budget of an expense category")
    public ResponseEntity<BudgetResponse> save(@AuthenticationPrincipal User user, @PathVariable Long categoryId,
            @RequestBody @Valid BudgetRequest request) {
        return ResponseEntity.ok(service.save(user, categoryId, request.monthlyLimit()));
    }

    @DeleteMapping("/{categoryId}")
    @Operation(summary = "Remove the budget of a category")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal User user, @PathVariable Long categoryId) {
        service.delete(user, categoryId);
        return ResponseEntity.noContent().build();
    }
}
