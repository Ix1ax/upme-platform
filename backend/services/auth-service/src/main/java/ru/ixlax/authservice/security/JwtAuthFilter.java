package ru.ixlax.authservice.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import ru.ixlax.authservice.domain.User;
import ru.ixlax.authservice.repository.UserRepository;

import java.io.IOException;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    // Пути, которые пропускаем без проверки
    private static final String[] WHITELIST = {
            "/auth/", "/auth",
            "/v3/api-docs", "/v3/api-docs/",
            "/swagger-ui", "/swagger-ui/",
            "/swagger-ui.html",
            "/actuator", "/actuator/"
    };

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        for (String open : WHITELIST) {
            if (path.equals(open) || path.startsWith(open)) return true;
        }
        return false;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);
        try {
            var jwt = jwtService.parse(token);
            String sub = jwt.getSubject();
            String email = (String) jwt.getClaims().get("email");

            var user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                filterChain.doFilter(request, response);
                return;
            }

            var principal = new AuthenticatedUserPrincipal(user);
            var auth = new UsernamePasswordAuthenticationToken(
                    principal,
                    null,
                    principal.getAuthorities()
            );
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (Exception e) {

        }

        filterChain.doFilter(request, response);
    }

    public static class AuthenticatedUserPrincipal extends org.springframework.security.core.userdetails.User {
        private final User user;

        public AuthenticatedUserPrincipal(User user) {
            super(
                    user.getEmail(),
                    user.getPasswordHash(),
                    java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
            );
            this.user = user;
        }

        public User getUser() {
            return user;
        }
    }
}