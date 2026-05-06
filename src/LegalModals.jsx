import React from 'react';

const LegalModal = ({ title, isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>
            
            {/* Modal Content */}
            <div className="relative bg-white border-4 border-secondary max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col pixel-shadow">
                {/* Header */}
                <div className="bg-secondary text-primary p-6 border-b-4 border-primary flex justify-between items-center">
                    <h2 className="text-2xl font-black uppercase tracking-tight">{title}</h2>
                    <button 
                        onClick={onClose}
                        className="size-10 bg-primary text-secondary border-2 border-secondary flex items-center justify-center hover:scale-110 active:translate-y-1 transition-transform"
                    >
                        <span className="material-symbols-outlined font-black">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto text-secondary custom-scrollbar">
                    <div className="space-y-8 font-body text-sm leading-relaxed">
                        {children}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t-2 border-gray-100 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="bg-secondary text-white px-8 py-2 text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-colors"
                    >
                        I Accept & Understand
                    </button>
                </div>
            </div>
        </div>
    );
};

export const TermsOfService = ({ isOpen, onClose }) => (
    <LegalModal title="Terms of Service" isOpen={isOpen} onClose={onClose}>
        <section>
            <h3 className="text-lg font-black uppercase text-primary mb-2 underline decoration-2 underline-offset-4">1. Binding Agreement</h3>
            <p>These Terms of Service ("Terms") constitute a legally binding agreement between you ("User" or "You") and SummerDash ("the Project", "We", or "Us"). By connecting a digital wallet, interacting with our smart contracts, or accessing the SummerDash platform, you acknowledge that you have read, understood, and agree to be bound by these Terms in their entirety.</p>
        </section>

        <section>
            <h3 className="text-lg font-black uppercase text-primary mb-2 underline decoration-2 underline-offset-4">2. Wallet Security & Self-Custody</h3>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="font-black text-red-700 uppercase text-xs mb-1 underline">DISCLAIMER OF LIABILITY:</p>
                <p className="text-red-900 font-bold italic">SummerDash is a decentralized application (DApp) and does NOT have access to your private keys, seed phrases, or funds. We are absolutely NOT responsible for any loss of digital assets, $DASH tokens, or currency resulting from: (a) Exposure of your private keys; (b) Phishing attacks; (c) Compromised wallet software; (d) Sharing session links with third parties; or (e) User error in transaction execution.</p>
            </div>
            <p>You agree that you are solely responsible for maintaining the confidentiality of your credentials and for all activities that occur through your wallet connection. SummerDash is not a custodian and has no power to reverse transactions or recover lost funds.</p>
        </section>

        <section>
            <h3 className="text-lg font-black uppercase text-primary mb-2 underline decoration-2 underline-offset-4">3. Prohibited Conduct</h3>
            <p>Users are strictly prohibited from engaging in the following activities:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2 font-bold italic">
                <li>Using automated scripts, bots, or any form of artificial intelligence to manipulate game scores.</li>
                <li>Attempting to circumvent regional restrictions or smart contract access controls.</li>
                <li>Exploiting software vulnerabilities, glitches, or bugs for unfair competitive advantage.</li>
                <li>Engaging in wash trading, multi-accounting, or other sybil attacks to drain prize pools.</li>
                <li>Harassing or impersonating other community members or developers.</li>
            </ul>
        </section>

        <section>
            <h3 className="text-lg font-black uppercase text-primary mb-2 underline decoration-2 underline-offset-4">4. Smart Contract "As-Is" Status</h3>
            <p>Our smart contracts are provided on an "as-is" and "as-available" basis. While we strive for absolute security, you acknowledge that software can have bugs. By using the platform, you assume all risks associated with blockchain technology, including but not limited to network congestion, hard forks, and smart contract vulnerabilities.</p>
        </section>

        <section>
            <h3 className="text-lg font-black uppercase text-primary mb-2 underline decoration-2 underline-offset-4">5. Prize Pool & $DASH Utility</h3>
            <p>$DASH is a virtual utility token used within the SummerDash ecosystem. It has no intrinsic value and should not be considered a financial investment or security. Prize pools are determined by player participation and are subject to network gas fees and administrative shares as defined in the game documentation.</p>
        </section>

        <section>
            <h3 className="text-lg font-black uppercase text-primary mb-2 underline decoration-2 underline-offset-4">6. Indemnification</h3>
            <p>You agree to indemnify and hold harmless SummerDash and its contributors from and against any claims, damages, obligations, losses, liabilities, costs, or debt arising from: (i) your use of and access to the Service; (ii) your violation of any term of these Terms; or (iii) your violation of any third-party right, including without limitation any intellectual property, or privacy right.</p>
        </section>

        <section>
            <h3 className="text-lg font-black uppercase text-primary mb-2 underline decoration-2 underline-offset-4">7. Governing Law & Arbitration</h3>
            <p>These Terms shall be governed by the principles of international commercial law. Any disputes arising out of or in connection with these Terms shall be resolved through final and binding arbitration, rather than in court.</p>
        </section>
    </LegalModal>
);

