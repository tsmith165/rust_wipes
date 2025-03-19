import React from 'react';
import { Html, Head, Preview, Body, Container, Section, Heading, Text, Tailwind } from '@react-email/components';

import PROJECT_CONSTANTS from '@/lib/constants';

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
            <Preview>{`${kit_name} Subscription Cancellation`}</Preview>
            <Tailwind
                config={{
                    theme: {
                        extend: {
                            colors: {
                                primary_light: '#ff6b6b',
                                primary: '#fa5252',
                                primary_dark: '#f03e3e',
                                st_lightest: '#f0a58f',
                                st: '#e8836a',
                                st_darkest: '#b56552',
                            },
                        },
                    },
                }}
            >
                <Body className="h-full w-full">
                    <Container className="h-full w-full rounded-lg bg-stone-900 p-2">
                        <Heading className="h-fit w-full p-4 pb-0 text-center text-2xl font-bold text-primary">
                            {`${kit_name} Subscription Cancellation`}
                        </Heading>
                        <Section className="flex-col space-y-0.5 px-4 text-stone-300">
                            <Text className="text-lg">Hello {steam_username},</Text>
                            <Text className="text-lg">
                                We're writing to confirm that your subscription to the "{kit_name}" kit has been canceled.
                            </Text>
                            <Text className="text-lg">
                                You will continue to have access to the kit until{' '}
                                <span className="font-bold text-primary_light">{formattedEndDate}</span>. After that, you will no longer be
                                able to use the <span className="font-bold text-primary_light">/kit {kit_name.toLowerCase()}</span> command
                                in-game.
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
                                <a href={PROJECT_CONSTANTS.CONTACT_DISCORD} className="text-blue-400 hover:text-blue-300">
                                    Contact us in our Discord community!
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
