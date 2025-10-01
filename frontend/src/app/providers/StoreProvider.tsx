import {createContext, type ReactNode, useMemo} from 'react';
import {Store} from '@/shared/store/store.js';

// eslint-disable-next-line react-refresh/only-export-components
export const StoreContext = createContext<Store | null>(null);

interface StoreProviderProps {
    children: ReactNode;
}

export default function StoreProvider({ children } : StoreProviderProps) {
    const store = useMemo(() => new Store(), []);
    return (
        <StoreContext.Provider value={store}>
            {children}
        </StoreContext.Provider>
    )
}
