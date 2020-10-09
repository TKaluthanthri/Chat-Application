using chatApp.Hubs;
using CustomChatApplication.Entities;
using Moq;
using System;
using System.Dynamic;
using Xunit;

namespace XUnitTestChatApp
{
    public class UnitTest1
    {
        [Theory]
        [InlineData("saman", "ameliya")]
        public async void Test1(string messageSender, string messageReceiver)
        {
            IChatHub chatHub = new ChatHub();
            await chatHub.UserRegister(messageSender);
            await chatHub.UserRegister(messageReceiver);

        }

        //[Fact]
        //public async GetOnlineUsers() 
        //{
        //    IChatHub chatHub = new ChatHub();
        //    var mockClients = new Mock<IHubCallerConnectionContext<dynamic>>();

        //}

    }
}
