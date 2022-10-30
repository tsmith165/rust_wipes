import React from 'react';

import Navbar from './Navbar'

class Layout extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        console.log(`LAYOUT PAGE: ${this.props.page}`)
        return (
            <>
                <Navbar page={this.props.page} setPage={this.props.setPage}/>
                {this.props.children}
            </>
        )
    }
}

export default Layout;