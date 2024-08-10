import React from 'react';
import { Html, Head, Preview, Body, Container, Section, Heading, Text, Tailwind } from '@react-email/components';

interface ErrorEmailTemplateProps {
    error_message: string;
    steam_username: string;
    kit_name: string;
    action_type: 'grant' | 'revoke';
}

const ErrorEmailTemplate: React.FC<ErrorEmailTemplateProps> = ({ error_message, steam_username, kit_name, action_type }) => {
    return (
        <Html>
            <Head />
            <Preview>Error Notification - Rust Kit Access {action_type === 'grant' ? 'Granting' : 'Revoking'}</Preview>
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
                        <Heading className="h-fit w-full p-4 pb-0 text-center text-2xl font-bold text-primary">
                            Error: Failed to {action_type === 'grant' ? 'Grant' : 'Revoke'} Rust Kit Access
                        </Heading>
                        <Section className="flex-col space-y-0.5 px-4 text-stone-300">
                            <Text className="text-lg">An error occurred while attempting to {action_type} kit access:</Text>
                            <Text className="text-lg font-bold text-primary_light">{error_message}</Text>
                            <Text className="text-lg">Details:</Text>
                            <ul className="list-disc pl-5 text-lg">
                                <li>Steam Username: {steam_username}</li>
                                <li>Kit Name: {kit_name}</li>
                                <li>Action: {action_type === 'grant' ? 'Granting' : 'Revoking'} access</li>
                            </ul>
                            <Text className="text-lg">Please investigate this issue and manually {action_type} access if necessary.</Text>
                            <Text className="text-lg">If you need any additional information, please contact the development team.</Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default ErrorEmailTemplate;
