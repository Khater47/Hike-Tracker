const APIURL = new URL("http://localhost:3001/api/");

async function getAllHikes() {
    // call: GET /api/hikes
    let err = new Error();
    const response = await fetch(new URL("hikes", APIURL));
    if (response.ok) {
      const hikesJson = await response.json();
      return hikesJson.map((r) => ({
        startPlace: r.start_place,
        endPlace: r.end_place,
        pathLength: r.length,
        expTime: r.expected_time,
        ascent: r.ascent,
        difficulty: r.difficulty,
        key: r.key,
        name: r.name,
        description: r.description
      }));
    } else {
      if (response.status === 500) {
        err.message = "500 INTERNAL SERVER ERROR";
        throw err;
      }
    }
}  
const API = {
    getAllHikes,
}
export default  API ;