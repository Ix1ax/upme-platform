package ru.ixlax.courseservice.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.ixlax.courseservice.domain.*;
import ru.ixlax.courseservice.exception.custom.*;
import ru.ixlax.courseservice.repository.*;
import ru.ixlax.courseservice.service.CourseTestService;
import ru.ixlax.courseservice.web.dto.*;

import java.util.*;

@Service
@RequiredArgsConstructor
public class CourseTestServiceImpl implements CourseTestService {

    private final CourseRepository courses;
    private final CourseTestRepository tests;
    private final EnrollmentRepository enrollments;
    private final TestAttemptRepository attempts;
    private final ObjectMapper mapper;

    @Override
    @Transactional
    public CourseTestResponse createOrUpdate(UUID courseId, UUID authorId, boolean isAdmin, CourseTestRequest request) {
        Course course = findCourse(courseId);
        ensureOwnerOrAdmin(course, authorId, isAdmin);

        ArrayNode normalized = normalizeQuestions(request.questions());
        Integer passingScore = resolvePassingScore(request.passingScore(), normalized.size());

        CourseTest test = tests.findByCourseId(courseId)
                .orElseGet(() -> CourseTest.builder()
                        .course(course)
                        .build());

        test.setCourse(course);
        test.setTitle(request.title().trim());
        test.setPassingScore(passingScore);
        test.setQuestionsJson(writeJson(normalized));

        CourseTest saved = tests.save(test);
        return new CourseTestResponse(
                saved.getId(),
                saved.getCourse().getId(),
                saved.getTitle(),
                normalized,
                saved.getPassingScore()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public CourseTestResponse getForManage(UUID courseId, UUID authorId, boolean isAdmin) {
        Course course = findCourse(courseId);
        ensureOwnerOrAdmin(course, authorId, isAdmin);

        CourseTest test = tests.findByCourseId(courseId)
                .orElseThrow(() -> new CourseTestNotFoundException("Тест для курса не найден"));

        JsonNode questions = readQuestions(test);
        return new CourseTestResponse(test.getId(), courseId, test.getTitle(), questions, test.getPassingScore());
    }

    @Override
    @Transactional(readOnly = true)
    public CourseTestContentResponse getForPassing(UUID courseId, UUID userId) {
        requireUser(userId);
        CourseTest test = tests.findByCourseId(courseId)
                .orElseThrow(() -> new CourseTestNotFoundException("Тест для курса не найден"));

        ensureEnrollmentExists(courseId, userId);

        JsonNode sanitized = sanitizeQuestions(readQuestions(test));
        return new CourseTestContentResponse(test.getId(), courseId, test.getTitle(), sanitized, test.getPassingScore());
    }

    @Override
    @Transactional
    public TestAttemptResponse submit(UUID courseId, UUID userId, TestSubmissionRequest submission) {
        requireUser(userId);
        CourseTest test = tests.findByCourseId(courseId)
                .orElseThrow(() -> new CourseTestNotFoundException("Тест для курса не найден"));

        Enrollment enrollment = ensureEnrollmentExists(courseId, userId);

        JsonNode questions = readQuestions(test);
        Map<String, Set<String>> correctAnswers = extractCorrectAnswers(questions);
        Map<String, List<String>> answers = submission.answers() == null
                ? Map.of()
                : submission.answers();

        int totalQuestions = correctAnswers.size();
        int correctCount = 0;

        for (Map.Entry<String, Set<String>> entry : correctAnswers.entrySet()) {
            List<String> provided = answers.get(entry.getKey());
            Set<String> userAnswer = provided == null ? Collections.emptySet() : new HashSet<>(provided);
            if (userAnswer.equals(entry.getValue())) {
                correctCount++;
            }
        }

        int passingScore = resolvePassingScore(test.getPassingScore(), totalQuestions);
        boolean passed = correctCount >= passingScore;

        TestAttempt attempt = TestAttempt.builder()
                .test(test)
                .userId(enrollment.getUserId())
                .correctAnswers(correctCount)
                .totalQuestions(totalQuestions)
                .passed(passed)
                .answersJson(writeJson(answers))
                .build();

        TestAttempt saved = attempts.save(attempt);
        return TestAttemptResponse.from(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public TestAttemptResponse getLatestAttempt(UUID courseId, UUID userId) {
        requireUser(userId);
        CourseTest test = tests.findByCourseId(courseId)
                .orElseThrow(() -> new CourseTestNotFoundException("Тест для курса не найден"));
        ensureEnrollmentExists(courseId, userId);

        return attempts.findTopByTestIdAndUserIdOrderByCreatedAtDesc(test.getId(), userId)
                .map(TestAttemptResponse::from)
                .orElseThrow(() -> new TestAttemptNotFoundException("Попыток прохождения пока не было"));
    }

    private Course findCourse(UUID id) {
        return courses.findById(id)
                .orElseThrow(() -> new CourseNotFoundException(id.toString()));
    }

    private void ensureOwnerOrAdmin(Course course, UUID authorId, boolean isAdmin) {
        if (isAdmin) {
            return;
        }
        if (course.getAuthorId() == null || authorId == null || !course.getAuthorId().equals(authorId)) {
            throw new CourseAccessDeniedException(course.getId().toString());
        }
    }

    private ArrayNode normalizeQuestions(JsonNode rawQuestions) {
        if (rawQuestions == null || !rawQuestions.isArray()) {
            throw new IllegalArgumentException("Ожидался массив вопросов");
        }

        ArrayNode normalized = mapper.createArrayNode();
        Set<String> questionIds = new HashSet<>();

        rawQuestions.forEach(node -> {
            String id = node.path("id").asText("").trim();
            if (id.isEmpty()) {
                throw new IllegalArgumentException("Каждый вопрос должен иметь идентификатор");
            }
            if (!questionIds.add(id)) {
                throw new IllegalArgumentException("Идентификатор вопроса " + id + " повторяется");
            }

            ArrayNode options = mapper.createArrayNode();
            Set<String> optionIds = new HashSet<>();
            JsonNode originalOptions = node.path("options");
            if (!originalOptions.isArray() || originalOptions.isEmpty()) {
                throw new IllegalArgumentException("У вопроса " + id + " должен быть хотя бы один вариант ответа");
            }

            int correctCount = 0;
            for (JsonNode optionNode : originalOptions) {
                String optionKey = optionNode.path("key").asText("").trim();
                if (optionKey.isEmpty()) {
                    throw new IllegalArgumentException("Варианты ответа должны содержать ключ");
                }
                if (!optionIds.add(optionKey)) {
                    throw new IllegalArgumentException("Ключ варианта ответа " + optionKey + " повторяется в вопросе " + id);
                }

                ObjectNode normalizedOption = mapper.createObjectNode();
                normalizedOption.put("key", optionKey);
                normalizedOption.put("label", optionNode.path("label").asText(""));
                boolean correct = optionNode.path("correct").asBoolean(false);
                normalizedOption.put("correct", correct);
                if (correct) {
                    correctCount++;
                }
                options.add(normalizedOption);
            }

            if (correctCount == 0) {
                throw new IllegalArgumentException("У вопроса " + id + " должен быть хотя бы один правильный ответ");
            }

            ObjectNode normalizedQuestion = mapper.createObjectNode();
            normalizedQuestion.put("id", id);
            normalizedQuestion.put("title", node.path("title").asText(""));
            boolean multiple = node.path("multiple").isMissingNode()
                    ? correctCount > 1
                    : node.path("multiple").asBoolean(correctCount > 1);
            normalizedQuestion.put("multiple", multiple);
            normalizedQuestion.set("options", options);
            normalized.add(normalizedQuestion);
        });

        return normalized;
    }

    private JsonNode sanitizeQuestions(JsonNode original) {
        ArrayNode sanitized = mapper.createArrayNode();
        original.forEach(node -> {
            ObjectNode sanitizedQuestion = mapper.createObjectNode();
            sanitizedQuestion.put("id", node.path("id").asText());
            sanitizedQuestion.put("title", node.path("title").asText());
            sanitizedQuestion.put("multiple", node.path("multiple").asBoolean(false));

            ArrayNode sanitizedOptions = mapper.createArrayNode();
            node.path("options").forEach(opt -> {
                ObjectNode optNode = mapper.createObjectNode();
                optNode.put("key", opt.path("key").asText());
                optNode.put("label", opt.path("label").asText());
                sanitizedOptions.add(optNode);
            });
            sanitizedQuestion.set("options", sanitizedOptions);
            sanitized.add(sanitizedQuestion);
        });
        return sanitized;
    }

    private Map<String, Set<String>> extractCorrectAnswers(JsonNode questions) {
        Map<String, Set<String>> result = new HashMap<>();
        questions.forEach(node -> {
            String questionId = node.path("id").asText();
            Set<String> correct = new HashSet<>();
            node.path("options").forEach(opt -> {
                if (opt.path("correct").asBoolean(false)) {
                    correct.add(opt.path("key").asText());
                }
            });
            result.put(questionId, correct);
        });
        return result;
    }

    private JsonNode readQuestions(CourseTest test) {
        try {
            return mapper.readTree(test.getQuestionsJson());
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Не удалось прочитать структуру теста", e);
        }
    }

    private String writeJson(Object value) {
        try {
            return mapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Не удалось сохранить структуру теста", e);
        }
    }

    private Enrollment ensureEnrollmentExists(UUID courseId, UUID userId) {
        return enrollments.findByCourseIdAndUserId(courseId, userId)
                .orElseThrow(() -> new EnrollmentNotFoundException("Сначала запишитесь на курс"));
    }

    private void requireUser(UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("Требуется авторизация");
        }
    }

    private Integer resolvePassingScore(Integer provided, int totalQuestions) {
        int fallback = totalQuestions == 0 ? 0 : totalQuestions;
        if (provided == null) {
            return fallback;
        }
        if (provided < 0) {
            return 0;
        }
        return Math.min(provided, fallback);
    }
}
