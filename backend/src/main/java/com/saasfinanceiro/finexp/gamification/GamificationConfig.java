package com.saasfinanceiro.finexp.gamification;

import java.time.Clock;
import java.time.ZoneId;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GamificationConfig {

    /**
     * Clock in the users' time zone. The server runs in UTC, so without it a transaction logged at
     * 10 p.m. in Brazil would count for the next day's streak.
     */
    @Bean
    public Clock gamificationClock(@Value("${app.gamification.zone:America/Sao_Paulo}") String zone) {
        return Clock.system(ZoneId.of(zone));
    }
}
