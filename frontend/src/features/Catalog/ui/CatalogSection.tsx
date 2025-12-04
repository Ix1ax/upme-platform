// src/features/Catalog/ui/CatalogSection.tsx
import { observer } from "mobx-react-lite";
import {
    Group,
    Loader,
    Paper,
    SimpleGrid,
    Stack,
    Title,
    TextInput,
    Select,
    NumberInput,
} from "@mantine/core";
import styles from "./Catalog.module.css";
import { useStore } from "@/shared/hooks/UseStore";
import CourseCard from "@/features/Catalog/ui/CourseCard";
import { useEffect, useMemo, useState } from "react";

const CatalogSection = observer(() => {
    const catalogStore = useStore().catalog;
    const {
        courses,
        isLoading,
        getCourses,
        authors,
        isAuthorsLoading,
        loadAuthors,
    } = catalogStore;

    const [search, setSearch] = useState("");
    const [minRating, setMinRating] = useState<number | null>(null);
    const [teacherId, setTeacherId] = useState<string | null>(null);
    const [sortMode, setSortMode] = useState<
        "rating_desc" | "rating_asc" | "newest" | "oldest"
    >("rating_desc");

    // загружаем авторов один раз
    useEffect(() => {
        loadAuthors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // каждый раз при изменении фильтров — ходим на бэк
    useEffect(() => {
        getCourses({
            query: search.trim() || undefined,
            authorId: teacherId || undefined,
            minRating: minRating ?? undefined,
            sort: sortMode,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, teacherId, minRating, sortMode]);

    const teacherOptions = useMemo(
        () =>
            authors.map((a) => ({
                value: a.id,
                label: a.name || a.email,
            })),
        [authors],
    );

    return (
        <section className="section">
            <Group wrap="nowrap" align="start" className={styles.rel ?? ""}>
                <Paper
                    className={styles.filtersBlock ?? ""}
                    bg="#fff"
                    p={20}
                    radius="lg"
                >
                    <Stack gap={10}>
                        <Title order={3}>Фильтры</Title>

                        <TextInput
                            label="Поиск"
                            placeholder="Название или описание"
                            value={search}
                            onChange={(e) => setSearch(e.currentTarget.value)}
                        />

                        <NumberInput
                            label="Минимальный рейтинг"
                            min={0}
                            max={5}
                            step={0.5}
                            value={minRating}
                            onChange={(value) =>
                                setMinRating(
                                    typeof value === "number" ? value : null,
                                )
                            }
                        />

                        <Select
                            label="Преподаватель"
                            placeholder={
                                isAuthorsLoading ? "Загрузка..." : "Любой"
                            }
                            data={teacherOptions}
                            value={teacherId}
                            onChange={setTeacherId}
                            clearable
                            searchable
                        />

                        <Select
                            label="Сортировка"
                            value={sortMode}
                            onChange={(val) =>
                                setSortMode(
                                    (val as
                                        | "rating_desc"
                                        | "rating_asc"
                                        | "newest"
                                        | "oldest") || "rating_desc",
                                )
                            }
                            data={[
                                { value: "rating_desc", label: "Рейтинг ↓" },
                                { value: "rating_asc", label: "Рейтинг ↑" },
                                { value: "newest", label: "Сначала новые" },
                                { value: "oldest", label: "Сначала старые" },
                            ]}
                        />
                    </Stack>
                </Paper>

                <Stack w="100%" gap={10}>
                    {isLoading ? (
                        <Loader size="sm" />
                    ) : courses.length > 0 ? (
                        <SimpleGrid cols={4}>
                            {courses.map((course: any, index: number) => (
                                <CourseCard course={course} key={index} />
                            ))}
                        </SimpleGrid>
                    ) : (
                        <Paper bg="#fff" px={20} py={40} radius="lg">
                            <Title>Курсов не найдено</Title>
                        </Paper>
                    )}
                </Stack>
            </Group>
        </section>
    );
});

export default CatalogSection;
