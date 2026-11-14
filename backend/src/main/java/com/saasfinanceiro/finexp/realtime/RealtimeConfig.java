package com.saasfinanceiro.finexp.realtime;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/** Enables the scheduler used for the SSE heartbeat. */
@Configuration
@EnableScheduling
public class RealtimeConfig {
}
