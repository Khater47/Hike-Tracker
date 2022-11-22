import React, { useEffect, useState } from 'react';
import './styles/base.scss';
import NavbarHead from './components/Navbar/navbar';
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate
} from 'react-router-dom';
import HomePage from './pages/HomePage';
import NewHike from './pages/NewHike';
import WrongPath from './pages/WrongPath';
import Login from './pages/Login';
import Signup from './pages/Signup';
import API from './API/api';
import InfoModalComponent from './components/InfoModalComponent/InfoModalComponent';
import { faCheckCircle, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';

function App() {
	return (
		<Router>
			<App2 />
		</Router>
	);
}

function App2() {
	const [loggedIn, setLoggedIn] = useState(false);
	const [hikes, setHikes] = useState([]);
	const [filters, setFilters] = useState([]);
	const [facets, setFacets] = useState({});
	const [provincesFacets, setProvincesFacets] = useState([]);
	const [user, setUser] = useState({});
	const [updateHikes, setUpdateHikes] = useState(0);
	const [showWelcomeModal, setShowWelcomeModal] = useState(false);
	const [showLogoutModal, setShowLogoutModal] = useState(false);
	const [showAddNewHikeSuccess, setShowAddNewHikeSuccess] = useState(false);
	const [showAddNewHikeError, setShowAddNewHikeError] = useState(false);

	const getHikes = async (dataOnRequest) => {
		try {
			const { hikes, ...others } = await API.getAllHikes(dataOnRequest);
			setHikes([...hikes].sort((a,b)=>a.province.localeCompare(b.province)));//ORDER BY PROVINCE ASC BY DEFAULT
			if (Object.keys(facets).length === 0) {
				setFacets({
					...others
				});
			}
		} catch (err) {
			console.log(err);
		}
	};

	const getDataOnRequest = () => {
		const provinceFilter =
			filters
				.filter((filterEle) => filterEle.key === 'provinces')
				?.map((ele) => ele.id)?.[0] || null;
		const difficultyFilter =
			filters
				.filter((filterEle) => filterEle.key === 'difficulty')
				?.map((ele) => ele.id) || [];
		const expTimeFilter =
			filters.filter((filterEle) => filterEle.key === 'expected-time')?.[0]
				?.values || [];
		const lengthFilter =
			filters.filter((filterEle) => filterEle.key === 'length')?.[0]?.values ||
			[];
		const ascentFilter =
			filters.filter((filterEle) => filterEle.key === 'ascent')?.[0]?.values ||
			[];

		const newObj = {
			province: provinceFilter,
			difficulty: difficultyFilter,
			exp_time:
				expTimeFilter?.length === 2
					? { min: expTimeFilter[0], max: expTimeFilter[1] }
					: null,
			length:
				lengthFilter?.length === 2
					? { min: lengthFilter[0], max: lengthFilter[1] }
					: null,
			ascent:
				ascentFilter?.length === 2
					? { min: ascentFilter[0], max: ascentFilter[1] }
					: null
		};

		return newObj;
	};

	useEffect(() => {
		const checkAuth = async () => {
			const user = await API.getUserInfo();
			if (user) {
				setLoggedIn(true);
				setUser(user);
			}
		};
		checkAuth();
	}, []);

	useEffect(() => {
		getHikes(getDataOnRequest());
	}, [filters, updateHikes]);

	useEffect(() => {
		API.getProvincesFacets().then((response) => setProvincesFacets(response));
	}, []);

	return (
		<div className="App">
			<NavbarHead
				loggedIn={loggedIn}
				setLoggedIn={setLoggedIn}
				user={user}
				setUser={setUser}
				setShowLogoutModal={setShowLogoutModal}
			/>
			<main className="main-wrap">
				<Routes>
					{/* to insert route */}
					<Route
						path="/"
						element={
							<HomePage
								hikes={hikes}
								setHikes={setHikes}
								filters={filters}
								setFilters={setFilters}
								facets={facets}
								provincesFacets={provincesFacets}
							/>
						}
					/>
					<Route
						path="/newHike"
						element={
							loggedIn && user.role === 'Local guide' ? (
								<NewHike setUpdateHikes={setUpdateHikes} setShowAddNewHikeSuccess={setShowAddNewHikeSuccess} setShowAddNewHikeError={setShowAddNewHikeError}/>
							) : (
								<Navigate to="/login" replace />
							)
						}
					/>
					<Route
						path="/login"
						element={
							loggedIn ? (
								<Navigate to="/" replace />
							) : (
								<Login setLoggedIn={setLoggedIn} setUser={setUser} setShowWelcomeModal={setShowWelcomeModal}/>
							)
						}
					/>
					<Route path="/signup" element={
							loggedIn ? (
								<Navigate to="/" replace />
							) : (
								<Signup setLoggedIn={setLoggedIn} setUser={setUser} setShowWelcomeModal={setShowWelcomeModal}/>
							)
						} />
					<Route path="*" element={<WrongPath />} />
				</Routes>
				<InfoModalComponent
					show={showWelcomeModal}
					title="Logged in successfully"
					subtitle={`Welcome ${user.name}, you are logged in successfully`}
					icon={faCheckCircle}
				/>
				<InfoModalComponent
					show={showLogoutModal}
					subtitle={`Logged out successfully`}
					icon={faCheckCircle}
				/>
				<InfoModalComponent
					show={showAddNewHikeSuccess}
					title="Success!"
					subtitle={`New hike added successfully`}
					icon={faCheckCircle}
				/>
				<InfoModalComponent
					show={showAddNewHikeError}
					title="Error"
					subtitle={`Oh no... there was a problem, try later`}
					icon={faXmarkCircle}
					success={false}
				/>
				<div id="modal-root" />
			</main>
		</div>
	);
}


export default App;
