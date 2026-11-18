package com.saasfinanceiro.finexp.dto.ai;

import java.time.LocalDateTime;
import java.util.List;

/** Natural-language reading of a wallet's period: a short summary and a few practical tips. */
public record InsightsResponse(String summary, List<String> tips, boolean generatedByAi, LocalDateTime generatedAt) {}
