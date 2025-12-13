// import SockJS from 'sockjs-client'
// import Stomp from 'stompjs'

// let stompClient = null

// export const connectWebSocket = (clinicId, onMessageReceived) => {
//   const socket = new SockJS('http://localhost:8080/ws')
//   stompClient = Stomp.over(socket)

//   stompClient.connect({}, () => {
//     stompClient.subscribe(`/topic/clinic/${clinicId}`, (message) => {
//       onMessageReceived(JSON.parse(message.body))
//     })
//   })
// }

// export const disconnectWebSocket = () => {
//   if (stompClient) {
//     stompClient.disconnect()
//   }
// }

import SockJS from 'sockjs-client'
import Stomp from 'stompjs'

let stompClient = null

export const connectWebSocket = (clinicId, onMessageReceived) => {
  const socket = new SockJS('http://localhost:8080/ws')
  stompClient = Stomp.over(socket)

  stompClient.connect({}, () => {
    stompClient.subscribe(`/topic/clinic/${clinicId}`, (message) => {
      onMessageReceived(JSON.parse(message.body))
    })
  })
}

export const disconnectWebSocket = () => {
  if (stompClient && stompClient.connected) {
    stompClient.disconnect()
  }
  stompClient = null
}