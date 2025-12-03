// pages/Course/CoursePage.tsx
//
// Обёртка над CourseLearningSection с общим MainLayout

import MainLayout from "@/layouts/main/MainLayout";
import { Container } from "@mantine/core";
import CourseLearningSection from "@/features/course/ui/CourseLearningSection";

export default function CoursePage() {
    return (
        <MainLayout>
            <Container py="lg">
                <CourseLearningSection />
            </Container>
        </MainLayout>
    );
}
