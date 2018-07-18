import React from 'react';
import theme from '../theme';

let styles = {
    root: {
        
    }
};

class Button extends React.Component {
    render() {
    	const { children, classes, component, onClick, ...props } = this.props;
    	switch (component) {
    		case "a":
    			return <a style={styles.root} role="button" {...props}>{children}</a>;
    		default:
    			return <button style={styles.root} onClick={onClick} {...props}>{children}</button>;
    	}
    }
}


export default Button;
