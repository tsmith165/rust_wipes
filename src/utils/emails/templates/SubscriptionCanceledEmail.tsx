import React from 'react';
import { Html, Head, Preview, Body, Container, Section, Heading, Text, Tailwind } from '@react-email/components';

interface SubscriptionCanceledEmailProps {
    steam_username: string;
    kit_name: string;
    end_date: string;
}

const SubscriptionCanceledEmail: React.FC<SubscriptionCanceledEmailProps> = ({ steam_username, kit_name, end_date }) => {
    const formattedEndDate = new Date(end_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <Html>
            <Head />
            <Preview>Subscription Cancellation - Rust Kit</Preview>
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
                            Rust Kit Subscription Cancellation
                        </Heading>
                        <Section className="flex-col space-y-0.5 px-4">
                            <Text className="text-lg">Hello {steam_username},</Text>
                            <Text className="text-lg">
                                We're writing to confirm that your subscription to the "{kit_name}" kit has been canceled.
                            </Text>
                            <Text className="text-lg">
                                You will continue to have access to the kit until{' '}
                                <span className="font-bold text-secondary">{formattedEndDate}</span>. After that, you will no longer be able
                                to use the <span className="font-bold text-secondary">/kit {kit_name.toLowerCase()}</span> command in-game.
                            </Text>
                            <Text className="text-lg">
                                If you've canceled by mistake or wish to resubscribe in the future, you can do so at any time through our
                                website.
                            </Text>
                            <Text className="text-lg">
                                We appreciate the support you've shown us and hope you've enjoyed using the kit. If you have any questions
                                about your cancellation or feedback on your experience, please don't hesitate to reach out to our support
                                team.
                            </Text>
                            <Text className="text-lg">Thank you for being a part of our community!</Text>
                            <Text className="text-lg">The Rust Team</Text>
                            <Text className="text-lg">
                                <a href="https://www.yourwebsite.com" className="text-blue-400 hover:text-blue-300">
                                    support@yourwebsite.com
                                </a>
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default SubscriptionCanceledEmail;
