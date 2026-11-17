package com.saasfinanceiro.finexp.security;

import jakarta.servlet.http.HttpServletRequest;

/** Address of the client that made the request, as seen behind the hosting proxy. */
public final class ClientIp {

    private ClientIp() {
    }

    /**
     * In production the API sits behind one proxy (Render), which appends the real client address to
     * {@code X-Forwarded-For}. Only that last entry is trusted: the ones before it can be typed by the
     * client to dodge the rate limits. Without the header, the connection address is used.
     */
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
