package com.saasfinanceiro.finexp.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

class EmailServiceTest {

    private JavaMailSender javaMailSender;
    private TemplateEngine templateEngine;
    private RestClient.Builder restClientBuilder;
    private MockRestServiceServer brevo;

    @BeforeEach
    void setUp() {
        javaMailSender = mock(JavaMailSender.class);
        templateEngine = mock(TemplateEngine.class);
        when(templateEngine.process(eq("newUser"), any(Context.class))).thenReturn("<p>Welcome</p>");

        restClientBuilder = RestClient.builder();
        brevo = MockRestServiceServer.bindTo(restClientBuilder).build();
    }

    @Test
    void sendsThroughBrevoWhenTheApiKeyIsSet() {
        brevo.expect(requestTo(EmailService.BREVO_SEND_URL))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("api-key", "test-key"))
                .andExpect(jsonPath("$.sender.email").value("no-reply@finexp.test"))
                .andExpect(jsonPath("$.sender.name").value("FinEXP"))
                .andExpect(jsonPath("$.to[0].email").value("ana@example.com"))
                .andExpect(jsonPath("$.subject").value("Verify your account"))
                .andExpect(jsonPath("$.htmlContent").value("<p>Welcome</p>"))
                .andRespond(withStatus(HttpStatus.CREATED));

        EmailService service = service("test-key");
        assertTrue(service.usesBrevo());

        service.sendEmailTemplate("ana@example.com", "Verify your account", "newUser", new Context());

        brevo.verify();
        verify(javaMailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    void aBrevoFailureIsLoggedInsteadOfThrown() {
        brevo.expect(requestTo(EmailService.BREVO_SEND_URL)).andRespond(withServerError());

        service("test-key").sendEmailTemplate("ana@example.com", "Verify your account", "newUser", new Context());

        brevo.verify();
    }

    @Test
    void sendsThroughSmtpWithoutApiKey() {
        when(javaMailSender.createMimeMessage()).thenReturn(new MimeMessage((Session) null));

        EmailService service = service("");
        assertFalse(service.usesBrevo());

        service.sendEmailTemplate("ana@example.com", "Verify your account", "newUser", new Context());

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    private EmailService service(String apiKey) {
        return new EmailService(javaMailSender, templateEngine, restClientBuilder, apiKey,
                "no-reply@finexp.test", "FinEXP");
    }
}
