import {Card, Stack, ThemeIcon, Title, Text} from "@mantine/core";
import styles from './Card.module.css'
import type {ReactNode} from "react";

interface CardProps {
    title: string;
    description: string;
    icon: ReactNode
}

const ThemeCard = ({title, description, icon} : CardProps) => {
    return (
        <Card
            shadow="md"
            radius="xl"
            p="lg"
            withBorder
            className={styles.card ?? ''}
        >

            <Stack gap="md">
                <ThemeIcon
                    variant="light"
                    radius="lg"
                    size="xl"
                >
                    {icon}
                </ThemeIcon>

                <Title order={2}>
                    {title}
                </Title>
                <Text>
                    {description}
                </Text>
            </Stack>

        </Card>
    )
}

export default ThemeCard;