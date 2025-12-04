import { observer } from "mobx-react-lite";
import MyCoursesStore from "../model/store";
import {
    Button,
    Grid, Group,
    Paper,
    Title
} from "@mantine/core";
import CourseCard from "@/features/MyCourses/ui/courseCard";
import SkeletonCard from "@/features/MyCourses/ui/SkeletonCard";
import EmptyState from "@/features/MyCourses/ui/Empty";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { STATIC_LINKS } from "@/shared/constants/staticLinks";

const MyCoursesSection = observer(() => {
    const { courses, isLoading, getCourses } = MyCoursesStore;

    const nav = useNavigate();

    useEffect(() => {
        getCourses().then(() => {
            console.log("Загруженные курсы:", MyCoursesStore.courses);
        });
    }, []);

    return (
        <section>
            <Group justify="space-between">
                <Title order={2} mb="md">Мои курсы</Title>
                <Button  onClick={() => nav(STATIC_LINKS.MY_COURSES_NEW)}>
                    + Новый курс
                </Button>
            </Group>
            <Paper p="md" radius="lg" withBorder bg="#fff">
                {isLoading ? (
                    <Grid gutter="md">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4 }}>
                                <SkeletonCard />
                            </Grid.Col>
                        ))}
                    </Grid>
                ) : courses.length === 0 ? (
                    <EmptyState />
                ) : (
                    <Grid gutter="md">
                        {courses.map((c) => (
                            <Grid.Col key={c.id} span={{ base: 12, sm: 6, md: 4 }}>
                                <CourseCard
                                    id={c.id}
                                    title={c.title}
                                    description={c.description}
                                    previewUrl={c.previewUrl}
                                    published={Boolean(c.published)}
                                    rating={Number(c.rating) || 0}
                                    structureUrl={c.structureUrl}
                                />
                            </Grid.Col>
                        ))}
                    </Grid>
                )}
            </Paper>
        </section>
    );
});

export default MyCoursesSection;
