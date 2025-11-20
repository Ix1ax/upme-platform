package ru.ixlax.profileservice.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import ru.ixlax.profileservice.web.SwaggerRoleTags;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI api() {
        final String bearer = "BearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("UPME Profile Service API")
                        .version("v1")
                        .description("Профиль/Редакторирование"))
                .addSecurityItem(new SecurityRequirement().addList(bearer))
                .components(new Components().addSecuritySchemes(
                        bearer,
                        new SecurityScheme()
                                .name(bearer)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                ))
                .tags(List.of(
                        new Tag()
                                .name(SwaggerRoleTags.AUTHENTICATED)
                                .description("Любой авторизованный пользователь (STUDENT/TEACHER/ADMIN)")
                ));
    }
}
