package ru.ixlax.profileservice.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class JwtService {

    private final JwtDecoder jwtDecoder;

    public Jwt parse(String token) throws JwtException {
        return jwtDecoder.decode(token);
    }

}
