using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace chatApp.Hubs
{
    public interface IWebSocket
    {
        public void SendAll(string msg);
    }
}
