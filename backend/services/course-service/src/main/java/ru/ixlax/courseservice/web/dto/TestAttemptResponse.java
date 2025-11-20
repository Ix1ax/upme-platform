package ru.ixlax.courseservice.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import ru.ixlax.courseservice.domain.TestAttempt;

import java.time.OffsetDateTime;
import java.util.UUID;

@Schema(description = "Результат попытки прохождения теста")
public record TestAttemptResponse(
        @Schema(description = "ID попытки") UUID attemptId,
        @Schema(description = "ID теста") UUID testId,
        @Schema(description = "ID курса") UUID courseId,
        @Schema(description = "ID пользователя") UUID userId,
        @Schema(description = "Количество правильных ответов") int correctAnswers,
        @Schema(description = "Количество вопросов в тесте") int totalQuestions,
        @Schema(description = "Прошел ли тест по порогу") boolean passed,
        @Schema(description = "Процент правильных ответов") int scorePercent,
        @Schema(description = "Дата и время попытки") OffsetDateTime createdAt
) {
    public static TestAttemptResponse from(TestAttempt attempt) {
        int total = attempt.getTotalQuestions() == null ? 0 : attempt.getTotalQuestions();
        int correct = attempt.getCorrectAnswers() == null ? 0 : attempt.getCorrectAnswers();
        int percent = total == 0 ? 0 : (int) Math.round((double) correct * 100 / total);

        return new TestAttemptResponse(
                attempt.getId(),
                attempt.getTest().getId(),
                attempt.getTest().getCourse().getId(),
                attempt.getUserId(),
                correct,
                total,
                attempt.isPassed(),
                percent,
                attempt.getCreatedAt()
        );
    }
}
