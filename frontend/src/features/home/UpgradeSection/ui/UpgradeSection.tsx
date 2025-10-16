// import styles from './UpgradeSection.module.css'
import {Stack, Title, Text, Button, Group, Card, Image} from "@mantine/core";
import comp from '../images/computer.svg'

const UpgradeSection = () => {
    return (
        <section className={"section"}>
           <Group justify="space-between">
               <Stack>
                   <Title order={3} size={12} c="#00C2E0">IT-курсы онлайн</Title>
                   <Title order={1}>Прокачайся в IT</Title>
                   <Text>
                       Frontend, Backend, DevOps, QA —
                       от нуля до проекта.
                   </Text>
                   <Group>
                       <Button>
                           Начать бесплатно
                       </Button>
                       <Button variant="light">
                           Каталог курсов
                       </Button>
                   </Group>
               </Stack>

               <Card h={360} maw={450} w={"100%"} shadow="md" padding="lg" radius="lg" >
                   <Stack justify="center" align="center" h="100%">
                       <Image
                           src={comp}

                       />
                   </Stack>
               </Card>
           </Group>
        </section>
    )
}

export default UpgradeSection;