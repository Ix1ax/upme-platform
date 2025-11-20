package ru.ixlax.courseservice.service;

import ru.ixlax.courseservice.web.dto.*;

import java.util.UUID;

public interface CourseTestService {
    CourseTestResponse createOrUpdate(UUID courseId, UUID authorId, boolean isAdmin, CourseTestRequest request);
    CourseTestResponse getForManage(UUID courseId, UUID authorId, boolean isAdmin);
    CourseTestContentResponse getForPassing(UUID courseId, UUID userId);
    TestAttemptResponse submit(UUID courseId, UUID userId, TestSubmissionRequest submission);
    TestAttemptResponse getLatestAttempt(UUID courseId, UUID userId);
}
