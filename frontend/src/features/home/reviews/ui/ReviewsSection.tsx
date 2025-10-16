import {useState} from "react";
import {Group, ScrollArea} from "@mantine/core";
import ReviewCard from "./Card/ReviewCard";


const mockReviews = [
    {
        id: 1,
        name: "Алексей",
        course: "IT spec",
        comment: "Понравилась практика и быстрые ответы наставников. За месяц собрал первый React-проект.",
    },
    {
        id: 2,
        name: "Алексей",
        course: "IT SPECIALIST",
        comment: "Понравилась практика и быстрые ответы наставников. За месяц собрал первый React-проект.",
    },
    {
        id: 3,
        name: "Алексей",
        course: "IT SPECIALIST",
        comment: "Понравилась практика и быстрые ответы наставников. За месяц собрал первый React-проект.",
    },
]

const ReviewSection = () => {
    const [cards, ] = useState(mockReviews)

    return (
        <section className={"section"}>
            <ScrollArea h={250} type="always" scrollbarSize={4}>
                <Group wrap={"nowrap"}>
                    {cards.map((card, index) => (
                        <ReviewCard key={index} name={card.name} course={card.course} comment={card.comment} />
                    ))}
                </Group>
            </ScrollArea>
        </section>
    )
}

export default ReviewSection