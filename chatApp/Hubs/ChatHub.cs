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
    public class ChatHub: Hub
    {
        static HashSet<User> CurrentConnections = new HashSet<User>();

        public override Task OnConnectedAsync()
        {
            return base.OnConnectedAsync();
        }
        public async Task Log()
        {
            var list = new List<string>();
            list.Add(Context.ConnectionId);
            await Clients.Caller.SendAsync("ReceiveLog", list);
        }

        public async Task SendMessage(string messageReceiver, string messageSender, string message, string Id, bool isDeleted)
        {
            var selectedUser = CurrentConnections.Where(x => x.UserName == messageReceiver).First();
            DateTime timestamp = DateTime.Now;
            string messageId = string.Empty;

            if (String.IsNullOrEmpty(Id))
            {
                messageId = Guid.NewGuid().ToString("N");
                await Clients.Caller.SendAsync("MessageSent", messageId, timestamp, message, messageReceiver);
                await Clients.Client(selectedUser.ConnectionId).SendAsync("ReceiveMessage", messageReceiver, messageSender, message, timestamp, false, messageId);

            }
            else
            {
                await Clients.Client(selectedUser.ConnectionId).SendAsync("ReceiveMessage", messageReceiver, messageSender, message, timestamp, isDeleted, Id);
            }

        }

        public async Task UserRegister(string userName)
        {
            User user = new User();
            user.ConnectionId = Context.ConnectionId;
            user.UserName = userName;
            CurrentConnections.Add(user);
        }

        public async Task GetOnlineUsers(string connectionId) {

            var onlineUsers = CurrentConnections.Where(x => x.ConnectionId != connectionId).ToList();
            var currentuser = Context.ConnectionId;
            await Clients.Client(connectionId).SendAsync("GetAllUsers", onlineUsers);
        }

        

    }
}
