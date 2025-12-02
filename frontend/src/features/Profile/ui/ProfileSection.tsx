import { observer } from "mobx-react-lite";
import {
    Avatar,
    Badge,
    Button,
    FileInput,
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
import styles from "./Profile.module.css";
import { useStore } from "@/shared/hooks/UseStore";
import { STATIC_LINKS } from "@/shared/constants/staticLinks";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import ProfileService, {
    type ProfileResponse,
} from "@/features/Profile/api/ProfileService";

/**
 * Значения формы редактирования профиля.
 * Это фронтовое отображение, которое потом мапим на payload API.
 */
type ProfileFormValues = {
    name: string;        // displayName
    description: string; // bio
    avatarUrl: string;   // сейчас только для отображения, бэк не принимает URL при updateProfile
    city: string;
    phone: string;
};

const ProfileSection = observer(() => {
    const authStore = useStore().auth;
    const { user } = authStore;
    const nav = useNavigate();

    // Открытие/закрытие модалки редактирования
    const [opened, { open, close }] = useDisclosure(false);

    // Файл аватара, который выбрал пользователь (но ещё не отправил)
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    // Флаг отправки формы (чтобы показать лоадер на кнопке "Сохранить")
    const [saving, setSaving] = useState(false);

    // Инициализируем форму — реальные значения подставим в useEffect,
    // когда user загрузится.
    const form = useForm<ProfileFormValues>({
        initialValues: {
            name: "",
            description: "",
            avatarUrl: "",
            city: "",
            phone: "",
        },
        validate: {
            name: (v) => (v.trim().length < 2 ? "Имя слишком короткое" : null),
            avatarUrl: (v) =>
                v && !/^https?:\/\/.+/i.test(v)
                    ? "Введите корректный URL (http/https)"
                    : null,
            phone: (v) =>
                v && v.replace(/[^\d+]/g, "").length < 7
                    ? "Телефон выглядит некорректно"
                    : null,
        },
    });

// Когда профиль загрузился и открылась модалка — заполняем форму.
// Пока модалка открыта и ты что-то печатаешь, эффект больше не трогает значения.
    useEffect(() => {
        if (!opened || !user) return;

        form.setValues({
            name: user.displayName ?? "",
            description: user.bio ?? "",
            avatarUrl: user.avatarUrl ?? "",
            city: user.city ?? "",
            phone: user.phone ?? "",
        });

        setAvatarFile(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opened, user?.id]); // 👈 важное изменение: NЕТ user целиком и NЕТ form


    // Роль пользователя (для отображения бейджа и логики блоков)
    const role = user?.role ?? null;

    const roleLabel = useMemo(() => {
        switch (role) {
            case "ADMIN":
                return "Администратор";
            case "TEACHER":
                return "Преподаватель";
            case "STUDENT":
                return "Студент";
            default:
                return "Пользователь";
        }
    }, [role]);

    const isTeacherOrAdmin = role === "TEACHER" || role === "ADMIN";

    // Открыть модалку редактирования
    const handleEditClick = () => {
        open();
    };

    // Выход из аккаунта
    const handleLogout = async () => {
        await authStore.logout();
        nav(STATIC_LINKS.HOME);
    };

    /**
     * Сабмит формы:
     * 1) отправляем JSON с displayName/bio/city/phone;
     * 2) если выбран файл аватара — отправляем его отдельным запросом;
     * 3) последний полученный профиль кладём в AuthStore (setUserFromProfile).
     */
    const handleSubmit = async (values: ProfileFormValues) => {
        if (!authStore) return;

        setSaving(true);
        try {
            let lastProfile: ProfileResponse | null = null;

            // 1. Обновляем текстовые поля профиля
            const jsonPayload = {
                displayName: values.name.trim() || undefined,
                bio: values.description.trim() || undefined,
                city: values.city.trim() || undefined,
                phone: values.phone.trim() || undefined,
            };

            const resProfile = await ProfileService.updateProfile(jsonPayload);
            lastProfile = resProfile.data;

            // 2. Если пользователь выбрал новый аватар — отправляем файл
            if (avatarFile) {
                const resAvatar = await ProfileService.updateAvatar(avatarFile);
                lastProfile = resAvatar.data;
            }

            // 3. Обновляем стор авторизации, чтобы Header и Profile сразу
            //    показали актуальные данные.
            if (lastProfile) {
                authStore.setUserFromProfile(lastProfile);
            }

            close();
        } catch (e) {
            console.error("Ошибка обновления профиля", e);
            // TODO: можно добавить нотификацию Mantine
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="section">
            <Group wrap="nowrap" align="flex-start">
                {/* ЛЕВАЯ КОЛОНКА: основная информация о пользователе */}
                <Paper
                    className={styles.profileInfoBlock ?? ""}
                    bg="#fff"
                    p={20}
                    radius="lg"
                >
                    <Stack gap={10}>
                        {/* Аватар. Сейчас картинка берётся по URL,
               после updateAvatar бэк отдаёт новый avatarUrl. */}
                        <Avatar
                            src={user?.avatarUrl ?? ""}
                            size="xl"
                            radius="xl"
                        />

                        {/* Имя пользователя + роль */}
                        <Group gap={8}>
                            <Title order={3}>{user?.displayName ?? "Пользователь"}</Title>
                            <Badge
                                size="sm"
                                variant="light"
                                color={
                                    role === "ADMIN"
                                        ? "red"
                                        : role === "TEACHER"
                                            ? "blue"
                                            : "green"
                                }
                            >
                                {roleLabel}
                            </Badge>
                        </Group>

                        {/* Краткое описание (bio) в мини-карточке */}
                        <Paper className={styles.miniCard ?? ""}>
                            <Text>
                                {user?.bio && user.bio.trim().length > 0
                                    ? user.bio
                                    : "Без описания"}
                            </Text>
                        </Paper>

                        {/* Город */}
                        <Paper className={styles.miniCard ?? ""}>
                            <SimpleGrid cols={2}>
                                <Text fw={500}>Город</Text>
                                <Text>{user?.city || "—"}</Text>
                            </SimpleGrid>
                        </Paper>

                        {/* Телефон */}
                        <Paper className={styles.miniCard ?? ""}>
                            <SimpleGrid cols={2}>
                                <Text fw={500}>Телефон</Text>
                                <Text>{user?.phone || "—"}</Text>
                            </SimpleGrid>
                        </Paper>

                        {/* Кнопки действий */}
                        <Button variant="filled" mt={10} onClick={handleEditClick}>
                            Редактировать
                        </Button>
                        <Button
                            variant="outline"
                            color="red"
                            mt={6}
                            onClick={handleLogout}
                        >
                            Выйти
                        </Button>
                    </Stack>
                </Paper>

                {/* ПРАВАЯ КОЛОНКА: расширенная информация и блоки платформы */}
                <Stack w="100%" gap={10}>
                    {/* Блок "О себе" */}
                    <Paper w="100%" bg="#fff" p={20} radius="lg">
                        <Stack gap={12}>
                            <Title order={3}>О себе</Title>
                            <Text>
                                {user?.bio && user.bio.trim().length > 0
                                    ? user.bio
                                    : "Вы ещё не рассказали о себе. Нажмите «Редактировать», чтобы добавить информацию."}
                            </Text>
                        </Stack>
                    </Paper>

                    {/* Блок "Мои курсы" / "Моё обучение" в зависимости от роли */}
                    <Paper w="100%" bg="#fff" p={20} radius="lg">
                        <Group gap={12} justify="space-between" align="center">
                            <Stack gap={4}>
                                <Title order={3}>
                                    {isTeacherOrAdmin ? "Мои курсы" : "Моё обучение"}
                                </Title>
                                <Text size="sm" c="dimmed">
                                    {isTeacherOrAdmin
                                        ? "Управляйте своими образовательными программами, обновляйте материалы и следите за прогрессом студентов."
                                        : "Записывайтесь на курсы, проходите уроки и отслеживайте свой прогресс."}
                                </Text>
                            </Stack>

                            {isTeacherOrAdmin ? (
                                <Group gap={8}>
                                    <Link to={STATIC_LINKS.MY_COURSES}>
                                        <Button variant="light">Управлять курсами</Button>
                                    </Link>
                                    <Link to={STATIC_LINKS.MY_COURSES_NEW}>
                                        <Button variant="outline">
                                            <Text size="xl">+</Text>
                                        </Button>
                                    </Link>
                                </Group>
                            ) : (
                                <Link to={STATIC_LINKS.CATALOG}>
                                    <Button variant="light">Перейти в каталог курсов</Button>
                                </Link>
                            )}
                        </Group>
                    </Paper>
                </Stack>
            </Group>

            {/* Модалка редактирования профиля */}
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
                                label="Имя"
                                placeholder="Ваше отображаемое имя"
                                {...form.getInputProps("name")}
                            />
                            <TextInput
                                label="Телефон"
                                placeholder="+7 (999) 999-99-99"
                                {...form.getInputProps("phone")}
                            />
                        </Group>

                        <Group grow>
                            <TextInput
                                label="Город"
                                placeholder="Тверь"
                                {...form.getInputProps("city")}
                            />
                        </Group>

                        <Textarea
                            label="Био"
                            placeholder="Коротко о себе"
                            minRows={3}
                            autosize
                            {...form.getInputProps("description")}
                        />

                        {/* Выбор нового аватара (опционально) */}
                        <FileInput
                            label="Аватар"
                            placeholder="Выберите файл"
                            accept="image/*"
                            value={avatarFile}
                            onChange={setAvatarFile}
                            clearable
                        />

                        <Group justify="flex-end" mt="xs">
                            <Button variant="default" onClick={close}>
                                Отменить
                            </Button>
                            <Button type="submit" variant="filled" loading={saving}>
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
