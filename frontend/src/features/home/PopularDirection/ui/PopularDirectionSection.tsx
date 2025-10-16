import {Group, ScrollArea, Title} from "@mantine/core";
import ThemeCard from "@/features/home/ui/ThemeCard";
import {type ReactNode, useState} from "react";
import { IoCode } from "react-icons/io5";


const mockCards = [
    {
        id: 1,
        title: "Frontend",
        description: "HTML, CSS, JS, React. От верстки до SPA.",
        icon: <IoCode />
    },
    {
        id: 2,
        title: "Frontend",
        description: "HTML, CSS, JS, React. От верстки до SPA.",
        icon: <IoCode />
    },    {
        id: 3,
        title: "Frontend",
        description: "HTML, CSS, JS, React. От верстки до SPA.",
        icon: <IoCode />
    },
]

type cards = {title: string; description: string; icon: ReactNode}


const PopularDirectionSection = () => {
    const [cards, ] = useState<cards[]>(mockCards);
    return (
        <section className="section">
            <Title order={2} mb={25}>Популярные направления</Title>
            <ScrollArea h={250} type="always" scrollbarSize={4}>
                <Group wrap="nowrap">
                    {cards.map((card, index) => (
                        <ThemeCard key={index} title={card.title} description={card.description} icon={card.icon} />
                    ))}
                </Group>
            </ScrollArea>
        </section>
    )
}

export default PopularDirectionSection;