import {AppShell, Autocomplete, Container, Group, Image} from "@mantine/core";
import {Link, NavLink} from "react-router-dom";
import {STATIC_LINKS} from "@/shared/constants/staticLinks";
import {observer} from "mobx-react-lite";
import { CiSearch } from "react-icons/ci";

const Header = observer(() => {

    return (
        <AppShell.Header>
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
                        <Link to={STATIC_LINKS.LOGIN}>Войти</Link>
                    </Group>
                </Group>
            </Container>
        </AppShell.Header>
    )
})

export default Header;