package com.saasfinanceiro.finexp.controller;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.saasfinanceiro.finexp.dto.dashboard.DashboardSummaryResponse;
import com.saasfinanceiro.finexp.service.DashboardService;

@RestController
@RequestMapping("/api/wallets")
public class DashboardController {

    @Autowired
    private DashboardService service;

    @GetMapping("/{walletId}/summary")
    public ResponseEntity<DashboardSummaryResponse> getSummary(
            @PathVariable Long walletId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        return ResponseEntity.ok(service.getSummary(walletId, startDate, endDate));
    }
}
