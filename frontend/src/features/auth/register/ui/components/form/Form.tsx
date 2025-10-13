import {Button, Checkbox, Group, PasswordInput, Stack, TextInput} from "@mantine/core";
import type {ChangeEvent, FormEvent} from "react";
import Roles from "@/features/auth/register/ui/components/form/roles";

type RegForm = {
    name: string,
    email: string;
    password: string;
    confirmPassword: string;
    role: string;
    isAcceptPolicy: boolean;
};

type RoleCode = "STUDENT" | "TEACHER"

interface formProps {
    form: RegForm;
    isLoading: boolean;
    handleChangeForm: (e: ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
    onChangeRole: (role: RoleCode) => void
}

const Form = ({handleSubmit, handleChangeForm, form, isLoading, onChangeRole} : formProps) => {
    return (
        <form onSubmit={(e)=> handleSubmit(e)}>
            <Stack gap={2}>
                <TextInput
                    label="Имя"
                    placeholder="Введите имя"
                    onChange={handleChangeForm}
                    value={form.name}
                    name="name"
                />
                <TextInput
                    label="Email"
                    placeholder="Введите email"
                    onChange={handleChangeForm}
                    value={form.email}
                    name="email"
                />
                <Group grow>
                    <PasswordInput
                        label="Пароль"
                        placeholder="Введите пароль"
                        onChange={handleChangeForm}
                        value={form.password}
                        name="password"
                    />

                    <PasswordInput
                        label="Повторить пароль"
                        placeholder="Повторите пароль"
                        onChange={handleChangeForm}
                        value={form.confirmPassword}
                        name="confirmPassword"
                    />
                </Group>

                <Roles
                    value={form.role as "STUDENT" | "TEACHER"}
                    onChange={onChangeRole}
                />

                <Checkbox label="Принимаю условия" onChange={handleChangeForm} checked={form.isAcceptPolicy} name="isAcceptPolicy" />

                <Button type="submit" mt="sm" w={"100%"} loading={isLoading}>Зарегистрироваться</Button>

            </Stack>
        </form>
    )
}

export default Form;