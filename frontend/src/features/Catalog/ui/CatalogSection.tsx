import {observer} from "mobx-react-lite";
import {Group, Loader, Paper, SimpleGrid, Stack, Title} from "@mantine/core";
import styles from "./Catalog.module.css";
import {useStore} from "@/shared/hooks/UseStore";
import CourseCard from "@/features/Catalog/ui/CourseCard";
import {useEffect} from "react";

const CatalogSection = observer(() => {

    const {courses, isLoading, getCourses} = useStore().catalog;

    useEffect(() => {
        getCourses();
    }, []);

    return (
        <section className='section'>
            <Group wrap="nowrap" align="start" className={styles.rel ?? ''}>
                <Paper className={styles.filtersBlock ?? ''} bg="#fff" p={20} radius="lg">
                    <Stack gap={10}>
                        <Title>Фильтры</Title>
                    </Stack>
                </Paper>

                <Stack w="100%" gap={10}>
                    {
                        isLoading ? (
                            <Loader size="sm" />
                        ) : (
                            courses.length > 0 ? (
                                <SimpleGrid cols={4}>
                                    {
                                        courses.map((course, index) => (
                                            <CourseCard course={course} key={index} />
                                        ))
                                    }
                                </SimpleGrid>
                            ) : (
                                <Paper bg="#fff" px={20} py={40} radius="lg">
                                    <Title>
                                        Курсов не найдено
                                    </Title>
                                </Paper>
                            )
                        )
                    }
                </Stack>
            </Group>
        </section>
    )
})

export default CatalogSection;