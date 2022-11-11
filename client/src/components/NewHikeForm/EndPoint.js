import { Form, Col } from 'react-bootstrap';

export default function EndPoint(props) {
	const generateOptions = () => {
		/* An api call should be made here to get all reference points points*/
		return (
			<>
				<option key={1} value="Point 1">
					Point 1
				</option>
				<option key={2} value="Point 2">
					Point 2
				</option>
			</>
		);
	};
	return (
		<Form.Group as={Col} md="6">
			<Form.Label>End point</Form.Label>
			<Form.Select
				value={props.endPoint}
				onChange={(event) => props.setEndPoint(event.target.value)}
			>
				<option key={0}>Select point</option>
				{generateOptions()}
			</Form.Select>
		</Form.Group>
	);
}
