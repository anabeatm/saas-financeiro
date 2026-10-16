package com.saasfinanceiro.finexp.security;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.saasfinanceiro.finexp.model.User;
import com.saasfinanceiro.finexp.repository.UserRepository;
import com.saasfinanceiro.finexp.service.TokenService;

@Component
public class SecurityFilter extends OncePerRequestFilter {
    private final TokenService tokenService;
    private final UserRepository userRepository;

    private SecurityFilter(TokenService tokenService, UserRepository userRepository) {
        this.tokenService=tokenService;
        this.userRepository=userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        var token = this.recoverToken(request);
        if (token != null) {
            var subject = tokenService.validateToken(token);

            if (!subject.isEmpty()) {
                Optional<User> userOptional = parseUserId(subject).flatMap(userRepository::findById);

                if (userOptional.isPresent()) {
                    User user = userOptional.get();

                    var authorities = Collections.singleton(new SimpleGrantedAuthority("ROLE_USER"));

                    var authentication = new UsernamePasswordAuthenticationToken(user, null, authorities);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        }
        filterChain.doFilter(request, response);
    }

    private Optional<Long> parseUserId(String subject) {
        try {
            return Optional.of(Long.parseLong(subject));
        } catch (NumberFormatException e) {
            // Tokens issued before the subject became the user id are simply rejected.
            return Optional.empty();
        }
    }

    private String recoverToken(HttpServletRequest request) {
        var authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        var token = authHeader.substring("Bearer ".length()).trim();
        return token.isEmpty() ? null : token;
    }
}
