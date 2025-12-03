package ru.ixlax.courseservice.repository.specification;

import org.springframework.data.jpa.domain.Specification;
import ru.ixlax.courseservice.domain.Course;

import java.util.UUID;

public final class CourseSpecifications {

    private CourseSpecifications() {
    }

    public static Specification<Course> published() {
        return (root, query, cb) -> cb.isTrue(root.get("published"));
    }

    public static Specification<Course> titleOrDescriptionContains(String text) {
        String pattern = "%" + text.toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("title")), pattern),
                cb.like(cb.lower(root.get("description")), pattern)
        );
    }

    public static Specification<Course> authorEquals(UUID authorId) {
        return (root, query, cb) -> cb.equal(root.get("authorId"), authorId);
    }

    public static Specification<Course> ratingGte(Double rating) {
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("rating"), rating);
    }
}
