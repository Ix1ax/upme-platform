import {Card, Group, Skeleton, Stack} from "@mantine/core";

const SkeletonCard = () => (
    <Card shadow="sm" radius="lg" withBorder>
        <Skeleton height={160} radius="md" />
        <Stack gap="xs" mt="md">
            <Skeleton height={18} width="70%" />
            <Skeleton height={14} width="90%" />
            <Skeleton height={14} width="60%" />
        </Stack>
        <Group mt="md" justify="space-between">
            <Skeleton height={36} width={120} />
            <Skeleton height={36} width={120} />
        </Group>
    </Card>
);

export default SkeletonCard;