import type {ReactNode} from "react";
import {AppShell} from "@mantine/core";
import Header from "@/widgets/Header/Header";
import Footer from "@/widgets/Footer/Footer";

interface AuthLayoutProps {
    children?: ReactNode;
}

const MainLayout = ({children} : AuthLayoutProps) => {
    return (
        <AppShell header={{ height: 60 }}>
            <Header />

            <AppShell.Main>
                {children}
            </AppShell.Main>

            <Footer />
        </AppShell>
    )
}

export default MainLayout;