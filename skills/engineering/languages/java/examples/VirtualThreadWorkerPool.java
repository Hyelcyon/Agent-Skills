package com.enterprise.examples;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class VirtualThreadWorkerPool {
    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    public List<String> fetchEndpointsConcurrently(List<String> urls) {
        List<Future<String>> futures;
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            futures = urls.stream()
                    .map(url -> executor.submit(() -> fetchSingleUrl(url)))
                    .toList();
        }

        // Future.resultNow() is valid only after executor.close() finishes awaiting all tasks.
        return futures.stream()
                .map(Future::resultNow)
                .toList();
    }

    private String fetchSingleUrl(String url) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(3))
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            return response.body();
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            return "ERROR: Request interrupted";
        } catch (Exception ex) {
            return "ERROR: " + ex.getMessage();
        }
    }
}
