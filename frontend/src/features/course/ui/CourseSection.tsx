import {observer} from "mobx-react-lite";
import {Button, Group, Image, Loader, Paper, Stack, Text, Title} from "@mantine/core";
// import styles from "./Course.module.css";
import CourseStore from "../model/store";
// import CourseCard from "@/features/Catalog/ui/CourseCard";
import {useEffect} from "react";
import {useNavigate, useParams} from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";


const CourseSection = observer(() => {

    const {course, isLoading, getCourse} = CourseStore;

    const {id} = useParams();

    const nav = useNavigate();

    useEffect(() => {
        if (id) {
            getCourse(id);
        }
    }, [id])

    if (isLoading) {
        return (
            <Group justify="center" align="center" style={{ minHeight: "60vh" }}>
                <Loader size="xl" />
            </Group>
        );
    }
    if (!course) {
        return (
            <Group justify="center" align="center" style={{ minHeight: "60vh" }}>
                <Paper bg="#fff" p={40} radius={15}>
                    <Title order={1}>Курс не найден</Title>
                </Paper>
            </Group>
        )
    }
    return (
        <section className='section'>
            <Button
                onClick={()=> nav(-1)}
                mb={20}
            >
                <IoChevronBack size={20} />
                Назад
            </Button>
            <Group>
                <Image
                    src={course.previewUrl}
                    alt='course'
                    fallbackSrc="/img/plug.avif"
                    maw={300}
                />
                <Stack>
                    <Title order={2}>
                        {course.title}
                    </Title>
                    <Text>
                        {course.description}
                    </Text>
                </Stack>
            </Group>
        </section>
    )
})

export default CourseSection;