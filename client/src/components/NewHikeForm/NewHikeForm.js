import { Form, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ReferencePoints from './ReferencePoints';
import DifficultyLevel from './DifficultyLevel';
import EndPoint from './EndPoint';
import Title from './Title';
import Province from './Province';
import Municipality from './Municipality';
import Length from './Length';
import ExpectedTime from './ExpectedTime';
import Ascent from './Ascent';
import StartPoint from './StartPoint';
import Description from './Description';
import API from '../../API/api';
import styles from './index.module.scss';
import GPXFile from './GPXFile';
import Map from '../MapComponent/Map';
import FileInput from '../FileInput/FileInput';
import { getBase64 } from '../../helpers/utility';

export default function NewHikeForm(props) {
	const { setUpdateHikes, setShowAddNewHikeSuccess, setShowAddNewHikeError } = props;
	const [title, setTitle] = useState('');
	const [province, setProvince] = useState({});
	const [municipality, setMunicipality] = useState('');
	const [length, setLength] = useState('');
	const [expectedTime, setExpectedTime] = useState('');
	const [ascent, setAscent] = useState('');
	const [difficulty, setDifficulty] = useState('');
	const [startPoint, setStartPoint] = useState({});
	const [endPoint, setEndPoint] = useState({});
	const [referencePoints, setReferencePoints] = useState([]);
	const [gpxFile, setGpxFile] = useState('');
	const [description, setDescription] = useState('');
	const [refPoint, setRefPoint] = useState({});
	const [gpxPoints, setGpxPoints] = useState({});
	const [validated, setValidated] = useState(false);
	const [isFormValid, setIsFormValid] = useState(false);
	const [inputValueMunicipality, setInputValueMunicipality] = useState('');
	const [hikeImage, setHikeImage] = useState(null);
	const [hikeImage64, setHikeImage64] = useState(null);

	const navigate = useNavigate();

	useEffect(() => {
		const loadFile = () => {
			getBase64(hikeImage).then((result) => setHikeImage64(result));
		};
		if (hikeImage) {
			loadFile();
		}
	}, [hikeImage]);

	const handleSubmit = (event) => {
		event.preventDefault();
		let valid = true;
		const form = event.currentTarget;
		const hike = {
			title: title,
			province: province?.prov_istat_code_num,
			municipality: municipality,
			length: length,
			expectedTimeString: expectedTime,
			expectedTime: 0,
			ascent: ascent,
			difficulty: difficulty,
			startPoint: startPoint,
			endPoint: endPoint,
			referencePoints: referencePoints,
			gpxData: JSON.stringify(gpxPoints),
			description: description,
			image: hikeImage64
		};

		const time = hike.expectedTimeString.split(' ');
		let hours = 0;
		time.forEach((part) => {
			if (part[part.length - 1] === 'h') {
				const p = part.slice(0, part.length - 1);
				const h = parseInt(p, 10);
				hours += h;
			} else if (part[part.length - 1] === 'm') {
				const p = part.slice(0, part.length - 1);
				const m = parseInt(p, 10);
				hours += m / 60;
			}
		});
		hike.expectedTime = hours;
		hike.difficulty = parseInt(difficulty, 10);
		hike.ascent = parseInt(ascent, 10);
		hike.length = parseInt(length, 10);

		const addNewHike = async () => {
			await API.createNewHike(hike)
				.then(() => {
					setShowAddNewHikeSuccess(true);
					setUpdateHikes((prevstate) => prevstate + 1);
				})
				.catch(() => setShowAddNewHikeError(true))
				.finally(() =>
					setTimeout(() => {
						setShowAddNewHikeError(false);
						setShowAddNewHikeSuccess(false);
					}, 2500)
				);
		};

		if (
			province === '' ||
			municipality === '' ||
			startPoint.type === '' ||
			(startPoint.type === 'Hut/Parking lot' && (startPoint.lat === '' || startPoint.lon === '')) ||
			endPoint.type === '' ||
			(endPoint.type === 'Hut/Parking lot' && (endPoint.lat === '' || endPoint.lon === '')) ||
			(startPoint.type === 'Address/Name of location' &&
				(startPoint.lat === '' || startPoint.lon === '')) ||
			(endPoint.type === 'Address/Name of location' &&
				(endPoint.lat === '' || endPoint.lon === '')) ||
			hikeImage64 === null
		) {
			valid = false;
		}

		if (form.checkValidity() === false || !valid) {
			setIsFormValid(false);
			event.stopPropagation();
		} else {
			setIsFormValid(true);
			addNewHike();
			navigate('/');
		}
		setValidated(true);
	};

	const addRefPoint = () => {
		let list;
		if (refPoint.type === 'Hut/Parking lot') {
			if (referencePoints.find((point) => point.id === refPoint.id) === undefined) {
				API.getPlaceById(refPoint.id)
					.then((place) => {
						list = [...referencePoints, place];
						return list;
					})
					.then((list) => setReferencePoints(list));
			}
		} else if (
			refPoint.type === 'Address/Name of location' ||
			refPoint.type === 'GPS coordinates'
		) {
			if (referencePoints.find((point) => point.id === refPoint.id) === undefined) {
				list = [...referencePoints, refPoint];
				setReferencePoints(list);
			}
		}
	};

	const delRefPoint = (pointId) => {
		const list = referencePoints.filter((element) => element.id !== pointId);
		setReferencePoints(list);
	};

	useEffect(() => {
		setMunicipality('');
		setInputValueMunicipality('');
	}, [JSON.stringify(gpxPoints)]);

	return (
		<Form className="text-start" noValidate validated={validated} onSubmit={handleSubmit}>
			<Row className="mb-3">
				<Col>
					{/*Title field*/}
					<Title title={title} setTitle={setTitle} />
				</Col>
				<Col>
					{/*Province field*/}
					<Province province={province} setProvince={setProvince} validated={validated} />
					{/*Municipality field*/}
					{Object.keys(province).length !== 0 ? (
						<Municipality
							municipality={municipality}
							setMunicipality={setMunicipality}
							province={province}
							validated={validated}
							setInputValueMunicipality={setInputValueMunicipality}
							inputValueMunicipality={inputValueMunicipality}
						/>
					) : (
						''
					)}
				</Col>
			</Row>

			<Row className="mb-3">
				<Col>
					{/*Length field*/}
					<Length length={length} setLength={setLength} />
				</Col>
				<Col>
					{/*Expected time field*/}
					<ExpectedTime expectedTime={expectedTime} setExpectedTime={setExpectedTime} />
				</Col>
				<Col>
					{/*Ascent field*/}
					<Ascent ascent={ascent} setAscent={setAscent} />
				</Col>
			</Row>

			{/*Third row contains difficulty level*/}
			<Row className="mb-3">
				<Col>
					<DifficultyLevel setDifficulty={setDifficulty} />
				</Col>
			</Row>

			{/*Fourth row contains the start and end points*/}
			<Row className="mb-3">
				<Col>
					{/*Start point field*/}
					<StartPoint
						startPoint={startPoint}
						setStartPoint={setStartPoint}
						province={province}
						validated={validated}
						endPoint={endPoint}
						referencePoints={referencePoints}
					/>
				</Col>
				<Col>
					{/*End point field*/}
					<EndPoint
						endPoint={endPoint}
						setEndPoint={setEndPoint}
						province={province}
						validated={validated}
						startPoint={startPoint}
						referencePoints={referencePoints}
					/>
				</Col>
			</Row>

			<Row className="mb-3">
				<Col>
					<GPXFile
						gpxFile={gpxFile}
						setGpxFile={setGpxFile}
						setGpxPoints={setGpxPoints}
						setLength={setLength}
						setAscent={setAscent}
						setProvince={setProvince}
						setMunicipality={setMunicipality}
					/>
					{gpxPoints?.length > 0 && <Map gpxPoints={gpxPoints} />}
				</Col>
			</Row>

			{/*Fifth row contains Reference points*/}
			<Row className="mb-3">
				<Col>
					<ReferencePoints
						referencePoints={referencePoints}
						setReferencePoints={setReferencePoints}
						refPoint={refPoint}
						setRefPoint={setRefPoint}
						addRefPoint={addRefPoint}
						delRefPoint={delRefPoint}
						province={province}
						startPoint={startPoint}
						endPoint={endPoint}
					/>
				</Col>
			</Row>

			<Row className="mb-3">
				{/*Image field*/}
				<Col>
					<FileInput
						title={'Upload a image of the track'}
						required={true}
						accept={'.png, .jpeg, .jpg'}
						onChange={setHikeImage}
						value={hikeImage}
						description={'File type accepted: .png, .jpeg, jpg'}
						errorText={'Please insert a valid file for the image'}
					/>
				</Col>
			</Row>

			{/*Final row with the description field*/}
			<Row className="mb-3">
				{/*Description field*/}
				<Col>
					<Description description={description} setDescription={setDescription} />
				</Col>
			</Row>

			{/*Submit button*/}
			<Row className="my-5">
				<Col className="mb-4">
					<Button className={styles.button} type="submit">
						Submit
					</Button>
					{validated && !isFormValid && (
						<span className={styles.disclaimer}>Fill all required fields</span>
					)}
				</Col>
			</Row>
		</Form>
	);
}
