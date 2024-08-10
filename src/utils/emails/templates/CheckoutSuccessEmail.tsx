import React from 'react';
import { Html, Head, Preview, Body, Container, Section, Heading, Text, Tailwind } from '@react-email/components';

import PROJECT_CONSTANTS from '@/lib/constants';

interface CheckoutSuccessEmailProps {
    steam_username: string;
    kit_name: string;
    price_paid: number;
    is_subscription: boolean;
}

const CheckoutSuccessEmail: React.FC<CheckoutSuccessEmailProps> = ({ steam_username, kit_name, price_paid, is_subscription }) => {
    return (
        <Html>
            <Head />
            <Preview>{`${is_subscription ? 'Subscription' : 'Purchase'} Confirmation - ${kit_name}`}</Preview>
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
                            {`${kit_name} ${is_subscription ? 'Subscription' : 'Purchase'} Confirmation`}
                        </Heading>
                        <Section className="flex-col space-y-0.5 px-4 text-stone-300">
                            <Text className="text-lg">Hello {steam_username},</Text>
                            <Text className="text-lg">
                                Thank you for your {is_subscription ? 'subscription to' : 'purchase of'} the "{kit_name}" kit. Your{' '}
                                {is_subscription ? 'initial payment' : 'transaction'} of ${price_paid.toFixed(2)} has been successfully
                                processed.
                            </Text>
                            <Text className="text-lg">We appreciate your support and hope you enjoy your new Rust kit!</Text>
                            <Text className="text-lg">
                                Your kit is now available for use in-game. To claim your kit, use the command{' '}
                                <span className="font-bold text-primary_light">/kit {kit_name.toLowerCase()}</span> when you're in the game.
                            </Text>
                            <Text className="text-lg">Please note:</Text>
                            <ul className="list-disc pl-5 text-lg">
                                <li>Kits are locked for 4 hours after a server wipe.</li>
                                <li>After the initial 4-hour lock, your kit will be available every 8 hours.</li>
                                {is_subscription ? (
                                    <li>Your subscription will automatically renew each month until canceled.</li>
                                ) : (
                                    <li>This kit access is valid for 30 days from the date of purchase.</li>
                                )}
                            </ul>
                            <Text className="text-lg">
                                If you have any questions or issues with your kit, please don't hesitate to contact our support team.
                            </Text>
                            <Text className="text-lg">Good luck, and have fun raiding!</Text>
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

export default CheckoutSuccessEmail;
