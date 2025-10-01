package ru.ixlax.authservice.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Простой health-check, чтобы проверить проксирование через gateway.
 * GET /auth/health -> "OK"
 */
@RestController
@RequestMapping("/auth")
public class AuthController {
    @GetMapping("/health")
    public String health() {
        return "OK";
    }
}
