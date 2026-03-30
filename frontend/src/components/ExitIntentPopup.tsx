'use client';

import { useState, useEffect } from 'react';

export default function ExitIntentPopup() {
    const [isMounted, setIsMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [hasShown, setHasShown] = useState(false);
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        // Check if the user has already seen the popup this session
        const alreadyShown = sessionStorage.getItem('photoGuidePopupShown');
        if (alreadyShown) {
            setHasShown(true);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                // Trigger popup when they scroll near the footer
                if (entry.isIntersecting && !hasShown) {
                    setIsMounted(true); // Mount the DOM node off-screen
                    setHasShown(true);
                    sessionStorage.setItem('photoGuidePopupShown', 'true');

                    // Wait 50ms for react to render the DOM node, then trigger the CSS transition
                    setTimeout(() => {
                        setIsVisible(true);
                    }, 50);

                    // Disconnect observer once triggered
                    observer.disconnect();
                }
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 0.5, // Trigger when section is 50% visible
            }
        );

        // Give the DOM a moment to render before looking for the section
        setTimeout(() => {
            const targetSection = document.getElementById('site-footer');
            if (targetSection) {
                observer.observe(targetSection);
            }
        }, 500);

        return () => observer.disconnect();
    }, [hasShown]);

    if (!isMounted) return null;

    const handleClose = () => {
        setIsVisible(false);
        // Wait for the slide-out animation to finish before removing from DOM
        setTimeout(() => setIsMounted(false), 500);
    };

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 z-[100] md:bottom-6 md:left-auto md:right-6 pointer-events-none transition-transform duration-500 ease-out ${isVisible ? "translate-y-0" : "translate-y-full md:translate-y-[150%]"
                }`}
        >
            {/* Bottom Sheet Modal */}
            <div className="w-full md:w-[420px] bg-[var(--color-dark-card)] border-t md:border border-neutral-800 md:rounded-2xl shadow-[0_-8px_40px_hsla(0,0%,0%,0.3)] md:shadow-[0_16px_40px_hsla(0,0%,0%,0.5)] overflow-hidden pointer-events-auto">
                {/* Close Button (Min 44px target) */}
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-2 right-2 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-neutral-500 hover:text-white transition-colors"
                    aria-label="Close popup"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="p-6 md:p-8">
                    {!submitted ? (
                        <>
                            <h2 className="font-display text-xl md:text-2xl font-bold text-white mb-2 md:mb-4 pr-8">
                                Not quite ready to commission a clone?
                            </h2>
                            <p className="text-neutral-400 mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
                                Get our free guide on <strong>"How to Take the Perfect Reference Photo"</strong>. Plus, we'll send you a 10% discount for when you are ready.
                            </p>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    // In a real app, you would POST this to an email marketing service (Resend, Mailchimp, etc)
                                    setSubmitted(true);
                                }}
                                className="space-y-4"
                            >
                                <div>
                                    <label htmlFor="exit-email" className="sr-only">Email address</label>
                                    <input
                                        type="email"
                                        id="exit-email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email address"
                                        className="w-full px-4 py-3 min-h-[44px] rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-colors"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full px-6 py-3 min-h-[44px] bg-terra-600 hover:bg-terra-500 text-white font-semibold rounded-lg transition-colors shadow-[0_4px_16px_hsla(22,74%,54%,0.2)] hover:shadow-[0_8px_24px_hsla(22,74%,54%,0.4)]"
                                >
                                    Send Me The Guide
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 rounded-full bg-terra-600/10 border border-terra-500/20 flex items-center justify-center text-terra-400 mx-auto mb-6">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="font-display text-2xl font-bold text-white mb-3">
                                Check your inbox!
                            </h3>
                            <p className="text-neutral-400 mb-8 text-sm leading-relaxed">
                                Your free camera guide and 10% discount code are on the way.
                            </p>
                            <button
                                onClick={() => setIsVisible(false)}
                                className="min-h-[44px] text-terra-400 hover:text-terra-300 font-medium transition-colors border-b border-terra-500/30 hover:border-terra-400"
                            >
                                Close Window
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
