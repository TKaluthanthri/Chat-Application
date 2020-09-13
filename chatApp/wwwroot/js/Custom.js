$(function () {

    var returndata;
   

    $('#registerUser').click(function () {
        var model = {
            UserId: 'Andrew@gmail.com',
            UserName: 'Locky',
            Status: false,
        };

        $.ajax({
            url: "api/account/",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data:JSON.stringify(model),
            success: function (response) {
               // alert(data);
                //if (response == "success") {
                 window.location.href = window.location.href.split("?")[0];
                //}
                $.ajax({
                    url: "api/account/",
                    type: "GET",
                    contentType: "application/json; charset=utf-8",
                    data: {},
                    success: function (result) {
                        alert("Hey there");
                        $('#result').html(result);
                         //var returndata = data;
                        
                    }
                });
            }
        });
    });
});