// Виджет страница курса: просто обёртка над CoursePlayer
// с контейнером и отступами.

import { Container } from "@mantine/core";
import CoursePlayer from "@/features/course/ui/CoursePlayer";

const CourseWidget = () => {
    return (
        <Container py="xl">
            <CoursePlayer />
        </Container>
    );
};

export default CourseWidget;
