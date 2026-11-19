package com.saasfinanceiro.finexp.ai;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import com.saasfinanceiro.finexp.exceptions.AiUnavailableException;
import com.saasfinanceiro.finexp.exceptions.TooManyRequestsException;

class GeminiClientTest {

    private static final String URL = GeminiClient.BASE_URL + "test-model:generateContent";

    private RestClient.Builder builder;
    private MockRestServiceServer server;

    @BeforeEach
    void setUp() {
        builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
    }

    @Test
    void sendsThePromptAndReturnsTheAnswerText() {
        server.expect(requestTo(URL))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("x-goog-api-key", "test-key"))
                .andExpect(jsonPath("$.systemInstruction.parts[0].text").value("rules"))
                .andExpect(jsonPath("$.contents[0].parts[0].text").value("question"))
                .andExpect(jsonPath("$.generationConfig.responseMimeType").value("application/json"))
                .andRespond(withSuccess("""
                        {"candidates":[{"content":{"parts":[{"text":"{\\"categoryId\\":"},{"text":" 3}"}]},
                          "finishReason":"STOP"}],"usageMetadata":{"totalTokenCount":42}}
                        """, MediaType.APPLICATION_JSON));

        String answer = client("test-key").generateJson("rules", "question");

        assertEquals("{\"categoryId\": 3}", answer);
        server.verify();
    }

    @Test
    void sendsTheResponseSchemaWhenGiven() {
        server.expect(requestTo(URL))
                .andExpect(jsonPath("$.generationConfig.responseSchema.type").value("OBJECT"))
                .andExpect(jsonPath("$.generationConfig.responseSchema.required[0]").value("summary"))
                .andRespond(withSuccess("""
                        {"candidates":[{"content":{"parts":[{"text":"{\\"summary\\": \\"ok\\"}"}]}}]}
                        """, MediaType.APPLICATION_JSON));

        String answer = client("test-key").generateJson("rules", "question", AiService.INSIGHTS_SCHEMA);

        assertEquals("{\"summary\": \"ok\"}", answer);
        server.verify();
    }

    @Test
    void withoutKeyTheFeatureIsUnavailable() {
        GeminiClient client = client("");

        assertFalse(client.isConfigured());
        assertThrows(AiUnavailableException.class, () -> client.generateJson("rules", "question"));
    }

    @Test
    void quotaExceededBecomes429() {
        server.expect(requestTo(URL)).andRespond(withStatus(HttpStatus.TOO_MANY_REQUESTS));

        assertThrows(TooManyRequestsException.class, () -> client("test-key").generateJson("rules", "question"));
    }

    @Test
    void providerErrorsBecome503() {
        server.expect(requestTo(URL)).andRespond(withServerError());

        assertThrows(AiUnavailableException.class, () -> client("test-key").generateJson("rules", "question"));
    }

    @Test
    void anEmptyAnswerIsAnError() {
        server.expect(requestTo(URL)).andRespond(withSuccess("{\"candidates\":[]}", MediaType.APPLICATION_JSON));

        assertThrows(AiUnavailableException.class, () -> client("test-key").generateJson("rules", "question"));
    }

    private GeminiClient client(String key) {
        return new GeminiClient(builder, key, "test-model");
    }
}
