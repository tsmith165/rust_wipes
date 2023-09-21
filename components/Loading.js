import React from 'react';
import styles from '../styles/components/Loading.module.scss'
  
class Loading extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={styles.page_container}>
                <div className={styles.loader}/>
            </div>
        )
    }
}

export default Loading;
