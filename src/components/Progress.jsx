import React from 'react';
import theme from '../theme';

let styles = {
    root: {
        
    }
};

class Progress extends React.Component {
    render() {
    	const { classes, ...props } = this.props;
    	return <div style={styles.root} {...props}>loading...</div>;
    }
}


export default Progress;
