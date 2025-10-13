import type {ReactNode} from "react";
import {AppShell} from "@mantine/core";
import Header from "@/widgets/Header/Header";

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
        </AppShell>
    )
}

export default MainLayout;