

var socket = io(window.location.host)

$('#click').click(() => {
    socket.emit('Admin-sent-notification', {
        content: "Hạ giám 40%"
    })
})

