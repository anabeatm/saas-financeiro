package com.saasfinanceiro.finexp.controller;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
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
import com.saasfinanceiro.finexp.dto.auth.RegisterRequestDTO;
import com.saasfinanceiro.finexp.dto.auth.ResetPasswordRequest;
import com.saasfinanceiro.finexp.dto.auth.VerifyAccountRequest;
import com.saasfinanceiro.finexp.exceptions.BadRequestException;
import com.saasfinanceiro.finexp.model.PasswordResetToken;
import com.saasfinanceiro.finexp.model.User;
import com.saasfinanceiro.finexp.model.VerificationToken;
import com.saasfinanceiro.finexp.repository.PasswordResetTokenRepository;
import com.saasfinanceiro.finexp.repository.UserRepository;
import com.saasfinanceiro.finexp.repository.VerificationTokenRepository;
import com.saasfinanceiro.finexp.service.EmailService;
import com.saasfinanceiro.finexp.service.TokenService;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final VerificationTokenRepository verificationTokenRepository;
    private final EmailService emailService;
    private final String dummyHash;
    private final String frontendUrl;
    private final boolean debugResetToken;

    public AuthController(UserRepository userRepository, PasswordResetTokenRepository passwordResetTokenRepository,
            PasswordEncoder passwordEncoder, TokenService tokenService, VerificationTokenRepository verificationTokenRepository, EmailService emailService,
            @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl,
            @Value("${app.debug-reset-token:false}") boolean debugResetToken) {
        this.userRepository = userRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
        this.verificationTokenRepository = verificationTokenRepository;
        this.emailService = emailService;
        this.frontendUrl = frontendUrl;
        this.debugResetToken = debugResetToken;
        this.dummyHash = passwordEncoder.encode(UUID.randomUUID().toString());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginRequest request) {
        Optional<User> uOptional = userRepository.findByEmail(request.email());

        // Always run a BCrypt comparison so response time does not reveal whether the email exists.
        String hashToCompare = uOptional.map(User::getPassword).orElse(dummyHash);
        boolean passwordMatches = passwordEncoder.matches(request.password(), hashToCompare);

        if (uOptional.isEmpty() || !passwordMatches) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Incorrect email or password");
        }

        User user = uOptional.get();

        // Only revealed after the password is proven correct, to avoid account enumeration.
        if (!user.isEnabled()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Please verify your email before logging in.");
        }

        String token = tokenService.generateToken(user);
        return ResponseEntity.ok(new LoginResponse(token));
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody @Valid RegisterRequestDTO request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new DataIntegrityViolationException("Email already in use");
        }
        User newUser = new User();
        newUser.setName(request.name());
        newUser.setEmail(request.email());
        newUser.setPassword(passwordEncoder.encode(request.password()));
        newUser.setEnabled(false);

        userRepository.save(newUser);

        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setUser(newUser);
        verificationToken.setToken(UUID.randomUUID().toString());
        verificationToken.setExpiryDate(LocalDateTime.now().plusHours(24));
        
        verificationTokenRepository.save(verificationToken);

        Context context = new Context();
        context.setVariable("name", newUser.getName());
        context.setVariable("link", frontendUrl + "/verify-account/" + verificationToken.getToken());

        emailService.sendEmailTemplate(newUser.getEmail(),"Welcome to FinEXP - Verify your account","newUser",context);

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/verify-account")
    public ResponseEntity<?> verifyAccount(@RequestBody @Valid VerifyAccountRequest request) {
        VerificationToken verificationToken = verificationTokenRepository.findByToken(request.token())
                .orElseThrow(() -> new BadRequestException("Invalid or missing verification token"));

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("This validation link has expired.");
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
            if (debugResetToken) {
                debugToken = resetToken.getToken();
            }

            Context context = new Context();
            context.setVariable("name", user.getName());
            context.setVariable("link", frontendUrl + "/forgot-password/" + resetToken.getToken());

            emailService.sendEmailTemplate(user.getEmail(), "Password Reset Request - FinEXP", "forgotPassword", context);
        }

        ForgotPasswordResponse response = new ForgotPasswordResponse(
                "If this email address is registered, you will receive instructions in your email", debugToken);

        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.token())
                .orElseThrow(() -> new BadRequestException("Invalid or missing token"));

        if (resetToken.isUsed()) {
            throw new BadRequestException("This token has already been used");
        }
        if (resetToken.getExpiresIn().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("This token has expired. Please request a new one");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        return ResponseEntity.ok().body("{\"message\": \"Password reset successfully.\"}");
    }
}
