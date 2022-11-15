import React from 'react';

import Navbar from './Navbar'

class Layout extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
                <Navbar url={this.props.url}/>
                {this.props.children}
            </>
        )
    }
}

export default Layout;