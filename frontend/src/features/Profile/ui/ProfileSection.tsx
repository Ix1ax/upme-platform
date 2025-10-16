import { observer } from "mobx-react-lite";
import {
    Avatar,
    Button,
    Group,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    Title,
    Modal,
    TextInput,
    Textarea,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { useState } from "react";
import styles from "./Profile.module.css";

type Profile = {
    id: string;
    name: string;
    description: string;
    avatarUrl: string;
    city: string;
    phone: string;
};

const ProfileSection = observer(() => {
    // Локальное состояние профиля (можешь заменить на данные из MobX-стора)
    const [profile, setProfile] = useState<Profile>({
        id: "123456",
        name: "Иван Иванов",
        description:
            "Разработчик Java/Spring. Люблю чистую архитектуру и красивый UI, иногда занимаюсь дизайном.",
        avatarUrl: "",
        city: "Тверь",
        phone: "+358 40 000 00 00",
    });

    // Открытие/закрытие модалки
    const [opened, { open, close }] = useDisclosure(false);

    // Форма Mantine
    const form = useForm<Profile>({
        initialValues: profile,
        validate: {
            name: (v) => (v.trim().length < 2 ? "Имя слишком короткое" : null),
            id: (v) => (v.trim().length === 0 ? "ID обязателен" : null),
            avatarUrl: (v) =>
                v && !/^https?:\/\/.+/i.test(v) ? "Введите корректный URL (http/https)" : null,
            phone: (v) =>
                v && v.replace(/[^\d+]/g, "").length < 7 ? "Телефон выглядит некорректно" : null,
        },
    });

    const handleEditClick = () => {
        // Перед открытием модалки синхронизируем значения формы c текущим профилем
        form.setValues(profile);
        open();
    };

    const handleSubmit = (values: Profile) => {
        setProfile(values);
        close();
    };

    return (
        <section className="section">
            <Group wrap="nowrap" align="start">
                <Paper className={styles.profileInfoBlock} bg="#fff" p={20} radius="lg">
                    <Stack gap={10}>
                        <Avatar src={profile.avatarUrl} size="xl" />
                        <Title order={3}>{profile.name}</Title>
                        <Text>ID: {profile.id}</Text>

                        <Paper className={styles.miniCard}>
                            <Text>{profile.description || "Без описания"} </Text>
                        </Paper>

                        <Paper className={styles.miniCard}>
                            <SimpleGrid cols={2}>
                                <Text>
                                    <b>Город</b>
                                </Text>
                                <Text>{profile.city || "—"}</Text>
                            </SimpleGrid>
                        </Paper>

                        <Paper className={styles.miniCard}>
                            <SimpleGrid cols={2}>
                                <Text>
                                    <b>Телефон</b>
                                </Text>
                                <Text>{profile.phone || "—"}</Text>
                            </SimpleGrid>
                        </Paper>

                        <Button variant="filled" mt={10} onClick={handleEditClick}>
                            Редактировать
                        </Button>
                    </Stack>
                </Paper>

                <Stack w="100%" gap={10}>
                    <Paper w="100%" bg="#fff" p={20} radius="lg">
                        <Stack gap={12}>
                            <Title order={3}>О себе</Title>
                            <Text>{profile.description}</Text>
                        </Stack>
                    </Paper>

                    <Paper w="100%" bg="#fff" p={20} radius="lg">
                        <Stack gap={12}>
                            <Title order={3}>Мои курсы</Title>
                            {/*<Text>*/}
                            {/*    Пишу backend на Java (Spring Boot, Security, Data). Люблю аккуратные интерфейсы и*/}
                            {/*    понятную структуру кода. Стремлюсь к продуманному UX и ясной архитектуре сервисов.*/}
                            {/*</Text>*/}
                        </Stack>
                    </Paper>
                </Stack>
            </Group>

            {/* Модалка редактирования */}
            <Modal
                opened={opened}
                onClose={close}
                title="Редактировать профиль"
                centered
                radius="lg"
                size="lg"
            >
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack gap="md">
                        <Group grow>
                            <TextInput
                                label="ID"
                                placeholder="Уникальный ID"
                                {...form.getInputProps("id")}
                            />
                            <TextInput
                                label="Имя"
                                placeholder="Ваше отображаемое имя"
                                {...form.getInputProps("name")}
                            />
                        </Group>

                        <TextInput
                            label="URL аватарки"
                            placeholder="https://..."
                            {...form.getInputProps("avatarUrl")}
                        />

                        <Group grow>
                            <TextInput
                                label="Город"
                                placeholder="Напр. Helsinki"
                                {...form.getInputProps("city")}
                            />
                            <TextInput
                                label="Телефон"
                                placeholder="+358 ..."
                                {...form.getInputProps("phone")}
                            />
                        </Group>

                        <Textarea
                            label="Био"
                            placeholder="Коротко о себе"
                            minRows={3}
                            autosize
                            {...form.getInputProps("description")}
                        />

                        <Group justify="flex-end" mt="xs">
                            <Button variant="default" onClick={close}>
                                Отменить
                            </Button>
                            <Button type="submit" variant="filled">
                                Сохранить
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </section>
    );
});

export default ProfileSection;
