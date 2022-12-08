'use strict';

const express = require('express');
const { check, body, validationResult } = require('express-validator');
const router = express.Router();
const hikeDao = require('../modules/DbManager').hike_dao;
const placeDao = require('../modules/DbManager').place_dao;

// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}

	return res.status(401).json({ error: 'User not authenticated' });
};

/*** Hikes APIs ***/

// Examples of body:
/*
	{
		"province": null,
		"municipality": null,
		"difficulty": [1],
		"exp_time": { "min": 5.2, "max": 7.0 },
		"length": { "min": 0.0, "max": 15.7 },
		"ascent": { "min": 500, "max": 2000 },
		"range": null,
	}
	{
		"province": 1,
		"municipality": 7078,
		"difficulty": [1,2],
		"exp_time": { "min": 5.6, "max": 9.0 },
		"length": { "min": 0.0, "max": 15.7 },
		"ascent": { "min": 500, "max": 2900 },
		"range": { "center": {"lat": 0.0, "long": 0.0}, "radius": 1000.0 },
	}
*/

//POST /api/hikes
router.post('/hikes',
	body('difficulty').isArray(),
	async (req, res) => {

		if (Object.keys(req.body).length === 0) {
			console.log('Empty body!');
			return res.status(422).json({ error: 'Empty body request' });
		}

		if (Object.keys(req.body).length !== 7) {
			console.log('Data not formatted properly!');
			return res.status(422).json({ error: 'Data not formatted properly' });
		}

		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			console.log("Error in body!");
			return res.status(422).json({ errors: errors.array() });
		}

		try {

			const unique = (value, index, self) => {
				return self.indexOf(value) === index;
			};

			let hikes = await hikeDao.getAllFilteredHikes(req.body);

			let hikes_ranged = [];
			let distinct_ascents = [];
			let distinct_times = [];
			let distinct_lengths = [];
			let result = {};

			if (req.body.range !== null) {

				for (let hike of hikes) {

					const start_place = await hikeDao.getLatLongStartPlaceByHikeId(hike.key);

					/*
						Haversine formula
						lat1, lon1 = latitude and longitude of the center point
						lat2, lon2 = latitude and longitude of the hike's start point
					*/

					const lat1 = req.body.range.center.lat;
					const lon1 = req.body.range.center.long;
					const lat2 = start_place.latitude;
					const lon2 = start_place.longitude;

					let distance = 6372795.477598 *
						Math.acos(Math.sin(toRad(lat2)) *
							Math.sin(toRad(lat1)) +
							Math.cos(toRad(lat2)) *
							Math.cos(toRad(lat1)) *
							Math.cos(toRad(lon2 - lon1)));

					if (distance <= req.body.range.radius) {
						hikes_ranged.push(hike);
					}
				}

				distinct_times = hikes_ranged.map((el) => el.expected_time).filter(unique);
				distinct_lengths = hikes_ranged.map((el) => el.length).filter(unique);
				distinct_ascents = hikes_ranged.map((el) => el.ascent).filter(unique);

				result = {
					hikes: hikes_ranged,
					distinct_times: distinct_times,
					distinct_lengths: distinct_lengths,
					distinct_ascents: distinct_ascents
				};
			} else {

				distinct_times = hikes.map((el) => el.expected_time).filter(unique);
				distinct_lengths = hikes.map((el) => el.length).filter(unique);
				distinct_ascents = hikes.map((el) => el.ascent).filter(unique);

				result = {
					hikes: hikes,
					distinct_times: distinct_times,
					distinct_lengths: distinct_lengths,
					distinct_ascents: distinct_ascents
				};
			}

			return res.status(200).json(result);
		} catch (err) {
			return res.status(500).json({ error: 'Internal Server Error' });
		}
	});

function toRad(Value) {
	return ((Value * Math.PI) / 180);
}

/*			HIKE
	{	
		"title":"Test1",
		"province":1,
		"municipality":7078,
		"length":345,
		"expectedTimeString":"12h",
		"expectedTime":12,
		"ascent":123,
		"difficulty":2,
		"startPoint":9,
		"endPoint":5,
		"referencePoints":[],
		"gpxData":"...",
		"description":"Test1"
	}
*/

/*			POINT
			{
				id: ,
				name: ,
				type: ,
				lat: ,
				lon: 
			}
			*/

