//Submit data when enter key is pressed
$('#user_name').keydown(function(e) {
  var name = $('#user_name').val();
  if (e.which == 13 && name.length > 0) { //catch Enter key
    //POST request to API to create a new visitor entry in the database
    $.ajax({
        method: "POST",
        url: "./api/visitors",
        contentType: "application/json",
        data: JSON.stringify({
          name: name
        })
      })
      .done(function(data) {
        if (data && data.name) {
          if (data._id)
            $('#response').html($.i18n('added_to_database', AntiXSS.sanitizeInput(data.name)));
          else
            $('#response').html($.i18n('hello', AntiXSS.sanitizeInput(data.name)));
        } else {
          $('#response').html(AntiXSS.sanitizeInput(data));
        }

        $('#user_name').val('');
        $('#user_name').attr("placeholder", $.i18n('name'));
        $('#nameInput').hide();
        getNames();
      });
  }
});

//Retrieve all the visitors from the database
function getNames() {
  $.get("./api/visitors")
    .done(function(data) {
      if (data.length > 0) {
        data.forEach(function(element, index) {
          data[index] = AntiXSS.sanitizeInput(element)
        });
        $('#databaseNames').html($.i18n('database_contents') + JSON.stringify(data));
      }
    });
}

//Call getNames on page load.
getNames();
