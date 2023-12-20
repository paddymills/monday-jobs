import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch, faCheck } from '@fortawesome/free-solid-svg-icons';
import './terminal.css';

const icons = {
	pending: <FontAwesomeIcon className="spin" icon={faCircleNotch} spin />,
	complete: <FontAwesomeIcon className="check" icon={faCheck} />
};

function ListItem(props) {
	return (
		<p id={props.id}>
			{icons[props.state]}
			{props.value}
		</p>
	);
}

export default class Terminal extends React.Component {
	constructor(props) {
		super(props);

		// Default state
		this.state = {
			order: [],
			items: {}
		};
	}

	pushItem(item) {
		this.setState((state, _) => ({
			order: [...state.order, item.id],
			items: Object.assign(state.items, { [item.id]: item })
		}));
	}

	pushStatus(statusText, level) {
		const newItem = {
			id: Math.floor(Math.random() * 1000),
			level: level || 1,
			state: 'pending',
			value: statusText
		};

		this.pushItem(newItem);

		return newItem.id;
	}

	updateItemValue(id, val) {
		this.setState((state, _) => {
			let listItems = Object.assign({}, state.items);
			listItems[id].value = val;

			return { items: listItems };
		});
	}

	updateItemState(id, newState) {
		this.setState((state, _) => {
			let listItems = Object.assign({}, state.items);
			listItems[id].state = newState;

			return { items: listItems };
		});
	}

	lineText(line) {
		const indent = '--'.repeat(line.level - 1);
		const head = line.level > 1 ? '>' : '';

		return ` ${indent}${head} ${line.value}`;
	}

	render() {
		const tty = this.state.order.map((id) => {
			const line = Object.assign({}, this.state.items[id]);

			return <ListItem id={id} key={id} state={line.state} value={this.lineText(line)} />;
		});

		return <div className="terminal">{tty}</div>;
	}
}
