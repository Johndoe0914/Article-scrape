$.getJSON("/articles", function(data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      $("#articles").append("<p  data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + data[i].text + "</p>");
    }
  });
  
  $(document).on("click", "p", function(){
    $("#comments").empty();
    console.log("paragraph clicked")

    var thisId = $(this).attr("data-id");

    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
    .then(function(data){
      console.log(data);

      $("#comments").append("<h2>" + data.title + "<h2>");

      $("#comments").append("<input id='titleinput' name ='title' >");

      $("#comments").append("<textarea id='bodyinput' name='body'></textarea>");
      
      $("#comments").append("<button data-id ='" + data._id + "' id='savecomment'>Save Comment</button>");

      if(data.comment){
        $("#titleinput").val(data.comment.title);

        $("#bodyinput").val(data.comment.body);
      }
    });
  });

  $(document).on("click", "#savecomment", function(){
    var thisId = $(this).attr("data-id");

    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        title: $("#titleinput").val(),
        body: $("#bodyinput").val()
      }
    })
    .then(function(data){
      console.log(data);

      $("#comments").empty();
    });

    $("#titleinput").val("");
    $("#bodyinput").val("");
  });