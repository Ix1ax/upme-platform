import {observer} from "mobx-react-lite";
import MainLayout from "@/layouts/main/MainLayout";
import CatalogWidget from "@/widgets/Catalog/CatalogWidget";

const CatalogPage = observer(() => {
    return (
        <MainLayout>
            <CatalogWidget />
        </MainLayout>
    )
})
export default CatalogPage