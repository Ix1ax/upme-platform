import { observer } from 'mobx-react-lite';
import { Navigate, Outlet } from 'react-router';
import { STATIC_LINKS } from '@/shared/constants/staticLinks.js';
import { useStore } from "@/shared/hooks/UseStore";
import { useEffect } from 'react';
import {Group, Loader} from "@mantine/core";

const PrivateRoute = observer(() => {
    const { auth }  = useStore();
    const hasToken = !!localStorage.getItem('accessToken');

    // При первом рендере пытаемся восстановить сессию
    useEffect(() => {
        auth.ensureAuth();
    }, [auth]);

    if (hasToken && (auth.isLoadingProfile || !auth.profileLoaded)) {
        return (
            <Group justify="center" align="center" style={{ minHeight: "60vh" }}>
                <Loader size="xl" />
            </Group>
        );
    }

    return auth.isAuthenticated ? <Outlet /> : <Navigate to={STATIC_LINKS.LOGIN} replace />;
});

export default PrivateRoute;
