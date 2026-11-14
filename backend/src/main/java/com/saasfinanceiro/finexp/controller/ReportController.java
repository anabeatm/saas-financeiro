package com.saasfinanceiro.finexp.controller;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.saasfinanceiro.finexp.dto.report.StatementReportResponse;
import com.saasfinanceiro.finexp.service.ReportService;
import com.saasfinanceiro.finexp.service.StatementCsvExporter;

@RestController
@RequestMapping("/api/v1/wallets/{walletId}/reports")
public class ReportController {

    private static final MediaType TEXT_CSV = new MediaType("text", "csv", StandardCharsets.UTF_8);

    private final ReportService reportService;
    private final StatementCsvExporter csvExporter;

    public ReportController(ReportService reportService, StatementCsvExporter csvExporter) {
        this.reportService = reportService;
        this.csvExporter = csvExporter;
    }

    @GetMapping("/statement")
    public ResponseEntity<StatementReportResponse> getStatement(
            @PathVariable Long walletId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportService.getStatement(walletId, startDate, endDate));
    }

    @GetMapping("/statement/csv")
    public ResponseEntity<byte[]> downloadStatementCsv(
            @PathVariable Long walletId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        StatementReportResponse report = reportService.getStatement(walletId, startDate, endDate);

        return ResponseEntity.ok()
                .contentType(TEXT_CSV)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(csvExporter.fileName(report)).build().toString())
                .body(csvExporter.export(report));
    }
}
