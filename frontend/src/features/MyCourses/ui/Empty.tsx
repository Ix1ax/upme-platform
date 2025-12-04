import {useNavigate} from "react-router-dom";
import {Button, Center, Stack, Text} from "@mantine/core";
import {STATIC_LINKS} from "@/shared/constants/staticLinks";

const EmptyState = () => {
    const nav = useNavigate();
    return (
        <Center mih={220} p="xl">
            <Stack align="center" gap="sm">
                <Text c="dimmed">У вас пока нет курсов</Text>
                <Button onClick={() => nav(STATIC_LINKS.MY_COURSES_NEW)}>Добавить</Button>
            </Stack>
        </Center>
    );
};
export default EmptyState;