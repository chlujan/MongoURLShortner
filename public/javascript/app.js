var main = function() {
    var $result,
        url,
        link,
        index,
        userUrl;

    function checkinput (link) {
        index = link.indexOf("localhost:3000");

        if(index > -1) {
            link = link.replace("localhost:3000", "");
        }

        return link;
    }

    $("#button").click(function() {
        url = $("#url").val();
        if (url === '') {
            alert("Empty url, please enter url.");
        }
        else {
            userUrl = JSON.stringify({url0:url});
            $.ajax({
                type: "POST",  //post to server.js
                url: "/geturl",    //route
                contentType: "application/json; charset=utf-8",
                dataType: "json",  //json type
                data: userUrl
            })
            .done(function (data, status) {
                $("#result").html(""); //html added
                //inserts link into dom
                link = checkinput(data.url);
                $("#result").append("<a href = "+ link + ">" + data.url + "</a>");  
            })
            .fail(function (data, status){
                console.log("Call is fail");
            });
        }
    });

    setInterval(function(){ 
        $('#visit').empty();
        $.ajax({
            url:"/getList",
            error : function () {

            },dataType: "json",
            success: function (data) {
                var i;
                for (i = 0; i < 10; i++) {
                    $("#visit").append("<p>Number: "+ (i + 1) +"</p>");
                    $("#visit").append($('<p>')).append("URL: " + data[i].short + " Views: " + data[i].view);
                }
        },type: "post"
    })}, 5000);

};

$(document).ready(main);
