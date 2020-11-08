const express = require('express')
const app = express()

app.set('view engine', 'ejs');


app.listen(3000, () => {
 
    console.log('Server started and is listening on port 3000')
 
})


app.get('/', (request, respond) => {

    //respond.send('Homepage')

    respond.render('pages/index')

})

app.get('/register', (request, respond) => {

    respond.send('Register')

})

app.get('/login', (request, respond) => {

    respond.send('Login')

})

app.get('/profile', (request, respond) => {

    respond.send('Profile')

})