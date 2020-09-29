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

        public override Task OnConnectedAsync()
        {
            return base.OnConnectedAsync();
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
            var onlineUsers = Connections.Select(x => x.Key).ToList();
            await Clients.All.SendAsync("GetAllUsers", onlineUsers);
        }

        public async Task RemoveMessage(string messageSender, string messageId)
        {
            await Clients.Client(Context.ConnectionId).SendAsync("DeleteMessage", messageId, messageSender);
        }


    }
}
