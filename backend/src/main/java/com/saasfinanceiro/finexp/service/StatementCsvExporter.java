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

/**
 * Writes the statement's transactions (one row each, with the running balance) as CSV in the
 * format spreadsheets use in Brazil: ';' between columns, ',' as decimal separator and a UTF-8 BOM
 * so accents open correctly in Excel. Totals and the category breakdown stay on the screen/PDF.
 */
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

    /** Download name without user-provided text, e.g. statement-3-2025-01-01-2025-01-31.csv */
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

    /**
     * Free text typed by users. A leading = + - @ (or tab/CR) would make a spreadsheet run it as a
     * formula (CSV injection), so such values are prefixed with an apostrophe.
     */
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
