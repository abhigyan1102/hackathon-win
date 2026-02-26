'use client';

import React, { FormEvent } from 'react';
import styles from './page.module.css';

export default function LoginPage() {
    const signIn = (e: FormEvent) => {
        e.preventDefault();
        console.log('User signed in!');
    };

    const signUp = (e: FormEvent) => {
        e.preventDefault();
        console.log('User signed up!');
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-950 relative overflow-hidden">
            {/* Dark Glassmorphism Background Effects */}
            <div className="absolute w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] top-[-100px] left-[-100px]"></div>
            <div className="absolute w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[120px] bottom-[-50px] right-[-50px]"></div>

            <div className="z-10 bg-white/5 backdrop-blur-xl border border-white/10 p-16 rounded-3xl shadow-2xl flex flex-col items-center justify-center">
                <div className={styles.wrapper}>
                    <div className={styles.cardSwitch}>
                        <label className={styles.switch}>
                            <input type="checkbox" className={styles.toggle} />
                            <span className={styles.slider}></span>
                            <span className={styles.cardSide}></span>

                            <div className={styles.flipCardInner}>
                                <div className={styles.flipCardFront}>
                                    <div className={styles.title}>Log in</div>
                                    <form className={styles.flipCardForm} onSubmit={signIn}>
                                        <input className={styles.flipCardInput} name="email" placeholder="Email" type="email" required />
                                        <input className={styles.flipCardInput} name="password" placeholder="Password" type="password" required />
                                        <button className={styles.flipCardBtn} type="submit">Let&apos;s go!</button>
                                    </form>
                                </div>

                                <div className={styles.flipCardBack}>
                                    <div className={styles.title}>Sign up</div>
                                    <form className={styles.flipCardForm} onSubmit={signUp}>
                                        <input className={styles.flipCardInput} placeholder="Name" type="text" required />
                                        <input className={styles.flipCardInput} name="email" placeholder="Email" type="email" required />
                                        <input className={styles.flipCardInput} name="password" placeholder="Password" type="password" required />
                                        <button className={styles.flipCardBtn} type="submit">Confirm!</button>
                                    </form>
                                </div>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
