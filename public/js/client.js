

var socket = io(window.location.host)

socket.on('Server-sent-notification', (data) => {
    alert(data.content)
})