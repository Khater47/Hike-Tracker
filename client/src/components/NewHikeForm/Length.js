import { Form, Col } from 'react-bootstrap';

export default function Length(props) {
	return (
		<Form.Group as={Col} md="4">
			<Form.Label>Length</Form.Label>
			<Form.Control
				type="number"
				value={props.length}
				onChange={(event) => props.setLength(event.target.value)}
			/>
			<Form.Text className="text-muted">Length of the hike in KM.</Form.Text>
		</Form.Group>
	);
}
