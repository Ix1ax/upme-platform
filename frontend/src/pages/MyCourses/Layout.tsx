
import { Outlet, Link } from "react-router-dom";
import { Button, Group, Title } from "@mantine/core";

export default function MyCoursesLayout() {
    return (
        <section>
            <Group justify="space-between" mb="md">
                <Title order={2}>Мои курсы</Title>
                <Button component={Link} to="new">Создать курс</Button> {/* относительный путь */}
            </Group>
            {/* можно добавить табы, хлебные крошки и т.п. */}
            <Outlet />
        </section>
    );
}
