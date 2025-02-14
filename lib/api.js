const config = require('./utils/config'),
    getRawClinics = require('./utils/clinics'),
    gtable = require('./utils/gtable'),
    verification = require('./utils/verification'),
    getRating = require('./utils/yandex'),
    sendSelfMessage = require('./utils/email')


const MAX_RATING = 5.0;

const gsApi = gtable.authGetApi(function (err) {
    if (err) {
        console.log(err);
        process.exit(1);
    } else {
        console.log('GAPI module successfully initialized');
    }
});

module.exports = {
    serverPort: config.port,
    getFullClinicsData: async function (name, region) {
        let rawData = getRawClinics(name, region);
        for (const clinic of rawData) {
            try {
                clinic.yandex.rating = await getRating(clinic.yandex.reviews);
                clinic.yandex.rating_percent = (100.0 * clinic.yandex.rating / MAX_RATING) | 0; // make it integer
            } catch (error) {
                clinic.yandex.rating = 'NaN';
                clinic.yandex.rating_percent = 0;
            }
        }
        return rawData;
    },
    getFreeTime: function (name, date) {
        if (!verification.verifyDate(date)) return Promise.reject({code: 400, text: 'Wrong parameters'});

        let clinics = getRawClinics(name, null);
        if (!verification.verifyClinics(clinics)) return Promise.reject({code: 404, text: 'Clinic not found'});

        let spreadsheetId = clinics[0].spreadsheetId;
        return gtable.getFreeTimes(gsApi, spreadsheetId, date)
            .catch(() => Promise.reject({code: 500, text: 'gtable error'}));
    },
    newContact: function (name, number, messenger) {
        if (!(verification.verifyPhone(number) && verification.verifyMessenger(messenger)))
            return Promise.reject({code: 400, text: 'Wrong parameters'});
        return gtable.makeContact(gsApi, name, number, messenger)
            .catch(() => Promise.reject({code: 500, text: 'gtable error'}));
    },
    newAppointment: function (name, date, time, phone, fio, animal, comment) {
        if (!(verification.verifyDate(date) && verification.verifyTime(time) && verification.verifyPhone(phone)))
            return Promise.reject({code: 400, text: 'Wrong parameters'});
        let clinics = getRawClinics(name, null);
        if (!verification.verifyClinics(clinics)) return Promise.reject({code: 404, text: 'Clinic not found'});

        let spreadsheetId = clinics[0].spreadsheetId;
        return gtable.makeAppointment(gsApi, spreadsheetId, date, time, phone, fio, animal, comment)
            .then(() => sendSelfMessage(`'${name}: ${fio}' at '${date} ${time}' with '${phone}'`))
            .catch(() => Promise.reject({code: 500, text: 'gtable or email error'}));
    }
};