package ru.ixlax.authservice.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;
import ru.ixlax.authservice.domain.User;

import java.time.Instant;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final JwtEncoder encoder;
    private final JwtDecoder decoder;

    @Value("${jwt.issuer:upme-auth}")
    private String issuer;

    @Value("${jwt.access-ttl-seconds:900}")
    private long accessTtlSeconds;

    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(accessTtlSeconds);

        var claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .issuedAt(now)
                .expiresAt(exp)
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("name", user.getName())
                .claim("role", user.getRole().name())
                .build();

        var header = JwsHeader.with(MacAlgorithm.HS256).build(); // ВАЖНО

        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

    public Jwt parse(String token) throws JwtException {
        return decoder.decode(token);
    }

    public boolean isValid(String token) {
        try {
            decoder.decode(token);
            return true;
        } catch (JwtException ex) {
            return false;
        }
    }

    public Map<String, Object> getClaims(String token) {
        Jwt jwt = decoder.decode(token);
        return jwt.getClaims();
    }
}
