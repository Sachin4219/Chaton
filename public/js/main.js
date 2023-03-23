const socket = io();

const chatform = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.querySelector('#room-name')
const usersList = document.querySelector('#users')

const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})


//join chatroom
socket.emit('joinRoom', {username, room})

//get room and users
socket.on('roomUsers', (room, users)=>{
    outputRoomName(room)
    outputUsers(room.users)
})


// Message from server
socket.on('message', (message) => {
    outputMessage(message)

    chatMessages.scrollTop = chatMessages.scrollHeight
});

//Message submit
chatform.addEventListener('submit', (e) => {
    e.preventDefault();

    //get message text
    const msg = e.target.elements.msg.value;

    //emiting a message to server
    socket.emit('chatMessage', msg);
});

//output message to dom
function outputMessage(message){
    const div = document.createElement('div')
    div.classList.add('message')
    div.innerHTML = `	
                        <p class="meta">${message.username} <span> ${message.time}</span></p>
						<p class="text">
                            ${message.text}
						</p>
                    `
    document.querySelector('.chat-messages').appendChild(div)
}

function outputRoomName(room){
    roomName.innerText = room.room
}

function outputUsers(users){
    // var userString = ''

    // users.forEach(user=>{
    //     if(user)
    //         userString += `<li>${user.username}</li>`
    // })
    // usersList.innerHTML = userString
    usersList.innerHTML = `
        ${
            users.map(user=>`<li>${user.username}</li>`).join('')
        }
    `
}