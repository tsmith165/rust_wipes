import React from 'react';

import styles from "../styles/components/InputComponent.module.scss";

import Tooltip from '@mui/material/Tooltip';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import CachedIcon from '@material-ui/icons/Cached';

// INPUT TYPES
const INPUT_TYPE_MASTER = {
    'input': {name: "Input"},
    'input_split': {name: "Input Split"},
    'input_and_refresh': {name: "Input and Button"},
    'input_datepicker': {name: "Input Datepicker"},
    'input_select': {name: "Input Select"},
}

export default class InputComponent extends React.Component {
    constructor(props) {
        super(props);
        this.type = this.props.type
        this.default = this.props.default
        this.name = this.props.name
        this.full_name = (this.props.full_name !== undefined) ? (this.props.full_name) : (this.name)
        this.id = `${this.props.name.toLowerCase().replace(' ', '_')}`
    }

    render() {
        // console.log(`Generating input container of type: ${INPUT_TYPE_MASTER[this.type].name}`)
        
        if (this.type == 'input') {
            return (
                <div className={styles.input_container}>
                    <Tooltip title={this.full_name} placement="top-start">
                        <div className={styles.input_label_container}>
                            <div className={styles.input_label}>{this.name}</div>
                        </div>
                    </Tooltip>
                    <input 
                        id={this.id}
                        className={styles.input_textbox} 
                        defaultValue={this.default} 
                        onChange={(e) => {
                            e.preventDefault();
                            const changed_value = document.getElementById(this.id).value; 
                            console.log(`NEW VALUE FOR ${this.id}: ${changed_value}`); 
                            this.props.update_filter_value(this.id, changed_value)
                        }
                    }/>
                </div>
            )
        }
        else if (this.type == 'input_split') {
            return (
                <div className={styles.input_split_container}>
                    <Tooltip title={this.full_name} placement="top-start">
                        <div className={styles.input_label_container}>
                            <div className={styles.input_label}>{this.name}</div>
                        </div>
                    </Tooltip>
                    <input 
                        id={this.id}
                        className={styles.input_textbox} 
                        defaultValue={this.default} 
                        onChange={(e) => {
                            e.preventDefault();
                            const changed_value = document.getElementById(this.id).value; 
                            console.log(`NEW VALUE FOR ${this.id}: ${changed_value}`); 
                            this.props.update_filter_value(this.id, changed_value)
                        }
                    }/>
                </div>
            )
        }
        else if (this.type == 'input_and_refresh') {
            return (
                <div className={styles.input_and_button_container}>
                    <div className={styles.input_container}>
                        <Tooltip title={this.full_name} placement="top-start">
                            <div className={styles.input_label_container}>
                                <div className={styles.input_label}>{this.name}</div>
                            </div>
                        </Tooltip>
                        <input 
                            id={this.id}
                            className={styles.input_textbox} 
                            defaultValue={this.default}
                            onChange={(e) => {
                                e.preventDefault();
                                const changed_value = document.getElementById(this.id).value; 
                                console.log(`NEW VALUE FOR ${this.id}: ${changed_value}`); 
                                this.props.update_filter_value(this.id, changed_value)
                            }
                        }/>
                    </div>
                    <div 
                        className={`${styles.button_container} ${this.props.state.running ? (styles.running_background) : ('')}`} 
                        onClick={(e) => {e.preventDefault(); this.props.button_function(); }}
                    >
                        <CachedIcon className={`${styles.button_icon} ${this.props.state.refreshing ? (styles.rotate) : ('')}`} />
                    </div>
                </div>
            )
        }
        else if (this.type == 'input_datepicker') {
            return (
                <div className={styles.input_split_container}>
                    <Tooltip title={this.full_name} placement="top-start">
                        <div className={styles.input_label_container}>
                            <div className={styles.input_label}>{this.name}</div>
                        </div>
                    </Tooltip>
                    <DatePicker
                        id={this.id}
                        className={styles.date_picker}
                        selected={this.props.state.date} 
                        onChange= { (date) => {
                            console.log(`NEW DATE SELECTED: ${date}`); 
                            this.props.update_filter_value(this.id, date)
                            }
                        } 
                    />
                </div>
            )
        }
        else if (this.type == 'input_select') {
            return (
                <div className={styles.input_split_container}>
                    <div className={styles.input_label_container}>
                        <div className={styles.input_label}>{this.name}</div>
                    </div>
                    <select 
                        id={this.id}
                        className={`${styles.input_select}`} 
                        defaultValue={this.default}
                        onChange={(e) => {
                            e.preventDefault();
                            const changed_value = document.getElementById(this.id).value; 
                            console.log(`NEW VALUE FOR ${this.id}: ${changed_value}`); 
                            this.props.update_filter_value(this.id, changed_value)
                        }}
                    >
                        {this.props.select_options.map(function(select_option, i) {
                            var [option_value, option_string] = select_option
                            return <option value={option_value} key={i}>{`${option_string}`}</option>;
                        })}
                    </select>
                </div>
            )
        }
    }
}