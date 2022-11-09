class HikeDAO {

    sqlite = require('sqlite3');

    constructor(db, knex) {
        this.db = db;
        this.knex = knex;
    }

    // close the connection to database
    closeHikeTable = () => {
        return new Promise((resolve, reject) => {
            this.db.close();
            resolve(true);
        });
    }

    // create the service table
    newHikeTable = () => {
        return new Promise((resolve, reject) => {

            const sql = "CREATE TABLE IF NOT EXISTS HIKE(id_hike INTEGER NOT NULL, name TEXT, id_start_place INTEGER NOT NULL, id_end_place INTEGER NOT NULL, description TEXT, length REAL, expected_time REAL, ascent INTEGER, difficulty INTEGER, geographical_area TEXT, FOREIGN KEY(id_end_place) REFERENCES PLACE(id_place), FOREIGN KEY(id_start_place) REFERENCES PLACE(id_place), PRIMARY KEY(id_hike AUTOINCREMENT));";
            this.db.run(sql, (err) => {
                if (err) {
                    console.log('Error running sql: ' + sql);
                    console.log(err);
                    reject(err);
                }
                resolve(this.lastID);
            });
        });
    }

    // drop the service table
    dropHikeTable = () => {
        return new Promise((resolve, reject) => {
            const sql = "DROP TABLE IF EXISTS HIKE;";
            this.db.run(sql, function (err) {
                if (err) {
                    console.log('Error running sql: ' + sql);
                    console.log(err);
                    reject(err);
                }
                resolve(this.lastID);
            })

        });
    }

    /* 
        Difficulties -> Integer:

        0 -> tourist
        1 -> hiker
        2 -> professional hiker

    */

    // get all filtered hikes
    getAllFilteredHikes = (filters) => {

        let sql = this.knex.select('HIKE.name', 'HIKE.id_hike', 'HIKE.description', 'P1.description as START_PLACE', 'P2.description as END_PLACE', 'HIKE.length', 'HIKE.expected_time', 'HIKE.ascent', 'HIKE.difficulty', 'HIKE.geographical_area')
            .from('HIKE')
            .join('PLACE as P1', { 'P1.id_place': 'HIKE.id_start_place' })
            .join('PLACE as P2', { 'P2.id_place': 'HIKE.id_end_place' });

        if (filters.geo_area.length !== 0) {
            sql = sql.whereIn('HIKE.geographical_area', filters.geo_area);
        }
        if (filters.difficulty.length !== 0) {
            sql = sql.whereIn('HIKE.difficulty', filters.difficulty);
        }
        if (filters.exp_time !== null) {
            sql = sql.whereBetween('HIKE.expected_time', [filters.exp_time.min, filters.exp_time.max]);
        }
        if (filters.length !== null) {
            sql = sql.whereBetween('HIKE.length', [filters.length.min, filters.length.max]);
        }
        if (filters.ascent !== null) {
            sql = sql.whereBetween('HIKE.ascent', [filters.ascent.min, filters.ascent.max]);
        }

        //We can decide to do the query with knex or with sqlite

        /*return new Promise((resolve, reject) => {
            sql.then((rows) => {
                const hikes = rows.map((el) => {
                    return {
                        name: el.name,
                        key: el.id_hike,
                        description: el.description,
                        start_place: el.START_PLACE,
                        end_place: el.END_PLACE,
                        length: el.length,
                        expected_time: el.expected_time,
                        ascent: el.ascent,
                        difficulty: el.difficulty,
                        geographical_area: el.geographical_area,
                    }
                });
                resolve(hikes);
            }).catch((err) => {
                console.log(err);
                reject(err);
            });
        });*/

        return new Promise((resolve, reject) => {
            this.db.all(sql.toString(), [], (err, rows) => {
                if (err) {
                    console.log('Error running sql: ' + sql);
                    console.log(err);
                    reject(err);
                } else {

                    const hikes = rows.map((el) => {
                        return {
                            name: el.name,
                            key: el.id_hike,
                            description: el.description,
                            start_place: el.START_PLACE,
                            end_place: el.END_PLACE,
                            length: el.length,
                            expected_time: el.expected_time,
                            ascent: el.ascent,
                            difficulty: el.difficulty,
                            geographical_area: el.geographical_area,
                        }
                    });
                    resolve(hikes);
                }
            });
        });
    };
}

module.exports = HikeDAO;