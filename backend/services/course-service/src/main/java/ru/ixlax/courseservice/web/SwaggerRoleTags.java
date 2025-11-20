package ru.ixlax.courseservice.web;

/**
 * Набор человекочитаемых тегов, которые используются в Swagger,
 * чтобы быстро отфильтровывать ручки по ролям.
 */
public final class SwaggerRoleTags {
    public static final String PUBLIC = "Role · Public";
    public static final String STUDENT = "Role · Student";
    public static final String AUTHENTICATED = "Role · Authenticated";
    public static final String TEACHER_ADMIN = "Role · Teacher/Admin";

    private SwaggerRoleTags() {
    }
}
