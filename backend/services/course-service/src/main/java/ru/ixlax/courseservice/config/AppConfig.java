package ru.ixlax.courseservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

import javax.crypto.spec.SecretKeySpec;

@Configuration
public class AppConfig {

    @Bean
    public SecretKeySpec jwtHmacKey(@Value("${JWT_SECRET}") String secret) {
        return new SecretKeySpec(secret.getBytes(), "HmacSHA256");
    }

    @Bean
    public JwtDecoder jwtDecoder(SecretKeySpec hmacKey) {
        return NimbusJwtDecoder.withSecretKey(hmacKey).build();
    }

}
