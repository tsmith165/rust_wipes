'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Particle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    color: string;
    opacity: number;
}

export interface ParticlesBackgroundProps {
    className?: string;
    particleColor?: string;
    particleCount?: number;
    particleSize?: number;
    connectionDistance?: number;
    connectionOpacity?: number;
}

export function ParticlesBackground({
    className = '',
    particleColor = 'rgba(87, 204, 153, 0.6)', // Default to primary color
    particleCount = 80,
    particleSize = 3,
    connectionDistance = 150,
    connectionOpacity = 0.15,
}: ParticlesBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const particlesRef = useRef<Particle[]>([]);
    const animationRef = useRef<number>(0);
    const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    // Initialize particles
    const initParticles = () => {
        if (!canvasRef.current) return;

        const width = canvasRef.current.width;
        const height = canvasRef.current.height;
        const particles: Particle[] = [];

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * particleSize + 1,
                speedX: (Math.random() - 0.5) * 1.5,
                speedY: (Math.random() - 0.5) * 1.5,
                color: particleColor,
                opacity: Math.random() * 0.5 + 0.3,
            });
        }

        particlesRef.current = particles;
    };

    // Draw particles and connections
    const drawParticles = () => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw particles
        particlesRef.current.forEach((particle, i) => {
            // Update position
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            // Bounce off edges
            if (particle.x > canvas.width || particle.x < 0) {
                particle.speedX *= -1;
            }
            if (particle.y > canvas.height || particle.y < 0) {
                particle.speedY *= -1;
            }

            // Draw particle
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.opacity;
            ctx.fill();

            // Draw connections
            for (let j = i + 1; j < particlesRef.current.length; j++) {
                const otherParticle = particlesRef.current[j];
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDistance) {
                    ctx.beginPath();
                    ctx.strokeStyle = particleColor;
                    ctx.globalAlpha = connectionOpacity * (1 - distance / connectionDistance);
                    ctx.lineWidth = 1;
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(otherParticle.x, otherParticle.y);
                    ctx.stroke();
                }
            }

            // Connect to mouse
            const mouseX = mouseRef.current.x;
            const mouseY = mouseRef.current.y;
            if (mouseX && mouseY) {
                const dx = particle.x - mouseX;
                const dy = particle.y - mouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDistance * 1.5) {
                    ctx.beginPath();
                    ctx.strokeStyle = particleColor;
                    ctx.globalAlpha = connectionOpacity * 1.5 * (1 - distance / (connectionDistance * 1.5));
                    ctx.lineWidth = 1;
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(mouseX, mouseY);
                    ctx.stroke();
                }
            }
        });

        animationRef.current = requestAnimationFrame(drawParticles);
    };

    // Handle resize
    const handleResize = () => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        setDimensions({ width: canvas.width, height: canvas.height });

        initParticles();
    };

    // Handle mouse move
    const handleMouseMove = (e: MouseEvent) => {
        mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    // Handle touch move
    const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length > 0) {
            mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined' && canvasRef.current) {
            // Set initial dimensions
            handleResize();

            // Add event listeners
            window.addEventListener('resize', handleResize);
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('touchmove', handleTouchMove);

            // Start animation
            drawParticles();

            // Cleanup
            return () => {
                window.removeEventListener('resize', handleResize);
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('touchmove', handleTouchMove);
                cancelAnimationFrame(animationRef.current);
            };
        }
    }, []);

    return (
        <div className={`absolute inset-0 overflow-hidden ${className}`}>
            <canvas
                ref={canvasRef}
                className="pointer-events-none absolute inset-0 mx-auto"
                width={dimensions.width}
                height={dimensions.height}
            />
        </div>
    );
}
