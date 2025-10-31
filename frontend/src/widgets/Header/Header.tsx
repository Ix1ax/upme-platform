import {AppShell, Autocomplete, Container, Group, Image, Loader} from "@mantine/core";
import {Link, NavLink} from "react-router-dom";
import {STATIC_LINKS} from "@/shared/constants/staticLinks";
import {observer} from "mobx-react-lite";
import { CiSearch } from "react-icons/ci";
import {useStore} from "@/shared/hooks/UseStore";
import {useEffect} from "react";
import styles from './header.module.css'

const Header = observer(() => {

    const {user, isAuthenticated, isLoadingProfile, profile} = useStore().auth;

    useEffect(() => {
        if (!isAuthenticated && localStorage.getItem("accessToken")) {
            profile();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AppShell.Header className={styles.header ?? ''}>
            <Container>
                <Group h="100%" py="sm" px="md" justify="space-between">
                    <Group>
                        <Link to={STATIC_LINKS.HOME}>
                            <Image src={'/img/Upme.svg'} alt="UP.me" w={100} fit="contain" />
                        </Link>
                        <NavLink to={STATIC_LINKS.CATALOG}>Каталог</NavLink>
                        <NavLink to={STATIC_LINKS.CATALOG}>Преподавателям</NavLink>
                        <NavLink to={STATIC_LINKS.CATALOG}>О нас</NavLink>
                    </Group>

                    <Group>
                        <Autocomplete
                            placeholder={"Искать курс, тему, автора..."}
                            rightSection={<CiSearch />}
                            data={[]}
                        />
                        {
                          isLoadingProfile ? (
                              <Loader size="sm" />

                          ) :
                              isAuthenticated && user?(
                              <Link to={STATIC_LINKS.PROFILE}>
                                  {user?.displayName ?? "Пользователь"}
                              </Link>
                              ) :
                                  (
                              <Link to={STATIC_LINKS.LOGIN}>Войти</Link>
                              )
                        }
                    </Group>
                </Group>
            </Container>
        </AppShell.Header>
    )
})

export default Header;