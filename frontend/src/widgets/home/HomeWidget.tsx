import {observer} from "mobx-react-lite";
import {Container} from "@mantine/core";
import UpgradeSection from "@/features/home/UpgradeSection/ui/UpgradeSection";
import PopularDirectionSection from "@/features/home/PopularDirection/ui/PopularDirectionSection";
import WhyMeSection from "@/features/home/WhyMe/ui/WhyMeSection";
import ReviewSection from "@/features/home/reviews/ui/ReviewsSection";

const HomeWidget = observer(() => {
    return (
        <Container >
            <UpgradeSection/>
            <PopularDirectionSection />
            <WhyMeSection />
            <ReviewSection />
        </Container>
    )
})

export default HomeWidget