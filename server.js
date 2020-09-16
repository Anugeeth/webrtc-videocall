const port = process.env.PORT || 3000
const express = require('express')

const { ExpressPeerServer } = require('peer');
const app = express()
const server = require('http').Server(app)

var cors = require('cors')

const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
app.use(cors())

const peerServer = ExpressPeerServer(server, {
  path: '/'
});

app.use('/peerjs', peerServer);
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})


server.listen(port)


