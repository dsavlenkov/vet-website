const path = require('path'),
    express = require('express'),
    exphbs = require('express-handlebars'),
    api = require('./lib/api')

const app = express()

app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'views/layouts')
}))
app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static('public'))

app.get('/api/contact', (request, response) => {
    api.newContact(
        request.query['name'],
        request.query['number'],
        request.query['messenger']
    ).then(
        () => response.send({}),
        err => response.status(err.code).send({err: err.text})
    )
})

app.get('/api/time', (request, response) => {
    api.getFreeTime(
        request.query['name'],
        request.query['date']
    ).then(
        data => response.send(data),
        err => response.status(err.code).send({err: err.text})
    )
})

app.get('/api/appointment', (request, response) => {
    api.newAppointment(
        request.query['name'],
        request.query['date'],
        request.query['time'],
        request.query['phone'],
        request.query['fio'],
        '-', '-',
    ).then(
        () => response.send({}),
        err => response.status(err.code).send({err: err.text})
    )
})

app.get('/catalog', (request, response) => {
    api.getFullClinicsData(null, request.query['region']).then(clinics =>
        response.render('catalog', {
            clinics: clinics,
            helpers: {
                preview:
                    (data, idx, options) => options.fn(Object.fromEntries(Object.entries(data).slice(0, idx)))
            },
            layout: false
        })
    )
})

app.get('/modal', (request, response) => {
    api.getFullClinicsData(request.query['name'], null).then(clinics =>
        response.render('modal', {
            data: clinics[0],
            layout: false
        })
    )
})

app.get('/', (request, response) => {
    response.render('index')
})

app.listen(api.serverPort)