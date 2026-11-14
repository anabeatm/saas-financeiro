package com.saasfinanceiro.finexp.service;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.saasfinanceiro.finexp.dto.report.CategoryBreakdownDTO;
import com.saasfinanceiro.finexp.dto.report.StatementEntryDTO;
import com.saasfinanceiro.finexp.dto.report.StatementReportResponse;
import com.saasfinanceiro.finexp.model.enums.TransactionType;

class StatementCsvExporterTest {

    private final StatementCsvExporter exporter = new StatementCsvExporter();

    @Test
    void writesOnlyTheTransactionsTableInBrazilianFormat() {
        String csv = exportAsText(report(List.of(
                entry(TransactionType.INCOME, "Salário", "Salary", "1000", "1500"),
                entry(TransactionType.EXPENSE, "Groceries", "Food", "150.5", "1349.5"))));

        // expenses are written with a negative sign so the column can be summed
        assertEquals(
                "Date;Type;Description;Category;Created by;Amount;Balance\r\n"
                        + "05/01/2025;Income;Salário;Salary;Ana;1000,00;1500,00\r\n"
                        + "05/01/2025;Expense;Groceries;Food;Ana;-150,50;1349,50\r\n",
                csv);
    }

    @Test
    void startsWithUtf8Bom() {
        byte[] bytes = exporter.export(report(List.of()));

        assertArrayEquals(new byte[] { (byte) 0xEF, (byte) 0xBB, (byte) 0xBF }, Arrays.copyOf(bytes, 3));
    }

    @Test
    void quotesCellsWithSeparatorsOrQuotes() {
        String csv = exportAsText(report(List.of(
                entry(TransactionType.EXPENSE, "Rent; March \"downtown\"", "Housing", "10", "490"))));

        assertTrue(csv.contains(";\"Rent; March \"\"downtown\"\"\";"));
    }

    @Test
    void neutralizesSpreadsheetFormulas() {
        assertEquals("'=HYPERLINK(\"x\")", StatementCsvExporter.text("=HYPERLINK(\"x\")"));
        assertEquals("'+1", StatementCsvExporter.text("+1"));
        assertEquals("'-1", StatementCsvExporter.text("-1"));
        assertEquals("'@SUM(A1)", StatementCsvExporter.text("@SUM(A1)"));
        assertEquals("Groceries", StatementCsvExporter.text("Groceries"));
        assertEquals("", StatementCsvExporter.text(null));
    }

    @Test
    void fileNameDoesNotUseUserText() {
        assertEquals("statement-3-2025-01-01-2025-01-31.csv", exporter.fileName(report(List.of())));
    }

    private String exportAsText(StatementReportResponse report) {
        byte[] bytes = exporter.export(report);
        return new String(bytes, 3, bytes.length - 3, StandardCharsets.UTF_8);
    }

    private static StatementEntryDTO entry(TransactionType type, String description, String category,
            String amount, String balance) {
        return new StatementEntryDTO(1L, LocalDate.of(2025, 1, 5), type, description, category, "Ana",
                new BigDecimal(amount), new BigDecimal(balance));
    }

    private static StatementReportResponse report(List<StatementEntryDTO> entries) {
        return new StatementReportResponse(3L, "Household", LocalDate.of(2025, 1, 1), LocalDate.of(2025, 1, 31),
                LocalDateTime.of(2025, 2, 1, 9, 30), new BigDecimal("500"), new BigDecimal("1000"),
                new BigDecimal("150.5"), new BigDecimal("849.5"), new BigDecimal("1349.5"), entries.size(),
                List.of(new CategoryBreakdownDTO(2L, "Food", TransactionType.EXPENSE, new BigDecimal("150.5"), 1,
                        new BigDecimal("100"))),
                entries);
    }
}
