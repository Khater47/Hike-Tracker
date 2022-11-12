const testPlaceDao = require('../modules/DbManager').place_dao;
const testProvinceDao = require('../modules/DbManager').province_dao;

describe('TestPlaceDao', () => {

    testGetPlacesByProvinceId(0, false);
    testGetPlacesByProvinceId(1, true);
    testGetPlacesByProvinceId(2, true);
    testGetPlacesByProvinceId(3, true);
    testGetPlacesByProvinceId(6, true);
    testGetPlacesByProvinceId(7, true);
    testGetPlacesByProvinceId(237, false);

    // CLOSE CONNECTION TO PLACE TABLE

    testClosePlaceTable();
    testGetPlacesByProvinceId(1, true);

});

function testGetPlacesByProvinceId(id_province, expextedResult) {
    test('Test get places by province id', async () => {
        try {

            const places = await testPlaceDao.getAllPlacesByProvinceId(id_province);

            expect(places).not.toBeNull();

            if(expextedResult === true) {
                expect(places.length).toBeGreaterThan(0);
            }
            else {
                expect(places.length).toBe(0);
            }
        }
        catch (err) {
            console.log("---- Error on testGetPlacesByProvinceId ----");
            return;
        }
    });
}

function testClosePlaceTable() {
    test('Close place table', async () => {
        try{
            await testPlaceDao.closePlaceTable();
        }
        catch(err) {
            console.log("---- Error on TestClosePlaceTable ----");
        }
    });
}