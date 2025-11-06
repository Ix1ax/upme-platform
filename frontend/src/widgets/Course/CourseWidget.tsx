import {observer} from "mobx-react-lite";
import {Container} from "@mantine/core";
import CourseSection from "@/features/course/ui/CourseSection";


const CourseWidget = observer(() => {
    return (
        <Container>
            <CourseSection/>
        </Container>
    )
})

export default CourseWidget