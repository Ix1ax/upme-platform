import {observer} from "mobx-react-lite";
import {type ChangeEvent, type FormEvent, useState} from "react";
import styles from '../../login/ui/Login.module.css'
import img from '../../login/ui/img.svg'
import {Container, Group, Image, Stack, Text, Title} from "@mantine/core";
import {useStore} from "@/shared/hooks/UseStore";
import {Link, useNavigate} from "react-router-dom";
import {STATIC_LINKS} from "@/shared/constants/staticLinks";
import Form from "../ui/components/form/Form";

type RegForm = {
    name: string,
    email: string;
    password: string;
    confirmPassword: string;
    role: string;
    isAcceptPolicy: boolean;
};

const Register = observer(()=> {

    const  {isLoading, register} = useStore().auth;
    const navigate = useNavigate();

    const [form, setForm] = useState<RegForm>({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: "STUDENT",
        isAcceptPolicy: true,
    })

    const handleChangeForm = (e : ChangeEvent<HTMLInputElement>) => {
        const {name, value, checked,type} = e.currentTarget;
        if (type === "checkbox") {
            setForm((prev) => ({...prev, [name]: checked}))
        }else {
            setForm((prev) => ({...prev, [name]: value}))
        }
    }

    const handleChangeRole =(role: string) => {
        setForm((prev) => ({...prev, role}))
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const ok = await register(form);
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

                <Stack className={`${styles.formWrapper} ${styles.card}`} w="45%" mih={500}>
                    <Title order={3}>Регистрация</Title>
                    <Form
                        handleSubmit={handleSubmit}
                        form={form}
                        handleChangeForm={handleChangeForm}
                        isLoading={isLoading}
                        onChangeRole={handleChangeRole}
                    />

                    <Text>
                        Уже есть аккаунт? <Link to={STATIC_LINKS.LOGIN}>Войти</Link>
                    </Text>
                </Stack>
                <Group w={"50%"} h="45%" className={styles.card ?? ""}>
                    <Image src={img} radius={20} h="100%"/>
                </Group>
            </Group>
        </Container>
    )
})

export default Register