package com.saasfinanceiro.finexp.ai;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.saasfinanceiro.finexp.exceptions.AiUnavailableException;
import com.saasfinanceiro.finexp.exceptions.TooManyRequestsException;

/**
 * Calls Google's Gemini API ({@code generateContent}) and returns the model's answer as text.
 * The answer is requested as JSON; callers parse and validate it.
 *
 * <p>Configured by {@code app.ai.gemini-api-key} (env GEMINI_API_KEY) and {@code app.ai.model}
 * (env GEMINI_MODEL). Without a key the AI features answer 503 and the rest of the app works normally.
 */
@Component
public class GeminiClient {

    private static final Logger log = LoggerFactory.getLogger(GeminiClient.class);
    static final String BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/";

    @JsonIgnoreProperties(ignoreUnknown = true)
    record GenerateResponse(List<Candidate> candidates) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Candidate(Content content) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Content(List<Part> parts) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Part(String text) {}

    private final RestClient restClient;
    private final String apiKey;
    private final String model;

    private final String baseUrl;

    @Autowired
    public GeminiClient(@Value("${app.ai.gemini-api-key:}") String apiKey,
            @Value("${app.ai.model:gemini-3.5-flash-lite}") String model,
            // Only changed to point at a local fake server in manual tests
            @Value("${app.ai.base-url:" + BASE_URL + "}") String baseUrl) {
        this(RestClient.builder().requestFactory(requestFactory()), apiKey, model, baseUrl);
    }

    GeminiClient(RestClient.Builder builder, String apiKey, String model) {
        this(builder, apiKey, model, BASE_URL);
    }

    private GeminiClient(RestClient.Builder builder, String apiKey, String model, String baseUrl) {
        this.restClient = builder.build();
        this.apiKey = apiKey;
        this.model = model;
        this.baseUrl = baseUrl;
    }

    public boolean isConfigured() {
        return !apiKey.isBlank();
    }

    /**
     * @param instructions fixed rules for the model (system instruction)
     * @param prompt       the request itself, with the user's data
     * @return the text of the answer (JSON, as requested)
     */
    public String generateJson(String instructions, String prompt) {
        if (!isConfigured()) {
            throw new AiUnavailableException("AI features are not configured on this server");
        }

        Map<String, Object> body = Map.of(
                "systemInstruction", Map.of("parts", List.of(Map.of("text", instructions))),
                "contents", List.of(Map.of("role", "user", "parts", List.of(Map.of("text", prompt)))),
                "generationConfig", Map.of("responseMimeType", "application/json", "temperature", 0.2));

        GenerateResponse response;
        try {
            response = restClient.post()
                    .uri(baseUrl + model + ":generateContent")
                    .header("x-goog-api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(GenerateResponse.class);
        } catch (HttpClientErrorException.TooManyRequests e) {
            throw new TooManyRequestsException("The AI usage limit was reached. Please try again in a minute.", 60);
        } catch (RestClientException e) {
            log.warn("Gemini request failed: {}", e.getMessage());
            throw new AiUnavailableException("The AI service is unavailable right now. Please try again later.");
        }

        String text = response == null || response.candidates() == null ? "" : response.candidates().stream()
                .map(Candidate::content)
                .filter(Objects::nonNull)
                .flatMap(content -> content.parts() == null ? java.util.stream.Stream.empty() : content.parts().stream())
                .map(Part::text)
                .filter(Objects::nonNull)
                .collect(Collectors.joining());

        if (text.isBlank()) {
            throw new AiUnavailableException("The AI service returned an empty answer. Please try again.");
        }
        return text;
    }

    private static JdkClientHttpRequestFactory requestFactory() {
        HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(httpClient);
        factory.setReadTimeout(Duration.ofSeconds(20));
        return factory;
    }
}
