using chatApp.Entities;
using CustomChatApplication.Entities;
using CustomChatApplication.Hubs;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace chatApp.Hubs
{
    public class ChatHub : Hub
    {
        static Dictionary<string, string> Connections = new Dictionary<string, string>();

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            // handle user disconnect by removing them from user list
            foreach (KeyValuePair<string, string> pair in Connections)
            {
                if (pair.Value == Context.ConnectionId)
                {
                    Connections.Remove(pair.Key);
                    break;
                }
            }
            await SendUsersListToALL();
            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(string messageReceiver, string messageSender, string message)
        {
            var ConnectionId = Connections.GetValueOrDefault(messageReceiver, "");
            DateTime timestamp = DateTime.Now;
            string messageId = Guid.NewGuid().ToString("N");

            await Clients.Caller.SendAsync("MessageSent", messageId, timestamp, message, messageReceiver);
            await Clients.Client(ConnectionId).SendAsync("ReceiveMessage", messageId, timestamp, message, messageSender);
        }

        public async Task UserRegister(string userName)
        {
            Connections.Add(userName, Context.ConnectionId);
            await SendUsersListToALL();
        }

        public async Task RemoveMessage(string messageReceiver, string messageSender, string messageId)
        {
            var ConnectionId = Connections.GetValueOrDefault(messageReceiver, "");
            await Clients.Client(ConnectionId).SendAsync("DeleteMessage", messageId, messageSender);
        }

        private Task SendUsersListToALL() {
            var onlineUsers = Connections.Select(x => x.Key).ToList();
            return Clients.All.SendAsync("GetAllUsers", onlineUsers);
        }

    }
}
