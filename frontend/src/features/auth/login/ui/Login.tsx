import {observer} from "mobx-react-lite";
import styles from './Login.module.css'
import {type ChangeEvent, type FormEvent, useState} from "react";
import img from './img.svg'
import {Container, Group, Image, Stack, Text} from "@mantine/core";
import {useStore} from "@/shared/hooks/UseStore";
import {Link, useNavigate} from "react-router-dom";
import {STATIC_LINKS} from "@/shared/constants/staticLinks";
import Form from "../ui/components/form/Form";

type LoginForm = {
    email: string;
    password: string;
}

const Login = observer(()=> {

    const  {isLoading, login} = useStore().auth;
    const navigate = useNavigate();

    const [form, setForm] = useState<LoginForm>({
        email: '',
        password: '',
    })

    const handleChangeForm = (e : ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.currentTarget;
        setForm((prev) => ({...prev, [name]: value}))
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const ok = await login(form);
            if(ok){
                navigate(STATIC_LINKS.HOME)
            }
        }catch (e) {
            console.error(e)
        }
    }

    return (
       <Container>
           <Group h="100vh" justify="space-between">
               <Group w={"50%"} h="45%" className={styles.card ?? ""}>
                   <Image src={img} bdrs={20} h="100%"/>
               </Group>
               <Stack className={`${styles.formWrapper} ${styles.card}`} w="45%" h={500}>
                   <h2>Вход</h2>
                    <Form handleSubmit={handleSubmit} form={form} handleChangeForm={handleChangeForm} isLoading={isLoading}/>
                   <Text>
                       Нет аккаунта? <Link to={STATIC_LINKS.REGISTER}>Зарегистрироваться</Link>
                   </Text>
               </Stack>
           </Group>
       </Container>
    )
})

export default Login