import { Form } from 'react-bootstrap';
import styles from './index.module.scss';

export default function ExpectedTime(props) {
	return (
		<Form.Group>
			<Form.Label className={styles.title}>Expected time</Form.Label>
			<Form.Control
				className={styles.customInsert}
				type="text"
				value={props.expectedTime}
				onChange={(event) => props.setExpectedTime(event.target.value)}
				placeholder="Expected time"
				required={true}
			/>
			<Form.Text>Time format: xd xh</Form.Text>
			<Form.Control.Feedback type="invalid">Wrong format.</Form.Control.Feedback>
		</Form.Group>
	);
}
