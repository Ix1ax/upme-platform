import {
    AppShell,
    Autocomplete,
    Badge,
    Container,
    Group,
    Image,
    Loader,
    Text,
} from "@mantine/core";
import { Link, NavLink } from "react-router-dom";
import { STATIC_LINKS } from "@/shared/constants/staticLinks";
import { observer } from "mobx-react-lite";
import { CiSearch } from "react-icons/ci";
import { useStore } from "@/shared/hooks/UseStore";
import { useEffect } from "react";
import styles from "./header.module.css";

/**
 * Шапка приложения.
 *
 * Здесь:
 * - проверяем авторизацию при первом рендере;
 * - показываем навигацию по ролям (Teacher/Admin vs Student/гость);
 * - справа показываем поиск и блок пользователя.
 */
const Header = observer(() => {
    const { user, isAuthenticated, isLoadingProfile, profile } = useStore().auth;

    useEffect(() => {
        if (!isAuthenticated && localStorage.getItem("accessToken")) {
            profile();
        }
    }, []); // eslint-disable-line

    const role = user?.role;

    const isTeacherOrAdmin = role === "TEACHER" || role === "ADMIN";
    const isStudent = role === "STUDENT";

    return (
        <AppShell.Header className={styles.header ?? ""}>
            <Container>
                <Group h="100%" py="sm" px="md" justify="space-between">
                    {/* ЛЕВАЯ ЧАСТЬ: Логотип + навигация */}
                    <Group>
                        <Link to={STATIC_LINKS.HOME}>
                            <Image src={"/img/Upme.svg"} alt="UP.me" w={100} fit="contain" />
                        </Link>
                        <NavLink to={STATIC_LINKS.CATALOG}>Каталог</NavLink>

                        {isTeacherOrAdmin && (
                            <NavLink to={STATIC_LINKS.MY_COURSES}>Преподавателям</NavLink>
                        )}

                        {isStudent && (
                            <NavLink to={STATIC_LINKS.MY_LEARNING}>Моё обучение</NavLink>
                        )}

                        {/* если роль ещё не прогружена, можно ничего не показывать
      или оставить один общий линк */}
                    </Group>


                    {/* ПРАВАЯ ЧАСТЬ: Поиск + блок пользователя */}
                    <Group gap="md">
                        {/* Поиск: пока без реальной логики, просто UI.
                Позже сюда можно подвесить запрос к /courses с фильтром по названию. */}
                        <Autocomplete
                            placeholder={"Искать курс, тему, автора..."}
                            rightSection={<CiSearch />}
                            data={[]}
                            w={260}
                        />

                        {/* Блок пользователя: загрузка / авторизован / не авторизован */}
                        {isLoadingProfile ? (
                            // Пока профиль подгружается — показываем лоадер.
                            <Loader size="sm" />
                        ) : isAuthenticated && user ? (
                            // Авторизованный пользователь: ссылка на профиль + бейдж роли
                            <Group gap={8}>
                                <Link to={STATIC_LINKS.PROFILE}>
                                    <Text fw={500}>
                                        {user.displayName || "Пользователь"}
                                    </Text>
                                </Link>
                                {role && (
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
                                        {role === "ADMIN"
                                            ? "Администратор"
                                            : role === "TEACHER"
                                                ? "Преподаватель"
                                                : "Студент"}
                                    </Badge>
                                )}
                            </Group>
                        ) : (
                            // Неавторизованный пользователь: ссылка "Войти"
                            <Link to={STATIC_LINKS.LOGIN}>Войти</Link>
                        )}
                    </Group>
                </Group>
            </Container>
        </AppShell.Header>
    );
});

export default Header;
