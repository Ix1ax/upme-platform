import {Group, ScrollArea, Title} from "@mantine/core";
import {type ReactNode, useState} from "react";
import ThemeCard from "@/features/home/ui/ThemeCard";
import {IoCode} from "react-icons/io5";

type cards = {title: string; description: string; icon: ReactNode}

const mockCards = [
    {
        id: 1,
        title: "Практика",
        description: "Задания в браузере, автопроверка и разборы.",
        icon: <IoCode />
    },
    {
        id: 2,
        title: "Наставники",
        description: "Поддержка опытных разработчиков в чате.",
        icon: <IoCode />
    },
    {
        id: 3,
        title: "Проекты",
        description: "Портфельные кейсы и код-ревью.",
        icon: <IoCode />
    },
    {
        id: 4,
        title: "Сертификаты",
        description: "Электронные сертификаты и верификация.",
        icon: <IoCode />
    },
]


const WhyMeSection = () => {
    const [cards, ] = useState<cards[]>(mockCards);
    return (
        <section className="section">
            <Title order={2} mb={25}>Почему Up.me</Title>
            <ScrollArea h={250} type="always" scrollbarSize={4}>
                <Group wrap="nowrap" >
                    {cards.map((card, index) => (
                        <ThemeCard key={index} title={card.title} description={card.description} icon={card.icon} />
                    ))}
                </Group>
            </ScrollArea>
        </section>
    )
}

export default WhyMeSection;