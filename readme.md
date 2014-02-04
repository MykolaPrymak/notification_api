# HTML5 Notification API wrapper #

This code and [demo](http://mykolaprymak.github.io/notification_api/) can be used for test purpose and understand howto HTML5 Notification API works.

Example using:

```javascript
var result = Notify('Notification title');
// or
var result = new Notify('Notification title');

// The arguments can be a javascript object to specify the other optional notification options.

Notify('Notification title', {
    body: 'Notification body text',
    tag: '', //Tag name to overwrite previous message with the same tag name. Not used if empty.
    icon: 'http://some.site.com/image.jpg' // Image URL to show with notification,
    defaultClose: true, // Close the notification if onClick event occur and handler not set. Default: false. Note: this is default behavior for Firefox.
    timeout: 5, // Timeout in seconds to close the notification. Set to 0 to disable internal timeout close functionality. Default: 5. Note: Firefox automatically close notification after 4s.
    click: function(evt){} // The onclick handler. Default: empty.
});

// or the same with one arguments
Notify({
    title: 'Notification title', // Title is the only one required argument.
    body: 'Notification body text',
    .......
});
```


This demo used a JQuery custum events for inform the notification permission changes and call the requestPermission() method.
All event must be attached to the document object.
```javascript
// The permission status is a string in lower case. Posible values: 'default', 'denied', 'granted'.
$(document).on('notification:permission', function(evt){
    console.log('new permission is '+ evt.permission);
});


// Dublicate the internal notification event show, click and close.
$(document).on('notification:show', function(evt) {
    // Close the notification
    evt.target.close();
});
$(document).on('notification:click', function(evt) {
    // ....
});
$(document).on('notification:close', function(evt) {
    // ....
});

// If the browser reject request permission on document ready you can manualy request permission bu show some UI element and add a handler.
$('#requestPermission').click(function() {
        $(document).trigger('notification:request');
});
```

## Used materials ##

* [Source article (RU)](http://habrahabr.ru/post/183630/)
* [MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/notification)