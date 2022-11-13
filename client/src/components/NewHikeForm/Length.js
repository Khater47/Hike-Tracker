import { Form, Col } from 'react-bootstrap';
import styles from "./index.module.scss";


export default function Length(props) {
	return (
		<Form.Group as={Col} md="4">
			<Form.Label className={styles.title}>Length</Form.Label>
			<Form.Control
			    className={styles.customInsert}
				type="number"
				value={props.length}
				onChange={(event) => props.setLength(event.target.value)}
				required={true}
				placeholder="0"
				min={0}
				max={40075}
			/>
			<Form.Text className="text-muted">Length of the hike in KM.</Form.Text>
		</Form.Group>
	);
}
