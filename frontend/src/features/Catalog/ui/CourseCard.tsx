import {Badge, Button, Card, Group, Image, Text} from "@mantine/core";
import { useNavigate} from "react-router-dom";
import {STATIC_LINKS} from "@/shared/constants/staticLinks";

interface courseCardProps {
    course: {
        id: string,
        title: string,
        description: string,
        previewUrl: string,
        // structureUrl: string,
        // published: boolean,
        rating: number,
    };
}

const CourseCard = ({course} : courseCardProps) => {
    const nav = useNavigate();


    return (
        <Card>
            <Card.Section>
                <Image
                    fallbackSrc="/img/plug.avif"
                    src={course.previewUrl}
                />
            </Card.Section>
            <Group justify="space-between" mt="md" mb="xs">
                <Text fw={500}>{course.title}</Text>
                <Badge size="sm">{course.rating}</Badge>
            </Group>

            <Text size="sm" c="dimmed">
                {course.description}
            </Text>
            <Button onClick={() => nav(STATIC_LINKS.COURSE_BY_ID(course.id))} mt={15}>
                Просмотреть
            </Button>
        </Card>
    )
}

export default CourseCard;