package com.saasfinanceiro.finexp.gamification;

import java.time.Clock;
import java.time.ZoneId;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GamificationConfig {

    /** relógio no fuso dos usuários (o servidor roda em utc) */
    @Bean
    public Clock gamificationClock(@Value("${app.gamification.zone:America/Sao_Paulo}") String zone) {
        return Clock.system(ZoneId.of(zone));
    }
}
