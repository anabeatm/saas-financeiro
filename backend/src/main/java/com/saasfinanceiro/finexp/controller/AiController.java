package com.saasfinanceiro.finexp.controller;

import java.time.LocalDate;

import jakarta.validation.Valid;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.saasfinanceiro.finexp.ai.AiService;
import com.saasfinanceiro.finexp.dto.ai.CategorySuggestionRequest;
import com.saasfinanceiro.finexp.dto.ai.CategorySuggestionResponse;
import com.saasfinanceiro.finexp.dto.ai.InsightsResponse;

/** AI features (Google Gemini). Answer 503 when the server has no AI key configured. */
@RestController
@RequestMapping("/api/v1")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/ai/category-suggestion")
    public ResponseEntity<CategorySuggestionResponse> suggestCategory(
            @RequestBody @Valid CategorySuggestionRequest request) {
        return ResponseEntity.ok(aiService.suggestCategory(request));
    }

    @GetMapping("/wallets/{walletId}/reports/insights")
    public ResponseEntity<InsightsResponse> insights(
            @PathVariable Long walletId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(aiService.insights(walletId, startDate, endDate));
    }
}
