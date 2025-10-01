import { observer } from 'mobx-react-lite';
// import { useStore } from '../hooks/useStore.js';
import { Navigate, Outlet } from 'react-router';
import { STATIC_LINKS } from '@/shared/constants/staticLinks.js';

const PrivateRoute = observer(() => {
    const isAuth  = true; // useStore().auth

    return isAuth ? <Outlet /> : <Navigate to={STATIC_LINKS.LOGIN} />;
});

export default PrivateRoute;
