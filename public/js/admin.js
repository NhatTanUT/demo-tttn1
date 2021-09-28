

var socket = io('https://web-demo.online')

$('#click').click(() => {
    socket.emit('Admin-sent-notification', {
        content: "UI Lib themes 40% off for a limited time"
    })
})

