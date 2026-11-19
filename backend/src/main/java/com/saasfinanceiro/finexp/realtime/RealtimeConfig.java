package com.saasfinanceiro.finexp.realtime;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/** liga o scheduler do heartbeat do sse */
@Configuration
@EnableScheduling
public class RealtimeConfig {
}
