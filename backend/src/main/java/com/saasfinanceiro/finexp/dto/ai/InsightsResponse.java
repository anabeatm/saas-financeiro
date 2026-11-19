package com.saasfinanceiro.finexp.dto.ai;

import java.time.LocalDateTime;
import java.util.List;

/** resumo + dicas do período da carteira */
public record InsightsResponse(String summary, List<String> tips, boolean generatedByAi, LocalDateTime generatedAt) {}
