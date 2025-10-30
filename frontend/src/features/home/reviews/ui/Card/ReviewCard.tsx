import {Avatar, Card, Group, Paper, Stack, Text, Title} from "@mantine/core";
import styles from "./Card.module.css";

interface CardProps {
    name: string;
    course: string;
    comment: string;
}


const ReviewCard = ({name, course, comment} : CardProps) => {
    return (
        <Card
            shadow="md"
            radius="xl"
            p="lg"
            withBorder
            className={styles.card ?? ''}
        >

            <Stack gap="md">
                <Group>
                    <Avatar
                        color="light"
                        radius="xl"
                    >
                        {name.toUpperCase().slice(0, 1)}
                    </Avatar>
                    <Stack gap={0}>
                        <Title order={4}>
                            {name}
                        </Title>
                        <Text>
                            {course}
                        </Text>
                    </Stack>
                </Group>

                <Paper className={styles.comment ?? ''} radius="lg" p={10}>
                    <Text>
                        {comment}
                    </Text>
                </Paper>
            </Stack>
        </Card>
    )
}

export default ReviewCard