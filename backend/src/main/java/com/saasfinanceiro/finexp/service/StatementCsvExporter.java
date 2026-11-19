package com.saasfinanceiro.finexp.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.stereotype.Component;

import com.saasfinanceiro.finexp.dto.report.StatementEntryDTO;
import com.saasfinanceiro.finexp.dto.report.StatementReportResponse;
import com.saasfinanceiro.finexp.model.enums.TransactionType;

/** exporta o extrato em csv no formato do excel br (';' e vírgula decimal) */
@Component
public class StatementCsvExporter {

    private static final String SEPARATOR = ";";
    private static final String LINE_BREAK = "\r\n";
    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final byte[] UTF8_BOM = { (byte) 0xEF, (byte) 0xBB, (byte) 0xBF };

    public byte[] export(StatementReportResponse report) {
        StringBuilder csv = new StringBuilder();

        line(csv, "Date", "Type", "Description", "Category", "Created by", "Amount", "Balance");
        for (StatementEntryDTO e : report.entries()) {
            BigDecimal signed = e.type() == TransactionType.INCOME ? e.amount() : e.amount().negate();
            line(csv, e.date().format(DATE), typeLabel(e.type()), text(e.description()), text(e.categoryName()),
                    text(e.createdBy()), money(signed), money(e.balanceAfter()));
        }

        byte[] body = csv.toString().getBytes(StandardCharsets.UTF_8);
        byte[] withBom = new byte[UTF8_BOM.length + body.length];
        System.arraycopy(UTF8_BOM, 0, withBom, 0, UTF8_BOM.length);
        System.arraycopy(body, 0, withBom, UTF8_BOM.length, body.length);
        return withBom;
    }

    /** nome do arquivo, ex: statement-3-2025-01-01-2025-01-31.csv */
    public String fileName(StatementReportResponse report) {
        return "statement-%d-%s-%s.csv".formatted(report.walletId(), report.startDate(), report.endDate());
    }

    private static void line(StringBuilder csv, String... cells) {
        csv.append(Stream.of(cells).map(StatementCsvExporter::quoteIfNeeded)
                .collect(Collectors.joining(SEPARATOR)));
        csv.append(LINE_BREAK);
    }

    private static String quoteIfNeeded(String cell) {
        if (cell.contains(SEPARATOR) || cell.contains("\"") || cell.contains("\n") || cell.contains("\r")) {
            return "\"" + cell.replace("\"", "\"\"") + "\"";
        }
        return cell;
    }

    /** evita csv injection (coloca ' na frente de fórmula) */
    static String text(String value) {
        if (value == null || value.isEmpty()) {
            return "";
        }
        return List.of('=', '+', '-', '@', '\t', '\r').contains(value.charAt(0)) ? "'" + value : value;
    }

    private static String money(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP).toPlainString().replace('.', ',');
    }

    private static String typeLabel(TransactionType type) {
        return type == TransactionType.INCOME ? "Income" : "Expense";
    }
}
