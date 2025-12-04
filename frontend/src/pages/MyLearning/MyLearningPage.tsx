import MainLayout from "@/layouts/main/MainLayout";
import { Container } from "@mantine/core";
import MyLearningSection from "@/features/course/ui/MyLearningSection";

export default function MyLearningPage() {
    return (
        <MainLayout>
            <Container py="lg">
                <MyLearningSection />
            </Container>
        </MainLayout>
    );
}
