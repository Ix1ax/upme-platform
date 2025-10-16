import {observer} from "mobx-react-lite";
import HomeWidget from "@/widgets/home/HomeWidget";
import MainLayout from "@/layouts/main/MainLayout";

const HomePage = observer(() => {
    return (
        <MainLayout>
            <HomeWidget />
        </MainLayout>
    )
})
export default HomePage