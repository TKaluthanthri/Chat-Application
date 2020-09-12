using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CustomChatApplication.Entities
{
    public class Message
    {
        public string MessageContent { get; set; }
        public int MessageId { get; set; }
        public string ReceiverId { get; set; }
        public string SenderId { get; set; }
        public bool IsDeleted { get; set; }
    }
}
