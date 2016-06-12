var API_DOMAIN = "https://api.instagram.com/v1";
var RECENT_MEDIA_PATH = "/users/self/media/recent";
// what do you think a variable in all caps means?

$(document).ready(function() {
  var token = window.location.hash;
  if (!token) {
    window.location.replace("./login.html");
  }
  token = token.replace("#", "?"); // Prepare for query parameter
  var mediaUrl = API_DOMAIN + RECENT_MEDIA_PATH + token;

  $.ajax({
    method: "GET",
    url: mediaUrl,
    dataType: "jsonp",
    success: handleResponse,
    error: function() {
      alert("there has been an error...")
    }
  });

  var sentUrl = "https://community-sentiment.p.mashape.com/text/";
  $.ajax({
    type: "GET",
    url: sentUrl,
    data: {
      "X-Mashape-Key":"z5gD9Wpi2lmshS0ubSB2aARWgFLQp1KQoMmjsnikWCk0gUwQuo",
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json",
      "txt": "Fuck you fuck you fuck you fuck you"
    },
    dataType: "json",
    success: THIRSTBITCHES,
    error: function() {
      alert("NOW WE HUNGRY")
    }
  });
});

function THIRSTBITCHES(response) {
  console.log(response);
}

function handleResponse(response) {
  console.log(response);

  //Create Stats
  var egoCount = 0;

  var popCount = 0;

  var timestamp;
  var convStamp;
  var week = [0,0,0,0,0,0,0];
  var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  
  var capCount = 0;
  
  var hashCount = 0;


  //Load Images and Captions
  for(var i = 0; i < response.data.length; i++)
  { 
    //Paste Pictures and Captions
     $(".list").append($("<div class='data-item" + i + "'></div>")
      .html("<img class='image' src=" 
        + response.data[i].images.standard_resolution.url + "'>"));

     if(response.data[i].caption !== null)
     {
        $(".data-item" + i).append("<div class='caption'>" + 
          response.data[i].caption.text + "</div>");
     }

    if(response.data[i].user_has_liked)
    {
      egoCount++;
    }

    popCount += response.data[i].likes.count;

    timestamp = response.data[i].created_time;
    convStamp = new Date(timestamp*1000);
    week[convStamp.getDay()]++;

    if(response.data[i].caption !== null)
    {
      capCount += response.data[i].caption.text.length; 
    }

    hashCount += response.data[i].tags.length;


  }

  //Calculating Stats
  var ego = (egoCount/response.data.length*100).toFixed(0) + "%";
  $(".stats").append($("<div class='ego'></div>").html("Ego Score: " + ego + " Of Own Pictures Liked"));
  
  var pop = (popCount/response.data.length).toFixed(1);
   $(".stats").append($("<div class='ego'></div>").html("Popularity: " + pop + " Average Likes Per Pic"));
  
  var max = 0;
  var day = 0;
  for(var i = 0; i < 7; i++)
  {
    if(week[i] > max)
    {
      max = week[i];
      day = i;
    }
  }
  $(".stats").append($("<div class='ego'></div>").html("Most Active Day: " + days[day]));
  
  var brev = (capCount/response.data.length).toFixed(1);
  $(".stats").append($("<div class='ego'></div>").html("Brevity: " + brev + " Average Characters Per Pic"));
  
  var thirst = (hashCount/response.data.length).toFixed(1);
  $(".stats").append($("<div class='ego'></div>").html("THIRST: " + thirst + " Average #hashtags Per Pic"));

}