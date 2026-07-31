package com.saasfinanceiro.finexp.controller;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.thymeleaf.context.Context;

import com.saasfinanceiro.finexp.dto.auth.ForgotPasswordRequest;
import com.saasfinanceiro.finexp.dto.auth.ForgotPasswordResponse;
import com.saasfinanceiro.finexp.dto.auth.LoginRequest;
import com.saasfinanceiro.finexp.dto.auth.LoginResponse;
import com.saasfinanceiro.finexp.dto.auth.ResetPasswordRequest;
import com.saasfinanceiro.finexp.dto.auth.VerifyAccountRequest;
import com.saasfinanceiro.finexp.model.PasswordResetToken;
import com.saasfinanceiro.finexp.model.User;
import com.saasfinanceiro.finexp.model.VerificationToken;
import com.saasfinanceiro.finexp.repository.PasswordResetTokenRepository;
import com.saasfinanceiro.finexp.repository.UserRepository;
import com.saasfinanceiro.finexp.repository.VerificationTokenRepository;
import com.saasfinanceiro.finexp.service.EmailService;
import com.saasfinanceiro.finexp.service.TokenService;
import com.saasfinanceiro.finexp.service.UserService;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;
    private final TokenService tokenService;
    private final VerificationTokenRepository verificationTokenRepository;
    private final EmailService emailService;

    public AuthController(UserRepository userRepository, PasswordResetTokenRepository passwordResetTokenRepository,
            PasswordEncoder passwordEncoder, UserService userService, TokenService tokenService, VerificationTokenRepository verificationTokenRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.userService = userService;
        this.tokenService = tokenService;
        this.verificationTokenRepository = verificationTokenRepository;
        this.emailService = emailService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginRequest request) {
        Optional<User> uOptional = userRepository.findByEmail(request.email());

        if (uOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Incorrect email or password");
        }

        User user = uOptional.get();

        if (!user.isEnabled()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Please verify your email before logging in.");
        }

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Incorrect email or password");
        }

        String token = tokenService.generateToken(user);
        return ResponseEntity.ok(new LoginResponse(token));
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody @Valid User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.insert(user));
    }

    @PostMapping("/verify-account")
    public ResponseEntity<?> verifyAccount(@RequestBody VerifyAccountRequest request) {
        VerificationToken verificationToken = verificationTokenRepository.findByToken(request.token())
                .orElseThrow(() -> new RuntimeException("Invalid or missing verification token"));

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("This validation link has expired.");
        }
        User user = verificationToken.getUser();
        user.setEnabled(true);
        userRepository.save(user);


        verificationTokenRepository.delete(verificationToken);

        return ResponseEntity.ok().body("{\"message\": \"Account verified successfully!\"}");
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<ForgotPasswordResponse> forgotPassword(@RequestBody @Valid ForgotPasswordRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.email());
        String debugToken = null;

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setUser(user);
            resetToken.setToken(UUID.randomUUID().toString());
            resetToken.setExpiresIn(LocalDateTime.now().plusHours(1));

            passwordResetTokenRepository.save(resetToken);
            debugToken = resetToken.getToken();

            Context context = new Context();
            context.setVariable("name", user.getName());
            context.setVariable("link", "http://localhost:5173/reset-password/" + debugToken);

            emailService.sendEmailTemplate(user.getEmail(), "Password Reset Request - FinEXP", "resetPassword", context);
        }

        ForgotPasswordResponse response = new ForgotPasswordResponse(
                "If this email address is registered, you will receive instructions in your email", debugToken);

        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.token())
                .orElseThrow(() -> new RuntimeException("Invalid or missing token"));

        if (resetToken.isUsed()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("This token has already been used");
        }
        if (resetToken.getExpiresIn().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("This token has expired. Please request a new one");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        return ResponseEntity.ok().body("{\"message\": \"Password reset successfully.\"}");
    }
}
