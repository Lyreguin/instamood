var API_DOMAIN = "https://api.instagram.com/v1";
var RECENT_MEDIA_PATH = "/users/self/media/recent";
var SENT_URL = "https://twinword-sentiment-analysis.p.mashape.com/analyze/";
var CLAR_URL = "https://api.clarifai.com/v1/tag"
// what do you think a variable in all caps means?

//GLOBAL VARS
var sentTotal = 0;
var sentFinal = 0;
var numScores = 0;
var wordScore = "";
var tags = [];
var popTags = ["--","--","--"];


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
    var imgUrl = response.data[i].images.standard_resolution.url;
     $(".list").append($("<div class='data-item" + i + "'></div>")
      .html("<a href=" + imgUrl + ">" + "<img class='image' src=" 
        + imgUrl + "'></a>"));

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

    //Clarifai Call
    callClarifai(response.data[i].images.standard_resolution.url);

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
    $(".stats").append($("<div class='ego'></div>").html("<span class='stat-head'>Ego Score</span>: " + ego + " Of Own Pictures Liked"));
    
    var pop = (popCount/response.data.length).toFixed(1);
     $(".stats").append($("<div class='pop'></div>").html("<span class='stat-head'>Popularity</span>: " + pop + " Average Likes Per Pic"));
    
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
    $(".stats").append($("<div class='dayOfWeek'></div>").html("<span class='stat-head'>Most Active Day</span>: " + days[day]));
    
    var brev = (capCount/response.data.length).toFixed(1);
    $(".stats").append($("<div class='brev'></div>").html("<span class='stat-head'>Brevity</span>: " + brev + " Average Characters Per Pic"));
    
    var thirst = (hashCount/response.data.length).toFixed(1);
    $(".stats").append($("<div class='THIRST'></div>").html("<span class='stat-head'>THIRST</span>: " + thirst + " Average #hashtags Per Pic"));

    var sentFinal = (sentTotal/response.data.length).toFixed(3);
    $(".stats").append($("<div class='score'></div>").html("<span class='stat-head'>Overall Sentiment Score</span>: <span class='overSentScore'>" + sentFinal +"</span>"));
  
    $(".stats").append($("<div class='tags'></div>").html("<span class='stat-head'>Most Popular Tags</span>: loading..."));
  }
  else
  {
    $(".stats").append($("<div class='noPics'></div>").html("Post some pictures you lard."));
  }
}


function sentScore(output, index) {
  $(".data-item" + index).append("<div class='score'>" + 
    "Sentiment Score = " + output.type + " " + (output.score).toFixed(3) + "</div>");
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

function callClarifai(image)
{
  var finalClarUrl = CLAR_URL + "?url=" + image 
  + "&access_token=pa4tiv2e9OQ176jByu2DLKbuhTta5I";

  $.ajax({
    type: "GET",
    url: finalClarUrl,
    dataType: "json",
    success: analyze,
    error: function(err) {
      alert("Error with Clarifai Call");
      }
  });
}

function analyze(clarObj)
{
  console.log(clarObj);
  for(var i = 0; i < clarObj.results[0].result.tag.classes.length; i++)
  {
    var tag = clarObj.results[0].result.tag.classes[i];
      tags.push(tag);
  }
 

  var freq = {};
  var max = 0;  
  var result;   
  for(var i in tags) 
  {
    freq[tags[i]]=(freq[tags[i]] || 0)+1;
    if(freq[tags[i]] > max) 
    { 
      max = freq[tags[i]];  
      result = tags[i];          
    }
  }

  var check = $.inArray(result, popTags);
  console.log(check);
  if(check === -1)
  {
    popTags.push(result);
  }

  if(popTags.length > 3)
  {
    popTags.shift();
  }

  console.log(popTags);

  $(".tags").html("<span class='stat-head'>Most Popular Tags</span>: " 
    + popTags[0] + ", " + popTags[1] + ", " + popTags[2]);
}