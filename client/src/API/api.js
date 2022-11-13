const APIURL = new URL("http://localhost:3001/api/");

async function getAllHikes(data) {
    // call: POST /api/hikes
    let err = new Error();
    const response = await fetch(new URL("hikes", APIURL), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data) 
    });
    if (response.ok) {
      const hikesJson = await response.json();
      const hikes = hikesJson?.hikes?.map((r) => ({
        startPlace: r.start_place,
        endPlace: r.end_place,
        pathLength: r.length,
        expTime: r.expected_time,
        ascent: r.ascent,
        difficulty: r.difficulty,
        key: r.key,
        name: r.name,
        description: r.description,
        province : r.province
      }));
      return {
        hikes: hikes,
        distinctTimes: hikesJson?.distinct_times || [],
        distinctLengths: hikesJson?.distinct_lengths || [],
        distinctAscents: hikesJson?.distinct_ascents || [],
      }
    } else {
      if (response.status === 500) {
        err.message = "500 INTERNAL SERVER ERROR";
        throw err;
      }
    }
}

const getProvinces = async () => {
  let err = new Error();
  const response = await fetch(new URL("provinces", APIURL));
  if (response.ok) {
    const provincesJson = await response.json();
    const provinces = provincesJson?.map(province => ({
      id: province.id_province,
      value: province.name,
      label: province.name,
      abbreviation: province.abbreviation
    }))
    return provinces;
  } else {
    if (response.status === 500) {
      err.message = "500 INTERNAL SERVER ERROR";
      throw err;
    }
  }
}

const API = {
    getAllHikes,
    getProvinces,
}
export default  API ;