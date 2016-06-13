var API_DOMAIN = "https://api.instagram.com/v1";
var RECENT_MEDIA_PATH = "/users/self/media/recent";
var SENT_URL = "https://twinword-sentiment-analysis.p.mashape.com/analyze/";
// what do you think a variable in all caps means?

//GLOBAL VARS
var sentTotal = 0;
var sentFinal = 0;
var numScores = 0;
var wordScore = "";

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
});


function handleResponse(response) {
  console.log(response);

  //Create Stats
  var egoCount = 0;

  var popCount = 0;

  var timestamp = 0;
  var convStamp = 0;
  var week = [0,0,0,0,0,0,0];
  var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  
  var capCount = 0;
  
  var hashCount = 0;

  //Load Images and Captions
  //for(var i = 0; i < response.data.length; i++)
  $.each( response.data, function(i, output)
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

      //Sentiment Call
      $.ajax({
        type: "GET",
        url: SENT_URL,
        headers: {"X-Mashape-Key":"z5gD9Wpi2lmshS0ubSB2aARWgFLQp1KQoMmjsnikWCk0gUwQuo"},
        data: { text: response.data[i].caption.text },
        dataType: "json",
        success: function(response) {
          sentScore(response, i);
          },
        error: function(err) {
          alert("Error with Sentiment Call");
          }
      });
    }

    hashCount += response.data[i].tags.length;
  });

  //Calculating Stats
  if(response.data.length > 0)
  {
    var ego = (egoCount/response.data.length*100).toFixed(0) + "%";
    $(".stats").append($("<div class='ego'></div>").html("Ego Score: " + ego + " Of Own Pictures Liked"));
    
    var pop = (popCount/response.data.length).toFixed(1);
     $(".stats").append($("<div class='pop'></div>").html("Popularity: " + pop + " Average Likes Per Pic"));
    
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
    $(".stats").append($("<div class='dayOfWeek'></div>").html("Most Active Day: " + days[day]));
    
    var brev = (capCount/response.data.length).toFixed(1);
    $(".stats").append($("<div class='brev'></div>").html("Brevity: " + brev + " Average Characters Per Pic"));
    
    var thirst = (hashCount/response.data.length).toFixed(1);
    $(".stats").append($("<div class='THIRST'></div>").html("THIRST: " + thirst + " Average #hashtags Per Pic"));

    var sentFinal = (sentTotal/response.data.length).toFixed(3);
    
    
    $(".stats").append($("<div class='score'></div>").html("Overall Sentiment Score: <span class='overSentScore'>" + sentFinal +"</span>"));
  }
  else
  {
    $(".stats").append($("<div class='noPics'></div>").html("Post some pictures you lard."));
  }
}


function sentScore(output, index) {
  $(".data-item" + index).append("<div class='score'>" + 
    "Sentiment Score = " + output.type + " " + output.score + "</div>");
  sentTotal += output.score;
  numScores++;
  sentFinal = (sentTotal/numScores).toFixed(3);
  if(sentFinal>0)
  {
    wordScore = " Positive ";
  }
  else if(sentFinal<0)
  {
    wordScore = " Negative ";
  }
  else wordScore = " Neutral ";
  $(".overSentScore").html(wordScore + sentFinal);
}