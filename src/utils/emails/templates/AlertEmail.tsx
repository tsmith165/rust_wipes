import React from 'react';
import { Html, Head, Preview, Body, Container, Section, Heading, Text, Tailwind } from '@react-email/components';

interface AlertEmailProps {
    title: string;
    severity: string;
    type: string;
    message: string;
    server_id: string;
    timestamp: Date;
}

const AlertEmail: React.FC<AlertEmailProps> = ({ title, severity, type, message, server_id, timestamp }) => {
    return (
        <Html>
            <Head />
            <Preview>
                [{severity.toUpperCase()}] {title}
            </Preview>
            <Tailwind
                config={{
                    theme: {
                        extend: {
                            colors: {
                                primary: '#cd412b',
                                primary_dark: '#a33322',
                                secondary_light: '#f0a58f',
                                secondary: '#e8836a',
                                secondary_dark: '#b56552',
                            },
                        },
                    },
                }}
            >
                <Body className="h-full w-full">
                    <Container className="h-full w-full rounded-lg bg-stone-900 p-2">
                        <Heading className="h-fit w-full p-4 pb-0 text-center text-2xl font-bold text-primary">{title}</Heading>
                        <Section className="flex-col space-y-0.5 px-4 text-stone-300">
                            <Text className="text-lg">
                                <strong>Severity:</strong>{' '}
                                <span
                                    className={
                                        severity === 'high' ? 'text-red-500' : severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                                    }
                                >
                                    {severity.toUpperCase()}
                                </span>
                            </Text>
                            <Text className="text-lg">
                                <strong>Type:</strong> {type.charAt(0).toUpperCase() + type.slice(1)}
                            </Text>
                            <Text className="text-lg">
                                <strong>Message:</strong>
                            </Text>
                            <Text className="whitespace-pre-wrap text-lg">{message}</Text>
                            <Text className="text-lg">
                                <strong>Server ID:</strong> {server_id}
                            </Text>
                            <Text className="text-lg">
                                <strong>Time:</strong> {timestamp.toLocaleString()}
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default AlertEmail;
