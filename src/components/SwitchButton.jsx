import React from 'react';
import theme from '../theme';

let styles = {
    root: {
        position: "relative",
        display: "inline-block",
        width: "30px",
        height: "17px"
    },
    checkbox: {
    	display: "none"
    },
    slider: {
    	borderRadius: "17px",
    	position: "absolute",
  		cursor: "pointer",
  		top: 0,
  		left: 0,
  		right: 0,
  		bottom: 0,
  		backgroundColor: theme.palette.background.default,
  		"-webkit-transition": ".4s",
  		transition: ".4s",
    },
    switch: {
    	borderRadius: "50%",
    	position: "absolute",
    	height: "13px",
    	width: "13px",
    	left: "2px",
    	bottom: "2px",
		backgroundColor: "#212529",
		"-webkit-transition": ".4s",
		transition: ".4s",
    }
};

class SwitchButton extends React.Component {
	state = {
		checked: false
	};
	constructor(props) {
        super(props);
        this.switch = React.createRef();
        if (props.checked !== undefined) {
        	this.state.checked = this.props.checked;
        }
    }

	onChange = () => {
		let { checked } = this.state;
		let switch_button = this.switch.current;
		let transform;
		checked = !checked;
		this.setState({checked: checked});
		transform = (checked) ? 13 : 0;
		switch_button.style.transform = `translate(${transform}px, 0px)`;
	};

    render() {
    	const { classes, label, ...props } = this.props;
    	let { checked } = this.state;
    	styles = Object.assign(classes, styles);
    	return (
    		<label class="switch">
    			<span>{label}:</span>
	            <input type="checkbox" checked={checked} onChange={this.onChange}/>
	            <span ref={this.switch}></span>
	            <span></span>
	        </label>
        );
    }
}

export default SwitchButton;
