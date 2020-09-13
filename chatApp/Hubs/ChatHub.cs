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
        private Dictionary<string, string> mapConnToUser = new Dictionary<string, string>();
        private Dictionary<string, string> mapUser = new Dictionary<string, string>();

        public async Task Log()
        {
           
            var list = new List<string>();
            list.Add(Context.ConnectionId);
            await Clients.Caller.SendAsync("ReceiveLog", list);
        }

        public async Task SendMessage(string user, string message)
        {
            Console.WriteLine(Context.User.Identity.Name);
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

    }
}
