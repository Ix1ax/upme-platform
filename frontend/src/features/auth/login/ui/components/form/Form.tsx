import {Button, PasswordInput, Stack, TextInput} from "@mantine/core";
import type {ChangeEvent, FormEvent} from "react";

type LoginForm = {
    email: string;
    password: string;
};

interface formProps {
    form: LoginForm;
    isLoading: boolean;
    handleChangeForm: (e: ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

const Form = ({handleSubmit, handleChangeForm, form, isLoading} : formProps) => {
    return (
        <form onSubmit={(e)=> handleSubmit(e)}>
            <Stack gap={2}>
                <TextInput
                    label="Email"
                    placeholder="Введите email"
                    onChange={handleChangeForm}
                    value={form.email}
                    name="email"
                />
                <PasswordInput
                    label="Пароль"
                    placeholder="Введите пароль"
                    onChange={handleChangeForm}
                    value={form.password}
                    name="password"
                />

                <Button variant="transparent">
                    Забыли пароль?
                </Button>

                <Button type="submit" mt="sm" w={"100%"} loading={isLoading}>Войти</Button>
            </Stack>
        </form>
    )
}

export default Form;