//POST /api/newHike
router.post('/newHike',
	isLoggedIn,
	body('title').isString().isLength({ max: 300 }),
	body('province').notEmpty().isInt({ min: 1 }),
	body('municipality').notEmpty().isInt({ min: 1 }),
	body('length').isFloat({ min: 0.0 }),
	body('expectedTimeString').isString().isLength({ max: 20 }),
	body('expectedTime').isFloat({ min: 0.0 }),
	body('ascent').isInt({ min: 0 }),
	body('difficulty').isInt({ min: 1, max: 3 }),
	body('startPoint').notEmpty(),
	body('endPoint').notEmpty(),
	body('referencePoints').isArray(),
	body('gpxData').isString(),
	body('description').isString().isLength({ max: 1000 }),
	async (req, res) => {

		if (Object.keys(req.body).length === 0) {
			console.log('Empty body!');
			return res.status(422).json({ error: 'Empty body request' });
		}

		if (Object.keys(req.body).length !== 13) {
			console.log('Data not formatted properly!');
			return res.status(422).json({ error: 'Data not formatted properly' });
		}

		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			console.log("Error in body!");
			return res.status(422).json({ errors: errors.array() });
		}

		try {

			let idStart = null;
			let idEnd = null;

			//start point
			console.log("start type: " + req.body.startPoint.type);
			if (req.body.startPoint.type == "Hut/Parking lot") {
				idStart = req.body.startPoint.id;
			}
			else {
				//lo inserisco a db
				idStart = await placeDao.insertPlace(req.body.startPoint, req.body.province);
			}
			console.log("idstart: " + idStart);
			//end point
			console.log("end type: " + req.body.endPoint.type);
			if (req.body.endPoint.type == "Hut/Parking lot") {
				idEnd = req.body.endPoint.id;
			}
			else {
				//lo inserisco a db
				idEnd = await placeDao.insertPlace(req.body.endPoint, req.body.province);
			}
			console.log("idend: " + idEnd);
			//result = idhike inserted.
			//now i can enter the data in hike-place table
			const result = await hikeDao.insertHike(req.body, idStart, idEnd);
			// Inserting start point and end point in hike-place table
			await hikeDao.insertHikePlace(result, idStart);
			await hikeDao.insertHikePlace(result, idEnd);
			//reference points
			// insert in hike-place table, cycling on reference points
			for (let i = 0; i < req.body.referencePoints.length; i++) {

				let referencePoint = req.body.referencePoints[i];
				let idReferencePoint = null;

				let place_ok = null;
				console.log("ref type: " + referencePoint.type);
				if (referencePoint.type == "parking lot" || referencePoint.type == "hut") {
					place_ok = await placeDao.getPlaceById(referencePoint.id);
					idReferencePoint = referencePoint.id;
				}
				else {
					//lo inserisco a db
					idReferencePoint = await placeDao.insertPlace(referencePoint, req.body.province);
					place_ok = "ok";
				}
				console.log("idreferencepoint: " + idReferencePoint);

				if (place_ok !== null) {
					await hikeDao.insertHikePlace(result, idReferencePoint);
				}
				else {
					console.log("Place not found!");
					return res.status(404).json({ error: 'Not Found' });
				}
			}

			return res.status(201).json(result);
		} catch (err) {
			console.log(err);
			return res.status(503).json({ error: 'Service Unavailable' });
		}
	});

//GET /api/hikePoints/:id
router.get('/hikePoints/:id',
	isLoggedIn,
	[check('id').notEmpty().isNumeric().isInt({ min: 1 })],
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			console.log('Validation of provinceId failed!');
			return res.status(422).json({ errors: errors.array() });
		}

		if (!req.params) {
			console.log('Error in request parameters!');
			return res.status(422).json({ error: 'Error in request parameters' });
		}

		try {
			const id_hike = req.params.id;

			const hike = await hikeDao.getHikeById(id_hike);

			if (hike === null) {
				return res.status(404).json({ error: 'Not Found' });
			}

			const startPointId = hike.id_start_place;
			const endPointId = hike.id_end_place;
			const gpx = hike.gpx;
			const referencePoints = await hikeDao.getReferencePoints(id_hike);

			let hikePoints = referencePoints.map((el) => {
				return {
					id_place: el.id_place,
					name: el.name,
					description: el.description,
					latitude: el.latitude,
					longitude: el.longitude,
					startPoint: el.id_place === startPointId,
					endPoint: el.id_place === endPointId,
					type: el.type,
				};
			});

			res.status(200).json({ hikePoints: hikePoints, gpx: gpx });
		} catch (err) {
			res.status(500).json({ error: 'Internal Server Error' });
		}
	}
);
module.exports = router;