export const PrivacyPolicy = ({ isOpen, onClose }) => (
    <LegalModal title="Privacy Policy" isOpen={isOpen} onClose={onClose}>
        <section>
            <h3 className="text-lg font-black uppercase text-primary mb-2 underline decoration-2 underline-offset-4">1. Commitment to Privacy</h3>
            <p>At SummerDash, we prioritize user privacy through decentralization. Unlike traditional gaming platforms, we do not require accounts, emails, or personal identification. We do not sell, rent, or trade any user data to third parties.</p>
        </section>

        <section>
            <h3 className="text-lg font-black uppercase text-primary mb-2 underline decoration-2 underline-offset-4">2. Blockchain Data Public Notice</h3>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 font-bold italic">
                <p>Please be advised that all transactions on the Avalanche network are public, transparent, and permanent. Your public wallet address, transaction history, and game performance are accessible to anyone with access to a blockchain explorer.</p>
            </div>
        </section>

        <section>
            <h3 className="text-lg font-black uppercase text-primary mb-2 underline decoration-2 underline-offset-4">3. Information We Collect</h3>
            <ul className="list-disc pl-6 space-y-2 mt-2 font-bold italic">
                <li>Public Wallet Address: Required to track high scores and facilitate $DASH payouts.</li>
                <li>Device & Browser Data: We collect technical metadata (IP address, browser version) strictly to prevent DDoS attacks and bot manipulation.</li>
                <li>Cookies & Local Storage: Used to remember your local settings, session state, and chosen username.</li>
            </ul>
        </section>

        <section>
            <h3 className="text-lg font-black uppercase text-primary mb-2 underline decoration-2 underline-offset-4">4. Data Retention & Deletion</h3>
            <p>Because we do not store personal information in a centralized database, there is no "account" to delete. However, information stored in the blockchain (on-chain) cannot be deleted or modified by SummerDash. Your local browser data can be cleared at any time through your browser settings.</p>
        </section>

        <section>
            <h3 className="text-lg font-black uppercase text-primary mb-2 underline decoration-2 underline-offset-4">5. Age Restriction</h3>
            <p>SummerDash is intended for users who are at least 18 years of age. By using the platform, you represent that you meet this age requirement and have the legal capacity to enter into these agreements.</p>
        </section>

        <section>
            <h3 className="text-lg font-black uppercase text-primary mb-2 underline decoration-2 underline-offset-4">6. Security Measures</h3>
            <p>We implement a variety of security measures to maintain the safety of the frontend interface. However, no method of transmission over the Internet or method of electronic storage is 100% secure. We cannot guarantee absolute security of your off-chain data.</p>
        </section>
    </LegalModal>
);
