import React from 'react';
import { createRoot } from 'react-dom/client';
import {RouterProvider} from "react-router-dom";
import {router} from "@/app/router/router";
import StoreProvider from "@/app/providers/StoreProvider";

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root not found');

createRoot(root).render(
    <React.StrictMode>
        <StoreProvider>
            <RouterProvider router={router} />
        </StoreProvider>
    </React.StrictMode>
);
