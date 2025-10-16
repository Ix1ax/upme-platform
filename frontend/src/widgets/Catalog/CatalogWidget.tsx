import {observer} from "mobx-react-lite";
import {Container} from "@mantine/core";
import CatalogSection from "@/features/Catalog/ui/CatalogSection";


const HomeWidget = observer(() => {
    return (
        <Container>
            <CatalogSection />
        </Container>
    )
})

export default HomeWidget