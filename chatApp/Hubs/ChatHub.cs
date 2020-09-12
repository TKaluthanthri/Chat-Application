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
    public class ChatHub: Hub, IWebSocket
    {
        private readonly static ConnectionMapping<string> connections = new ConnectionMapping<string>();

        public async void SendAll(string msg)
        {
            await Clients.All.SendAsync("ReceiveAllMessage", msg);
        }

        public async Task SendMessage(string user, string message)
        {
            Console.WriteLine(Context.User.Identity.Name);
            await Clients.All.SendAsync("ReceiveMessage", user, message);
            
        }


        public async Task SendPrivateMessage(Message message)
        {
            //Receive Message
            string ReceiverConnectionid = connections.GetConnections(message.ReceiverId).First();
            if (ReceiverConnectionid.Count() > 0)
            {
                //Save-Receive-Message
                try
                {
                    message.IsDeleted = false;
                   // message.Connectionid = String.Join(",", ReceiverConnectionids);
                   // await saveUserChat(message);
                   // Generate TimeStramps 
                    await Clients.Clients(ReceiverConnectionid).SendAsync("ReceiveMessage", message);
                }
                catch (Exception) { }
            }
        }

        public override async Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            if (httpContext != null)
            {
                try
                {
                    //Add Active user
                    var userName = httpContext.Request.Query["user"].ToString();
                    //var UserAgent = httpContext.Request.Headers["User-Agent"].FirstOrDefault().ToString();
                    var connId = Context.ConnectionId.ToString();
                    connections.Add(userName, connId);

                    //Update Client
                    await Clients.All.SendAsync("UpdateUserList", connections.ToJson());
                }
                catch (Exception) { }
            }
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var httpContext = Context.GetHttpContext();
            if (httpContext != null)
            {
                //Remove status inactive User
                var username = httpContext.Request.Query["user"];
                connections.Remove(username, Context.ConnectionId);

                //Update Client
                await Clients.All.SendAsync("UpdateUserList", connections.ToJson());
            }

            //return base.OnDisconnectedAsync(exception);
        }
    }
}
