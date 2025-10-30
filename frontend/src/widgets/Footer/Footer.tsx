import {ActionIcon, Container, Group, Image, Text, Title} from '@mantine/core';
import classes from './Footer.module.css';
import { FaVk, FaTelegramPlane } from "react-icons/fa";
import { FaDiscord } from "react-icons/fa6";


const data = [
    {
        title: 'About',
        links: [
            { label: 'Features', link: '#' },
            { label: 'Pricing', link: '#' },
            { label: 'Support', link: '#' },
            { label: 'Forums', link: '#' },
        ],
    },
    {
        title: 'Project',
        links: [
            { label: 'Contribute', link: '#' },
            { label: 'Media assets', link: '#' },
            { label: 'Changelog', link: '#' },
            { label: 'Releases', link: '#' },
        ],
    },
    {
        title: 'Community',
        links: [
            { label: 'Join Discord', link: '#' },
            { label: 'Follow on Twitter', link: '#' },
            { label: 'Email newsletter', link: '#' },
            { label: 'GitHub discussions', link: '#' },
        ],
    },
];

export default function Footer() {
    const groups = data.map((group) => {
        const links = group.links.map((link, index) => (
            <Text<'a'>
                key={index}
                className={classes.link ?? ''}
                component="a"
                href={link.link}
                onClick={(event) => event.preventDefault()}
            >
                {link.label}
            </Text>
        ));

        return (
            <div className={classes.wrapper} key={group.title}>
                <Title order={4} className={classes.title ?? ''}>{group.title}</Title>
                {links}
            </div>
        );
    });

    return (
        <footer className={classes.footer}>
            <Container className={classes.inner ?? ''}>
                <div className={classes.logo}>
                    <Image src={'/img/Upme.svg'} alt="UP.me" w={100} fit="contain" />
                    <Text size="xs" c="dimmed" className={classes.description ?? ''}>
                        Build fully functional accessible web applications faster than ever
                    </Text>
                </div>
                <div className={classes.groups}>{groups}</div>
            </Container>
            <Container className={classes.afterFooter ?? ''}>
                <Text c="dimmed" size="sm">
                    © 2020 mantine.dev. All rights reserved.
                </Text>

                <Group gap={0} className={classes.social ?? ''} justify="flex-end" wrap="nowrap">
                    <ActionIcon size="lg" color="gray" variant="subtle">
                        <FaVk size={18}  />
                    </ActionIcon>
                    <ActionIcon size="lg" color="gray" variant="subtle">
                        <FaTelegramPlane size={18} />
                    </ActionIcon>
                    <ActionIcon size="lg" color="gray" variant="subtle">
                        <FaDiscord size={18} />
                    </ActionIcon>
                </Group>
            </Container>
        </footer>
    );
}