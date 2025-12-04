package ru.ixlax.courseservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import ru.ixlax.courseservice.domain.Course;
import ru.ixlax.courseservice.repository.projection.AuthorAggregation;

import java.util.List;
import java.util.UUID;

public interface CourseRepository extends JpaRepository<Course, UUID>, JpaSpecificationExecutor<Course> {
    List<Course> getAllByPublishedTrue();
    List<Course> getAllByAuthorId(UUID authorId);
    boolean existsByIdAndAuthorId(UUID courseID, UUID authorId);

    @Query("""
            select c.authorId as authorId, count(c) as coursesCount
            from Course c
            where c.published = true
            group by c.authorId
            order by count(c) desc
            """)
    List<AuthorAggregation> findPublishedAuthors();
}
