/**
 * HTML5 Notification API wrapper.
 *
 *
 */
(function(window) {
    if (!window.Notification) {
        // No support. Create a empty function
        window.Notify = function(title) {
            // Put the legasy code here
            //alert(title);
        };

        return false;
    }

    /**
     * Default permission. Call the Notification.requestPermission
     * to allow/deny notifiation
     *
     * @constant
     * @type String
     */
    var PERMISSION_DEFAULT = 'default';

    /**
     * Default permission. Notification is denied. 
     * Call the Notification.requestPermission have no effect.
     *
     * @constant
     * @private
     * @type {String}
     */
    var PERMISSION_DENIED = 'denied';

    /**
     * Notification is granted.
     * Call the Notification.requestPermission have no effect.
     *
     * @constant
     * @private
     * @type {String}
     */
    var PERMISSION_GRANTED = 'granted';

    /**
     * Default notification timeout.
     *
     * @constant
     * @private
     * @type {Number}
     */
    var DEFAULT_TIMEOUT = 5;

    /**
     * Notification events prefix.
     *
     * @constant
     * @private
     * @type {String}
     */
    var NOTIFY_EVENT_PREFIX = 'notification:';

    /**
     * Notification permission update event. Use $(document).on('event_name') to catch the event.
     *
     * @constant
     * @private
     * @type {String}
     */
    var PERMISSION_UPDATE_EVENT = NOTIFY_EVENT_PREFIX + 'permission';

    /**
     * Notification request permission event. Call this event if you need request the permission.
     *
     * @constant
     * @private
     * @type {String}
     */
    var PERMISSION_REQUEST_EVENT = NOTIFY_EVENT_PREFIX + 'request';

    /**
     * Notification show event.
     *
     * @constant
     * @private
     * @type {String}
     */
    var SHOW_NOTIFY_EVENT = NOTIFY_EVENT_PREFIX + 'show';

    /**
     * Notification close event.
     *
     * @constant
     * @private
     * @type {String}
     */
    var CLOSE_NOTIFY_EVENT = NOTIFY_EVENT_PREFIX + 'close';

    /**
     * Notification click event.
     *
     * @constant
     * @private
     * @type {String}
     */
    var CLICK_NOTIFY_EVENT = NOTIFY_EVENT_PREFIX + 'click';
    
    /**
     * Current permission status for internal use.
     *
     * @private
     * @type {String}
     */
    var permission;

    /**
     * Get the current permission status as string.
     * 
     * @return String
     */
    function getPermission() {
        var status;
        if (Notification.permission) {
            status = Notification.permission;
        } else {
            // No standart interface. Chrome?
            // Create test notification and read the permission, then instantly close the notification.
            var ntf = new Notification(NOTIFY_EVENT_PREFIX + PERMISSION_DEFAULT);
            status = ntf.permission;
            setTimeout(function() { ntf.close(); }, 10);
        }
        status = status.toLowerCase();
        if (permission != status) {
            $(document).trigger({type: PERMISSION_UPDATE_EVENT, permission: status});
        }
        return status;
    }

    /**
     * Request permission to show the notifications
     * 
     * @return void
     */
    function requestPermission() {
        Notification.requestPermission(function(status) {
            $(document).trigger({type: PERMISSION_UPDATE_EVENT, permission: status});
        });
    }

    /**
     * Do notification event and pass it to others listeners.
     * 
     * @param  {Object}  evt         Original Notification event object
     * @return void
     */
    function notifyTrigger(evt) {
        evt.type = NOTIFY_EVENT_PREFIX + evt.type;
        $(document).trigger(evt);
    }

    /*
     * Add event handler
     *
     */
    $(document).ready(function() {
        // Run when all third-party code is ready
        setTimeout(function() {
            if (getPermission() === PERMISSION_DEFAULT) {
                // Request permission on window load
                $(document).trigger(PERMISSION_REQUEST_EVENT);
            }
        }, 1);
    });
    // If permission changes - update the var. Place code after the define the window.Notify do possible the compact code
    $(document).on(PERMISSION_UPDATE_EVENT, function(evt){
        window.Notify.permission = permission = evt.permission;
    });
    $(document).on(PERMISSION_REQUEST_EVENT, requestPermission);

    /**
     * Do notification event and pass it to others listeners.
     * Return false if Notification API is not supported or notification title is not set
     * otherwise return the Notification Api instance.
     * 
     * @example
     * 
     * @constructor
     * @param  {String | Object} title               Notification title or event data object
     * @param  {Object}                              Notification options object
     * @param  {String}          [opt.title]         Notification title string
     * @param  {String}          [opt.body]          Notification body string. Default: empty.
     * @param  {String}          [opt.icon]          Notification icon url. Default: empty.
     * @param  {Boolean}         [opt.defaultClose]  If true and onclick handler not set - close the notification on click event. Default: false.
     * @param  {Number}          [opt.timeout]       Notification close timeout in seconds. Set to 0 to disable this feature. Default: 5.
     * @param  {Function}        [opt.click]       Notification onclick event handler. Default: none.
     * @return Mixed
     */
    window.Notify = function(title, opt) {
        if (!!title && !!title.substr) {
            title = {title: title};
        }
        opt = $.extend({timeout: DEFAULT_TIMEOUT}, title || {}, opt || {});
        
        if (getPermission() === PERMISSION_DEFAULT) {
            $(document).trigger(PERMISSION_REQUEST_EVENT);
        }

        if (!opt.title) {
            return false;
        }
        
        var ntf = new Notification(opt.title, opt);
        
        // If click handler is not specified and defaultClose is set to true then "click" event close the notification
        if (!!opt.defaultClose && (!opt.click)) {
            // Default behavior on click - close the notification
            opt.click = ntf.close;
        }
        
        $(ntf).on('show', function(evt) {
            if (opt.timeout !== 0) {
                setTimeout(function(){
                    ntf.close();
                }, opt.timeout * 1000);
            }
            notifyTrigger(evt);
        }).on('click', function(evt) {
            try {
                opt.click && opt.click(evt);
            } catch (e){};
            notifyTrigger(evt);
        }).on('close', notifyTrigger
        ).on('error', function(e) {
            //log('Notification <b>' + opt.title + '</b> error:' + e);
        });

        return ntf;
    }
})(window);