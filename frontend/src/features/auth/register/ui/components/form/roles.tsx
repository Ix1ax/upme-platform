import { Group, Radio, Text } from "@mantine/core";
import classes from "./roles.module.css";

type RoleCode = "STUDENT" | "TEACHER";

interface RolesProps {
    value: RoleCode;
    onChange: (value: RoleCode) => void;
}

const Roles = ({ value, onChange }: RolesProps) => {
    return (
        <Radio.Group
            label="Выберите роль"
            value={value}
            onChange={(v) => onChange(v as RoleCode)}
        >
            <Group pt={5} gap="xs">
                <Radio.Card className={classes.root ?? ""} value="STUDENT" w="48%" h={100} radius="md" p={10}>
                    <Group wrap="nowrap" align="flex-start" gap={5}>
                        <Radio.Indicator />
                        <div>
                            <Text className={classes.label ?? ""} fw={600}>Ученик</Text>
                            <Text className={classes.description ?? ""} size="sm" c="dimmed">
                                Доступ к курсам, прогресс, достижения
                            </Text>
                        </div>
                    </Group>
                </Radio.Card>

                <Radio.Card className={classes.root ?? ""} value="TEACHER" w="48%" h={100} radius="md" p={10}>
                    <Group wrap="nowrap" align="flex-start" gap={5}>
                        <Radio.Indicator />
                        <div>
                            <Text className={classes.label ?? ""} fw={600}>Учитель</Text>
                            <Text className={classes.description ?? ""} size="sm" c="dimmed">
                                Курсы, аналитика, выплаты
                            </Text>
                        </div>
                    </Group>
                </Radio.Card>
            </Group>
        </Radio.Group>
    );
};

export default Roles;
