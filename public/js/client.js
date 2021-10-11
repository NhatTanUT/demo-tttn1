

var socket = io('https://web-demo.online')

socket.on('Server-sent-notification', (data) => {
    alert(data.content)
})

