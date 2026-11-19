package com.saasfinanceiro.finexp.security;

import jakarta.servlet.http.HttpServletRequest;

/** pega o ip do cliente atrás do proxy */
public final class ClientIp {

    private ClientIp() {
    }

    /** usa o último ip do X-Forwarded-For (é o que o proxy coloca, os outros dá pra falsificar) */
    public static String of(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            String[] hops = forwardedFor.split(",");
            for (int i = hops.length - 1; i >= 0; i--) {
                String hop = hops[i].trim();
                if (!hop.isEmpty()) {
                    return hop;
                }
            }
        }
        return request.getRemoteAddr();
    }
}
