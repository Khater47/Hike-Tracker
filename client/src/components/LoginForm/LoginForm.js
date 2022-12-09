import { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../API/api';
import styles from './index.module.scss';

export default function LoginForm(props) {
	const { setShowWelcomeModal } = props;
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [err, setErr] = useState(false);
	const navigate = useNavigate();
	const [validated, setValidated] = useState(false);

	// login function, passed as props to loginForm
	const login = async (credentials) => {
		try {
			const user = await API.logIn(credentials);
			props.setLoggedIn(true);
			props.setUser(user);
			setShowWelcomeModal(true);
			setTimeout(() => {
				setShowWelcomeModal(false);
			}, 2500);
			return true;
		} catch (err) {
			return false;
		}
	};

	function handleSubmit(event) {
		const form = event.currentTarget;
		const credentials = { username, password };
		event.preventDefault();
		if (form.checkValidity() === false) {
			event.stopPropagation();
		} else {
			login(credentials)
				.then((val) => {
					val ? setErr(false) : setErr(true);
					return val;
				})
				.then((val) => {
					if (val) {
						navigate('/');
					}
				});
		}
		setValidated(true);
	}

	function handlePasswordChange(event) {
		setPassword(event.target.value);
	}

	function handleUsernameChange(event) {
		setUsername(event.target.value);
	}

	return (
		<>
			<Row>
				<Col xs={{ span: 12 }} md={{ span: 4, offset: 4 }}>
					<Form noValidate validated={validated} onSubmit={handleSubmit}>
						<FloatingLabel label="Email" controlId="Email" className="my-5">
							<Form.Control
								className={styles.customInsert}
								type="email"
								placeholder="email@example.com"
								value={username}
								onChange={handleUsernameChange}
								required={true}
							/>
							<Form.Control.Feedback type="invalid">
								Please enter a valid email
							</Form.Control.Feedback>
						</FloatingLabel>
						<FloatingLabel
							label="Password"
							controlId="password"
							className="my-5"
						>
							<Form.Control
								className={styles.customInsert}
								type="password"
								value={password}
								onChange={handlePasswordChange}
								placeholder="Password"
								required={true}
								minLength={8}
							/>
							<Form.Control.Feedback type="invalid">
								Password must be at least 8 characters
							</Form.Control.Feedback>
						</FloatingLabel>
						{err ? (
							<p className="text-danger">
								Wrong Email or/and password. Also check that you have confirmed
								your email if you have just registered
							</p>
						) : null}
						<Button className={styles.button} size="lg" type="submit">
							Login
						</Button>
					</Form>
					<div className={`${styles.goToRegistrationContainer} pb-5`}>
						<span>Don't you have a account yet? </span>
						<Link to="/signup" className={styles.link}>
							Register now
						</Link>
					</div>
				</Col>
			</Row>
		</>
	);
}
