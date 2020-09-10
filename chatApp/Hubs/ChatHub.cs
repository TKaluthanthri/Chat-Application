using chatApp.Entities;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace chatApp.Hubs
{
    public class ChatHub: Hub, IWebSocket
    {
        
        public async void SendAll(string msg)
        {
            await Clients.All.SendAsync("ReceiveAllMessage", msg);
        }

        public async Task SendMessage(string user, string message)
        {
            Console.WriteLine(Context.User.Identity.Name);
            await Clients.All.SendAsync("ReceiveMessage", user, message);
            
        }
    }
}
