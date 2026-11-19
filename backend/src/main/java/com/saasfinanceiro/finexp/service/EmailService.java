package com.saasfinanceiro.finexp.service;

import java.io.UnsupportedEncodingException;
import java.util.List;
import java.util.Map;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

/** manda os emails pelo brevo (produção) ou smtp (local) */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    static final String BREVO_SEND_URL = "https://api.brevo.com/v3/smtp/email";

    private final JavaMailSender javaMailSender;
    private final TemplateEngine templateEngine;
    private final RestClient restClient;
    private final String brevoApiKey;
    private final String fromAddress;
    private final String fromName;

    @Autowired
    public EmailService(JavaMailSender javaMailSender, TemplateEngine templateEngine,
            @Value("${app.mail.brevo-api-key:}") String brevoApiKey,
            @Value("${app.mail.from:}") String fromAddress,
            @Value("${app.mail.from-name:FinEXP}") String fromName) {
        this(javaMailSender, templateEngine, RestClient.builder(), brevoApiKey, fromAddress, fromName);
    }

    EmailService(JavaMailSender javaMailSender, TemplateEngine templateEngine, RestClient.Builder restClientBuilder,
            String brevoApiKey, String fromAddress, String fromName) {
        this.javaMailSender = javaMailSender;
        this.templateEngine = templateEngine;
        this.restClient = restClientBuilder.build();
        this.brevoApiKey = brevoApiKey;
        this.fromAddress = fromAddress;
        this.fromName = fromName;

        if (usesBrevo() && fromAddress.isBlank()) {
            log.warn("BREVO_API_KEY is set but MAIL_FROM is empty: Brevo will reject the e-mails");
        }
    }

    /** monta o template e manda como html, em background */
    @Async
    public void sendEmailTemplate(String to, String subject, String template, Context context) {
        String html = templateEngine.process(template, context);
        try {
            if (usesBrevo()) {
                sendWithBrevo(to, subject, html);
            } else {
                sendWithSmtp(to, subject, html);
            }
        } catch (MessagingException | UnsupportedEncodingException | RuntimeException e) {
            log.error("Could not send the e-mail \"{}\"", subject, e);
        }
    }

    boolean usesBrevo() {
        return !brevoApiKey.isBlank();
    }

    private void sendWithBrevo(String to, String subject, String html) {
        Map<String, Object> body = Map.of(
                "sender", Map.of("name", fromName, "email", fromAddress),
                "to", List.of(Map.of("email", to)),
                "subject", subject,
                "htmlContent", html);

        restClient.post()
                .uri(BREVO_SEND_URL)
                .header("api-key", brevoApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .toBodilessEntity();
    }

    private void sendWithSmtp(String to, String subject, String html)
            throws MessagingException, UnsupportedEncodingException {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        if (!fromAddress.isBlank()) {
            helper.setFrom(fromAddress, fromName);
        }
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(html, true);
        javaMailSender.send(message);
    }
}
