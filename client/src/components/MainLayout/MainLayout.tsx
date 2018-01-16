import * as React from 'react';
import * as styles from './MainLayout.css';
import { Header } from './Header';

export function MainLayout({ children, location }: any) {
    return (
        <div className={styles.normal}>
            <Header location={location} />
            <div className={styles.content}>
                <div className={styles.main}>{children}</div>
            </div>
        </div>
    );
}
