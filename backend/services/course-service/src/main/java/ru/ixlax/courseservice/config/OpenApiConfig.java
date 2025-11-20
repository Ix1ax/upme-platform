package ru.ixlax.courseservice.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import ru.ixlax.courseservice.web.SwaggerRoleTags;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI api() {
        final String bearer = "BearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("UPME Course Service API")
                        .version("v1")
                        .description("""
                                API сервиса курсов платформы UpMe. \
                                Включает CRUD курсов, управление уроками, процесс обучения студентов \
                                (запись на курс, прогресс по урокам) и проверку знаний через тесты. \
                                Все приватные ручки требуют JWT в заголовке Authorization (Bearer).\
                                """)
                        .contact(new Contact()
                                .name("UpMe Platform")
                                .email("support@upme.local")
                                .url("https://upme.local"))
                        .license(new License()
                                .name("Proprietary")
                                .url("https://upme.local/license")))
                .addServersItem(new Server()
                        .url("http://localhost:8083")
                        .description("Local course-service"))
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
                                .name(SwaggerRoleTags.PUBLIC)
                                .description("Публичные ручки каталога курсов, не требуют JWT"),
                        new Tag()
                                .name(SwaggerRoleTags.STUDENT)
                                .description("Доступно студентам/любым авторизованным пользователям для обучения"),
                        new Tag()
                                .name(SwaggerRoleTags.TEACHER_ADMIN)
                                .description("Управление курсами и тестами для авторов и админов")
                ));
    }
}
