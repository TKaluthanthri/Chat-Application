using chatApp.Hubs;
using NUnit.Framework;

namespace NUnitTestChatApp
{
    public class Tests
    {

        [SetUp]
        public void Setup()
        {
            IChatHub chatHub = new ChatHub();
            chatHub.UserRegister();
        }

        [Test]
        public void Test1()
        {
            Assert.Pass();
        }
    }
}