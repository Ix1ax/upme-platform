import {
    Button,
    createTheme,
    Input,
    MantineProvider,
    TextInput,
} from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import type {ReactNode} from "react";

interface StyleProviderProps {
    children?: ReactNode;
}

const StyleProvider = ({ children } : StyleProviderProps) => {
    const theme = createTheme({
        primaryColor: 'blue',
        components: {
            Input: Input.extend({
                defaultProps: {
                    radius: 'md',
                },
            }),
            TextInput: TextInput.extend({
                defaultProps: {
                    radius: 'md',
                },
            }),
            Button: Button.extend({
                defaultProps: {
                    radius: 'md',
                },
            }),
        },
    });

    return (
        <MantineProvider theme={theme} defaultColorScheme="light">
            {children}
            <Notifications position="top-right"/>
        </MantineProvider>
    );
};

export default StyleProvider;
