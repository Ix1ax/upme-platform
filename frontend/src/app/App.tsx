import {Outlet} from "react-router-dom";
import {MantineProvider} from "@mantine/core";


const App = () => (
    <MantineProvider defaultColorScheme="light">
        <Outlet />
    </MantineProvider>
)

export default App;